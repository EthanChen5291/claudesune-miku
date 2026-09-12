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
ap.add_argument('--no-gate', action='store_true', help='skip the DI-keyed noise gate (r35)')
ap.add_argument('--gate-open', type=float, default=-55.0)
ap.add_argument('--gate-close', type=float, default=-65.0)
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
x0 = x.copy()  # the DI as played, for the gate below
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
# r35 (verify catch): the crunch capture with +12 dB in lifts the DI's silent
# stretches from under -70 dBFS to about -35 dBFS — a hiss bed between notes,
# a candidate for his "sounds a bit like white noise" (three cards). A gate
# keyed on the DI ITSELF (not the amped signal): 10 ms RMS envelope of the
# unamplified input, open above --gate-open dBFS, closed below --gate-close,
# 10 ms attack / 120 ms release so the note's own decay is kept and only the
# floor between notes is shut. --no-gate disables it.
if not args.no_gate:
    w = max(1, int(sr * 0.01))
    n = len(x0) // w
    env = np.sqrt(np.mean(x0[: n * w].reshape(n, w) ** 2, axis=1) + 1e-12)
    env_db = 20 * np.log10(env)
    target = np.clip((env_db - args.gate_close) / max(1e-6, (args.gate_open - args.gate_close)), 0.0, 1.0)
    # attack / release smoothing per 10 ms step
    att = np.exp(-1.0 / max(1.0, 0.010 / 0.01)); rel = np.exp(-1.0 / max(1.0, 0.120 / 0.01))
    g = np.zeros(n, dtype=np.float32); cur = 0.0
    for i in range(n):
        t = float(target[i])
        cur = t + (cur - t) * (att if t > cur else rel)
        g[i] = cur
    mask = np.repeat(g, w)
    if len(mask) < len(y): mask = np.concatenate([mask, np.full(len(y) - len(mask), mask[-1] if len(mask) else 1.0, dtype=np.float32)])
    y = y * mask[: len(y)]
if not args.no_norm:
    rms = float(np.sqrt(np.mean(y ** 2)) + 1e-9)
    y *= (10 ** (args.out_db / 20)) / rms
peak = float(np.max(np.abs(y))) or 1.0
if peak > 0.98: y *= 0.98 / peak
sf.write(args.out, y, sr, subtype='PCM_16')
print(f"wrote {args.out} ({len(y) / sr:.1f}s, model {os.path.basename(args.model)} @ {model_sr} Hz, {time.time() - t0:.1f}s)", file=sys.stderr)
