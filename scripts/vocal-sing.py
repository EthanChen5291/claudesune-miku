#!/usr/bin/env python
"""Vocal tier, stage 1: sing a score with a DiffSinger (OpenUtau-format) voice.

    vendor/vocal/env/bin/python scripts/vocal-sing.py score.json out.wav
        [--voice vendor/vocal/tiger/voicebank] [--speaker tiger_fresh]
        [--syllable la] [--steps 20] [--depth 0.6] [--gender 0.0]
        [--no-pitch-model]

Runs the voicebank's ONNX models directly with onnxruntime (no OpenUtau):
  linguistic + pitch  -> a sung f0 curve from the note list (portamento,
                         vibrato, note transitions are the model's own)
  acoustic            -> mel from phoneme tokens + durations + f0
  vocoder             -> waveform
Every note carries one syllable (default "la": a short `l` then the vowel
`aa`), so each onset re-articulates and the line reads as singing rather than
a held tone. Notes shorter than 120 ms drop the consonant. Phrases split at
rests >= 0.5 s and render independently (OpenUtau does the same); a phrase
after a rest >= 0.35 s opens with a breath (AP).

The score's per-note gain (the engine's ear-tuned accent envelope) is applied
as a smoothed amplitude envelope after synthesis — this voicebank has no
energy embedding, so it is the only way its dynamics reach the vocal.
"""
import argparse, json, os, sys, time
import numpy as np
import soundfile as sf
import yaml
import onnxruntime as ort

ap = argparse.ArgumentParser()
ap.add_argument('score'); ap.add_argument('out')
ap.add_argument('--voice', default=os.path.join(os.path.dirname(__file__), '..', 'vendor', 'vocal', 'tiger', 'voicebank'))
ap.add_argument('--speaker', default='tiger_fresh')
ap.add_argument('--syllable', default='la', help='syllable per note: la | na | ah | oo | mm (or "auto")')
ap.add_argument('--steps', type=int, default=20)
ap.add_argument('--depth', type=float, default=0.6)
ap.add_argument('--gender', type=float, default=0.0, help='-1..1 key-shift embed (formant), 0 = as recorded')
ap.add_argument('--velocity', type=float, default=1.0)
ap.add_argument('--no-pitch-model', action='store_true')
ap.add_argument('--consonant-ms', type=float, default=55.0)
ap.add_argument('--phrase-gap', type=float, default=0.5)
ap.add_argument('--breath-gap', type=float, default=0.10)
ap.add_argument('--quiet', action='store_true')
# r39 — "increase autotune if you can": 0..1 pulls the predicted pitch curve
# toward the score INSIDE each note (the first 60 ms of a note — the glide in —
# and every rest are left to the pitch model), so 1.0 is a hard-tuned Vocaloid
# line with the model's own note-to-note transitions kept, 0 is the model as it
# comes. Measured on vr_rooftop (dry, pyworld vs score): see the D-entry.
ap.add_argument('--tune', type=float, default=0.0)
args = ap.parse_args()

VB = os.path.abspath(args.voice)
cfg = yaml.safe_load(open(os.path.join(VB, 'dsconfig.yaml')))
SR = 44100
HOP = 512
FRAME = HOP / SR
log = (lambda *a: None) if args.quiet else (lambda *a: print(*a, file=sys.stderr))

so = ort.SessionOptions(); so.log_severity_level = 3
prov = ['CPUExecutionProvider']
def sess(p): return ort.InferenceSession(p, so, providers=prov)

def phoneme_ids(path):
    return {p: i for i, p in enumerate(open(path).read().split())}

# ---- models -----------------------------------------------------------------
acoustic = sess(os.path.join(VB, cfg['acoustic']))
ac_ph = phoneme_ids(os.path.join(VB, cfg['phonemes']))
voc_dir = os.path.join(VB, cfg['vocoder'])
voc_cfg = yaml.safe_load(open(os.path.join(voc_dir, 'vocoder.yaml')))
vocoder = sess(os.path.join(voc_dir, voc_cfg['model']))
assert voc_cfg.get('sample_rate', SR) == SR and voc_cfg.get('hop_size', HOP) == HOP

spk_ac = np.fromfile(os.path.join(VB, 'dsacoustic', f'{args.speaker}.emb'), dtype=np.float32)
assert spk_ac.shape == (256,), spk_ac.shape

