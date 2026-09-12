#!/usr/bin/env python3
"""r35 — tables over audios/vocaloid-r35/_analysis.json (the Vocaloid read-out).

Every table states its POPULATION (D137's lesson: four agents on one JSON read
four populations). Here there is ONE: the 36 analyzed files (37 minus the
piano-only Senbonzakura alt), and each table says when it is a subset (e.g.
the two files with a second voice, the songs whose verse/chorus split exists).

    python3 scripts/report-vocaloid-r35.py [--songs]   (default audios/vocaloid-r35/_analysis.json)
"""
import json, sys, statistics as st
from collections import Counter, defaultdict

PATH = 'audios/vocaloid-r35/_analysis.json'
data = [s for s in json.load(open(PATH)) if 'skipped' not in s]
N = len(data)
CONTROL = {'Yellow (Coldplay, control)'}
core = [s for s in data if s['label']['song'] not in CONTROL]

def med(xs):
    xs = [x for x in xs if x is not None]
    return round(st.median(xs), 3) if xs else None
def q(xs, p):
    xs = sorted(x for x in xs if x is not None)
    return xs[min(len(xs) - 1, int(p * len(xs)))] if xs else None
def pc(x): return '—' if x is None else f'{100*x:.0f}%'
def rng(xs):
    xs = [x for x in xs if x is not None]
    return f'{min(xs)}–{max(xs)}' if xs else '—'
def row(*cols): print('| ' + ' | '.join(str(c) for c in cols) + ' |')
def hdr(*cols): row(*cols); row(*(['---'] * len(cols)))
def by_lane(s):
    l = s['label']['lane']
    if 'rock' in l and 'ballad' not in l: return 'rock'
    if 'electro' in l or 'dance' in l or 'hyper' in l: return 'electro/dance'
    if 'ballad' in l or 'waltz' in l: return 'ballad'
    if 'j-pop' in l: return 'j-pop (human)'
    if 'control' in l: return 'control'
    return 'pop'
lanes = defaultdict(list)
for s in data: lanes[by_lane(s)].append(s)

print(f'# Vocaloid set read-out — {N} files analyzed (population: all {N}; "core" = {len(core)} without the Coldplay control)\n')

# ---- corpus
print('## Corpus\n')
hdr('lane', 'files', 'bpm median (range)', 'minor keys', 'bars median', 'voice track named')
for lane, ss in sorted(lanes.items(), key=lambda kv: -len(kv[1])):
    row(lane, len(ss), f"{med([s['bpm'] for s in ss])} ({rng([s['bpm'] for s in ss])})", pc(sum('minor' in s['key'] for s in ss) / len(ss)), med([s['totalBars'] for s in ss]), pc(sum(s['method'] == 'name' for s in ss) / len(ss)))
row('ALL', N, f"{med([s['bpm'] for s in data])} ({rng([s['bpm'] for s in data])})", pc(sum('minor' in s['key'] for s in data) / N), med([s['totalBars'] for s in data]), pc(sum(s['method'] == 'name' for s in data) / N))
print()
print('tempo bands (all): ' + ', '.join(f'{k}: {v}' for k, v in sorted(Counter(('<100' if s['bpm'] < 100 else '100–139' if s['bpm'] < 140 else '140–169' if s['bpm'] < 170 else '170+') for s in data).items())))
print('keys (all): ' + ', '.join(f'{k}: {v}' for k, v in Counter(s['key'] for s in data).most_common()))
print()

