#!/usr/bin/env python3
"""
"Aurora" -- melodic trance, 138 BPM, form A B C B (16-bar sections).

Self-contained generator: writes a Standard MIDI File (aurora.mid) and a
fully synthesized stereo WAV render (aurora.wav) using only numpy + stdlib.

Sections (bars):
  A   0-15   intro/verse: kick+bass, hats, pluck arp, pads; riser+fill into B1
  B1  16-31  chorus: full mix + supersaw lead melody
  C   32-47  breakdown: no kick/bass; pads + emotive lead, arp build,
             riser+fill into the final chorus
  B2  48-63  final chorus (same material as B1)
  +1 bar ending hit, then reverb tail.
"""

import math
import struct
import wave
from pathlib import Path

import numpy as np

# ----------------------------------------------------------------------------
# Version parameters (these are the only knobs that differ between versions)
# ----------------------------------------------------------------------------
TRANSPOSE = 2            # semitones added to every pitched note (+2 = B minor)
INTRO_RISER_BARS = 2     # riser length going into the first chorus (B1)
INTRO_FILL_BARS = 1      # drum-fill length going into the first chorus
FINAL_RISER_BARS = 4     # riser length going into the final chorus (B2)
FINAL_FILL_BARS = 2      # drum-fill length going into the final chorus

# ----------------------------------------------------------------------------
# Globals
# ----------------------------------------------------------------------------
BPM = 138.0
SPB = 60.0 / BPM                 # seconds per beat
SR = 44100
TPB = 480                        # MIDI ticks per beat

BAR = 4                          # beats per bar
SEC_A, SEC_B1, SEC_C, SEC_B2 = 0, 16, 32, 48   # section start bars
END_BAR = 64                                    # ending-hit bar
TAIL_SEC = 2.5

RNG = np.random.default_rng(7)   # fixed seed: noise/drums identical across runs

# Chord progression: Am F C G (i-VI-III-VII), one chord per bar, 4-bar loop.
BASS_ROOTS = [45, 41, 48, 43]                       # A2 F2 C3 G2
PAD_CHORDS = [[57, 60, 64],                          # Am: A3 C4 E4
              [57, 60, 65],                          # F : A3 C4 F4
              [55, 60, 64],                          # C : G3 C4 E4
              [55, 59, 62]]                          # G : G3 B3 D4
ARP_NOTES = [[69, 72, 76, 81],                       # Am: A4 C5 E5 A5
             [69, 72, 77, 81],                       # F : A4 C5 F5 A5
             [67, 72, 76, 79],                       # C : G4 C5 E5 G5
             [67, 71, 74, 79]]                       # G : G4 B4 D5 G5

# 8-bar chorus lead melody: (start beat, dur beats, midi note). Played twice.
LEAD_MELODY_8 = [
    # bar 1 (Am)
    (0.0, 0.75, 76), (0.75, 0.75, 72), (1.5, 1.0, 69), (2.5, 0.5, 71), (3.0, 1.0, 72),
    # bar 2 (F)
    (4.0, 0.75, 72), (4.75, 0.75, 69), (5.5, 1.0, 65), (6.5, 0.5, 67), (7.0, 1.0, 69),
    # bar 3 (C)
    (8.0, 0.75, 67), (8.75, 0.75, 72), (9.5, 1.5, 76), (11.0, 1.0, 74),
    # bar 4 (G)
    (12.0, 0.75, 71), (12.75, 0.75, 74), (13.5, 1.0, 76), (14.5, 0.5, 74), (15.0, 1.0, 71),
    # bar 5 (Am)
    (16.0, 0.75, 76), (16.75, 0.75, 72), (17.5, 1.0, 69), (18.5, 0.5, 71), (19.0, 1.0, 72),
    # bar 6 (F)
    (20.0, 0.75, 72), (20.75, 0.75, 69), (21.5, 1.0, 65), (22.5, 0.5, 67), (23.0, 1.0, 69),
    # bar 7 (C)
    (24.0, 0.75, 67), (24.75, 0.75, 72), (25.5, 1.5, 76), (27.0, 1.0, 74),
    # bar 8 (G) -- rising variation ending
    (28.0, 0.75, 71), (28.75, 0.75, 74), (29.5, 0.75, 76), (30.25, 0.75, 79), (31.0, 1.0, 81),
]

