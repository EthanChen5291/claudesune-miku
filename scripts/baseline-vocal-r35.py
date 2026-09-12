#!/usr/bin/env python3
"""r35 — the ENGINE's own sung lines (audition/hq/*.vocal-score.json, the score
export-vocal.mjs sings) measured with the same yardsticks as the Vocaloid set,
so the comparison is like-for-like: range, tessitura, speed, IOI classes,
intervals, phrases (8th-rest breaths), repetition, phrase-start position.
Population: every *.vocal-score.json present (the r34/r35 vocal page + one
songs.html render). No harmony here — the score carries no chords; the
chord-tone comparison is done on the page mix separately.

    python3 scripts/baseline-vocal-r35.py
"""
import json, glob, statistics as st
from collections import Counter

def med(xs):
    xs = [x for x in xs if x is not None]
    return round(st.median(xs), 3) if xs else None
def q(xs, p):
    xs = sorted(x for x in xs if x is not None)
    return xs[min(len(xs) - 1, int(p * len(xs)))] if xs else None
def pc(x): return '—' if x is None else f'{100*x:.0f}%'

rows = []
for f in sorted(glob.glob('audition/hq/*.vocal-score.json')):
    d = json.load(open(f)); bpm = d['bpm']; spb = 60 / bpm
    notes = sorted(d['notes'], key=lambda n: n['start'])
    if len(notes) < 10: continue
    m = [n['midi'] for n in notes]
    beats = [n['start'] / spb for n in notes]; durs = [n['dur'] / spb for n in notes]
    iois = [beats[i] - beats[i - 1] for i in range(1, len(beats))]
    cls = lambda x: '16th' if x <= 0.3 else '8th' if x <= 0.6 else 'dot8th' if x <= 0.8 else 'quarter' if x <= 1.2 else 'half' if x <= 2.2 else 'long'
    ioh = Counter(cls(x) for x in iois if x <= 4); tot = sum(ioh.values()) or 1
    gaps = [beats[i] - (beats[i - 1] + durs[i - 1]) for i in range(1, len(beats))]
    phrases = [[0]]
    for i in range(1, len(notes)):
        if gaps[i - 1] >= 0.5: phrases.append([i])
        else: phrases[-1].append(i)
    ivs = [m[p[j]] - m[p[j - 1]] for p in phrases for j in range(1, len(p))]
    ic = lambda x: 'repeat' if x == 0 else 'step' if abs(x) <= 2 else 'third' if abs(x) <= 4 else 'leap4-5' if abs(x) <= 7 else 'leap6-8ve' if abs(x) <= 12 else 'wide'
    ih = Counter(ic(x) for x in ivs); itot = sum(ih.values()) or 1
    sung_bars = len(set(int(b // 4) for b in beats))
    slot = lambda b: int(round((b % 4) * 4)) % 16
    sp = Counter()
    for p in phrases:
        s = slot(beats[p[0]])
        sp['downbeat' if s == 0 else 'pickup(beat4)' if s >= 12 else 'beat3' if s == 8 else 'beat2/other' if s % 4 == 0 else 'off8th' if s % 2 == 0 else 'off16th'] += 1
    bars = {}
    for i, b in enumerate(beats): bars.setdefault(int(b // 4), []).append(i)
    total_bars = int(max(beats) // 4) + 1
    seen = set(); seenx = set(); cells = rep = repx = 0
    for b0 in range(0, total_bars, 2):
        idx = bars.get(b0, []) + bars.get(b0 + 1, [])
        if len(idx) < 2: continue
        cells += 1
        rh = ','.join(str(int(round(((beats[i] - b0 * 4) / 4) * 16))) for i in idx)
        iv = ','.join(str(m[idx[j]] - m[idx[j - 1]]) for j in range(1, len(idx)))
        sig = rh + '|' + iv; sigx = rh + '|' + ','.join(str(m[i]) for i in idx)
        if sig in seen: rep += 1
        if sigx in seenx: repx += 1
        seen.add(sig); seenx.add(sigx)
    lo, hi = min(m), max(m); ms = sorted(m)
    breaths = [g for g in gaps if g >= 0.5]
    rows.append(dict(name=d['name'], bpm=bpm, n=len(notes), lo=lo, hi=hi, median=int(st.median(m)), tess=ms[int(.9 * len(ms))] - ms[int(.1 * len(ms))], rng=hi - lo,
        sylps=round(len(notes) / (sung_bars * 4 * spb), 3), ioi_med=round(st.median(iois), 3), ioi={k: v / tot for k, v in ioh.items()}, dur_med=round(st.median(durs), 3),
        long=sum(x >= 2 for x in durs) / len(durs), legato=sum(1 for i in range(1, len(beats)) if beats[i - 1] + durs[i - 1] >= beats[i] - 0.02) / (len(beats) - 1),
        iv={k: v / itot for k, v in ih.items()}, mean_abs=round(st.mean(abs(x) for x in ivs), 3) if ivs else None, phrases=len(phrases),
        phr_beats=round(st.median([(beats[p[-1]] + durs[p[-1]]) - beats[p[0]] for p in phrases]), 2), phr_notes=st.median([len(p) for p in phrases]),
        breath=round(st.median(breaths), 2) if breaths else None, start={k: v / len(phrases) for k, v in sp.items()},
        rep2=rep / cells if cells else None, rep2x=repx / cells if cells else None, notes_per_bar=round(len(notes) / sung_bars, 2)))

print(f'# Engine sung lines — {len(rows)} scores (population: every audition/hq/*.vocal-score.json)\n')
print('| song | bpm | notes | lo–hi | median | tessitura | range | syl/s | notes/bar | IOI med | 16th | 8th | quarter | step | third | leap4-5 | repeat | phrases | phr beats | breath | start downbeat | pickup | off8th | rep2 shape | rep2 exact | long | legato |')
print('|' + '---|' * 27)
for r in rows:
    print(f"| {r['name']} | {r['bpm']} | {r['n']} | {r['lo']}–{r['hi']} | {r['median']} | {r['tess']} | {r['rng']} | {r['sylps']} | {r['notes_per_bar']} | {r['ioi_med']} | {pc(r['ioi'].get('16th', 0))} | {pc(r['ioi'].get('8th', 0))} | {pc(r['ioi'].get('quarter', 0))} | {pc(r['iv'].get('step', 0))} | {pc(r['iv'].get('third', 0))} | {pc(r['iv'].get('leap4-5', 0))} | {pc(r['iv'].get('repeat', 0))} | {r['phrases']} | {r['phr_beats']} | {r['breath']} | {pc(r['start'].get('downbeat', 0))} | {pc(r['start'].get('pickup(beat4)', 0))} | {pc(r['start'].get('off8th', 0))} | {pc(r['rep2'])} | {pc(r['rep2x'])} | {pc(r['long'])} | {pc(r['legato'])} |")
print('\n## Medians over songs (engine) — the row to set beside the Vocaloid table\n')
print('| metric | engine median | engine p10–p90 |\n|---|---|---|')
for key, name, f in [('lo', 'lowest note', None), ('hi', 'highest note', None), ('median', 'median note', None), ('tess', 'tessitura p10–p90 width', None), ('rng', 'full range', None), ('sylps', 'syllables/sec', None), ('notes_per_bar', 'notes per sung bar', None), ('ioi_med', 'IOI median (beats)', None), ('dur_med', 'duration median (beats)', None), ('long', 'long notes >=2 beats', pc), ('legato', 'legato', pc), ('mean_abs', 'mean |interval|', None), ('phrases', 'phrases', None), ('phr_beats', 'phrase beats (median)', None), ('phr_notes', 'notes per phrase', None), ('breath', 'breath (beats)', None), ('rep2', '2-bar shape repeat', pc), ('rep2x', '2-bar exact repeat', pc)]:
    xs = [r[key] for r in rows]; fmt = f or (lambda x: x)
    print(f'| {name} | {fmt(med(xs))} | {fmt(q(xs, .1))}–{fmt(q(xs, .9))} |')
for grp, src, keys in [('IOI', 'ioi', ['16th', '8th', 'dot8th', 'quarter', 'half', 'long']), ('intervals', 'iv', ['repeat', 'step', 'third', 'leap4-5', 'leap6-8ve', 'wide']), ('phrase start', 'start', ['downbeat', 'pickup(beat4)', 'beat3', 'beat2/other', 'off8th', 'off16th'])]:
    print(f'\n{grp} (median share): ' + ', '.join(f"{k}: {pc(med([r[src].get(k, 0) for r in rows]))}" for k in keys))
