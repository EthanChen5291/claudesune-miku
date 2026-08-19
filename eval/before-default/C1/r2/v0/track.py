#!/usr/bin/env python3
"""
"Undertow" -- house track generator.

F minor, 122 BPM, form A B A' B, 16-bar sections (64 bars total).
  A  : verse   -- sparse mid-register melody, 8th-note hats
  B  : chorus  -- lifts: melody up in register + denser, pad + 16th arp, 16th hats
  A' : verse return -- SAME melody as A, busier drums (16th hats, rim, shaker, tom fills)

Renders:
  - undertow.wav  (44.1 kHz / 16-bit stereo, ~2:08)  <- the listenable deliverable
  - undertow.mid  (Standard MIDI File, type 1)       <- editable/renderable elsewhere

Pure Python + numpy. Deterministic (seeded noise), so re-renders are bit-stable.
"""

import numpy as np
import struct
import wave
import os

# ----------------------------------------------------------------------------
# Globals
# ----------------------------------------------------------------------------
SR = 44100
BPM = 122.0
BEAT = 60.0 / BPM
BEATS_PER_BAR = 4
BARS_PER_SECTION = 16
SECTION_BEATS = BARS_PER_SECTION * BEATS_PER_BAR          # 64 beats
SECTIONS = ["A", "B", "A2", "B"]                          # A B A' B
TOTAL_BEATS = SECTION_BEATS * len(SECTIONS)               # 256 beats
TAIL_SEC = 2.5

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Bass timbre: "bright" (saw pluck) -- see synth_bass()
BASS_STYLE = "bright"


def mtof(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


# ----------------------------------------------------------------------------
# Musical material (F minor: F G Ab Bb C Db Eb)
# ----------------------------------------------------------------------------
# 4-bar chord loop, one chord per bar:  Fm7  Dbmaj7  Abmaj7  Eb7   (i VI III VII)
PROG = [
    ("Fm7",    41, [53, 56, 60, 63]),   # bass root F2 ; voicing F3 Ab3 C4 Eb4
    ("Dbmaj7", 37, [56, 60, 61, 65]),   # Db2          ; Ab3 C4 Db4 F4
    ("Abmaj7", 44, [56, 60, 63, 67]),   # Ab2          ; Ab3 C4 Eb4 G4
    ("Eb7",    39, [58, 61, 63, 67]),   # Eb2          ; Bb3 Db4 Eb4 G4
]

# Rolling house bass, one bar (offset-in-beats, semitone-offset-from-root, dur, gain)
BASS_BAR = [
    (0.00,  0, 0.45, 1.00),
    (0.75, 12, 0.20, 0.70),
    (1.50,  0, 0.40, 0.95),
    (2.50,  0, 0.40, 0.95),
    (3.00, 12, 0.20, 0.70),
    (3.50,  0, 0.30, 0.90),
    (3.75, 12, 0.20, 0.75),
]

# Verse melody: 4-bar loop, mid register (F4..C5), sparse.  (beat, midi, dur)
VERSE_MELODY_LOOP = [
    (0.0, 72, 0.75), (1.5, 68, 0.50), (2.5, 65, 1.25),
    (4.5, 68, 0.50), (5.5, 65, 0.50), (6.0, 61, 1.50),
    (8.0, 72, 0.75), (9.5, 70, 0.50), (10.5, 68, 1.25),
    (12.5, 67, 0.50), (13.0, 70, 0.75), (14.0, 63, 1.75),
]

# Chorus melody: 4-bar loop, higher (C5..Bb5) and denser than the verse.
CHORUS_MELODY_LOOP = [
    (0.00, 77, 0.50), (0.75, 80, 0.25), (1.50, 79, 0.50),
    (2.00, 77, 0.50), (2.50, 75, 0.50), (3.00, 72, 1.00),
    (4.00, 73, 0.50), (4.75, 77, 0.25), (5.50, 80, 0.50),
    (6.00, 77, 0.50), (6.50, 75, 0.50), (7.00, 73, 1.00),
    (8.00, 72, 0.50), (8.75, 75, 0.25), (9.50, 80, 0.50),
    (10.00, 79, 0.50), (10.50, 75, 0.50), (11.00, 72, 1.00),
    (12.00, 79, 0.50), (12.75, 82, 0.25), (13.50, 79, 0.50),
    (14.00, 77, 0.50), (14.50, 75, 0.50), (15.00, 72, 1.00),
]

# Chord-stab offsets per bar (offbeat skank)
STAB_OFFSETS_VERSE = [(1.5, 0.9), (3.5, 0.8)]
STAB_OFFSETS_CHORUS = [(0.5, 0.8), (1.5, 0.9), (2.5, 0.8), (3.5, 0.9)]

# 16th-note arp step pattern (indices into chord voicing +12, two octaves) -- chorus only
ARP_STEPS = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 6, 4, 2, 1, 3]