# Breakdown lead line (start beat within section C, dur, note)
BREAK_LEAD = [
    (16.0, 3.0, 76), (19.0, 1.0, 74),        # bar 36 (Am)
    (20.0, 4.0, 72),                          # bar 37 (F)
    (24.0, 2.0, 67), (26.0, 2.0, 72),         # bar 38 (C)
    (28.0, 4.0, 74),                          # bar 39 (G)
    (32.0, 3.0, 76), (35.0, 1.0, 79),         # bar 40 (Am)
    (36.0, 4.0, 77),                          # bar 41 (F)
    (40.0, 4.0, 76),                          # bar 42 (C)
    (44.0, 2.0, 74), (46.0, 2.0, 71),         # bar 43 (G)
]

ARP_PATTERN = [0, 1, 2, 3, 2, 1]  # index cycle over chord tones, 16th notes

# ----------------------------------------------------------------------------
# Event construction.  notes: pitched events, drums: percussion, fx: risers.
# ----------------------------------------------------------------------------
notes = []   # dict: t (beats), d (beats), n (midi note), v (0..1), voice
drums = []   # dict: t (beats), v, kind
fx = []      # dict: t, d, kind ('noise_riser'|'sub_drop'), plus tone riser notes


def add_note(t, d, n, v, voice):
    notes.append(dict(t=t, d=d, n=n + TRANSPOSE, v=v, voice=voice))


def add_drum(t, v, kind):
    drums.append(dict(t=t, v=v, kind=kind))


def chord_index(bar):
    return bar % 4


def build_kick_bars(bars):
    for bar in bars:
        for beat in range(4):
            add_drum(bar * BAR + beat, 1.0, 'kick')


def build_bass_bars(bars):
    for bar in bars:
        root = BASS_ROOTS[chord_index(bar)]
        for beat in range(4):
            base = bar * BAR + beat
            # rolling 16ths, downbeat left for the kick
            add_note(base + 0.25, 0.20, root, 0.85, 'bass')
            add_note(base + 0.50, 0.20, root, 0.95, 'bass')
            oct_up = (beat == 3)
            add_note(base + 0.75, 0.20, root + (12 if oct_up else 0), 0.85, 'bass')


def build_hats_bars(bars, shimmer=False):
    for bar in bars:
        for beat in range(4):
            add_drum(bar * BAR + beat + 0.5, 0.6, 'chat')      # offbeat 8ths
            if shimmer:
                for q in (0.25, 0.75):
                    add_drum(bar * BAR + beat + q, 0.22, 'chat')


def build_clap_bars(bars):
    for bar in bars:
        add_drum(bar * BAR + 1, 0.9, 'clap')
        add_drum(bar * BAR + 3, 0.9, 'clap')


def build_pads_bars(bars, vel):
    for bar in bars:
        for n in PAD_CHORDS[chord_index(bar)]:
            add_note(bar * BAR, 4.0, n, vel, 'pad')


def build_arp_bars(bars, vel_scale=1.0, ramp=False):
    bars = list(bars)
    for bi, bar in enumerate(bars):
        tones = ARP_NOTES[chord_index(bar)]
        r = (bi + 1) / len(bars) if ramp else 1.0
        for step in range(16):
            idx = ARP_PATTERN[step % len(ARP_PATTERN)]
            v = (0.9 if step % 4 == 0 else 0.55) * vel_scale * (0.35 + 0.65 * r)
            add_note(bar * BAR + step * 0.25, 0.22, tones[idx], v, 'pluck')


def build_lead_chorus(start_bar):
    t0 = start_bar * BAR
    for rep in range(2):                      # 8-bar melody twice = 16 bars
        off = t0 + rep * 32
        for (t, d, n) in LEAD_MELODY_8:
            add_note(off + t, d, n, 1.0, 'lead')