pitch_model = None
if not args.no_pitch_model and os.path.isdir(os.path.join(VB, 'dspitch')):
    pcfg = yaml.safe_load(open(os.path.join(VB, 'dspitch', 'dsconfig.yaml')))
    pit_ling = sess(os.path.join(VB, 'dspitch', pcfg['linguistic']))
    pit_pred = sess(os.path.join(VB, 'dspitch', pcfg['pitch']))
    pit_ph = phoneme_ids(os.path.join(VB, 'dspitch', pcfg['phonemes']))
    spk_pit = np.fromfile(os.path.join(VB, 'dspitch', 'files', f'{args.speaker}.emb'), dtype=np.float32)
    pitch_model = (pit_ling, pit_pred, pit_ph, spk_pit)

# ---- syllables ----------------------------------------------------------------
SYL = {
    'la': ('l', 'aa'), 'na': ('n', 'aa'), 'da': ('d', 'aa'), 'ma': ('m', 'aa'),
    'ah': (None, 'aa'), 'oo': (None, 'uw'), 'oh': (None, 'ow'), 'mm': (None, 'm'),
    'lu': ('l', 'uw'), 'lo': ('l', 'ow'), 'no': ('n', 'ow'),
}
def syllable_for(i, note, prev):
    # r34: a score with generated lyrics carries `ph` per note (consonants
    # first, vowel last — src/lib/lyrics-ja.js); a melisma note continues the
    # previous vowel and takes no consonant
    if note.get('ph'):
        ph = [p if p in ac_ph else 'a' for p in note['ph']]
        if note.get('melisma') or len(ph) == 1:
            return None, ph[-1]
        return tuple(ph[:-1]), ph[-1]
    s = args.syllable
    if s == 'auto':
        # re-articulate after a rest or a leap; slur stepwise motion on the vowel
        if prev is None or note['start'] - (prev['start'] + prev['dur']) > 0.02 or abs(note['midi'] - prev['midi']) > 2:
            s = 'la'
        else:
            s = 'ah'
    cons, vow = SYL[s]
    if note['dur'] < 0.12: cons = None
    return cons, vow

# ---- score -> phrases ---------------------------------------------------------
score = json.load(open(args.score))
notes = sorted(score['notes'], key=lambda n: n['start'])
phrases, cur = [], []
for n in notes:
    # the score's own phrase index wins (2-bar lines with a breath trim, r34);
    # otherwise split at rests >= phrase_gap
    if cur and (n.get('phrase') != cur[0].get('phrase') if n.get('phrase') is not None else
                n['start'] - (cur[-1]['start'] + cur[-1]['dur']) >= args.phrase_gap):
        phrases.append(cur); cur = []
    cur.append(n)
if cur: phrases.append(cur)
log(f'{score["name"]}: {len(notes)} notes, {len(phrases)} phrases, {score["totalSeconds"]:.1f}s')

def midi_to_hz(m): return 440.0 * 2 ** ((np.asarray(m, dtype=np.float64) - 69) / 12)

def frames(sec): return max(1, int(round(sec / FRAME)))