# ---- voice: range / tessitura / speed
print('## Voice — range, tessitura, speed (population: all files; median over songs, with the song-level spread)\n')
V = lambda s: s['voice']
hdr('metric', 'median', 'p10–p90 across songs', 'note')
row('lowest note (midi)', med([V(s)['lo'] for s in data]), f"{q([V(s)['lo'] for s in data], .1)}–{q([V(s)['lo'] for s in data], .9)}", 'A3=57, C4=60')
row('highest note', med([V(s)['hi'] for s in data]), f"{q([V(s)['hi'] for s in data], .1)}–{q([V(s)['hi'] for s in data], .9)}", 'G5=79, C6=84')
row('median note', med([V(s)['median'] for s in data]), f"{q([V(s)['median'] for s in data], .1)}–{q([V(s)['median'] for s in data], .9)}", 'E4=64, A4=69, C5=72')
row('tessitura p10–p90 width (semis)', med([V(s)['p90'] - V(s)['p10'] for s in data]), f"{q([V(s)['p90'] - V(s)['p10'] for s in data], .1)}–{q([V(s)['p90'] - V(s)['p10'] for s in data], .9)}", 'where 80% of notes live')
row('full range (semis)', med([V(s)['rangeSemis'] for s in data]), f"{q([V(s)['rangeSemis'] for s in data], .1)}–{q([V(s)['rangeSemis'] for s in data], .9)}", '')
row('monophony (share of onsets alone)', pc(med([V(s)['monophony'] for s in data])), f"{pc(q([V(s)['monophony'] for s in data], .1))}–{pc(q([V(s)['monophony'] for s in data], .9))}", '')
row('sung share of bars', pc(med([V(s)['sungShare'] for s in data])), f"{pc(q([V(s)['sungShare'] for s in data], .1))}–{pc(q([V(s)['sungShare'] for s in data], .9))}", '')
row('notes per sung bar', med([V(s)['notesPerSungBar'] for s in data]), f"{q([V(s)['notesPerSungBar'] for s in data], .1)}–{q([V(s)['notesPerSungBar'] for s in data], .9)}", '')
row('syllables per second', med([V(s)['syllablesPerSec'] for s in data]), f"{q([V(s)['syllablesPerSec'] for s in data], .1)}–{q([V(s)['syllablesPerSec'] for s in data], .9)}", 'onsets / sung seconds')
row('IOI median (beats)', med([V(s)['ioiMedianBeats'] for s in data]), f"{q([V(s)['ioiMedianBeats'] for s in data], .1)}–{q([V(s)['ioiMedianBeats'] for s in data], .9)}", '0.5 = 8th')
row('longest 16th run (notes)', med([V(s)['max16thRun'] for s in data]), f"{q([V(s)['max16thRun'] for s in data], .1)}–{q([V(s)['max16thRun'] for s in data], .9)}", '')
row('note duration median (beats)', med([V(s)['durMedianBeats'] for s in data]), f"{q([V(s)['durMedianBeats'] for s in data], .1)}–{q([V(s)['durMedianBeats'] for s in data], .9)}", '')
row('long notes (>=2 beats) share', pc(med([V(s)['longNotes'] for s in data])), f"{pc(q([V(s)['longNotes'] for s in data], .1))}–{pc(q([V(s)['longNotes'] for s in data], .9))}", '')
row('legato (note reaches next onset)', pc(med([V(s)['legato'] for s in data])), f"{pc(q([V(s)['legato'] for s in data], .1))}–{pc(q([V(s)['legato'] for s in data], .9))}", '')
print()
print('IOI class shares (median over songs): ' + ', '.join(f"{k}: {pc(med([V(s)['ioiShare'].get(k) or 0 for s in data]))}" for k in ['16th', '8th', 'dot8th', 'quarter', 'half', 'long']))
print()
print('### Speed by tempo band (population: all; syllables/sec and 16th-IOI share)\n')
hdr('bpm band', 'files', 'syl/s median', '16th share', '8th share', 'notes per sung bar', 'IOI median (beats)')
for band, lo, hi in [('<100', 0, 100), ('100–139', 100, 140), ('140–169', 140, 170), ('170+', 170, 999)]:
    ss = [s for s in data if lo <= s['bpm'] < hi]
    if not ss: continue
    row(band, len(ss), med([V(s)['syllablesPerSec'] for s in ss]), pc(med([V(s)['ioiShare'].get('16th') or 0 for s in ss])), pc(med([V(s)['ioiShare'].get('8th') or 0 for s in ss])), med([V(s)['notesPerSungBar'] for s in ss]), med([V(s)['ioiMedianBeats'] for s in ss]))
print()
print('### Range by lane (population: all)\n')
hdr('lane', 'files', 'lo', 'hi', 'median', 'tessitura width', 'full range', 'syl/s')
for lane, ss in sorted(lanes.items(), key=lambda kv: -len(kv[1])):
    row(lane, len(ss), med([V(s)['lo'] for s in ss]), med([V(s)['hi'] for s in ss]), med([V(s)['median'] for s in ss]), med([V(s)['p90'] - V(s)['p10'] for s in ss]), med([V(s)['rangeSemis'] for s in ss]), med([V(s)['syllablesPerSec'] for s in ss]))
print()