def build_lead_breakdown(start_bar):
    t0 = start_bar * BAR
    for (t, d, n) in BREAK_LEAD:
        add_note(t0 + t, d, n, 0.85, 'lead')


def build_transition(chorus_bar, riser_bars, fill_bars):
    """Riser + drum fill leading into the chorus that starts at chorus_bar."""
    # --- noise riser ---
    r_start = (chorus_bar - riser_bars) * BAR
    r_dur = riser_bars * BAR
    fx.append(dict(t=r_start, d=r_dur, kind='noise_riser'))
    # --- tone riser: pitch glide up to E6; longer risers start lower ---
    end_note = 88 + TRANSPOSE                              # E6
    start_note = end_note - (12 if riser_bars <= 2 else 19)
    fx.append(dict(t=r_start, d=r_dur, kind='tone_riser',
                   n0=start_note, n1=end_note))
    # --- drum fill: accelerating snare roll with crescendo ---
    f_start = (chorus_bar - fill_bars) * BAR
    f_dur = fill_bars * BAR
    hits = []
    if fill_bars == 1:
        t = 0.0
        while t < 2.0:                      # 8ths, first half of the bar
            hits.append(t); t += 0.5
        while t < 4.0:                      # 16ths, second half
            hits.append(t); t += 0.25
    else:
        t = 0.0
        while t < (fill_bars - 1) * 4.0:    # 8ths through the early bars
            hits.append(t); t += 0.5
        while t < f_dur - 2.0:              # 16ths, first half of last bar
            hits.append(t); t += 0.25
        while t < f_dur:                    # 32nds, final half bar
            hits.append(t); t += 0.125
    for h in hits:
        v = 0.32 + 0.72 * (h / f_dur)
        add_drum(f_start + h, min(v, 1.0), 'snare')
    # --- impact on the chorus downbeat ---
    add_drum(chorus_bar * BAR, 1.0, 'crash')
    fx.append(dict(t=chorus_bar * BAR, d=1.0, kind='sub_drop'))


# ---- Section A: intro (bars 0-15) ----
build_kick_bars(range(0, 16))
build_bass_bars(range(0, 16))
build_hats_bars(range(4, 16))
build_arp_bars(range(4, 16), vel_scale=0.7)
build_pads_bars(range(8, 16), vel=0.7)

# ---- Section B1: chorus (bars 16-31) ----
build_kick_bars(range(16, 32))
build_bass_bars(range(16, 32))
build_hats_bars(range(16, 32), shimmer=True)
build_clap_bars(range(16, 32))
build_pads_bars(range(16, 32), vel=0.9)
build_arp_bars(range(16, 32), vel_scale=1.0)
build_lead_chorus(16)

# ---- Section C: breakdown (bars 32-47) ----
build_pads_bars(range(32, 48), vel=1.0)
add_drum(32 * BAR, 0.5, 'crash')
build_lead_breakdown(32)
build_arp_bars(range(40, 48), vel_scale=0.8, ramp=True)

# ---- Section B2: final chorus (bars 48-63) ----
build_kick_bars(range(48, 64))
build_bass_bars(range(48, 64))
build_hats_bars(range(48, 64), shimmer=True)
build_clap_bars(range(48, 64))
build_pads_bars(range(48, 64), vel=0.9)
build_arp_bars(range(48, 64), vel_scale=1.0)
build_lead_chorus(48)

# ---- Transitions (riser + fill into each chorus) ----
build_transition(SEC_B1, INTRO_RISER_BARS, INTRO_FILL_BARS)
build_transition(SEC_B2, FINAL_RISER_BARS, FINAL_FILL_BARS)

# ---- Ending hit (bar 64) ----
add_drum(END_BAR * BAR, 1.0, 'kick')
add_drum(END_BAR * BAR, 1.0, 'crash')
for n in PAD_CHORDS[0]:
    add_note(END_BAR * BAR, 4.0, n, 1.0, 'pad')
