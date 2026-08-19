#!/usr/bin/env python3
"""
"Undertow" -- instrumental groove
  * 7/8 at 140 BPM (quarter note = 140), grouped 2+2+3
  * D dorian
  * Form: A B C A', 8 bars per section (32 bars total)
  * C is a bridge that withholds the bass entirely; the bass returning
    at the top of the final A is the payoff (marked with a crash).

Outputs:
  groove.mid  -- standard MIDI file (4 instrument tracks + meta)
  groove.wav  -- 44.1 kHz 16-bit stereo render via built-in numpy softsynth

Pure Python + numpy. No other dependencies.
"""

import struct
import wave

import numpy as np

# ---------------------------------------------------------------- timing ---
BPM = 140.0                      # quarter-note BPM
PPQ = 480                        # MIDI ticks per quarter
E = 1.0                          # one eighth note, our grid unit
BAR = 7 * E                      # 7/8
SEC_PER_EIGHTH = 60.0 / BPM / 2.0
TICKS_PER_EIGHTH = PPQ // 2
N_BARS = 32                      # 4 sections x 8 bars

# ---------------------------------------------------------------- pitches --
# D dorian: D E F G A B C
D2, E2, F2, G2, A2, B2, C3, D3 = 38, 40, 41, 43, 45, 47, 48, 50
E3, F3, G3, A3, B3 = 52, 53, 55, 57, 59
C4, D4, E4, F4, G4, A4, B4 = 60, 62, 64, 65, 67, 69, 71
C5, D5, E5, F5, G5, A5, B5, C6 = 72, 74, 76, 77, 79, 81, 83, 84

# GM drum notes
KICK, SNARE, STICK, HAT, OHAT, RIDE, CRASH, TOM_M, TOM_L = (
    36, 38, 37, 42, 46, 51, 49, 45, 43)


def ev(events, bar, pos, dur, pitch, vel):
    """Append one note event; time measured in eighth-note units."""
    events.append((bar * BAR + pos, dur, pitch, vel))


# ============================================================== composition
def build_drums():
    ns = []
    for bar in range(N_BARS):
        sec = bar // 8            # 0=A 1=B 2=C 3=A'
        bridge = (sec == 2)

        # -- crashes: downbeat, light at B, big on the payoff bar (final A)
        if bar == 0:
            ev(ns, bar, 0, 2, CRASH, 96)
        elif bar == 8:
            ev(ns, bar, 0, 2, CRASH, 72)
        elif bar == 24:
            ev(ns, bar, 0, 2, CRASH, 112)

        # -- kick / snare (backbone: K . S . K S . over 2+2+3)
        if bridge:
            ev(ns, bar, 0, 0.5, KICK, 88)
            ev(ns, bar, 4, 0.5, KICK, 80)
            if bar != 23:
                ev(ns, bar, 2, 0.5, STICK, 82)   # sidestick instead of snare
                ev(ns, bar, 5, 0.5, STICK, 74)
        else:
            ev(ns, bar, 0, 0.5, KICK, 118)
            ev(ns, bar, 4, 0.5, KICK, 110)
            if bar % 2 == 1:
                ev(ns, bar, 3.5, 0.5, KICK, 82)  # funk pickup into the 3-group
            ev(ns, bar, 2, 0.5, SNARE, 110)
            ev(ns, bar, 5, 0.5, SNARE, 100)
            if bar % 2 == 0:
                ev(ns, bar, 6.5, 0.5, SNARE, 40)  # ghost

        # -- hats / ride: straight eighths, accents on the 2+2+3 groupings
        cym = RIDE if bridge else HAT
        accents = [96, 58, 86, 58, 86, 60, 64]
        for i in range(7):
            v = accents[i]
            if bridge:
                v = int(v * 0.78)
            p = cym
            if not bridge and bar % 4 == 3 and i == 6:
                p = OHAT                          # open hat turnaround
            if bar in (15, 23) and i >= 4:
                continue                          # leave room for the fills
            ev(ns, bar, i, 0.5, p, v)

        # -- fills at section turns
        if bar == 15:                             # end of B
            for k, pos in enumerate([4, 4.5, 5, 5.5, 6, 6.5]):
                ev(ns, bar, pos, 0.5, SNARE, 68 + k * 8)
        if bar == 23:                             # end of C -> payoff
            for pos, p, v in [(4, SNARE, 78), (4.5, SNARE, 88),
                              (5, TOM_M, 96), (5.5, TOM_M, 100),
                              (6, TOM_L, 104), (6.5, TOM_L, 110)]:
                ev(ns, bar, pos, 0.5, p, v)
    return ns