def build_phrase(ph_notes, breath):
    """-> tokens(list[str]), ph_frames(list[int]), note_midi, note_rest, note_frames, ph_note_index"""
    toks, durs, nmidi, nrest, ndur = [], [], [], [], []
    ph_note = []  # token -> note index
    # leading pad (SP) and optional breath (AP) as rest notes. The breath is
    # as long as the gap allows (the exporter's breath trim leaves ~150 ms
    # between 2-bar lines; a real rest gets the full 180 ms)
    lead = 0.10
    toks.append('SP'); durs.append(frames(lead)); nmidi.append(0.0); nrest.append(True); ndur.append(durs[-1]); ph_note.append(0)
    if breath:
        toks.append('AP'); durs.append(frames(min(0.18, max(0.08, breath - 0.02)))); nmidi.append(0.0); nrest.append(True); ndur.append(durs[-1]); ph_note.append(len(nmidi) - 1)
    prev = None
    for i, n in enumerate(ph_notes):
        # rest between notes inside a phrase (short gap): SP note
        if prev is not None:
            gap = n['start'] - (prev['start'] + prev['dur'])
            if gap >= 0.06:
                toks.append('SP'); durs.append(frames(gap)); nmidi.append(0.0); nrest.append(True); ndur.append(durs[-1]); ph_note.append(len(nmidi) - 1)
        cons, vow = syllable_for(i, n, prev)
        nf = frames(n['dur'])
        # the consonant is sung BEFORE the beat and the vowel lands ON it (what
        # singers do and what OpenUtau's phonemizers do): it borrows its frames
        # from the previous token (the rest, or the previous note's vowel tail),
        # so the vowel starts exactly at the note start. Measured before this:
        # the vocal's onsets lagged the score by ~100 ms.
        if cons is not None and durs[-1] > 1:
            conss = list(cons) if isinstance(cons, tuple) else [cons]
            cf = min(frames(args.consonant_ms / 1000) * len(conss), durs[-1] - 1, max(len(conss), nf // 2))
            if cf < len(conss): conss = conss[-1:]
            durs[-1] -= cf
            per = [cf // len(conss)] * len(conss); per[-1] += cf - sum(per)
            for c, d in zip(conss, per):
                toks.append(c); durs.append(d); ph_note.append(len(nmidi))
            if i == 0: first_vowel_offset = sum(durs)
            toks.append(vow); durs.append(nf); ph_note.append(len(nmidi))
        else:
            if i == 0: first_vowel_offset = sum(durs)
            toks.append(vow); durs.append(nf); ph_note.append(len(nmidi))
        nmidi.append(float(n['midi'])); nrest.append(False); ndur.append(nf)
        prev = n
    toks.append('SP'); durs.append(frames(0.12)); nmidi.append(0.0); nrest.append(True); ndur.append(durs[-1]); ph_note.append(len(nmidi) - 1)
    # first_vowel_offset: frames from the phrase's audio start to the first
    # note's VOWEL. The phrase is placed so that this lands on the note start.
    # (Measured: computing the pad from the lead tokens AFTER the consonant had
    # borrowed from them placed every phrase late by one consonant — pitch
    # arrival went 24 -> 54 ms median while "fixing" the consonant order.)
    return toks, durs, nmidi, nrest, ndur, ph_note, first_vowel_offset

def base_pitch_curve(nmidi, nrest, ndur):
    """per-frame midi from the note list; rests take the nearest sung pitch."""
    n_frames = sum(ndur)
    curve = np.zeros(n_frames, dtype=np.float32)
    pos = 0
    last = None
    for m, r, d in zip(nmidi, nrest, ndur):
        curve[pos:pos + d] = np.nan if r else m
        pos += d
    # fill rests forward/backward
    idx = np.arange(n_frames)
    good = ~np.isnan(curve)
    if good.sum() == 0: return np.full(n_frames, 60.0, dtype=np.float32)
    curve = np.interp(idx, idx[good], curve[good]).astype(np.float32)
    return curve

def predicted_pitch(toks, durs, nmidi, nrest, ndur):
    pit_ling, pit_pred, pit_ph, spk = pitch_model
    n_frames = sum(durs)
    assert sum(ndur) == n_frames, (sum(ndur), n_frames)
    tokens = np.array([[pit_ph.get(t, pit_ph.get('SP')) for t in toks]], dtype=np.int64)
    ph_dur = np.array([durs], dtype=np.int64)
    enc = pit_ling.run(None, {'tokens': tokens, 'ph_dur': ph_dur})
    encoder_out = enc[0]
    base = base_pitch_curve(nmidi, nrest, ndur)
    feeds = {
        'encoder_out': encoder_out, 'ph_dur': ph_dur,
        'note_midi': np.array([nmidi], dtype=np.float32),
        'note_rest': np.array([nrest], dtype=bool),
        'note_dur': np.array([ndur], dtype=np.int64),
        'pitch': base[None, :].astype(np.float32),
        'expr': np.ones((1, n_frames), dtype=np.float32),
        'retake': np.ones((1, n_frames), dtype=bool),
        'spk_embed': np.tile(spk[None, None, :], (1, n_frames, 1)).astype(np.float32),
        'steps': np.array(args.steps, dtype=np.int64),
    }
    out = pit_pred.run(None, feeds)[0][0]
    return out.astype(np.float32), base

def hand_pitch(nmidi, nrest, ndur):
    base = base_pitch_curve(nmidi, nrest, ndur)
    n = len(base)
    t = np.arange(n) * FRAME
    # portamento: 40 ms glide into each note; vibrato after 250 ms of a note
    out = base.copy()
    pos = 0
    for m, r, d in zip(nmidi, nrest, ndur):
        if not r and d > int(0.25 / FRAME):
            k = np.arange(d) * FRAME
            vib = np.where(k > 0.25, 0.3 * np.sin(2 * np.pi * 5.5 * (k - 0.25)) * np.minimum(1, (k - 0.25) / 0.3), 0)
            out[pos:pos + d] += vib.astype(np.float32)
        pos += d
    kern = np.ones(4) / 4
    out = np.convolve(out, kern, mode='same').astype(np.float32)
    return out, base

def synth_phrase(toks, durs, f0_hz):
    n_frames = sum(durs)
    tokens = np.array([[ac_ph[t] for t in toks]], dtype=np.int64)
    feeds = {
        'tokens': tokens,
        'durations': np.array([durs], dtype=np.int64),
        'f0': f0_hz[None, :].astype(np.float32),
        'gender': np.full((1, n_frames), args.gender, dtype=np.float32),
        'velocity': np.full((1, n_frames), args.velocity, dtype=np.float32),
        'spk_embed': np.tile(spk_ac[None, None, :], (1, n_frames, 1)).astype(np.float32),
        'depth': np.array(min(args.depth, float(cfg.get('max_depth', 1.0))), dtype=np.float32),
        'steps': np.array(args.steps, dtype=np.int64),
    }
    mel = acoustic.run(None, feeds)[0]
    wav = vocoder.run(None, {'mel': mel.astype(np.float32), 'f0': f0_hz[None, :].astype(np.float32)})[0][0]
    return wav.astype(np.float32)

# ---- render ------------------------------------------------------------------
total = int((score['totalSeconds'] + 3.0) * SR)
mix = np.zeros(total, dtype=np.float32)
env = np.zeros(total, dtype=np.float32)
t0 = time.time()
report = {'phrases': [], 'pitch_model': pitch_model is not None}
prev_end = -10.0
for pi, ph in enumerate(phrases):
    gap = ph[0]['start'] - prev_end
    breath = gap if gap >= args.breath_gap else 0.0
    toks, durs, nmidi, nrest, ndur, ph_note, first_vowel_offset = build_phrase(ph, breath)
    if pitch_model is not None:
        try:
            pmidi, base = predicted_pitch(toks, durs, nmidi, nrest, ndur)
        except Exception as e:  # noqa
            log(f'  phrase {pi}: pitch model failed ({e}); hand curve'); pmidi, base = hand_pitch(nmidi, nrest, ndur)
    else:
        pmidi, base = hand_pitch(nmidi, nrest, ndur)
    # guard: the predictor must stay near the score (it writes ornaments, not a new tune)
    dev = np.abs(pmidi - base)
    if np.nanmedian(dev) > 2.0:
        log(f'  phrase {pi}: predicted pitch median-deviates {np.nanmedian(dev):.2f} st from score; using hand curve')
        pmidi, base = hand_pitch(nmidi, nrest, ndur)
    if args.tune > 0:
        # r39: inside each sung note, past its first 60 ms, blend the curve toward the score
        glide = max(1, int(round(0.06 / FRAME)))
        pos = 0
        for m, r, d in zip(nmidi, nrest, ndur):
            if not r and d > glide:
                a, b = pos + glide, pos + d
                pmidi[a:b] = base[a:b] + (pmidi[a:b] - base[a:b]) * (1.0 - args.tune)
            pos += d
        dev = np.abs(pmidi - base)
    f0 = midi_to_hz(pmidi).astype(np.float32)
    wav = synth_phrase(toks, durs, f0)
    lead_pad = first_vowel_offset * HOP
    start = int(round(ph[0]['start'] * SR)) - lead_pad
    if start < 0:
        wav = wav[-start:]; start = 0
    end = min(total, start + len(wav))
    mix[start:end] += wav[:end - start]
    # gain envelope: per-note gain, held across the note, smoothed
    for n in ph:
        a = int(n['start'] * SR); b = int((n['start'] + n['dur']) * SR) + int(0.05 * SR)
        env[a:min(total, b)] = np.maximum(env[a:min(total, b)], n['gain'])
    prev_end = ph[-1]['start'] + ph[-1]['dur']
    report['phrases'].append({'start': ph[0]['start'], 'notes': len(ph), 'frames': sum(durs), 'breath': breath,
                              'pitch_dev_median_st': float(np.nanmedian(dev)), 'pitch_dev_max_st': float(np.nanmax(dev))})
    log(f'  phrase {pi:2d} @{ph[0]["start"]:7.2f}s {len(ph):3d} notes {sum(durs):5d} frames  pitch dev med {np.nanmedian(dev):.2f} st  ({time.time() - t0:.0f}s)')

# envelope: fill rests with the neighbouring level so breaths/tails are not cut, then smooth (30 ms)
idx = np.arange(total); good = env > 0
if good.any():
    env = np.interp(idx, idx[good], env[good]).astype(np.float32)
else:
    env[:] = 1.0
k = int(0.03 * SR); env = np.convolve(env, np.ones(k) / k, mode='same').astype(np.float32)
mix *= env
peak = float(np.max(np.abs(mix))) or 1.0
if peak > 0.98: mix *= 0.98 / peak
sf.write(args.out, mix, SR, subtype='PCM_16')
report.update({'seconds': total / SR, 'peak': peak, 'render_s': time.time() - t0, 'speaker': args.speaker, 'syllable': args.syllable})
with open(os.path.splitext(args.out)[0] + '.sing.json', 'w') as f: json.dump(report, f, indent=1)
log(f'wrote {args.out} ({total / SR:.1f}s, peak {peak:.2f}, {time.time() - t0:.0f}s)')