add_note(END_BAR * BAR, 4.0, PAD_CHORDS[0][0] + 12, 1.0, 'pad')
add_note(END_BAR * BAR, 2.0, BASS_ROOTS[0], 0.9, 'bass')

TOTAL_BEATS = (END_BAR + 1) * BAR

# ----------------------------------------------------------------------------
# MIDI writer
# ----------------------------------------------------------------------------

def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    return bytes(reversed(out))


DRUM_KEY = dict(kick=36, snare=38, clap=39, chat=42, ohat=46, crash=49)


def write_midi(path):
    ticks = lambda beats: int(round(beats * TPB))
    vel = lambda v: max(1, min(127, int(v * 112) + 8))

    def track_chunk(events, meta_prefix=b''):
        # events: list of (tick, sort_rank, bytes)
        events.sort(key=lambda e: (e[0], e[1]))
        data = bytearray(meta_prefix)
        last = 0
        for tick, _, msg in events:
            data += vlq(tick - last) + msg
            last = tick
        data += vlq(0) + b'\xff\x2f\x00'
        return b'MTrk' + struct.pack('>I', len(data)) + bytes(data)

    # Track 0: meta
    tempo = int(round(60_000_000 / BPM))
    sf = {0: 0, 2: 2}.get(TRANSPOSE % 12, 0)   # Am: 0 accidentals, Bm: 2 sharps
    meta_events = [
        (0, 0, b'\xff\x03' + vlq(6) + b'Aurora'),
        (0, 0, b'\xff\x51\x03' + tempo.to_bytes(3, 'big')),
        (0, 0, b'\xff\x58\x04' + bytes([4, 2, 24, 8])),
        (0, 0, b'\xff\x59\x02' + bytes([sf & 0xFF, 1])),
    ]

    voice_setup = {
        'pad':   (0, 88, 'Pads'),
        'bass':  (1, 38, 'Bass'),
        'lead':  (2, 81, 'Lead'),
        'pluck': (3, 80, 'Pluck Arp'),
        'fxtone': (4, 90, 'Riser FX'),
    }
    tracks = {k: [] for k in voice_setup}
    tracks['drums'] = []

    def note_pair(evlist, ch, t, d, n, v):
        evlist.append((ticks(t), 1, bytes([0x90 | ch, n & 0x7F, vel(v)])))
        evlist.append((ticks(t + d), 0, bytes([0x80 | ch, n & 0x7F, 0])))

    for ev in notes:
        ch = voice_setup[ev['voice']][0]
        note_pair(tracks[ev['voice']], ch, ev['t'], ev['d'], ev['n'], ev['v'])

    # tone risers as rising chromatic 16ths on the FX track
    for ev in fx:
        if ev['kind'] != 'tone_riser':
            continue
        steps = int(ev['d'] * 4)
        for i in range(steps):
            frac = i / max(steps - 1, 1)
            n = int(round(ev['n0'] + (ev['n1'] - ev['n0']) * frac))
            note_pair(tracks['fxtone'], 4, ev['t'] + i * 0.25, 0.22, n,
                      0.3 + 0.6 * frac)

    for ev in drums:
        note_pair(tracks['drums'], 9, ev['t'], 0.25, DRUM_KEY[ev['kind']], ev['v'])

    chunks = [track_chunk(meta_events)]
    for key, (ch, prog, name) in voice_setup.items():
        chunks.append(track_chunk(
            [(0, 0, b'\xff\x03' + vlq(len(name)) + name.encode()),
             (0, 0, bytes([0xC0 | ch, prog]))] + tracks[key]))
    chunks.append(track_chunk([(0, 0, b'\xff\x03' + vlq(5) + b'Drums')] + tracks['drums']))

    header = b'MThd' + struct.pack('>IHHH', 6, 1, len(chunks), TPB)
    Path(path).write_bytes(header + b''.join(chunks))


# ----------------------------------------------------------------------------
# Softsynth renderer
# ----------------------------------------------------------------------------

def sec(beats):
    return beats * SPB