# ---- voice: intervals & phrases
print('## Voice — intervals, phrases, breath (population: all)\n')
print('within-phrase interval classes (median share over songs): ' + ', '.join(f"{k}: {pc(med([V(s)['intervals'].get(k) or 0 for s in data]))}" for k in ['repeat', 'step', 'third', 'leap4-5', 'leap6-8ve', 'wide']))
print(f"leap (>=P4) recovered by a step back: {pc(med([V(s)['leapRecoverShare'] for s in data]))} median; mean |interval| {med([V(s)['meanAbsInterval'] for s in data])} semis")
print()
hdr('metric', 'median', 'p10–p90')
row('phrases per song', med([V(s)['phrases'] for s in data]), f"{q([V(s)['phrases'] for s in data], .1)}–{q([V(s)['phrases'] for s in data], .9)}")
row('phrase length (beats, median)', med([V(s)['phraseBeatsMedian'] for s in data]), f"{q([V(s)['phraseBeatsMedian'] for s in data], .1)}–{q([V(s)['phraseBeatsMedian'] for s in data], .9)}")
row('phrase length p90 (beats)', med([V(s)['phraseBeatsP90'] for s in data]), f"{q([V(s)['phraseBeatsP90'] for s in data], .1)}–{q([V(s)['phraseBeatsP90'] for s in data], .9)}")
row('notes per phrase (median)', med([V(s)['phraseNotesMedian'] for s in data]), f"{q([V(s)['phraseNotesMedian'] for s in data], .1)}–{q([V(s)['phraseNotesMedian'] for s in data], .9)}")
row('breath between phrases (beats, median)', med([V(s)['breathBeatsMedian'] for s in data]), f"{q([V(s)['breathBeatsMedian'] for s in data], .1)}–{q([V(s)['breathBeatsMedian'] for s in data], .9)}")
row('phrase-final note (beats)', med([V(s)['phraseFinalDurBeats'] for s in data]), f"{q([V(s)['phraseFinalDurBeats'] for s in data], .1)}–{q([V(s)['phraseFinalDurBeats'] for s in data], .9)}")
print()
print('phrase START position (median share): ' + ', '.join(f"{k}: {pc(med([V(s)['phraseStart'].get(k) or 0 for s in data]))}" for k in ['downbeat', 'pickup(beat4)', 'beat3', 'beat2/other', 'off8th', 'off16th']))
print('phrase CONTOUR (phrases >=4 notes, median share): ' + ', '.join(f"{k}: {pc(med([V(s)['contour'].get(k) or 0 for s in data]))}" for k in ['arch', 'descend', 'ascend', 'flat']))
print('phrase-final LANDING vs the chord (median share): ' + ', '.join(f"{k}: {pc(med([V(s)['landing'].get(k) or 0 for s in data]))}" for k in ['root', '3rd', '5th', '7th', '9th', 'other']) + f"; lands on the KEY tonic {pc(med([V(s)['landingOnTonic'] for s in data]))}")
print()

# ---- harmony agreement
print('## Voice vs harmony — chord-tone rate by beat strength, NCT resolution, key (population: all; chord = half-bar label from NOTE+BASS)\n')
hdr('metric', 'median', 'p10–p90')
for k in ['beat1', 'beat3', 'beat2/4', 'off8th', 'off16th']:
    row(f'chord tone on {k}', pc(med([V(s)['chordToneByStrength'].get(k) for s in data])), f"{pc(q([V(s)['chordToneByStrength'].get(k) for s in data], .1))}–{pc(q([V(s)['chordToneByStrength'].get(k) for s in data], .9))}")
row('chord-tone share by DURATION', pc(med([V(s)['chordToneDurShare'] for s in data])), f"{pc(q([V(s)['chordToneDurShare'] for s in data], .1))}–{pc(q([V(s)['chordToneDurShare'] for s in data], .9))}")
row('non-chord-tone share (onsets)', pc(med([V(s)['nctShare'] for s in data])), f"{pc(q([V(s)['nctShare'] for s in data], .1))}–{pc(q([V(s)['nctShare'] for s in data], .9))}")
row('NCT resolved by step', pc(med([V(s)['nctResolved'] for s in data])), f"{pc(q([V(s)['nctResolved'] for s in data], .1))}–{pc(q([V(s)['nctResolved'] for s in data], .9))}")
row('NCT approached by step', pc(med([V(s)['nctApproached'] for s in data])), f"{pc(q([V(s)['nctApproached'] for s in data], .1))}–{pc(q([V(s)['nctApproached'] for s in data], .9))}")
row('out of key (natural scale)', pc(med([V(s)['outOfKey'] for s in data])), f"{pc(q([V(s)['outOfKey'] for s in data], .1))}–{pc(q([V(s)['outOfKey'] for s in data], .9))}")
row('out of key (raised 7th admitted)', pc(med([V(s)['outOfKeyHarmMinor'] for s in data])), f"{pc(q([V(s)['outOfKeyHarmMinor'] for s in data], .1))}–{pc(q([V(s)['outOfKeyHarmMinor'] for s in data], .9))}")
row('pentatonic share', pc(med([V(s)['pentatonicShare'] for s in data])), f"{pc(q([V(s)['pentatonicShare'] for s in data], .1))}–{pc(q([V(s)['pentatonicShare'] for s in data], .9))}")
print()
nd = Counter()
for s in data:
    for k, v in V(s)['nctDegrees'].items(): nd[int(k)] += v