def bass_riff_bar_x(ns, bar):
    ev(ns, bar, 0, 1.5, D2, 112)
    ev(ns, bar, 2, 0.75, D2, 88)
    ev(ns, bar, 3, 1, F2, 96)
    ev(ns, bar, 4, 1.5, A2, 104)
    ev(ns, bar, 5.5, 1.5, G2, 92)


def bass_riff_bar_y(ns, bar):
    ev(ns, bar, 0, 1.5, D2, 112)
    ev(ns, bar, 2, 0.75, D2, 88)
    ev(ns, bar, 3, 1, C3, 96)
    ev(ns, bar, 4, 1, B2, 102)        # B natural: the dorian color tone
    ev(ns, bar, 5, 1, A2, 92)
    ev(ns, bar, 6, 1, G2, 88)


def build_bass():
    ns = []
    for sec, base in ((0, 0), (3, 24)):           # A and A' -- same riff
        for b in range(8):
            bar = base + b
            if b == 7:                            # turnaround run
                ev(ns, bar, 0, 1.5, D2, 110)
                ev(ns, bar, 2, 1, C3, 96)
                ev(ns, bar, 3, 1, B2, 94)
                ev(ns, bar, 4, 1, A2, 96)
                ev(ns, bar, 5, 1, G2, 92)
                ev(ns, bar, 6, 1, E2, 90)
            elif b % 2 == 0:
                bass_riff_bar_x(ns, bar)
            else:
                bass_riff_bar_y(ns, bar)
    # final-bar resolution (overrides nothing; bar 31 gets a landing instead)
    ns = [n for n in ns if not (31 * BAR <= n[0] < 32 * BAR)]
    ev(ns, 31, 0, 1.5, D2, 112)
    ev(ns, 31, 2, 1, D3, 100)
    ev(ns, 31, 4, 3, D2, 108)

    # B section: rootsy pattern under F G F G Am G F, settling onto D
    roots = [F2, G2, F2, G2, A2, G2, F2]
    for i, r in enumerate(roots):
        bar = 8 + i
        ev(ns, bar, 0, 2, r, 108)
        ev(ns, bar, 2, 1, r, 88)
        ev(ns, bar, 4, 1.5, r + 7, 98)
        ev(ns, bar, 5.5, 1.5, r, 90)
    ev(ns, 15, 0, 2, F2, 106)                     # bar 15: land on D...
    ev(ns, 15, 2, 1, E2, 96)
    ev(ns, 15, 4, 3, D2, 100)
    # ...then SILENCE: no bass anywhere in bars 16-23 (the C bridge).
    return sorted(ns)


CHORDS = {
    "Dm7":   [F3, A3, C4, E4],
    "Dm11":  [G3, C4, E4],
    "Cmaj":  [G3, C4, E4],
    "G_B":   [B3, D4, G4],
    "Fmaj7": [A3, C4, E4, G4],
    "G7":    [B3, D4, F4],
    "Am7":   [G3, C4, E4, G4],
    # bridge pads (voiced higher; no bass below them)
    "Dm9p":  [D4, F4, A4, E5],
    "Fmaj7p": [F4, A4, C5, E5],
    "Em7p":  [E4, G4, B4, D5],
    "Gadd9p": [B3, D4, G4, A4],
}


