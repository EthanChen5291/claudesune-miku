#!/usr/bin/env python
"""Vocal tier: MEASURE a rendered vocal against its score (never trust "returned OK").

    vendor/vocal/env/bin/python scripts/vocal-verify.py score.json vocal.wav [--json out.json]

Per note: the fraction of voiced f0 frames (pyworld harvest) inside the note's
span that sit within 50 cents of the score pitch (any octave counted
separately as an octave error). Reports the note hit rate, octave-error rate,
voiced coverage of the sung spans, silence inside rests (leak), and the level.
"""
import argparse, json, sys
import numpy as np
import soundfile as sf
import pyworld as pw

ap = argparse.ArgumentParser()
ap.add_argument('score'); ap.add_argument('wav'); ap.add_argument('--json'); ap.add_argument('--tol', type=float, default=50.0)
args = ap.parse_args()
score = json.load(open(args.score))
x, sr = sf.read(args.wav, dtype='float64')
if x.ndim > 1: x = x.mean(axis=1)
hop_ms = 5.0
f0, t = pw.harvest(x, sr, f0_floor=60.0, f0_ceil=1400.0, frame_period=hop_ms)
f0 = pw.stonemask(x, f0, t, sr)
midi = np.where(f0 > 0, 69 + 12 * np.log2(np.maximum(f0, 1e-6) / 440.0), np.nan)

notes = score['notes']
hits, octs, voiced, total_frames = [], [], [], 0
per_note = []
for n in notes:
    a = int(n['start'] / (hop_ms / 1000)); b = int((n['start'] + n['dur']) / (hop_ms / 1000))
    # skip the first 40 ms (consonant/transition) and last 20 ms
    a2 = a + int(0.04 / (hop_ms / 1000)); b2 = max(a2 + 1, b - int(0.02 / (hop_ms / 1000)))
    seg = midi[a2:b2]
    v = seg[~np.isnan(seg)]
    cov = len(v) / max(1, len(seg))
    if len(v) == 0:
        per_note.append({'start': n['start'], 'midi': n['midi'], 'hit': 0.0, 'oct': 0.0, 'voiced': 0.0}); hits.append(0); octs.append(0); voiced.append(0); continue
    dev = v - n['midi']
    within = np.abs(dev) * 100 <= args.tol
    octerr = (~within) & (np.abs(np.abs(dev) - 12) * 100 <= args.tol)
    per_note.append({'start': n['start'], 'midi': n['midi'], 'hit': float(within.mean()), 'oct': float(octerr.mean()), 'voiced': cov, 'median_dev_cents': float(np.median(dev) * 100)})
    hits.append(within.mean()); octs.append(octerr.mean()); voiced.append(cov)

# rests: voiced energy where the score is silent (leak) — measured on RMS over 50 ms windows
rms_win = int(0.05 * sr)
env = np.sqrt(np.convolve(x ** 2, np.ones(rms_win) / rms_win, mode='same'))
sung = np.zeros(len(x), dtype=bool)
for n in notes:
    a = int(n['start'] * sr); b = int((n['start'] + n['dur'] + 0.25) * sr)
    sung[max(0, a - int(0.15 * sr)):min(len(x), b)] = True
sung_rms = float(np.sqrt(np.mean(x[sung] ** 2))) if sung.any() else 0.0
rest_rms = float(np.sqrt(np.mean(x[~sung] ** 2))) if (~sung).any() else 0.0
db = lambda v: 20 * np.log10(max(v, 1e-9))

# onset lag by PITCH ARRIVAL: for each note preceded by a different pitch or a
# rest, the first frame (from 120 ms before the score onset) whose tracked f0
# sits within `tol` of the note; the median over notes is the line's lag. An
# amplitude-envelope estimate is unusable here — a sung "la" rises slowly and
# the room tail smears it (measured +185/+30/+100 ms on three views of one
# performance); pitch arrival is what the ear counts as the note starting.
hop_s = hop_ms / 1000
lags = []
for i, n in enumerate(notes):
    if i and abs(notes[i - 1]['midi'] - n['midi']) < 1 and notes[i - 1]['start'] + notes[i - 1]['dur'] > n['start'] - 0.02:
        continue  # a repeated pitch has no pitch arrival to measure
    a = int((n['start'] - 0.12) / hop_s); b = int((n['start'] + min(n['dur'], 0.4)) / hop_s)
    seg = midi[max(0, a):b]
    ok = np.where(~np.isnan(seg) & (np.abs(seg - n['midi']) * 100 <= args.tol))[0]
    if len(ok): lags.append((max(0, a) + ok[0]) * hop_s - n['start'])
lags = np.array(lags) * 1000
hits = np.array(hits); octs = np.array(octs); voiced = np.array(voiced)
rep = {
    'wav': args.wav, 'seconds': len(x) / sr, 'sr': sr, 'notes': len(notes),
    'note_hit_rate_mean': float(hits.mean()), 'notes_hit_ge_50pct': float((hits >= 0.5).mean()),
    'octave_error_rate_mean': float(octs.mean()), 'notes_octave_wrong': int((octs > 0.5).sum()),
    'voiced_coverage_mean': float(voiced.mean()), 'notes_unvoiced': int((voiced < 0.2).sum()),
    'sung_rms_db': db(sung_rms), 'rest_rms_db': db(rest_rms), 'rest_leak_db': db(rest_rms) - db(sung_rms),
    'onset_lag_median_ms': float(np.median(lags)) if len(lags) else None,
    'onset_lag_p90_ms': float(np.percentile(lags, 90)) if len(lags) else None, 'onset_lag_notes': int(len(lags)),
    'worst_notes': sorted(per_note, key=lambda p: p['hit'])[:8],
}
print(f"{args.wav}: {len(notes)} notes  hit {rep['note_hit_rate_mean']*100:.1f}% of voiced frames within {args.tol:.0f} cents  "
      f"({rep['notes_hit_ge_50pct']*100:.1f}% of notes >=50%)  octave-wrong notes {rep['notes_octave_wrong']}  "
      f"unvoiced notes {rep['notes_unvoiced']}  voiced cov {rep['voiced_coverage_mean']*100:.0f}%  "
      f"onset lag median {rep['onset_lag_median_ms'] if rep['onset_lag_median_ms'] is None else round(rep['onset_lag_median_ms'])} ms (p90 {rep['onset_lag_p90_ms'] if rep['onset_lag_p90_ms'] is None else round(rep['onset_lag_p90_ms'])}, n={rep['onset_lag_notes']})  "
      f"sung {rep['sung_rms_db']:.1f} dB, rests {rep['rest_rms_db']:.1f} dB")
if args.json:
    json.dump(rep, open(args.json, 'w'), indent=1)
