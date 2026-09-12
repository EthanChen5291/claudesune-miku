#!/usr/bin/env python
"""Guitar amp stage: a DI (direct-input) guitar wav through a Neural Amp
Modeler capture, headless.

    vendor/vocal/env/bin/python scripts/guitar-amp.py in.wav out.wav \
        --model vendor/nam-models/<capture>.nam [--in-gain-db 0] [--out-db -18]

The .nam captures (vendor/nam-models/, GPL v3, from the NAM community
collection) run through the `neural-amp-modeler` package's own model loader,
so the amp is the same network the NAM plugin runs — no plugin state to
forge. Captures whose name carries "Cab" include the speaker cabinet; the
others are amp-only and want an impulse response after them (not wired yet).
Audio is resampled to the capture's rate (48 kHz for these), processed in
one pass, resampled back, and normalised to `--out-db` RMS so the level the
song sees does not depend on the capture's own gain.
"""
import argparse, json, os, sys, time
# the nam package imports tkinter (a GUI) at import time; brew python has none
from unittest.mock import MagicMock
for _m in ["tkinter", "tkinter.filedialog", "tkinter.messagebox", "_tkinter"]:
    sys.modules[_m] = MagicMock()
import numpy as np
import soundfile as sf
import torch
from scipy.signal import resample_poly
from nam.models import init_from_nam

ap = argparse.ArgumentParser()
ap.add_argument('inp'); ap.add_argument('out')
ap.add_argument('--model', required=True)
ap.add_argument('--in-gain-db', type=float, default=0.0)
ap.add_argument('--out-db', type=float, default=-18.0, help='RMS of the output, dBFS; omit normalisation with --no-norm')
ap.add_argument('--no-norm', action='store_true')
args = ap.parse_args()

t0 = time.time()
cfg = json.load(open(args.model))
model_sr = int(cfg.get('sample_rate') or 48000)
# legacy (.nam version 0.5.x) WaveNet layer configs carry `head_size` /
# `head_bias` per layer; the current loader wants a `head` object. Validated:
# converted captures behave as amps (a clean capture adds < -36 dB harmonics,
# a crunch one +20 dB more), which a misordered network would not.
if cfg.get('architecture') == 'WaveNet':
    for lc in cfg['config'].get('layers', []):
        if 'head' not in lc and 'head_size' in lc:
            lc['head'] = {'out_channels': lc.pop('head_size'), 'kernel_size': 1, 'bias': lc.pop('head_bias', True)}
model = init_from_nam(cfg)
model.eval()

x, sr = sf.read(args.inp, dtype='float32')
if x.ndim > 1: x = x.mean(axis=1)
x = x * (10 ** (args.in_gain_db / 20))
if sr != model_sr:
    from math import gcd
    g = gcd(sr, model_sr); x = resample_poly(x, model_sr // g, sr // g).astype(np.float32)
with torch.no_grad():
    y = model(torch.from_numpy(x)[None, :]).squeeze(0).cpu().numpy()
# the receptive field trims the head; keep alignment by left-padding the difference
if len(y) < len(x): y = np.concatenate([np.zeros(len(x) - len(y), dtype=np.float32), y])
if model_sr != sr:
    g = gcd(sr, model_sr); y = resample_poly(y, sr // g, model_sr // g).astype(np.float32)
if not args.no_norm:
    rms = float(np.sqrt(np.mean(y ** 2)) + 1e-9)
    y *= (10 ** (args.out_db / 20)) / rms
peak = float(np.max(np.abs(y))) or 1.0
if peak > 0.98: y *= 0.98 / peak
sf.write(args.out, y, sr, subtype='PCM_16')
print(f"wrote {args.out} ({len(y) / sr:.1f}s, model {os.path.basename(args.model)} @ {model_sr} Hz, {time.time() - t0:.1f}s)", file=sys.stderr)