def stab(ns, bar, pos, dur, chord, vel):
    for p in CHORDS[chord]:
        ev(ns, bar, pos, dur, p, vel)


def build_keys():
    ns = []
    for base in (0, 24):                          # A and A'
        for b in range(8):
            bar = base + b
            if b == 6:
                stab(ns, bar, 2, 1, "Cmaj", 80)
                stab(ns, bar, 5.5, 1.5, "Cmaj", 72)
            elif b == 7:
                stab(ns, bar, 2, 1, "G_B", 80)
                stab(ns, bar, 5.5, 1.5, "G_B", 72)
            else:
                stab(ns, bar, 2, 1, "Dm7", 78)
                stab(ns, bar, 5.5, 1, "Dm11", 68)
    # B section: one chord per bar, pushed on the 1 and the 3-group
    prog = ["Fmaj7", "G7", "Fmaj7", "G7", "Am7", "G7", "Fmaj7"]
    for i, ch in enumerate(prog):
        stab(ns, 8 + i, 0, 1.5, ch, 84)
        stab(ns, 8 + i, 4, 2.5, ch, 74)
    stab(ns, 15, 0, 3.5, "Fmaj7", 80)             # let bar 15 breathe
    # C bridge: sustained pads, two bars each, floating with no floor
    for i, ch in enumerate(["Dm9p", "Dm9p", "Fmaj7p", "Fmaj7p",
                            "Em7p", "Em7p", "Gadd9p", "Gadd9p"]):
        stab(ns, 16 + i, 0, 7, ch, 64 if i % 2 == 0 else 58)
    return sorted(ns)


def lead_a_section(ns, base):
    """The A melody: an angular dorian motif, call and response."""
    for pair in range(2):                          # bars 0-3 = motif twice
        bar = base + pair * 2
        ev(ns, bar, 0, 1.5, D5, 96)
        ev(ns, bar, 2, 0.5, F5, 88)
        ev(ns, bar, 2.5, 0.5, E5, 84)
        ev(ns, bar, 3, 1, D5, 90)
        ev(ns, bar, 4, 1.5, C5, 92)
        ev(ns, bar, 5.5, 1.5, A4, 84)
        bar += 1                                   # response bar
        ev(ns, bar, 2, 1, G4, 80)
        ev(ns, bar, 3, 1, A4, 84)
        ev(ns, bar, 4, 1.5, B4, 90)                # dorian sixth
        ev(ns, bar, 5.5, 0.5, C5, 82)
        ev(ns, bar, 6, 1, D5, 88)
    # bars 4-5: motif lifted a third
    bar = base + 4
    ev(ns, bar, 0, 1.5, F5, 96)
    ev(ns, bar, 2, 0.5, A5, 88)
    ev(ns, bar, 2.5, 0.5, G5, 84)
    ev(ns, bar, 3, 1, F5, 90)
    ev(ns, bar, 4, 1.5, E5, 92)
    ev(ns, bar, 5.5, 1.5, C5, 84)
    bar = base + 5
    ev(ns, bar, 2, 1, D5, 84)
    ev(ns, bar, 4, 1.5, E5, 88)
    ev(ns, bar, 5.5, 0.5, F5, 82)
    ev(ns, bar, 6, 1, E5, 86)
    # bars 6-7: cadence over Cmaj -> G/B
    bar = base + 6
    ev(ns, bar, 0, 1.5, E5, 92)
    ev(ns, bar, 2, 1, G5, 88)
    ev(ns, bar, 3, 1, E5, 84)
    ev(ns, bar, 4, 3, D5, 90)
    bar = base + 7
    ev(ns, bar, 2, 1, B4, 84)
    ev(ns, bar, 3, 1, C5, 86)
    ev(ns, bar, 4, 1.5, D5, 90)
    ev(ns, bar, 5.5, 1.5, A4, 82)