# ----------------------------------------------------------------------------
# Drum patterns per section (offset-in-beats, gain), per bar
# ----------------------------------------------------------------------------
KICK_BAR = [(0.0, 1.0), (1.0, 1.0), (2.0, 1.0), (3.0, 1.0)]
CLAP_BAR = [(1.0, 1.0), (3.0, 1.0)]

SIXTEENTH_CH = [
    (0.00, 1.0), (0.25, 0.55), (0.75, 0.65),
    (1.00, 1.0), (1.25, 0.55), (1.75, 0.65),
    (2.00, 1.0), (2.25, 0.55), (2.75, 0.65),
    (3.00, 1.0), (3.25, 0.55), (3.75, 0.65),
]

HAT_PATTERNS = {
    #        closed hats                                  open hats
    "A":  {"ch": [(0.0, 1.0), (1.0, 1.0), (2.0, 1.0), (3.0, 1.0)],
           "oh": [(0.5, 1.0), (1.5, 1.0), (2.5, 1.0), (3.5, 1.0)]},
    "B":  {"ch": list(SIXTEENTH_CH),
           "oh": [(0.5, 1.0), (1.5, 1.0), (2.5, 1.0), (3.5, 1.0)]},
    "A2": {"ch": list(SIXTEENTH_CH),
           "oh": [(0.5, 1.0), (1.5, 1.0), (2.5, 1.0), (3.5, 1.0)]},
}

# Extra percussion for A' (the "busier drums" of the varied return)
A2_RIM_BAR = [(1.75, 0.8), (3.25, 0.7)]
A2_SHAKER_BAR = [(0.25, 0.5), (0.75, 0.7), (1.25, 0.5), (1.75, 0.7),
                 (2.25, 0.5), (2.75, 0.7), (3.25, 0.5), (3.75, 0.7)]
A2_TOM_FILL = [(3.00, 0.7, 45), (3.25, 0.75, 47), (3.50, 0.85, 48), (3.75, 1.0, 50)]


# ----------------------------------------------------------------------------
# DSP helpers
# ----------------------------------------------------------------------------
def lowpass(x, cutoff_hz):
    """Cheap box-blur lowpass; fine for synth tone-shaping."""
    k = max(1, int(SR / cutoff_hz))
    if k <= 1:
        return x
    kernel = np.ones(k) / k
    return np.convolve(x, kernel, mode="same")


def norm(x, g=1.0):
    p = np.max(np.abs(x)) + 1e-9
    return x * (g / p)


def env_ar(n, attack_s, decay_tau):
    t = np.arange(n) / SR
    e = np.exp(-t / decay_tau)
    a = max(1, int(attack_s * SR))
    e[:a] *= np.linspace(0.0, 1.0, a)
    return e


def gate_env(n, dur_s, rel_s=0.02):
    g = np.ones(n)
    ge = min(n, int(dur_s * SR))
    r = np.arange(n - ge) / SR
    g[ge:] = np.exp(-r / rel_s)
    return g


# ----------------------------------------------------------------------------
# Drum synths (rendered once, cached)
# ----------------------------------------------------------------------------
def synth_kick():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 44 + 118 * np.exp(-t / 0.026)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.115)
    click = np.random.default_rng(11).uniform(-1, 1, n) * np.exp(-t / 0.0035) * 0.5
    return norm(np.tanh(1.6 * (body + click)), 1.0)


