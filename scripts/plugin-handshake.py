#!/usr/bin/env python
# r37 — ONE-TIME GUI handshake for a sampler whose kit is not a parameter.
#
#   vendor/pyenv/bin/python scripts/plugin-handshake.py \
#     --plugin "/Library/Audio/Plug-Ins/VST3/SSDSampler5.vst3" \
#     --state vendor/patches/ssd5-kit.state
#
# WHY. SSD5 and Triaz expose only Bypass + MIDI CCs as automatable parameters
# (measured: 2081 params on SSD5, exactly ONE of them non-CC). The loaded kit
# lives in opaque plugin STATE, so a freshly instantiated plugin has no kit and
# renders pure silence — measured across all 48 of SSD5's output channels, peak
# 0.0, even after a 3 s warmup. That is D85's trap exactly: the render "worked"
# and produced nothing.
#
# The fix is a handshake done once by a human: open the editor, load a kit,
# close the window. The state is then frozen to a file and every later render
# loads it headlessly. Re-run only to change kits.
import argparse, os
import dawdreamer as daw
import numpy as np

p = argparse.ArgumentParser()
p.add_argument('--plugin', required=True)
p.add_argument('--state', required=True)
p.add_argument('--midi', default=None, help='optional test MIDI rendered after the handshake')
p.add_argument('--sample-rate', type=int, default=44100)
a = p.parse_args()

engine = daw.RenderEngine(a.sample_rate, 512)
plug = engine.make_plugin_processor('plug', a.plugin)
print(f'{os.path.basename(a.plugin)}: {plug.get_num_output_channels()} outs')
print('Opening the editor. Load a kit, then CLOSE THE WINDOW to continue.')
plug.open_editor()

os.makedirs(os.path.dirname(a.state) or '.', exist_ok=True)
plug.save_state(a.state)
print(f'state saved -> {a.state}')

if a.midi:
    engine.load_graph([(plug, [])])
    engine.render(2.0)                      # let the kit finish loading
    plug.load_midi(a.midi, clear_previous=True)
    engine.render(6.0)
    audio = engine.get_audio()
    peak = float(np.abs(audio).max())
    live = [i for i, v in enumerate(np.abs(audio).max(axis=1)) if v > 1e-6]
    print(f'VERIFY  peak {peak:.4f}  non-silent channels {live[:8]}{"..." if len(live)>8 else ""} ({len(live)})')
    if peak < 1e-6:
        raise SystemExit('STILL SILENT — the kit did not load, or the plugin is unauthorised.')