def build_lead():
    ns = []
    lead_a_section(ns, 0)
    lead_a_section(ns, 24)

    # B section: longer singing arcs over the F/G motion
    b = [
        (8,  [(0, 3, A4, 88), (4, 1.5, C5, 90), (5.5, 1.5, D5, 86)]),
        (9,  [(0, 2, E5, 92), (2, 1, D5, 84), (4, 3, B4, 88)]),
        (10, [(0, 3, A4, 86), (4, 1.5, G4, 82), (5.5, 1.5, A4, 84)]),
        (11, [(0, 2, B4, 90), (2, 1, C5, 86), (4, 3, D5, 92)]),
        (12, [(0, 3, E5, 94), (4, 1.5, D5, 88), (5.5, 1.5, C5, 84)]),
        (13, [(0, 2, B4, 88), (2, 1, D5, 86), (4, 3, G5, 96)]),
        (14, [(0, 3, F5, 92), (4, 1.5, E5, 88), (5.5, 1.5, C5, 84)]),
        (15, [(0, 2, D5, 90), (2, 1, A4, 82), (4, 3, D5, 86)]),
    ]
    for bar, notes in b:
        for pos, dur, p, v in notes:
            ev(ns, bar, pos, dur, p, v)

    # C bridge: sparse, high, floating -- lots of air where the bass isn't
    c = [
        (16, [(2, 2, A5, 72)]),
        (17, [(0, 3, E5, 68)]),
        (18, [(2, 1.5, C6, 74), (4, 3, A5, 70)]),
        (19, []),
        (20, [(2, 2, B5, 72)]),
        (21, [(0, 3, G5, 68)]),
        (22, [(2, 1.5, A5, 74), (4, 3, B5, 72)]),
        (23, [(0, 4, C6, 78)]),                    # tension note into payoff
    ]
    for bar, notes in c:
        for pos, dur, p, v in notes:
            ev(ns, bar, pos, dur, p, v)
    return sorted(ns)


def build_song():
    return {
        "drums": sorted(build_drums()),
        "bass": build_bass(),
        "keys": build_keys(),
        "lead": build_lead(),
    }


# ================================================================== MIDI ===
def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append(0x80 | (n & 0x7F))
        n >>= 7
    return bytes(reversed(out))


def midi_track(events_bytes):
    data = b"".join(events_bytes) + b"\x00\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(data)) + data


def note_track(notes, channel, program=None, name=b""):
    msgs = []                                     # (tick, order, bytes)
    if name:
        msgs.append((0, 0, b"\x00\xff\x03" + bytes([len(name)]) + name))
    if program is not None:
        msgs.append((0, 0, bytes([0xC0 | channel, program])))
    evs = []
    for t, dur, pitch, vel in notes:
        on = int(round(t * TICKS_PER_EIGHTH))
        off = int(round((t + dur) * TICKS_PER_EIGHTH))
        evs.append((on, 1, bytes([0x90 | channel, pitch, vel])))
        evs.append((off, 0, bytes([0x80 | channel, pitch, 0])))
    evs.sort()
    out, last = [m[2] for m in msgs], 0
    for tick, _, b in evs:
        out.append(vlq(tick - last) + b)
        last = tick
    return midi_track(out)


def write_midi(song, path):
    tempo = int(round(60_000_000 / BPM))
    meta = midi_track([
        b"\x00\xff\x51\x03" + struct.pack(">I", tempo)[1:],
        b"\x00\xff\x58\x04" + bytes([7, 3, 24, 8]),     # 7/8
    ])
    tracks = [
        meta,
        note_track(song["drums"], 9, None, b"drums"),
        note_track(song["bass"], 0, 33, b"bass"),        # fingered bass
        note_track(song["keys"], 1, 4, b"keys"),         # EP 1
        note_track(song["lead"], 2, 81, b"lead"),        # saw lead
    ]
    hdr = b"MThd" + struct.pack(">IHHH", 6, 1, len(tracks), PPQ)
    with open(path, "wb") as f:
        f.write(hdr + b"".join(tracks))