tot = sum(nd.values())
print('which non-chord tones (semis above chord root, pooled over all onsets): ' + ', '.join(f'{k}: {100*v/tot:.0f}%' for k, v in nd.most_common(6)))
print()

# ---- repetition
print('## Voice — repetition (population: all; cell = rhythm slots + interval string, exact = + absolute pitches)\n')
hdr('metric', 'median', 'p10–p90')
row('1-bar cells repeating an earlier cell (shape)', pc(med([V(s)['rep1']['repeatShare'] for s in data])), f"{pc(q([V(s)['rep1']['repeatShare'] for s in data], .1))}–{pc(q([V(s)['rep1']['repeatShare'] for s in data], .9))}")
row('2-bar cells repeating (shape)', pc(med([V(s)['rep2']['repeatShare'] for s in data])), f"{pc(q([V(s)['rep2']['repeatShare'] for s in data], .1))}–{pc(q([V(s)['rep2']['repeatShare'] for s in data], .9))}")
row('2-bar cells repeating EXACTLY (pitches too)', pc(med([V(s)['rep2']['exactShare'] for s in data])), f"{pc(q([V(s)['rep2']['exactShare'] for s in data], .1))}–{pc(q([V(s)['rep2']['exactShare'] for s in data], .9))}")
row('2-bar RHYTHM repeating (any pitches)', pc(med([V(s)['rhythmRepeat2'] for s in data])), f"{pc(q([V(s)['rhythmRepeat2'] for s in data], .1))}–{pc(q([V(s)['rhythmRepeat2'] for s in data], .9))}")
row('distinct 2-bar shapes per song', med([V(s)['rep2']['distinct'] for s in data]), f"{q([V(s)['rep2']['distinct'] for s in data], .1)}–{q([V(s)['rep2']['distinct'] for s in data], .9)}")
row('odd-16th onsets', pc(med([V(s)['odd16'] for s in data])), f"{pc(q([V(s)['odd16'] for s in data], .1))}–{pc(q([V(s)['odd16'] for s in data], .9))}")
row('anticipations (& of 2 / & of 4 slots)', pc(med([V(s)['anticipation'] for s in data])), f"{pc(q([V(s)['anticipation'] for s in data], .1))}–{pc(q([V(s)['anticipation'] for s in data], .9))}")
row('short note in the bar\'s final 16th slot', pc(med([V(s)['shortLastSlot'] for s in data])), f"{pc(q([V(s)['shortLastSlot'] for s in data], .1))}–{pc(q([V(s)['shortLastSlot'] for s in data], .9))}")
row('velocity distinct values', med([V(s)['velDistinct'] for s in data]), f"{q([V(s)['velDistinct'] for s in data], .1)}–{q([V(s)['velDistinct'] for s in data], .9)}")
print()

# ---- form
print('## Form — verse vs chorus (population: songs with a split = sung 4-bar windows >= 4; verse = bottom third by register+density composite, chorus = top third)\n')
C = [s for s in data if s['form']['contrast']]
ct = lambda k, i: med([s['form']['contrast'][k][i] for s in C])
hdr('measure', 'verse (median)', 'chorus (median)', 'delta / ratio')
for k, name, kind in [('vMed', 'voice median pitch', 'd'), ('vHi', 'voice top', 'd'), ('vLo', 'voice bottom', 'd'), ('vNotesPerBar', 'voice notes / bar', 'r'), ('vVel', 'voice velocity', 'd'), ('aOnsetsPerBar', 'acc onsets / bar', 'r'), ('aMeanSize', 'acc notes per strike', 'r'), ('aTop', 'acc top (p90 midi)', 'd'), ('bOnsetsPerBar', 'bass onsets / bar', 'r'), ('bMed', 'bass median', 'd'), ('chordChangesPerBar', 'chords / bar', 'r')]:
    a, b = ct(k, 0), ct(k, 1)
    row(name, a, b, (f'{b - a:+.1f}' if kind == 'd' else f'x{b / a:.2f}') if a and b is not None else '—')
