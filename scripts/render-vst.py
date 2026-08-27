#!/usr/bin/env python
# DawDreamer offline VST render (D80, tier 2): MIDI -> WAV through a plugin.
#
#   vendor/pyenv/bin/python scripts/render-vst.py \
#     --plugin "vendor/plugins/Surge XT.vst3" --midi stem.mid --out stem.wav \
#     --duration 65 [--preset patch.fxp] [--sample-rate 44100]
#
# The plugin loads from a repo-local path (no system install). Presets: .fxp
# via load_preset (Surge XT reads its own .fxp patch format through this),
# .vstpreset via load_vst3_preset. Without a preset the plugin's init patch
# sounds — functional, not curated.

import argparse
import struct
import wave

import dawdreamer as daw
import numpy as np

p = argparse.ArgumentParser()
p.add_argument('--plugin', required=True)
p.add_argument('--midi', required=True)
p.add_argument('--out', required=True)
p.add_argument('--duration', type=float, required=True)
p.add_argument('--preset', default=None)
p.add_argument('--sample-rate', type=int, default=44100)
args = p.parse_args()

engine = daw.RenderEngine(args.sample_rate, 512)
synth = engine.make_plugin_processor('synth', args.plugin)
if args.preset:
    try:
        if args.preset.endswith('.vstpreset'):
            synth.load_vst3_preset(args.preset)
        else:
            synth.load_preset(args.preset)
    except Exception as e:  # noqa: BLE001 — a bad preset falls back to init, loudly
        print(f'warning: preset load failed ({e}); rendering init patch')
synth.load_midi(args.midi, clear_previous=True, beats=False, all_events=True)
engine.load_graph([(synth, [])])
engine.render(args.duration)
audio = engine.get_audio()  # float32, shape (2, N)

audio = np.clip(audio, -1.0, 1.0)
pcm = (audio.T * 32767.0).astype(np.int16)
with wave.open(args.out, 'wb') as w:
    w.setnchannels(pcm.shape[1])
    w.setsampwidth(2)
    w.setframerate(args.sample_rate)
    w.writeframes(pcm.tobytes())
print(f'wrote {args.out} ({pcm.shape[0] / args.sample_rate:.1f}s)')