def smp(beats):
    return int(round(sec(beats) * SR))


def midi_hz(n):
    return 440.0 * 2.0 ** ((n - 69) / 12.0)


def fft_filter(x, fc, kind='lp', order=2):
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    with np.errstate(divide='ignore'):
        if kind == 'lp':
            H = 1.0 / np.sqrt(1.0 + (f / fc) ** (2 * order))
        else:
            H = 1.0 / np.sqrt(1.0 + (fc / np.maximum(f, 1e-9)) ** (2 * order))
            H[0] = 0.0
    return np.fft.irfft(X * H, n)


def fades(y, ms=3.0):
    k = min(int(SR * ms / 1000), len(y) // 2)
    if k > 0:
        y[:k] *= np.linspace(0, 1, k)
        y[-k:] *= np.linspace(1, 0, k)
    return y


def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2.0 * ((freq * t + phase) % 1.0) - 1.0


# --- percussion samples (precomputed once) ---

def make_kick():
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 45 + 120 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t / 0.10)
    click = RNG.standard_normal(int(0.004 * SR)) * 0.6
    y[:len(click)] += click * np.exp(-np.arange(len(click)) / (0.0015 * SR))
    return fades(np.tanh(1.6 * y))


def make_snare():
    n = int(0.20 * SR)
    t = np.arange(n) / SR
    noise = fft_filter(RNG.standard_normal(n), 1800, 'hp') * np.exp(-t / 0.055)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.04)
    return fades(np.tanh(1.3 * (0.9 * noise + 0.7 * tone)))


def make_clap():
    n = int(0.30 * SR)
    t = np.arange(n) / SR
    env = np.zeros(n)
    for off in (0.0, 0.011, 0.022):
        i = int(off * SR)
        seg = np.exp(-(t[: n - i]) / 0.008)
        env[i:] = np.maximum(env[i:], seg)
    env += 0.6 * np.exp(-t / 0.11) * (t > 0.022)
    noise = fft_filter(RNG.standard_normal(n), 900, 'hp')
    noise = fft_filter(noise, 5000, 'lp')
    return fades(np.tanh(1.4 * noise * env))


def make_chat():
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    y = fft_filter(RNG.standard_normal(n), 7500, 'hp') * np.exp(-t / 0.022)
    return fades(y)


def make_crash():
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    l = fft_filter(RNG.standard_normal(n), 3500, 'hp') * np.exp(-t / 0.55)
    r = fft_filter(RNG.standard_normal(n), 3500, 'hp') * np.exp(-t / 0.55)
    return fades(l * 0.7), fades(r * 0.7)


# --- pitched voices ---

PAD_DETUNE = [-15, -9, -4, 0, 4, 9, 15]          # cents
PAD_PANS = [-0.8, 0.6, -0.3, 0.0, 0.3, -0.6, 0.8]
LEAD_DETUNE = [-8, -5, -2, 0, 2, 5, 8]


def supersaw_note(freq, dur_s, detunes, pans, fc, attack, release, rng):
    n = int((dur_s + release) * SR)
    t = np.arange(n) / SR
    L = np.zeros(n)
    R = np.zeros(n)
    for cents, pan in zip(detunes, pans):
        f = freq * 2.0 ** (cents / 1200.0)
        s = saw(f, n, phase=rng.random())
        L += s * (1 - pan) * 0.5
        R += s * (1 + pan) * 0.5
    L = fft_filter(L, fc, 'lp')
    R = fft_filter(R, fc, 'lp')
    env = np.minimum(1.0, t / max(attack, 1e-4))
    rel_start = dur_s
    rel = np.clip((t - rel_start) / release, 0, 1)
    env = env * (1.0 - rel)
    return fades(L * env), fades(R * env)


def pluck_note(freq, rng):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    s = 0.5 * (saw(freq, n, rng.random()) + saw(freq * 1.006, n, rng.random()))
    dark = fft_filter(s, 650, 'lp')
    bright = fft_filter(s, 4500, 'lp')
    b = np.exp(-t / 0.09)
    y = (b * bright + (1 - b) * dark) * np.exp(-t / 0.26)
    return fades(y)