lifts = [s['form']['contrast']['vMed'][1] - s['form']['contrast']['vMed'][0] for s in C]
print(f"\n{len(C)} songs split. Register lift distribution (chorus median − verse median, semis): " + ', '.join(f'{k}: {v}' for k, v in sorted(Counter(('<=0' if l <= 0 else '1–2' if l <= 2 else '3–4' if l <= 4 else '5–7' if l <= 7 else '8+') for l in lifts).items())))
print(f"chorus TOP over verse TOP: " + ', '.join(f'{k}: {v}' for k, v in sorted(Counter(('<=0' if l <= 0 else '1–2' if l <= 2 else '3–4' if l <= 4 else '5–7' if l <= 7 else '8+') for l in [s['form']['contrast']['vHi'][1] - s['form']['contrast']['vHi'][0] for s in C]).items())))
print()
# an INDEPENDENT split: chorus/verse chosen by the ACCOMPANIMENT alone (acc
# onsets + notes per strike + bass onsets), so the voice's lift is not selected on
print('### The same contrast with verse/chorus chosen by the ACCOMPANIMENT ONLY (voice not in the selector; population: the same songs)\n')
def acc_split(s):
    W = [w for w in s['form']['windowTable'] if w['sung'] and (w['vNotesPerBar'] or 0) >= 2]
    if len(W) < 4: return None
    def z(k):
        vals = [w[k] or 0 for w in W]; m = st.mean(vals); sd = st.pstdev(vals) or 1
        return [((w[k] or 0) - m) / sd for w in W]
    za, zs, zb = z('aOnsetsPerBar'), z('aMeanSize'), z('bOnsetsPerBar')
    sc = [za[i] + zs[i] + 0.5 * zb[i] for i in range(len(W))]
    order = sorted(range(len(W)), key=lambda i: sc[i]); k = max(1, len(W) // 3)
    return [W[i] for i in order[:k]], [W[i] for i in order[-k:]]
A = [(s, acc_split(s)) for s in data]; A = [(s, x) for s, x in A if x]
def avg2(ws, k):
    xs = [w[k] for w in ws if w.get(k) is not None]; return st.mean(xs) if xs else None
hdr('measure', 'verse (median)', 'chorus (median)', 'delta / ratio')
for k, name, kind in [('vMed', 'voice median pitch', 'd'), ('vHi', 'voice top', 'd'), ('vLo', 'voice bottom', 'd'), ('vNotesPerBar', 'voice notes / bar', 'r'), ('accDoubles', 'acc doubles the voice pc at onset', 'd%'), ('aOnsetsPerBar', 'acc onsets / bar', 'r'), ('aMeanSize', 'acc notes per strike', 'r'), ('aTop', 'acc top (p90)', 'd'), ('bMed', 'bass median', 'd'), ('chordChangesPerBar', 'chords / bar', 'r')]:
    a = med([avg2(v, k) for s, (v, c) in A]); b = med([avg2(c, k) for s, (v, c) in A])
    row(name, a if kind != 'd%' else pc(a), b if kind != 'd%' else pc(b), (f'{b - a:+.1f}' if kind == 'd' else f'{100*(b-a):+.0f} pts' if kind == 'd%' else f'x{b / a:.2f}') if a and b is not None else '—')
lifts2 = [avg2(c, 'vMed') - avg2(v, 'vMed') for s, (v, c) in A]
print(f"\n{len(A)} songs. Register lift (chorus − verse voice median, semis): " + ', '.join(f'{k}: {v}' for k, v in sorted(Counter(('<=0' if l <= 0 else '1–2' if l <= 2 else '3–4' if l <= 4 else '5–7' if l <= 7 else '8+') for l in lifts2).items())))
print()
print('### Intro / interludes / outro (population: all; bars)\n')
hdr('metric', 'median', 'p10–p90', 'note')
row('intro bars before the voice', med([s['form']['introBars'] for s in data]), f"{q([s['form']['introBars'] for s in data], .1)}–{q([s['form']['introBars'] for s in data], .9)}", 'seconds vary with bpm')
row('intro seconds', med([s['form']['introBars'] * 240 / s['bpm'] for s in data]), f"{q([s['form']['introBars'] * 240 / s['bpm'] for s in data], .1):.0f}–{q([s['form']['introBars'] * 240 / s['bpm'] for s in data], .9):.0f}", '')
row('instrumental interludes (>=2 bars) per song', med([len(s['form']['interludes']) for s in data]), f"{q([len(s['form']['interludes']) for s in data], .1)}–{q([len(s['form']['interludes']) for s in data], .9)}", '')
row('interlude length (bars, pooled median)', med([g for s in data for g in s['form']['interludes']]), f"{q([g for s in data for g in s['form']['interludes']], .1)}–{q([g for s in data for g in s['form']['interludes']], .9)}", '')
row('outro bars after the voice', med([s['form']['outroBars'] for s in data]), f"{q([s['form']['outroBars'] for s in data], .1)}–{q([s['form']['outroBars'] for s in data], .9)}", '')
print()

# ---- support
print('## Support — what plays with the voice (population: all)\n')
S = lambda s: s['support']
hdr('metric', 'median', 'p10–p90', 'reading')
row('voice onsets struck WITH an acc onset (homorhythm)', pc(med([S(s)['homorhythmShare'] for s in data])), f"{pc(q([S(s)['homorhythmShare'] for s in data], .1))}–{pc(q([S(s)['homorhythmShare'] for s in data], .9))}", '')
row('acc doubles the voice at pitch', pc(med([S(s)['accDoublesVoice'] for s in data])), f"{pc(q([S(s)['accDoublesVoice'] for s in data], .1))}–{pc(q([S(s)['accDoublesVoice'] for s in data], .9))}", 'same midi at the onset')
row('acc doubles the voice at another octave', pc(med([S(s)['accDoublesVoiceOctave'] for s in data])), f"{pc(q([S(s)['accDoublesVoiceOctave'] for s in data], .1))}–{pc(q([S(s)['accDoublesVoiceOctave'] for s in data], .9))}", '')
row('acc TOP note above the voice (sounding)', pc(med([S(s)['accTopAboveVoice'] for s in data])), f"{pc(q([S(s)['accTopAboveVoice'] for s in data], .1))}–{pc(q([S(s)['accTopAboveVoice'] for s in data], .9))}", 'D77 in the source')
row('acc top − voice (semis, median)', med([S(s)['accTopIvMedian'] for s in data]), f"{q([S(s)['accTopIvMedian'] for s in data], .1)}–{q([S(s)['accTopIvMedian'] for s in data], .9)}", 'negative = under')
row('nearest acc note UNDER the voice (semis)', med([S(s)['accUnderMedian'] for s in data]), f"{q([S(s)['accUnderMedian'] for s in data], .1)}–{q([S(s)['accUnderMedian'] for s in data], .9)}", '')
row('acc onsets / bar', med([S(s)['accOnsetsPerBar'] for s in data]), f"{q([S(s)['accOnsetsPerBar'] for s in data], .1)}–{q([S(s)['accOnsetsPerBar'] for s in data], .9)}", 'notes, not strikes')
row('acc notes per strike', med([S(s)['accClusterMean'] for s in data]), f"{q([S(s)['accClusterMean'] for s in data], .1)}–{q([S(s)['accClusterMean'] for s in data], .9)}", '')
row('acc on the 8th grid', pc(med([S(s)['accOnGrid8'] for s in data])), f"{pc(q([S(s)['accOnGrid8'] for s in data], .1))}–{pc(q([S(s)['accOnGrid8'] for s in data], .9))}", '')
row('acc notes / bar in SUNG bars', med([S(s)['accSungBarMean'] for s in data]), f"{q([S(s)['accSungBarMean'] for s in data], .1)}–{q([S(s)['accSungBarMean'] for s in data], .9)}", '')
row('acc notes / bar in voice-REST bars (interludes)', med([S(s)['accSilentBarMean'] for s in data]), f"{q([S(s)['accSilentBarMean'] for s in data], .1)}–{q([S(s)['accSilentBarMean'] for s in data], .9)}", 'the fill')
row('bass onsets / bar', med([S(s)['bass']['onsetsPerBar'] for s in data]), f"{q([S(s)['bass']['onsetsPerBar'] for s in data], .1)}–{q([S(s)['bass']['onsetsPerBar'] for s in data], .9)}", '')
row('bass on the chord root', pc(med([S(s)['bass']['rootLock'] for s in data])), f"{pc(q([S(s)['bass']['rootLock'] for s in data], .1))}–{pc(q([S(s)['bass']['rootLock'] for s in data], .9))}", '')
row('bass median midi', med([S(s)['bass']['median'] for s in data]), f"{q([S(s)['bass']['median'] for s in data], .1)}–{q([S(s)['bass']['median'] for s in data], .9)}", 'C2=36, C3=48')
row('bass strikes that are clusters', pc(med([S(s)['bass']['clusterShare'] for s in data])), f"{pc(q([S(s)['bass']['clusterShare'] for s in data], .1))}–{pc(q([S(s)['bass']['clusterShare'] for s in data], .9))}", '')
row('… of which octaves', pc(med([S(s)['bass']['octaveShare'] for s in data])), f"{pc(q([S(s)['bass']['octaveShare'] for s in data], .1))}–{pc(q([S(s)['bass']['octaveShare'] for s in data], .9))}", '')
print()
print('nearest acc note under the voice — interval class (median share): ' + ', '.join(f"{k}: {pc(med([S(s)['accUnderInterval'].get(k) or 0 for s in data]))}" for k in ['2nd', '3rd', '4th', '5th', '6th', '7th', '8ve', '>8ve']))
print()
print('### The second voice (population: the files carrying one)\n')
for s in data:
    v2 = S(s)['voice2']
    if not v2: continue
    print(f"- **{s['label']['song']}**: {v2['notes']} notes over {v2['bars']} bars ({pc(v2['barShare'])} of sung bars), first at bar {v2['firstBar']}, median midi {v2['med']} (voice {V(s)['median']}); strikes WITH the voice {pc(v2['coincidentShare'])}, SOUNDS while the voice sounds {pc(v2['overlapShare'])}, sings in bars the voice also sings {pc(v2['sameBarShare'])}" + (' — stacked harmony: ' + ', '.join(f'{k} {pc(v)}' for k, v in sorted(v2['intervals'].items(), key=lambda kv: -kv[1])[:5]) if v2['intervals'] else ' — a TRADE (answer lines), never a stacked harmony') + f"; in chorus windows: {v2['inChorus']}, in verse windows: {v2['inVerse']}")
print()

# ---- harmony
print('## Harmony — loops, colour, borrowed, cadence (population: all; chord labels from NOTE+BASS at half-bar resolution)\n')
H = lambda s: s['harmony']
hdr('metric', 'median', 'p10–p90')
row('chords per bar', med([H(s)['chordsPerBar'] for s in data]), f"{q([H(s)['chordsPerBar'] for s in data], .1)}–{q([H(s)['chordsPerBar'] for s in data], .9)}")
row('colour share (7ths/9ths/sus/6)', pc(med([H(s)['colorShare'] for s in data])), f"{pc(q([H(s)['colorShare'] for s in data], .1))}–{pc(q([H(s)['colorShare'] for s in data], .9))}")
row('diatonic share', pc(med([H(s)['diatonicShare'] for s in data])), f"{pc(q([H(s)['diatonicShare'] for s in data], .1))}–{pc(q([H(s)['diatonicShare'] for s in data], .9))}")
print()
qh = Counter()
for s in data:
    for k, v in H(s)['qualityHist'].items(): qh[k or 'triad'] += v
tot = sum(qh.values())
print('quality shares (pooled segments): ' + ', '.join(f'{k}: {100*v/tot:.0f}%' for k, v in qh.most_common(9)))
bh = Counter()
for s in data:
    for k in H(s)['borrowed']: bh[k] += 1
print('borrowed devices (songs carrying it in >=2 half-bars): ' + ', '.join(f'{k}: {v}' for k, v in bh.most_common(10)))
print()
print('### Loops (the top loop per song by coverage; skeleton = numerals; population: all)\n')
lc = Counter(); cad = Counter(); start = Counter(); lb = Counter()
for s in data:
    L = H(s)['loops']
    if not L: continue
    top = max(L, key=lambda l: l['coverage'])
    lc[top['numerals']] += 1; cad[top['cadence']] += 1; start['tonic' if top['startsOnTonic'] else 'non-tonic'] += 1; lb[top['bars']] += 1
print('loop length (bars): ' + ', '.join(f'{k}: {v}' for k, v in sorted(lb.items())))
print('starts on the tonic: ' + ', '.join(f'{k}: {v}' for k, v in start.items()))
print('cadence class: ' + ', '.join(f'{k}: {v}' for k, v in cad.most_common(8)))
print()
hdr('song', 'key', 'bpm', 'top loop (bars × reps, coverage)', 'numerals', 'second loop')
for s in sorted(data, key=lambda s: s['label']['lane']):
    L = sorted(H(s)['loops'], key=lambda l: -l['coverage'])
    if not L: row(s['label']['song'], s['key'], s['bpm'], '—', '—', '—'); continue
    t = L[0]
    row(s['label']['song'], s['key'], s['bpm'], f"{t['bars']}×{t['reps']} ({pc(t['coverage'])})", t['numerals'], L[1]['numerals'] if len(L) > 1 else '—')
print()

if '--songs' in sys.argv:
    print('## Per-song digest\n')
    for s in sorted(data, key=lambda s: (by_lane(s), s['label']['song'])):
        v, sp, f, h = V(s), S(s), s['form'], H(s)
        c = f['contrast']
        print(f"### {s['label']['song']} — {s['label']['producer']} · {s['label']['lane']} · {s['label']['emotion']} · {s['bpm']} bpm · {s['key']} · {s['totalBars']} bars")
        print(f"- voice {v['lo']}–{v['hi']} (median {v['median']}, tessitura {v['p10']}–{v['p90']}), {v['syllablesPerSec']} syl/s, IOI median {v['ioiMedianBeats']} beats, 16th share {pc(v['ioiShare'].get('16th') or 0)}, max 16th run {v['max16thRun']}, sung {pc(v['sungShare'])} of bars, {v['notesPerSungBar']} notes/sung bar")
        print(f"- intervals step {pc(v['intervals'].get('step') or 0)} / third {pc(v['intervals'].get('third') or 0)} / leap4-5 {pc(v['intervals'].get('leap4-5') or 0)} / 6th+ {pc((v['intervals'].get('leap6-8ve') or 0) + (v['intervals'].get('wide') or 0))} / repeat {pc(v['intervals'].get('repeat') or 0)}; phrases {v['phrases']} × {v['phraseBeatsMedian']} beats, breath {v['breathBeatsMedian']} beats, starts " + ', '.join(f'{k} {pc(x)}' for k, x in sorted(v['phraseStart'].items(), key=lambda kv: -kv[1])[:3]))
        print(f"- chord tone: beat1 {pc(v['chordToneByStrength'].get('beat1'))} beat3 {pc(v['chordToneByStrength'].get('beat3'))} off8th {pc(v['chordToneByStrength'].get('off8th'))} off16th {pc(v['chordToneByStrength'].get('off16th'))}; NCT {pc(v['nctShare'])} resolved {pc(v['nctResolved'])}; out of key {pc(v['outOfKey'])}; landing " + ', '.join(f'{k} {pc(x)}' for k, x in sorted(v['landing'].items(), key=lambda kv: -kv[1])[:3]))
        print(f"- repetition: 2-bar shape {pc(v['rep2']['repeatShare'])}, exact {pc(v['rep2']['exactShare'])}, rhythm-only {pc(v['rhythmRepeat2'])}; odd16 {pc(v['odd16'])}; long notes {pc(v['longNotes'])}")
        print(f"- support: homorhythm {pc(sp['homorhythmShare'])}, acc doubles {pc(sp['accDoublesVoice'])} (+{pc(sp['accDoublesVoiceOctave'])} 8ve), acc top above voice {pc(sp['accTopAboveVoice'])} (median {sp['accTopIvMedian']}), under-interval " + ', '.join(f'{k} {pc(x)}' for k, x in sorted(sp['accUnderInterval'].items(), key=lambda kv: -kv[1])[:3]) + f"; acc {sp['accOnsetsPerBar']} notes/bar × {sp['accClusterMean']} per strike; sung-bar {sp['accSungBarMean']} vs rest-bar {sp['accSilentBarMean']}; bass {sp['bass']['onsetsPerBar']}/bar root {pc(sp['bass']['rootLock'])} med {sp['bass']['median']}" + (f"; VOICE 2: {sp['voice2']['notes']} notes, " + ', '.join(f'{k} {pc(x)}' for k, x in sorted(sp['voice2']['intervals'].items(), key=lambda kv: -kv[1])[:3]) if sp['voice2'] else ''))
        if c: print(f"- verse→chorus: voice median {c['vMed'][0]}→{c['vMed'][1]}, top {c['vHi'][0]}→{c['vHi'][1]}, notes/bar {c['vNotesPerBar'][0]}→{c['vNotesPerBar'][1]}, vel {c['vVel'][0]}→{c['vVel'][1]}, acc {c['aOnsetsPerBar'][0]}→{c['aOnsetsPerBar'][1]} notes/bar, per strike {c['aMeanSize'][0]}→{c['aMeanSize'][1]}, bass {c['bOnsetsPerBar'][0]}→{c['bOnsetsPerBar'][1]}/bar med {c['bMed'][0]}→{c['bMed'][1]}, chords/bar {c['chordChangesPerBar'][0]}→{c['chordChangesPerBar'][1]} (verse windows at bars {c['verseWindows']}, chorus {c['chorusWindows']})")
        print(f"- form: intro {f['introBars']} bars, interludes {f['interludes']}, outro {f['outroBars']}; harmony {h['chordsPerBar']} chords/bar, colour {pc(h['colorShare'])}, diatonic {pc(h['diatonicShare'])}, borrowed {h['borrowed']}; loops: " + ' | '.join(f"{l['numerals']} ({l['bars']}b×{l['reps']} @{l['atBar']})" for l in h['loops']))
        print()