def synth_clap():
    rng = np.random.default_rng(22)
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for i, off in enumerate([0.0, 0.011, 0.022, 0.032]):
        s = int(off * SR)
        tau = 0.0085 if i < 3 else 0.075
        x[s:] += rng.uniform(-1, 1, n - s) * np.exp(-t[: n - s] / tau)
    x = np.diff(x, prepend=0.0)
    x = lowpass(x, 6200)
    return norm(x, 1.0)


def synth_hat(decay_tau, seed):
    n = int(max(decay_tau * 6.0, 0.05) * SR)
    rng = np.random.default_rng(seed)
    x = rng.uniform(-1, 1, n)
    x = np.diff(np.diff(x, prepend=0.0), prepend=0.0)      # steep highpass
    t = np.arange(n) / SR
    return norm(x * np.exp(-t / decay_tau), 1.0)


def synth_rim():
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.010)
    click = np.random.default_rng(33).uniform(-1, 1, n) * np.exp(-t / 0.003) * 0.6
    return norm(tone + click, 1.0)


def synth_shaker():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(44)
    x = np.diff(rng.uniform(-1, 1, n), prepend=0.0)
    e = np.exp(-t / 0.030)
    a = int(0.008 * SR)
    e[:a] *= np.linspace(0, 1, a)
    return norm(x * e, 1.0)


def synth_tom(midi):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f0 = mtof(midi)
    f = f0 * (1.0 + 0.6 * np.exp(-t / 0.02))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)
    return norm(np.tanh(1.4 * x), 1.0)


# ----------------------------------------------------------------------------
# Tonal synths
# ----------------------------------------------------------------------------
def osc(freq, n, kind="saw", detune=1.0, phase0=0.0):
    t = np.arange(n) / SR
    ph = (freq * detune * t + phase0) % 1.0
    if kind == "saw":
        return 2.0 * ph - 1.0
    if kind == "square":
        return np.where(ph < 0.5, 1.0, -1.0)
    if kind == "pulse":
        return np.where(ph < 0.32, 1.0, -1.0)
    if kind == "tri":
        return 2.0 * np.abs(2.0 * ph - 1.0) - 1.0
    return np.sin(2.0 * np.pi * ph)


def synth_bass(freq, dur):
    """Bass voice.  BASS_STYLE selects the timbre; notes/rhythm live elsewhere."""
    n = int((dur + 0.08) * SR)
    t = np.arange(n) / SR
    if BASS_STYLE == "bright":
        # Punchy saw/square pluck with an open-ish filter
        x = 0.9 * osc(freq, n, "saw") + 0.35 * osc(freq, n, "square", phase0=0.25)
        x = lowpass(x, 950.0)
        e = env_ar(n, 0.003, 0.22)
    else:
        # "dark": round sub -- sine + soft triangle, heavy filter, softer attack
        x = 0.95 * osc(freq, n, "sine") + 0.40 * osc(freq, n, "tri") \
            + 0.25 * osc(freq * 2.0, n, "sine", phase0=0.1)
        x = lowpass(x, 330.0)
        e = env_ar(n, 0.008, 0.26)
    x = x * e * gate_env(n, dur)
    return np.tanh(1.3 * x)


