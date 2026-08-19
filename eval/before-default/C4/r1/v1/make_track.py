#!/usr/bin/env python3
"""
Melodic trance track generator — "Skyline Static"

Key: A minor, 138 BPM, 4/4.
Form: A (verse) | B (chorus) | C (breakdown) | B (final chorus), 16 bars each.
Riser + drum-fill transition material leads into each chorus (each B section).

Outputs (next to this script):
  trance_track.mid  — standard MIDI file (type 1) of the full arrangement
  trance_track.wav  — 44.1 kHz / 16-bit stereo render via the built-in numpy softsynth
  trance_track.mp3  — convenience encode (if ffmpeg is on PATH)

Everything is deterministic (fixed RNG seeds), so re-runs are bit-identical.
"""

import os
import struct
import subprocess
import wave

import numpy as np

# ----------------------------------------------------------------------------
# Version configuration
# ----------------------------------------------------------------------------
TRANSPOSE = 0                 # semitones added to every pitched note (0 = A minor)
BIG_FINAL_TRANSITION = True  # True = longer riser + bigger drum fill into final chorus

# ----------------------------------------------------------------------------
# Globals
# ----------------------------------------------------------------------------
SR = 44100
BPM = 138.0
SPB = 60.0 / BPM              # seconds per beat
BAR = 4                       # beats per bar
PPQ = 480                     # MIDI ticks per quarter

HERE = os.path.dirname(os.path.abspath(__file__))

def bt(bar, beat=0.0):
    """bar (0-based) + beat offset -> absolute beat."""
    return bar * BAR + beat

def beats_to_samp(b):
    return int(round(b * SPB * SR))

def m2f(pitch):
    return 440.0 * 2.0 ** ((pitch - 69) / 12.0)

# ----------------------------------------------------------------------------
# Arrangement data
# ----------------------------------------------------------------------------
# Sections (bar indices): A 0-15, B1 16-31, C 32-47, B2 48-63.
SEC_A, SEC_B1, SEC_C, SEC_B2 = 0, 16, 32, 48
TOTAL_BARS = 64

# i - VI - III - VII in A minor: Am F C G (one chord per bar, 4-bar loop)
PADS   = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]]   # voice-led triads
ARPSET = [[57, 64, 69, 72], [53, 60, 65, 69], [55, 60, 64, 67], [55, 59, 62, 67]]
BASSRT = [45, 41, 48, 43]    # A2 F2 C3 G2
SUBRT  = [33, 29, 36, 31]    # A1 F1 C2 G1

def chord_of(bar):
    return bar % 4

# 16-step arp pattern (indexes into ARPSET row) + accent map
ARP_PAT = [0, 2, 1, 2, 0, 2, 1, 3, 0, 2, 1, 2, 3, 2, 1, 2]
ARP_VEL = [96 if i % 4 == 0 else 72 for i in range(16)]

# Chorus lead: one rhythmic motif per bar, 8-bar phrase (pitches per bar).
LEAD_RHYTHM = [(0.0, 0.75), (0.75, 0.75), (1.5, 1.0), (2.5, 0.5), (3.0, 1.0)]
LEAD_PHRASE = [
    [69, 71, 72, 71, 76],   # Am
    [77, 76, 72, 74, 72],   # F
    [76, 74, 72, 67, 76],   # C
    [74, 72, 71, 69, 71],   # G
    [69, 71, 72, 71, 76],   # Am
    [77, 76, 72, 74, 77],   # F
    [76, 77, 79, 76, 74],   # C (lift)
    [74, 76, 74, 72, 71],   # G (leads home)
]

