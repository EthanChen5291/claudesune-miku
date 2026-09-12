#!/usr/bin/env python
# DawDreamer offline VST render (D80, tier 2): MIDI -> WAV through a plugin.
#
#   vendor/pyenv/bin/python scripts/render-vst.py \
#     --plugin "vendor/plugins/Surge XT.vst3" --midi stem.mid --out stem.wav \
#     --duration 65 [--preset patch.fxp] [--sample-rate 44100]
#
# The plugin loads from a repo-local path (no system install).
#
# D85: DawDreamer's load_preset(.fxp) is a VST2-only code path — on a VST3
# plugin it returns False and applies NOTHING (every "patched" render before
# this fix actually sounded Surge's init saw; the return value was never
# checked). The working path for VST3 is load_vst3_preset(.vstpreset), so a
# .fxp preset is wrapped on the fly: the fxp's chunk payload (Surge's native
# 'sub3' patch stream) becomes the Comp chunk of a constructed .vstpreset
# whose class ID is the JUCE-derived component FUID (0xABCDEF01, 0x9182FAEB,
# manufacturer, plugin) — verified against the FUID table in the Surge XT
# binary. Any load failure is now fatal, never silent.
#
# The patch swap is enqueued on the audio thread and kills voices in the
# first processed block, which silenced notes starting at t=0 — so after
# loading the graph we run a short throwaway render to consume the patch
# queue BEFORE the MIDI is added (measured: note@0 peak 0.0 without the
# warmup, full amplitude with it).

import argparse
import struct
import wave

import dawdreamer as daw
import numpy as np

# JUCE VST3 component FUID words for Surge XT (manufacturer VmbA, plugin SgXT)
SURGE_CID = 'ABCDEF019182FAEB{:08X}{:08X}'.format(
    int.from_bytes(b'VmbA', 'big'), int.from_bytes(b'SgXT', 'big'))

p = argparse.ArgumentParser()
p.add_argument('--plugin', required=True)
p.add_argument('--midi', required=True)
p.add_argument('--out', required=True)
p.add_argument('--duration', type=float, required=True)
p.add_argument('--preset', default=None)
# r37: a SAMPLER whose kit is not a parameter. SSD5 exposes 2081 parameters of
# which exactly ONE is not a MIDI CC, so the loaded kit lives in opaque plugin
# state and a fresh instance renders pure silence — measured, peak 0.0 across
# all 48 of its output channels even after a 3 s warmup. `--state` loads a blob
# frozen once by scripts/plugin-handshake.py. Note that load_state returns None,
# not a success flag: D85 again, so the caller must verify with AUDIO.
p.add_argument('--state', default=None)
# a sampler streams its kit in; notes fired before it is ready are silent
p.add_argument('--warmup', type=float, default=0.0)
p.add_argument('--sample-rate', type=int, default=44100)
args = p.parse_args()


def fxp_to_vstpreset(fxp_path, out_path, cid=SURGE_CID):
    b = open(fxp_path, 'rb').read()
    if b[:4] != b'CcnK' or b[8:12] != b'FPCh':
        raise SystemExit(f'{fxp_path}: not an FPCh-chunk .fxp')
    size = struct.unpack('>i', b[56:60])[0]
    chunk = b[60:60 + size]
    buf = b'VST3' + struct.pack('<i', 1) + cid.encode('ascii')
    buf += struct.pack('<q', 48 + len(chunk)) + chunk
    buf += b'List' + struct.pack('<i', 1) + b'Comp' + struct.pack('<qq', 48, len(chunk))
    open(out_path, 'wb').write(buf)


engine = daw.RenderEngine(args.sample_rate, 512)
synth = engine.make_plugin_processor('synth', args.plugin)
if args.state:
    synth.load_state(args.state)   # returns None — verified by audio below, never by this
if args.preset:
    preset = args.preset
    if preset.endswith('.fxp'):
        preset = args.out + '.vstpreset'
        fxp_to_vstpreset(args.preset, preset)
    if not synth.load_vst3_preset(preset):
        raise SystemExit(f'preset REFUSED by plugin: {args.preset}')
engine.load_graph([(synth, [])])
if args.preset:
    engine.render(0.3)  # consume the enqueued patch load before real MIDI
if args.warmup:
    engine.render(args.warmup)  # let a streaming sampler finish loading its kit
synth.load_midi(args.midi, clear_previous=True, beats=False, all_events=True)
engine.render(args.duration)
audio = engine.get_audio()  # float32, shape (2, N)
# D85, made structural: a plugin that loaded and rendered nothing is the failure
# mode this whole file exists to stop. A silent render is an ERROR, not a file.
if float(np.abs(audio).max()) < 1e-6:
    raise SystemExit(f'SILENT render from {args.plugin}'
                     + (f' with state {args.state}' if args.state else '')
                     + ' — the plugin loaded and produced nothing.')
if audio.shape[0] > 2:
    audio = audio[:2]  # multi-out samplers (SSD5 has 48) mix down to the main pair

audio = np.clip(audio, -1.0, 1.0)
pcm = (audio.T * 32767.0).astype(np.int16)
with wave.open(args.out, 'wb') as w:
    w.setnchannels(pcm.shape[1])
    w.setsampwidth(2)
    w.setframerate(args.sample_rate)
    w.writeframes(pcm.tobytes())
print(f'wrote {args.out} ({pcm.shape[0] / args.sample_rate:.1f}s)')