def synth_stab(freqs, dur):
    n = int((dur + 0.25) * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    for i, f in enumerate(freqs):
        L += osc(f, n, "saw", detune=0.9965, phase0=0.13 * i)
        R += osc(f, n, "saw", detune=1.0035, phase0=0.31 * i)
    e = env_ar(n, 0.004, 0.16) * gate_env(n, dur, 0.05)
    L = lowpass(L * e, 2100)
    R = lowpass(R * e, 2100)
    return np.vstack([L, R]) / max(1, len(freqs))


def synth_pad(freqs, dur):
    n = int((dur + 0.9) * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    for i, f in enumerate(freqs):
        L += osc(f, n, "saw", detune=0.994, phase0=0.11 * i)
        L += osc(f, n, "saw", detune=1.003, phase0=0.47 * i)
        R += osc(f, n, "saw", detune=0.997, phase0=0.29 * i)
        R += osc(f, n, "saw", detune=1.006, phase0=0.71 * i)
    t = np.arange(n) / SR
    e = np.minimum(t / 0.6, 1.0) * gate_env(n, dur, 0.5)
    L = lowpass(L * e, 1400)
    R = lowpass(R * e, 1400)
    return np.vstack([L, R]) / (2 * max(1, len(freqs)))


def synth_lead(freq, dur):
    n = int((dur + 0.30) * SR)
    t = np.arange(n) / SR
    vib = 1.0 + 0.006 * np.sin(2 * np.pi * 5.3 * t) * np.minimum(t / 0.25, 1.0)
    ph = np.cumsum(freq * vib) / SR
    x = 0.6 * np.where(ph % 1.0 < 0.42, 1.0, -1.0)
    x += 0.5 * (2.0 * ((ph * 1.004 + 0.17) % 1.0) - 1.0)
    x = lowpass(x, 3000)
    e = env_ar(n, 0.006, 0.45) * gate_env(n, dur, 0.06)
    return x * e


def synth_arp(freq, dur):
    n = int((dur + 0.10) * SR)
    x = osc(freq, n, "pulse") + 0.4 * osc(freq, n, "saw", detune=1.005)
    x = lowpass(x, 2600)
    e = env_ar(n, 0.002, 0.07) * gate_env(n, dur, 0.02)
    return x * e


# ----------------------------------------------------------------------------
# Song assembly: build event lists (absolute beats)
# ----------------------------------------------------------------------------
def build_song():
    ev = {
        "kick": [], "clap": [], "ch": [], "oh": [],
        "rim": [], "shaker": [], "tom": [],
        "bass": [], "stab": [], "pad": [], "lead": [], "arp": [],
    }

    for si, name in enumerate(SECTIONS):
        base = si * SECTION_BEATS
        is_chorus = (name == "B")

        # -------- drums --------
        hats = HAT_PATTERNS[name]
        for bar in range(BARS_PER_SECTION):
            b0 = base + bar * BEATS_PER_BAR
            for off, g in KICK_BAR:
                ev["kick"].append((b0 + off, g))
            for off, g in CLAP_BAR:
                ev["clap"].append((b0 + off, g))
            for off, g in hats["ch"]:
                ev["ch"].append((b0 + off, g))
            for off, g in hats["oh"]:
                ev["oh"].append((b0 + off, g))
            if name == "A2":
                for off, g in A2_RIM_BAR:
                    ev["rim"].append((b0 + off, g))
                for off, g in A2_SHAKER_BAR:
                    ev["shaker"].append((b0 + off, g))
                if bar % 4 == 3:
                    for off, g, note in A2_TOM_FILL:
                        ev["tom"].append((b0 + off, g, note))

        # -------- bass (same rolling pattern throughout) --------
        for bar in range(BARS_PER_SECTION):
            b0 = base + bar * BEATS_PER_BAR
            root = PROG[bar % 4][1]
            for off, semi, dur, g in BASS_BAR:
                ev["bass"].append((b0 + off, root + semi, dur, g))

        # -------- chords --------
        stab_offsets = STAB_OFFSETS_CHORUS if is_chorus else STAB_OFFSETS_VERSE
        for bar in range(BARS_PER_SECTION):
            b0 = base + bar * BEATS_PER_BAR
            voicing = PROG[bar % 4][2]
            for off, g in stab_offsets:
                ev["stab"].append((b0 + off, tuple(voicing), 0.30, g))
        if is_chorus:
            # sustained wide pad, one chord per bar
            for bar in range(BARS_PER_SECTION):
                b0 = base + bar * BEATS_PER_BAR
                voicing = PROG[bar % 4][2]
                ev["pad"].append((b0, tuple(voicing), float(BEATS_PER_BAR) - 0.05, 1.0))

        # -------- melody --------
        loop = CHORUS_MELODY_LOOP if is_chorus else VERSE_MELODY_LOOP
        loop_len = 4 * BEATS_PER_BAR
        for rep in range(BARS_PER_SECTION // 4):
            for off, note, dur in loop:
                ev["lead"].append((base + rep * loop_len + off, note, dur, 1.0))

        # -------- chorus 16th arp (adds density + registral width) --------
        if is_chorus:
            for bar in range(BARS_PER_SECTION):
                b0 = base + bar * BEATS_PER_BAR
                voicing = PROG[bar % 4][2]
                tones = [v + 12 for v in voicing] + [v + 24 for v in voicing]
                for step in range(16):
                    note = tones[ARP_STEPS[step] % len(tones)]
                    ev["arp"].append((b0 + step * 0.25, note, 0.22, 0.9))

    return ev


# ----------------------------------------------------------------------------
# WAV rendering
# ----------------------------------------------------------------------------
def place(bus, start_sec, sig, gain=1.0, pan=0.0):
    """Mix `sig` (mono 1-D or stereo (2,n)) into stereo `bus` at start_sec."""
    s = int(start_sec * SR)
    if sig.ndim == 1:
        gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        sl = sig * (gl / np.sqrt(2))
        srg = sig * (gr / np.sqrt(2))
    else:
        sl = sig[0] * gain
        srg = sig[1] * gain
    n = len(sl)
    end = min(s + n, bus.shape[1])
    if end <= s:
        return
    bus[0, s:end] += sl[: end - s]
    bus[1, s:end] += srg[: end - s]


def ping_pong_delay(bus, delay_beats, fb, mix):
    d = int(delay_beats * BEAT * SR)
    wet = np.zeros_like(bus)
    for k in range(1, 5):
        off = d * k
        if off >= bus.shape[1]:
            break
        shifted = np.zeros_like(bus)
        shifted[:, off:] = bus[:, :-off]
        if k % 2 == 1:
            shifted = shifted[::-1]
        wet += shifted * (fb ** k)
    return bus + wet * mix


def sidechain_curve(n_samples, depth=0.40, recover_tau=0.085):
    """Per-beat pump: duck at each kick, exponential recovery."""
    t = np.arange(n_samples) / SR
    phase = np.mod(t, BEAT)
    return 1.0 - depth * np.exp(-phase / recover_tau)


def render_wav(ev, path):
    total_sec = TOTAL_BEATS * BEAT + TAIL_SEC
    N = int(total_sec * SR)

    drums = np.zeros((2, N))
    bassb = np.zeros((2, N))
    chords = np.zeros((2, N))
    arpb = np.zeros((2, N))
    leadb = np.zeros((2, N))

    # drums (cached one-shots)
    kick = synth_kick()
    clap = synth_clap()
    chh = synth_hat(0.035, seed=55)
    ohh = synth_hat(0.240, seed=66)
    rim = synth_rim()
    shk = synth_shaker()
    toms = {m: synth_tom(m) for m in {n for (_, _, n) in ev["tom"]}} if ev["tom"] else {}

    for b, g in ev["kick"]:
        place(drums, b * BEAT, kick, 0.95 * g, 0.0)
    for b, g in ev["clap"]:
        place(drums, b * BEAT, clap, 0.42 * g, 0.06)
    for b, g in ev["ch"]:
        place(drums, b * BEAT, chh, 0.16 * g, -0.18)
    for b, g in ev["oh"]:
        place(drums, b * BEAT, ohh, 0.14 * g, 0.20)
    for b, g in ev["rim"]:
        place(drums, b * BEAT, rim, 0.22 * g, -0.35)
    for b, g in ev["shaker"]:
        place(drums, b * BEAT, shk, 0.11 * g, 0.38)
    for b, g, note in ev["tom"]:
        place(drums, b * BEAT, toms[note], 0.45 * g, (note - 47) * 0.12)

    # bass
    for b, note, dur, g in ev["bass"]:
        place(bassb, b * BEAT, synth_bass(mtof(note), dur * BEAT), 0.52 * g, 0.0)

    # chords
    for b, voicing, dur, g in ev["stab"]:
        sig = synth_stab([mtof(v) for v in voicing], dur * BEAT)
        place(chords, b * BEAT, sig, 0.50 * g, 0.0)
    for b, voicing, dur, g in ev["pad"]:
        sig = synth_pad([mtof(v) for v in voicing], dur * BEAT)
        place(chords, b * BEAT, sig, 0.62 * g, 0.0)

    # arp
    for b, note, dur, g in ev["arp"]:
        pan = 0.45 if (int(b * 4) % 2 == 0) else -0.45
        place(arpb, b * BEAT, synth_arp(mtof(note), dur * BEAT), 0.16 * g, pan)

    # lead (stereo double: slight detune per side via pan trick + delay send)
    for b, note, dur, g in ev["lead"]:
        sig = synth_lead(mtof(note), dur * BEAT)
        place(leadb, b * BEAT, sig, 0.30 * g, -0.12)
        place(leadb, b * BEAT + 0.007, sig, 0.26 * g, 0.12)
    leadb = ping_pong_delay(leadb, delay_beats=0.75, fb=0.38, mix=0.30)

    # sidechain pump on the sustained/tonal material
    duck = sidechain_curve(N)
    bassb *= duck
    chords *= duck
    arpb *= duck

    master = drums + bassb + chords + arpb + leadb
    master = np.tanh(master * 1.1)
    master = norm(master, 0.95)

    pcm = (master.T * 32767.0).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"wrote {path}  ({master.shape[1] / SR:.1f}s)")


# ----------------------------------------------------------------------------
# MIDI writing (SMF type 1)
# ----------------------------------------------------------------------------
TPB = 480  # ticks per beat

GM_DRUM = {"kick": 36, "clap": 39, "ch": 42, "oh": 46, "rim": 37, "shaker": 70}

MIDI_PROGRAMS = {           # instrument -> (channel, GM program)
    "bass": (0, 38),        # Synth Bass 1
    "stab": (1, 62),        # Synth Brass 1
    "pad":  (2, 89),        # Pad 2 (warm)
    "lead": (3, 80),        # Lead 1 (square)
    "arp":  (4, 81),        # Lead 2 (sawtooth)
}


def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append(0x80 | (n & 0x7F))
        n >>= 7
    return bytes(reversed(out))


def track_chunk(events):
    """events: list of (tick, order, bytes) -> complete MTrk chunk."""
    events = sorted(events, key=lambda e: (e[0], e[1]))
    data = bytearray()
    last = 0
    for tick, _, msg in events:
        data += vlq(tick - last) + msg
        last = tick
    data += vlq(0) + b"\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(data)) + bytes(data)


def write_midi(ev, path):
    tracks = []

    # conductor
    tempo = int(60_000_000 / BPM)
    cond = [
        (0, 0, b"\xff\x51\x03" + struct.pack(">I", tempo)[1:]),
        (0, 0, b"\xff\x58\x04\x04\x02\x18\x08"),
        (0, 0, b"\xff\x59\x02" + struct.pack("bB", -4, 1)),  # 4 flats, minor
        (0, 0, b"\xff\x03" + bytes([8]) + b"Undertow"),
    ]
    tracks.append(track_chunk(cond))

    # drums on channel 9
    dev = []
    for name, key in GM_DRUM.items():
        for item in ev[name]:
            b, g = item[0], item[1]
            tick = int(round(b * TPB))
            vel = max(20, min(127, int(105 * g)))
            dev.append((tick, 1, bytes([0x99, key, vel])))
            dev.append((tick + TPB // 8, 0, bytes([0x89, key, 0])))
    for b, g, note in ev["tom"]:
        tick = int(round(b * TPB))
        dev.append((tick, 1, bytes([0x99, note, max(20, min(127, int(105 * g)))])))
        dev.append((tick + TPB // 8, 0, bytes([0x89, note, 0])))
    tracks.append(track_chunk(dev))

    # tonal tracks
    for name, (chan, prog) in MIDI_PROGRAMS.items():
        tev = [(0, 0, bytes([0xC0 | chan, prog]))]
        for item in ev[name]:
            b, payload, dur, g = item
            notes = payload if isinstance(payload, tuple) else (payload,)
            on = int(round(b * TPB))
            off = on + max(1, int(round(dur * TPB)))
            vel = max(20, min(127, int(100 * g)))
            for nn in notes:
                tev.append((on, 1, bytes([0x90 | chan, nn, vel])))
                tev.append((off, 0, bytes([0x80 | chan, nn, 0])))
        tracks.append(track_chunk(tev))

    header = b"MThd" + struct.pack(">IHHH", 6, 1, len(tracks), TPB)
    with open(path, "wb") as f:
        f.write(header)
        for t in tracks:
            f.write(t)
    print(f"wrote {path}")


# ----------------------------------------------------------------------------
if __name__ == "__main__":
    events = build_song()
    render_wav(events, os.path.join(OUT_DIR, "undertow.wav"))
    write_midi(events, os.path.join(OUT_DIR, "undertow.mid"))