def build_song():
    """Returns (notes, drums, risers).

    notes : list of (part, start_beat, dur_beats, midi_pitch, velocity)
    drums : list of (name, start_beat, velocity)
    risers: list of (start_beat, dur_beats)  — noise sweep + pitched uplifter
    """
    notes, drums, risers = [], [], []
    T = TRANSPOSE

    def note(part, start, dur, pitch, vel):
        notes.append((part, start, dur, pitch + T, vel))

    # ---- pitched parts -----------------------------------------------------
    for bar in range(TOTAL_BARS):
        c = chord_of(bar)
        in_A  = SEC_A  <= bar < SEC_B1
        in_B  = (SEC_B1 <= bar < SEC_C) or (SEC_B2 <= bar < TOTAL_BARS)
        in_C  = SEC_C  <= bar < SEC_B2

        # Off-beat 8th bass (verse + choruses)
        if in_A or in_B:
            for k in range(4):
                note("bass", bt(bar, k + 0.5), 0.42, BASSRT[c], 100)

        # 16th pluck arp (verse + choruses)
        if in_A or in_B:
            for s in range(16):
                p = ARPSET[c][ARP_PAT[s]]
                v = ARP_VEL[s] if in_B else int(ARP_VEL[s] * 0.8)
                note("arp", bt(bar, s * 0.25), 0.24, p, v)

        # Pads: from bar 8 of the verse, then everywhere
        if bar >= 8:
            for p in PADS[c]:
                note("pads", bt(bar), 4.0, p, 78)

        # Breakdown sub bass (second half of C)
        if in_C and bar >= SEC_C + 8:
            note("sub", bt(bar), 4.0, SUBRT[c], 95)

    # Chorus lead (both B sections, 8-bar phrase twice)
    for sec in (SEC_B1, SEC_B2):
        for rep in range(2):
            for i, pitches in enumerate(LEAD_PHRASE):
                bar = sec + rep * 8 + i
                for (off, dur), p in zip(LEAD_RHYTHM, pitches):
                    vel = 108 if off == 0.0 else 100
                    note("lead", bt(bar, off), dur * 0.95, p, vel)

    # Breakdown: same melody on the soft/washed lead
    for rep in range(2):
        for i, pitches in enumerate(LEAD_PHRASE):
            bar = SEC_C + rep * 8 + i
            for (off, dur), p in zip(LEAD_RHYTHM, pitches):
                note("softlead", bt(bar, off), dur * 0.98, p, 80)

    # Outro hit (bar 64 downbeat): let the tonic ring out
    for p in PADS[0]:
        note("pads", bt(TOTAL_BARS), 4.0, p, 82)
    note("sub", bt(TOTAL_BARS), 4.0, SUBRT[0], 100)

    # ---- drums -------------------------------------------------------------
    def drum(name, start, vel):
        drums.append((name, start, vel))

    for bar in range(TOTAL_BARS):
        in_A = SEC_A <= bar < SEC_B1
        in_B = (SEC_B1 <= bar < SEC_C) or (SEC_B2 <= bar < TOTAL_BARS)

        if in_A or in_B:                     # four-on-the-floor
            for k in range(4):
                drum("kick", bt(bar, k), 118)

        if in_A and bar >= 8:                # light claps late in the verse
            drum("clap", bt(bar, 1), 64)
            drum("clap", bt(bar, 3), 64)
        if in_B:
            drum("clap", bt(bar, 1), 104)
            drum("clap", bt(bar, 3), 104)

        if in_A:                             # off-beat closed hats
            for k in range(4):
                drum("chat", bt(bar, k + 0.5), 70)
        if in_B:                             # 16th hats + open hat off-beats
            for k in range(4):
                drum("chat", bt(bar, k + 0.25), 52)
                drum("chat", bt(bar, k + 0.75), 62)
                drum("ohat", bt(bar, k + 0.5), 84)

    # Crashes at section downbeats + outro
    drum("crash", bt(SEC_A), 70)
    drum("crash", bt(SEC_B1), 110)
    drum("crash", bt(SEC_C), 62)
    drum("crash", bt(SEC_B2), 116)
    drum("crash", bt(TOTAL_BARS), 112)
    drum("kick",  bt(TOTAL_BARS), 120)

    # ---- transitions into the choruses ------------------------------------
    # Into B1: 2-bar riser (bars 14-15) + half-bar snare roll (bar 15)
    risers.append((bt(14), 8.0))
    for i in range(8):                       # 16ths over beats 62-64
        drum("snare", bt(15, 2.0) + i * 0.25, 58 + i * 7)

    if not BIG_FINAL_TRANSITION:
        # Into B2 (v0): 4-bar riser (bars 44-47) + 1-bar fill (bar 47)
        risers.append((bt(44), 16.0))
        for i in range(12):                  # 16ths, beats 1-3 of bar 47
            drum("snare", bt(47, 0.0) + i * 0.25, 52 + i * 5)
        for i in range(8):                   # 32nds on the last beat
            drum("snare", bt(47, 3.0) + i * 0.125, 96 + i * 3)
    else:
        # Into B2 (v1): 8-bar riser (bars 40-47) + 2-bar escalating fill
        risers.append((bt(40), 32.0))
        for b in range(4):                   # bar-downbeat kick thumps, bars 44-47
            drum("kick", bt(44 + b), 92 + b * 8)
        drum("crash", bt(46), 78)            # extra crash launches the fill
        for i in range(8):                   # bar 46: 8th-note snares
            drum("snare", bt(46, 0.0) + i * 0.5, 54 + i * 4)
        drum("tomh", bt(46, 1.75), 88)       # tom accents woven between snares
        drum("tomm", bt(46, 2.75), 94)
        drum("toml", bt(46, 3.75), 100)
        for i in range(8):                   # bar 47 beats 1-2: 16ths
            drum("snare", bt(47, 0.0) + i * 0.25, 78 + i * 3)
        for i in range(16):                  # bar 47 beats 3-4: 32nds
            drum("snare", bt(47, 2.0) + i * 0.125, 96 + int(i * 1.6))
        drum("ohat", bt(47, 3.75), 100)

    return notes, drums, risers