def bass_note(freq, dur_s):
    n = int((dur_s + 0.03) * SR)
    t = np.arange(n) / SR
    y = fft_filter(saw(freq, n), 900, 'lp') * 0.8
    y += 0.6 * np.sin(2 * np.pi * (freq / 2) * t)
    env = np.exp(-t / max(dur_s, 0.05))
    env *= np.clip(1.0 - (t - dur_s) / 0.03, 0, 1)
    return fades(np.tanh(1.3 * y * env))


# --- render ---

def render_wav(path):
    total_n = smp(TOTAL_BEATS) + int(TAIL_SEC * SR)
    buses = {k: np.zeros((2, total_n)) for k in
             ('pads', 'bass', 'lead', 'pluck', 'drums', 'fx')}

    def add_st(bus, i, L, R, g=1.0):
        end = min(i + len(L), total_n)
        if end <= i:
            return
        buses[bus][0, i:end] += L[: end - i] * g
        buses[bus][1, i:end] += R[: end - i] * g

    def add_mono(bus, i, y, g=1.0):
        add_st(bus, i, y, y, g)

    # percussion
    kick_s, snare_s, clap_s, chat_s = make_kick(), make_snare(), make_clap(), make_chat()
    crash_L, crash_R = make_crash()
    for ev in drums:
        i = smp(ev['t'])
        v = ev['v'] ** 1.2
        if ev['kind'] == 'kick':
            add_mono('drums', i, kick_s, 0.95 * v)
        elif ev['kind'] == 'snare':
            add_mono('drums', i, snare_s, 0.55 * v)
        elif ev['kind'] == 'clap':
            add_mono('drums', i, clap_s, 0.5 * v)
        elif ev['kind'] == 'chat':
            add_mono('drums', i, chat_s, 0.4 * v)
        elif ev['kind'] == 'crash':
            add_st('drums', i, crash_L, crash_R, 0.5 * v)

    # pitched notes (deterministic per-note rng for stable phases)
    for k, ev in enumerate(notes):
        rng = np.random.default_rng(1000 + k)
        f = midi_hz(ev['n'])
        i = smp(ev['t'])
        g = ev['v'] ** 1.3
        if ev['voice'] == 'pad':
            L, R = supersaw_note(f, sec(ev['d']), PAD_DETUNE, PAD_PANS,
                                 2200, 0.06, 0.35, rng)
            add_st('pads', i, L, R, 0.16 * g)
        elif ev['voice'] == 'lead':
            L, R = supersaw_note(f, sec(ev['d']), LEAD_DETUNE, PAD_PANS,
                                 5500, 0.006, 0.12, rng)
            add_st('lead', i, L, R, 0.30 * g)
        elif ev['voice'] == 'pluck':
            y = pluck_note(f, rng)
            pan = 0.25 * math.sin(k * 1.7)
            add_st('pluck', i, y * (1 - pan), y * (1 + pan), 0.30 * g)
        elif ev['voice'] == 'bass':
            add_mono('bass', i, bass_note(f, sec(ev['d'])), 0.55 * g)

    # FX: noise risers, tone risers, sub drops
    for ev in fx:
        i = smp(ev['t'])
        if ev['kind'] == 'noise_riser':
            n = smp(ev['d'])
            t = np.arange(n) / n
            amp = t ** 1.6
            for ch, seed in ((0, 21), (1, 22)):
                rng = np.random.default_rng(seed + int(ev['t']))
                noise = rng.standard_normal(n)
                lpn = fft_filter(noise, 700, 'lp')
                y = ((1 - t ** 2) * lpn + (t ** 2) * noise) * amp
                y = fft_filter(y, 180, 'hp')
                buses['fx'][ch, i:i + n] += fades(y) * 0.30
        elif ev['kind'] == 'tone_riser':
            n = smp(ev['d'])
            tt = np.arange(n) / SR
            f0, f1 = midi_hz(ev['n0']), midi_hz(ev['n1'])
            f = f0 * (f1 / f0) ** (tt / tt[-1])
            ph = 2 * np.pi * np.cumsum(f) / SR
            y = fft_filter(2 * ((ph / (2 * np.pi)) % 1.0) - 1.0, 3000, 'lp')
            y *= (np.arange(n) / n) ** 1.4
            add_mono('fx', i, fades(y), 0.16)
        elif ev['kind'] == 'sub_drop':
            n = int(0.7 * SR)
            tt = np.arange(n) / SR
            f = 70 * (32 / 70) ** (tt / tt[-1])
            ph = 2 * np.pi * np.cumsum(f) / SR
            y = np.sin(ph) * np.exp(-tt / 0.35)
            add_mono('fx', i, fades(np.tanh(1.5 * y)), 0.6)

    # lead ping-pong delay (dotted 8th)
    d = smp(0.75)
    lead = buses['lead']
    wet = np.zeros_like(lead)
    src = lead.copy()
    for k in range(1, 6):
        g = 0.45 ** k
        off = d * k
        if off >= total_n:
            break
        a, b = (1, 0) if k % 2 else (0, 1)
        wet[a, off:] += src[0, : total_n - off] * g
        wet[b, off:] += src[1, : total_n - off] * g
    buses['lead'] = lead + wet

    # sidechain pump keyed to kicks
    gain = np.ones(total_n)
    W = smp(0.55)
    duck = 0.22 + 0.78 * np.linspace(0, 1, W) ** 2
    for ev in drums:
        if ev['kind'] != 'kick':
            continue
        i = smp(ev['t'])
        end = min(i + W, total_n)
        gain[i:end] = np.minimum(gain[i:end], duck[: end - i])
    for bus in ('pads', 'pluck'):
        buses[bus] *= gain
    buses['lead'] *= (0.55 + 0.45 * gain)

    # reverb (FFT convolution with decaying-noise IR) on a send bus
    ir_n = int(1.8 * SR)
    ir_t = np.arange(ir_n) / SR
    ir = np.stack([fft_filter(np.random.default_rng(31 + c).standard_normal(ir_n), 250, 'hp')
                   * np.exp(-ir_t / 0.5) for c in range(2)])
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    ir *= 1.1
    send = (0.5 * buses['pads'] + 0.45 * buses['lead'] + 0.35 * buses['pluck'] +
            0.25 * buses['drums'] + 0.3 * buses['fx'])
    conv_n = total_n + ir_n - 1
    nfft = 1 << (conv_n - 1).bit_length()
    wet = np.zeros((2, total_n))
    for c in range(2):
        W_ = np.fft.rfft(send[c], nfft) * np.fft.rfft(ir[c], nfft)
        wet[c] = np.fft.irfft(W_, nfft)[:total_n]

    mix = (buses['drums'] + buses['bass'] + buses['pads'] + buses['pluck'] +
           buses['lead'] + buses['fx'] + 0.35 * wet)

    mix = np.tanh(1.1 * mix)
    mix *= 0.89 / max(np.abs(mix).max(), 1e-9)

    pcm = (mix.T.reshape(-1) * 32767).astype('<i2').tobytes()
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)
    return mix


def main():
    out = Path(__file__).resolve().parent
    write_midi(out / 'aurora.mid')
    mix = render_wav(out / 'aurora.wav')
    dur = mix.shape[1] / SR
    print(f'wrote aurora.mid + aurora.wav ({dur:.1f}s, {BPM:.0f} BPM, '
          f'transpose={TRANSPOSE:+d})')
    # per-section RMS sanity check
    for name, b0, b1 in (('A', 0, 16), ('B1', 16, 32), ('C', 32, 48),
                         ('B2', 48, 64)):
        seg = mix[:, smp(b0 * BAR): smp(b1 * BAR)]
        print(f'  {name:3s} bars {b0:2d}-{b1 - 1:2d}  RMS {np.sqrt((seg**2).mean()):.3f}')


if __name__ == '__main__':
    main()