# ================================================================= synth ===
SR = 44100


def fft_filter(x, fc, order=2, kind="lp"):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1.0 / SR)
    f[0] = 1e-9
    if kind == "lp":
        H = 1.0 / np.sqrt(1.0 + (f / fc) ** (2 * order))
    else:
        H = 1.0 / np.sqrt(1.0 + (fc / f) ** (2 * order))
    return np.fft.irfft(X * H, len(x))


def adsr(n, a, d, s, r, total):
    env = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na, nd = max(na, 1), max(nd, 1)
    env[:na] = np.linspace(0, 1, na)
    if na + nd < n:
        env[na:na + nd] = np.linspace(1, s, nd)
    else:
        env[na:] = np.linspace(1, s, max(n - na, 1))
    if nr > 0 and nr < n:
        env[-nr:] *= np.linspace(1, 0, nr)
    return env


def hz(p):
    return 440.0 * 2.0 ** ((p - 69) / 12.0)


def synth_bass(pitch, dur, vel):
    n = int((dur + 0.05) * SR)
    t = np.arange(n) / SR
    f = hz(pitch)
    saw = 2.0 * ((f * t) % 1.0) - 1.0
    sub = 0.55 * np.sin(2 * np.pi * f * 0.5 * t)
    y = fft_filter(saw, 420, 2, "lp") + sub
    y *= adsr(n, 0.005, 0.09, 0.72, 0.04, dur)
    return y * (vel / 127.0) ** 1.4


def synth_keys(pitch, dur, vel):
    n = int((dur + 0.10) * SR)
    t = np.arange(n) / SR
    f = hz(pitch)
    y = (np.sin(2 * np.pi * f * t)
         + 0.34 * np.sin(2 * np.pi * 2 * f * t)
         + 0.10 * np.sin(2 * np.pi * 3 * f * t))
    y *= 1.0 + 0.08 * np.sin(2 * np.pi * 4.8 * t)        # EP tremolo
    attack = 0.25 if dur > 3 * SEC_PER_EIGHTH * 2 else 0.006
    y *= adsr(n, attack, 0.35, 0.55, 0.09, dur)
    y *= np.exp(-t / max(dur * 1.6, 1.0))
    return y * (vel / 127.0) ** 1.5 * 0.9