# ----------------------------------------------------------------------------
# MIDI writer (SMF type 1, no dependencies)
# ----------------------------------------------------------------------------
def _vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    return bytes(reversed(out))

def _track(events):
    """events: list of (tick, bytes). Returns a complete MTrk chunk."""
    events.sort(key=lambda e: e[0])
    data, last = bytearray(), 0
    for tick, ev in events:
        data += _vlq(tick - last) + ev
        last = tick
    data += _vlq(0) + b"\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(data)) + bytes(data)

PART_MIDI = {   # part -> (channel, GM program)
    "bass":     (0, 38),   # Synth Bass 1
    "arp":      (1, 81),   # Lead 2 (sawtooth)
    "lead":     (2, 81),
    "pads":     (3, 88),   # Pad 1 (new age)
    "softlead": (4, 90),   # Pad 3 (polysynth)
    "sub":      (5, 39),   # Synth Bass 2
}
DRUM_KEY = {"kick": 36, "snare": 38, "clap": 39, "chat": 42, "ohat": 46,
            "crash": 49, "tomh": 50, "tomm": 47, "toml": 45}

def write_midi(path, notes, drums, risers):
    ticks = lambda b: int(round(b * PPQ))
    chunks = []

    conductor = [
        (0, b"\xff\x03" + _vlq(14) + b"Skyline Static"),
        (0, b"\xff\x51\x03" + int(round(60_000_000 / BPM)).to_bytes(3, "big")),
        (0, b"\xff\x58\x04\x04\x02\x18\x08"),
    ]
    chunks.append(_track(conductor))

    for part in ("bass", "arp", "lead", "pads", "softlead", "sub"):
        ch, prog = PART_MIDI[part]
        ev = [(0, b"\xff\x03" + _vlq(len(part)) + part.encode()),
              (0, bytes([0xC0 | ch, prog]))]
        for p, start, dur, pitch, vel in ((n[0],) + n[1:] for n in notes):
            if p != part:
                continue
            on, off = ticks(start), ticks(start + dur)
            ev.append((on,  bytes([0x90 | ch, pitch, vel])))
            ev.append((max(off, on + 1), bytes([0x80 | ch, pitch, 0])))
        chunks.append(_track(ev))

    ev = [(0, b"\xff\x03" + _vlq(5) + b"drums")]
    for name, start, vel in drums:
        key, on = DRUM_KEY[name], ticks(start)
        ev.append((on, bytes([0x99, key, vel])))
        ev.append((on + PPQ // 8, bytes([0x89, key, 0])))
    chunks.append(_track(ev))

    ev = [(0, b"\xff\x03" + _vlq(5) + b"riser"), (0, bytes([0xC6, 96]))]  # FX 1
    for start, dur in risers:
        p = 69 + TRANSPOSE + 12                       # tonic, one octave up
        ev.append((ticks(start), bytes([0x96, p, 90])))
        ev.append((ticks(start + dur), bytes([0x86, p, 0])))
    chunks.append(_track(ev))

    with open(path, "wb") as f:
        f.write(b"MThd" + struct.pack(">IHHH", 6, 1, len(chunks), PPQ))
        for c in chunks:
            f.write(c)

# ----------------------------------------------------------------------------
# Softsynth (numpy)
# ----------------------------------------------------------------------------
def fftfilt(x, lo=None, hi=None):
    """Zero-phase Butterworth-style magnitude filter via rFFT."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.maximum(np.fft.rfftfreq(n, 1.0 / SR), 1e-6)
    m = np.ones_like(f)
    if lo:
        m *= 1.0 / np.sqrt(1.0 + (lo / f) ** 4)
    if hi:
        m *= 1.0 / np.sqrt(1.0 + (f / hi) ** 4)
    return np.fft.irfft(X * m, n)

def env_ar(n, a, r, curve=1.0):
    """Attack/release trapezoid over n samples (times in seconds)."""
    an, rn = max(int(a * SR), 1), max(int(r * SR), 1)
    e = np.ones(n)
    an, rn = min(an, n), min(rn, n)
    e[:an] = np.linspace(0, 1, an)
    e[n - rn:] *= np.linspace(1, 0, rn)
    return e ** curve

def saw_bank(f0, n, voices, detune, rng, glide_to=None):
    """Detuned saw stack, mono. Optional exponential glide f0 -> glide_to."""
    t = np.arange(n) / SR
    if glide_to is None:
        base = np.full(n, f0)
    else:
        base = f0 * (glide_to / f0) ** (t / t[-1])
    out = np.zeros(n)
    offs = np.linspace(-1, 1, voices) if voices > 1 else np.zeros(1)
    for o in offs:
        ph = np.cumsum(base * (1.0 + o * detune)) / SR + rng.random()
        out += 2.0 * (ph % 1.0) - 1.0
    return out / voices

# --- drum one-shots (synthesized once, cached) -------------------------------
def make_drums():
    rng = np.random.default_rng(1234)
    d = {}

    n = int(0.40 * SR); t = np.arange(n) / SR
    f = 46 + 112 * np.exp(-t / 0.052)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.15)
    click = fftfilt(rng.standard_normal(n) * np.exp(-t / 0.004), lo=1800)
    d["kick"] = np.tanh(2.3 * (body + 0.45 * click))

    n = int(0.35 * SR); t = np.arange(n) / SR
    noise = fftfilt(rng.standard_normal(n), lo=500, hi=8000)
    env = np.zeros(n)
    for t0 in (0.0, 0.012, 0.026):
        env = np.maximum(env, np.exp(-np.maximum(t - t0, 0) / 0.013) * (t >= t0))
    env += 0.5 * np.exp(-np.maximum(t - 0.032, 0) / 0.16) * (t >= 0.032)
    d["clap"] = noise * env * 0.9

    n = int(0.25 * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 186 * t) * np.exp(-t / 0.05) * 0.55
    noise = fftfilt(rng.standard_normal(n), lo=350, hi=9500) * np.exp(-t / 0.085)
    d["snare"] = np.tanh(1.6 * (tone + noise))

    n = int(0.09 * SR); t = np.arange(n) / SR
    d["chat"] = fftfilt(rng.standard_normal(n), lo=7500) * np.exp(-t / 0.018) * 0.8

    n = int(0.55 * SR); t = np.arange(n) / SR
    d["ohat"] = fftfilt(rng.standard_normal(n), lo=6200) * np.exp(-t / 0.14) * 0.7

    n = int(2.4 * SR); t = np.arange(n) / SR
    d["crash"] = fftfilt(rng.standard_normal(n), lo=3600) * np.exp(-t / 0.55) * 0.8

    for name, f0, f1 in (("tomh", 200, 130), ("tomm", 155, 100), ("toml", 120, 78)):
        n = int(0.4 * SR); t = np.arange(n) / SR
        f = f1 + (f0 - f1) * np.exp(-t / 0.06)
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
        nz = fftfilt(rng.standard_normal(n), lo=800, hi=6000) * np.exp(-t / 0.02)
        d[name] = np.tanh(1.8 * (tone + 0.25 * nz))
    return d

# --- pitched instruments ------------------------------------------------------
def synth_bass(f0, dur, rng):
    n = max(int(dur * SPB * SR), 64)
    t = np.arange(n) / SR
    sig = saw_bank(f0, n, 2, 0.004, rng) + 0.7 * np.sin(2 * np.pi * f0 * 0.5 * t)
    sig = fftfilt(sig, hi=900)
    return np.tanh(1.7 * sig) * env_ar(n, 0.004, 0.03)

def synth_pluck(f0, dur, rng):
    n = int((dur * SPB + 0.12) * SR)
    sig = saw_bank(f0, n, 3, 0.006, rng)
    bright, dark = fftfilt(sig, hi=8500), fftfilt(sig, hi=1300)
    t = np.arange(n) / SR
    k = np.exp(-t / 0.085)
    return (dark + (bright - dark) * k) * np.exp(-t / 0.16) * env_ar(n, 0.002, 0.01)

def synth_lead(f0, dur, rng):
    n = int((dur * SPB + 0.07) * SR)
    L = fftfilt(saw_bank(f0, n, 4, 0.011, rng), lo=180, hi=9500)
    R = fftfilt(saw_bank(f0, n, 4, 0.011, rng), lo=180, hi=9500)
    e = env_ar(n, 0.008, 0.06)
    t = np.arange(n) / SR
    e *= 0.78 + 0.22 * np.exp(-t / 0.14)          # pick-style decay to sustain
    return L * e, R * e

def synth_pad(f0, dur, rng):
    n = int((dur * SPB + 0.9) * SR)
    L = fftfilt(saw_bank(f0, n, 4, 0.014, rng), lo=110, hi=2900)
    R = fftfilt(saw_bank(f0, n, 4, 0.014, rng), lo=110, hi=2900)
    e = env_ar(n, min(0.5, dur * SPB * 0.35), 0.85, curve=1.3)
    return L * e, R * e

def synth_softlead(f0, dur, rng):
    n = int((dur * SPB + 0.5) * SR)
    L = fftfilt(saw_bank(f0, n, 3, 0.009, rng), lo=170, hi=3900)
    R = fftfilt(saw_bank(f0, n, 3, 0.009, rng), lo=170, hi=3900)
    e = env_ar(n, 0.12, 0.4)
    return L * e, R * e

def synth_sub(f0, dur, rng):
    n = int((dur * SPB + 0.15) * SR)
    t = np.arange(n) / SR
    sig = np.tanh(1.5 * np.sin(2 * np.pi * f0 * t))
    return sig * env_ar(n, 0.02, 0.12)

def synth_riser(dur_beats, f_root, rng):
    """Noise sweep (rising band-pass) + pitched uplifter gliding up 2 octaves."""
    n = int(dur_beats * SPB * SR)
    t01 = np.linspace(0, 1, n)

    x = rng.standard_normal(n)
    win, hop = 2048, 1024
    out = np.zeros(n + win)
    w = np.hanning(win)
    nf = max((n - win) // hop, 1)
    for i in range(nf + 1):
        s = min(i * hop, max(n - win, 0))
        fr = x[s:s + win]
        if len(fr) < win:
            fr = np.pad(fr, (0, win - len(fr)))
        F = np.fft.rfft(fr * w)
        fq = np.maximum(np.fft.rfftfreq(win, 1.0 / SR), 1.0)
        prog = i / max(nf, 1)
        c = 260.0 * (11000.0 / 260.0) ** prog
        mask = np.exp(-0.5 * (np.log2(fq / c) / 1.1) ** 2)
        out[s:s + win] += np.fft.irfft(F * mask, win) * w
    noise = out[:n] * (t01 ** 2.2)

    up = saw_bank(f_root, n, 3, 0.01, rng, glide_to=f_root * 4.0)
    up = fftfilt(up, hi=6000) * (t01 ** 1.6) * 0.4

    sig = (noise * 0.9 + up) * env_ar(n, 0.05, 0.012)
    return sig, sig

# ----------------------------------------------------------------------------
# Renderer
# ----------------------------------------------------------------------------
def render(notes, drums, risers, out_wav):
    tail = 3.5
    total_n = beats_to_samp(bt(TOTAL_BARS) + 4) + int(tail * SR)

    bufs = {k: np.zeros((total_n, 2), dtype=np.float32)
            for k in ("kick", "drums", "bass", "arp", "lead", "pads",
                      "softlead", "sub", "fx")}

    def add(buf, start, sigL, sigR=None, gain=1.0, pan=0.0):
        if sigR is None:
            sigR = sigL
        gl = gain * np.cos((pan + 1) * np.pi / 4) * 1.414
        gr = gain * np.sin((pan + 1) * np.pi / 4) * 1.414
        end = min(start + len(sigL), total_n)
        m = end - start
        if m <= 0:
            return
        buf[start:end, 0] += (sigL[:m] * gl).astype(np.float32)
        buf[start:end, 1] += (sigR[:m] * gr).astype(np.float32)

    # --- drums ---
    kit = make_drums()
    kick_samps = []
    for name, start, vel in drums:
        s = beats_to_samp(start)
        g = (vel / 127.0) ** 1.5
        if name == "kick":
            kick_samps.append(s)
            add(bufs["kick"], s, kit["kick"], gain=g)
        else:
            pan = {"chat": 0.25, "ohat": -0.2, "tomh": 0.3, "tomm": 0.0,
                   "toml": -0.3}.get(name, 0.0)
            add(bufs["drums"], s, kit[name], gain=g, pan=pan)

    # --- pitched notes ---
    rngs = {p: np.random.default_rng(seed) for p, seed in
            (("bass", 11), ("arp", 22), ("lead", 33), ("pads", 44),
             ("softlead", 55), ("sub", 66))}
    for part, start, dur, pitch, vel in notes:
        f0 = m2f(pitch)
        g = (vel / 127.0) ** 1.4
        s = beats_to_samp(start)
        r = rngs[part]
        if part == "bass":
            add(bufs["bass"], s, synth_bass(f0, dur, r), gain=g)
        elif part == "arp":
            pan = 0.35 if (round(start * 4) % 2) else -0.35
            add(bufs["arp"], s, synth_pluck(f0, dur, r), gain=g, pan=pan)
        elif part == "lead":
            L, R = synth_lead(f0, dur, r)
            add(bufs["lead"], s, L, R, gain=g)
        elif part == "pads":
            L, R = synth_pad(f0, dur, r)
            add(bufs["pads"], s, L, R, gain=g * 0.6)
        elif part == "softlead":
            L, R = synth_softlead(f0, dur, r)
            add(bufs["softlead"], s, L, R, gain=g)
        elif part == "sub":
            add(bufs["sub"], s, synth_sub(f0, dur, r), gain=g)

    # --- risers ---
    rrng = np.random.default_rng(77)
    for start, dur in risers:
        f_root = m2f(69 + TRANSPOSE)          # uplifter rooted on the tonic
        L, R = synth_riser(dur, f_root, rrng)
        add(bufs["fx"], beats_to_samp(start), L, R, gain=0.9)

    # --- sidechain pump keyed to the kick ---
    duck = np.ones(total_n, dtype=np.float32)
    rel = int(0.30 * SR)
    ramp = (0.22 + 0.78 * np.linspace(0, 1, rel) ** 1.6).astype(np.float32)
    for k in kick_samps:
        end = min(k + rel, total_n)
        duck[k:end] = np.minimum(duck[k:end], ramp[:end - k])
    duck = duck[:, None]
    bufs["bass"] *= duck
    bufs["sub"] *= duck
    for p in ("arp", "lead", "pads", "softlead"):
        bufs[p] *= 0.35 + 0.65 * duck

    # --- dotted-8th ping-pong delay on leads ---
    dsamp = beats_to_samp(0.75)
    for p, wet in (("lead", 0.55), ("softlead", 0.7)):
        mono = bufs[p].mean(axis=1)
        for i in range(1, 5):
            gsh = 0.45 ** i * wet
            sh = i * dsamp
            ch = 0 if i % 2 else 1
            bufs[p][sh:, ch] += (mono[:total_n - sh] * gsh).astype(np.float32)

    # --- reverb (synthetic IR, FFT convolution) ---
    irn = int(2.3 * SR)
    irt = np.arange(irn) / SR
    ir_rng = np.random.default_rng(99)
    irL = fftfilt(ir_rng.standard_normal(irn) * np.exp(-irt / 0.75), lo=260, hi=8200)
    irR = fftfilt(ir_rng.standard_normal(irn) * np.exp(-irt / 0.75), lo=260, hi=8200)
    irL /= np.sqrt((irL ** 2).sum()); irR /= np.sqrt((irR ** 2).sum())
    send = (bufs["pads"] * 0.35 + bufs["lead"] * 0.25 + bufs["softlead"] * 0.6 +
            bufs["arp"] * 0.12 + bufs["drums"] * 0.10)
    nfft = 1 << int(np.ceil(np.log2(total_n + irn)))
    wet = np.zeros((total_n, 2), dtype=np.float32)
    for ch, ir in ((0, irL), (1, irR)):
        W = np.fft.rfft(send[:, ch].astype(np.float64), nfft) * np.fft.rfft(ir, nfft)
        wet[:, ch] = np.fft.irfft(W, nfft)[:total_n].astype(np.float32)

    # --- mix ---
    mix = (bufs["kick"] * 1.00 + bufs["drums"] * 0.85 + bufs["bass"] * 0.70 +
           bufs["arp"] * 0.42 + bufs["lead"] * 0.60 + bufs["pads"] * 0.50 +
           bufs["softlead"] * 0.55 + bufs["sub"] * 0.55 + bufs["fx"] * 0.55 +
           wet * 0.9)
    mix = np.tanh(1.25 * mix)
    mix *= 0.97 / max(np.abs(mix).max(), 1e-9)

    pcm = (mix * 32767).astype(np.int16)
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())

    # section loudness sanity check
    for name, b0, b1 in (("A  (verse)    ", 0, 16), ("B1 (chorus)   ", 16, 32),
                         ("C  (breakdown)", 32, 48), ("B2 (chorus)   ", 48, 64)):
        seg = mix[beats_to_samp(bt(b0)):beats_to_samp(bt(b1))]
        print(f"  {name} RMS: {np.sqrt((seg ** 2).mean()):.3f}")

# ----------------------------------------------------------------------------
def main():
    key = ["A minor", "Bb minor", "B minor", "C minor"][TRANSPOSE % 12] \
        if TRANSPOSE in (0, 1, 2, 3) else f"A minor +{TRANSPOSE}st"
    print(f"Skyline Static — {key}, {BPM:.0f} BPM, form A B C B (16-bar sections)")
    print(f"  BIG_FINAL_TRANSITION={BIG_FINAL_TRANSITION}  TRANSPOSE={TRANSPOSE}")
    notes, drums, risers = build_song()
    print(f"  events: {len(notes)} notes, {len(drums)} drum hits, {len(risers)} risers")

    mid = os.path.join(HERE, "trance_track.mid")
    wav = os.path.join(HERE, "trance_track.wav")
    write_midi(mid, notes, drums, risers)
    print(f"  wrote {mid}")
    render(notes, drums, risers, wav)
    print(f"  wrote {wav}")

    mp3 = os.path.join(HERE, "trance_track.mp3")
    try:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav,
                        "-b:a", "192k", mp3], check=True)
        print(f"  wrote {mp3}")
    except Exception as e:
        print(f"  (mp3 skipped: {e})")

if __name__ == "__main__":
    main()