def synth_lead(pitch, dur, vel):
    n = int((dur + 0.06) * SR)
    t = np.arange(n) / SR
    f = hz(pitch)
    vib = 1.0 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip(
        (t - 0.12) / 0.25, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    det = 2.0 ** (7 / 1200.0)
    saw1 = 2.0 * ((ph / (2 * np.pi)) % 1.0) - 1.0
    saw2 = 2.0 * ((ph * det / (2 * np.pi)) % 1.0) - 1.0
    y = fft_filter(0.5 * (saw1 + saw2), 2300, 2, "lp")
    y *= adsr(n, 0.015, 0.10, 0.85, 0.05, dur)
    return y * (vel / 127.0) ** 1.4


def synth_drum(pitch, dur, vel):
    g = (vel / 127.0) ** 1.6
    rng = np.random.default_rng(pitch * 7919 + int(vel))
    if pitch == KICK:
        n = int(0.30 * SR)
        t = np.arange(n) / SR
        f = 42 + 78 * np.exp(-t / 0.045)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11)
        y[:int(0.004 * SR)] += 0.4 * rng.standard_normal(int(0.004 * SR))
        return y * g * 1.15
    if pitch == SNARE:
        n = int(0.25 * SR)
        t = np.arange(n) / SR
        y = (0.85 * fft_filter(rng.standard_normal(n), 950, 2, "hp")
             * np.exp(-t / 0.055)
             + 0.5 * np.sin(2 * np.pi * 186 * t) * np.exp(-t / 0.04))
        return y * g
    if pitch == STICK:
        n = int(0.08 * SR)
        t = np.arange(n) / SR
        y = (0.7 * np.sin(2 * np.pi * 810 * t) * np.exp(-t / 0.008)
             + 0.3 * fft_filter(rng.standard_normal(n), 2200, 2, "hp")
             * np.exp(-t / 0.012))
        return y * g
    if pitch in (HAT, OHAT):
        n = int((0.06 if pitch == HAT else 0.35) * SR)
        t = np.arange(n) / SR
        tau = 0.018 if pitch == HAT else 0.11
        y = fft_filter(rng.standard_normal(n), 6200, 2, "hp") * np.exp(-t / tau)
        return y * g * 0.8
    if pitch == RIDE:
        n = int(0.55 * SR)
        t = np.arange(n) / SR
        y = (fft_filter(rng.standard_normal(n), 4800, 2, "hp")
             * np.exp(-t / 0.19) * 0.6
             + 0.18 * np.sin(2 * np.pi * 5230 * t) * np.exp(-t / 0.25))
        return y * g * 0.7
    if pitch == CRASH:
        n = int(1.5 * SR)
        t = np.arange(n) / SR
        y = fft_filter(rng.standard_normal(n), 3400, 2, "hp") * np.exp(-t / 0.4)
        return y * g * 0.8
    if pitch in (TOM_M, TOM_L):
        f0, f1 = (165, 105) if pitch == TOM_M else (120, 78)
        n = int(0.28 * SR)
        t = np.arange(n) / SR
        f = f1 + (f0 - f1) * np.exp(-t / 0.06)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)
        y += 0.12 * rng.standard_normal(n) * np.exp(-t / 0.02)
        return y * g
    return np.zeros(1)


INSTRUMENTS = {
    "drums": (synth_drum, 0.0, 1.00),
    "bass": (synth_bass, 0.0, 0.90),
    "keys": (synth_keys, -0.30, 0.42),
    "lead": (synth_lead, 0.18, 0.55),
}
DRUM_PAN = {HAT: 0.30, OHAT: 0.30, RIDE: 0.25, STICK: -0.15,
            TOM_M: -0.10, TOM_L: 0.10}
DRUM_GAIN = {KICK: 1.0, SNARE: 0.8, STICK: 0.6, HAT: 0.42, OHAT: 0.45,
             RIDE: 0.5, CRASH: 0.55, TOM_M: 0.8, TOM_L: 0.8}


def render_wav(song, path):
    total = int((N_BARS * BAR * SEC_PER_EIGHTH + 2.5) * SR)
    mix = np.zeros((total, 2))
    for name, notes in song.items():
        synth, pan, gain = INSTRUMENTS[name]
        for tpos, dur, pitch, vel in notes:
            y = synth(pitch, max(dur * SEC_PER_EIGHTH, 0.03), vel)
            p = pan
            g = gain
            if name == "drums":
                p = DRUM_PAN.get(pitch, 0.0)
                g = gain * DRUM_GAIN.get(pitch, 0.7)
            i0 = int(tpos * SEC_PER_EIGHTH * SR)
            i1 = min(i0 + len(y), total)
            seg = y[: i1 - i0] * g
            mix[i0:i1, 0] += seg * np.sqrt(0.5 * (1 - p))
            mix[i0:i1, 1] += seg * np.sqrt(0.5 * (1 + p))
    peak = np.max(np.abs(mix))
    mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25) * 0.91
    pcm = (mix * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    song = build_song()
    write_midi(song, os.path.join(here, "groove.mid"))
    render_wav(song, os.path.join(here, "groove.wav"))
    n_notes = sum(len(v) for v in song.values())
    print(f"wrote groove.mid + groove.wav ({n_notes} notes, "
          f"{N_BARS * BAR * SEC_PER_EIGHTH:.1f}s)")
