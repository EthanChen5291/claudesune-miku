#!/usr/bin/env python3
"""
House track generator — F minor, 122 BPM, form A B A' B (16-bar sections).

Everything is generated from pattern data below and rendered two ways:
  * house_f-minor_122.wav  — fully synthesized stereo audio (listen directly)
  * house_f-minor_122.mid  — standard MIDI file (render/edit in any DAW)

Run:  python3 track.py
Requires: numpy
"""

import numpy as np
import wave
import os

# ----------------------------------------------------------------------------
# Global settings
# ----------------------------------------------------------------------------
SR = 44100
BPM = 122.0
BEAT = 60.0 / BPM                 # seconds per beat
SECTION_BARS = 16
BEATS_PER_BAR = 4
# Form: A (verse) B (chorus) A' (varied verse) B (chorus)
FORM = ["A", "B", "A2", "B"]
TOTAL_BEATS = len(FORM) * SECTION_BARS * BEATS_PER_BAR
TAIL_SEC = 2.5

# One independent, deterministic noise stream per drum voice, so editing one
# voice's pattern never changes another voice's rendered noise.
def _make_streams():
    kinds = ["kick", "clap", "ch", "oh", "shaker", "rim", "crash", "riser"]
    return {k: np.random.default_rng(1229 + i) for i, k in enumerate(kinds)}


RNGS = _make_streams()
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ----------------------------------------------------------------------------
# Harmony: 4-bar loop in F minor  (i - VI - III - VII : Fm, Db, Ab, Eb)
# ----------------------------------------------------------------------------
PROG = [
    dict(root=41, stab=[53, 56, 60], pad=[53, 56, 60, 65]),  # Fm  (F2 root)
    dict(root=37, stab=[49, 53, 56], pad=[49, 53, 56, 61]),  # Db  (Db2 root)
    dict(root=44, stab=[56, 60, 63], pad=[56, 60, 63, 68]),  # Ab  (Ab2 root)
    dict(root=39, stab=[51, 55, 58], pad=[51, 55, 58, 63]),  # Eb  (Eb2 root)
]

# ----------------------------------------------------------------------------
# Bass pattern: classic off-beat house pump (per bar; beat, semitone offset,
# velocity, duration-in-beats). Same notes/rhythm in every section.
# ----------------------------------------------------------------------------
BASS_PATTERN = [
    (0.50, 0, 1.00, 0.45),
    (1.50, 0, 1.00, 0.45),
    (2.50, 0, 1.00, 0.45),
    (3.50, 0, 0.90, 0.35),
    (3.75, 12, 0.55, 0.20),
]

# Bass timbre parameters (synthesis only — independent of the notes above).
# v3: swapped to a darker patch — low spectral corner, steep rolloff, the saw
# pulled back, more sine sub, warmer drive. Notes/rhythm are unchanged.
BASS_TIMBRE = dict(
    cutoff=380.0,      # harmonic rolloff corner for the saw layer (Hz)
    rolloff_pow=4.5,   # steepness of rolloff above cutoff
    saw_mix=0.55,      # level of the saw layer
    sub_mix=0.85,      # level of the sine sub layer (at note pitch)
    drive=1.5,         # soft saturation amount
)

# ----------------------------------------------------------------------------
# Hi-hat patterns (per bar).  Tuples: (beat, kind, velocity)
# kind: 'oh' = open hat, 'ch' = closed hat
# ----------------------------------------------------------------------------
# v1: busier hats — full 16th-note closed-hat grid with accents plus the
# off-beat open hats and syncopated extra opens. (Only the hats changed.)
HAT_PATTERN = [
    (0.00, "ch", 0.30), (0.25, "ch", 0.18), (0.50, "oh", 0.52), (0.75, "ch", 0.24),
    (1.00, "ch", 0.30), (1.25, "ch", 0.18), (1.50, "oh", 0.52), (1.75, "ch", 0.34),
    (2.00, "ch", 0.30), (2.25, "ch", 0.18), (2.50, "oh", 0.52), (2.75, "ch", 0.24),
    (3.00, "ch", 0.30), (3.25, "ch", 0.18), (3.50, "oh", 0.52), (3.75, "oh", 0.30),
]

# ----------------------------------------------------------------------------
# Melodies. Tuples: (beat offset within 4-bar phrase, midi, dur beats, vel)
# All pitches in F natural minor.
# ----------------------------------------------------------------------------
# A / A' verse melody — sparse, mid register (Db4..C5). A' uses the SAME melody.
MEL_A = [
    (0.0, 65, 1.5, 0.90), (2.0, 68, 0.5, 0.80), (3.0, 67, 1.0, 0.80),
    (4.0, 65, 1.0, 0.85), (6.0, 61, 1.0, 0.80),
    (8.0, 63, 1.5, 0.85), (10.0, 68, 0.5, 0.80), (11.0, 70, 1.0, 0.85),
    (12.0, 72, 2.0, 0.90), (14.5, 70, 0.5, 0.80), (15.0, 67, 1.0, 0.80),
]

# B chorus melody. v2: the main chorus line is lifted a further octave above
# these written pitches (see LEAD_B_LIFT) with a harmony line at the written
# register underneath — higher register AND denser. Verses are untouched.
MEL_B = [
    (0.0, 77, 0.5, 0.95), (0.5, 75, 0.5, 0.85), (1.0, 77, 1.0, 0.95),
    (2.0, 80, 0.5, 0.90), (2.5, 77, 0.5, 0.85), (3.0, 75, 1.0, 0.90),
    (4.0, 73, 0.5, 0.85), (4.5, 75, 0.5, 0.85), (5.0, 77, 1.0, 0.90),
    (6.0, 72, 1.0, 0.85), (7.0, 70, 1.0, 0.80),
    (8.0, 75, 0.5, 0.90), (8.5, 77, 0.5, 0.90), (9.0, 80, 1.0, 0.95),
    (10.0, 82, 0.5, 0.90), (10.5, 80, 0.5, 0.85), (11.0, 77, 1.0, 0.90),
    (12.0, 79, 1.0, 0.90), (13.0, 75, 0.5, 0.85), (13.5, 72, 0.5, 0.80),
    (14.0, 73, 0.5, 0.85), (14.5, 70, 0.5, 0.80), (15.0, 72, 1.0, 0.85),
]

# v2 chorus lift: main lead line transposed up an octave, harmony line kept
# at the written register underneath it.
LEAD_B_LIFT = 12
LEAD_B_HARMONY_VEL = 0.55

# Chorus arpeggio: 16th-note cycle over the pad voicing. v2: alternates
# between one and two octaves up for a taller, denser sparkle.
ARP_OCTAVES = (12, 24)
ARP_VEL_ACCENT = 0.50
ARP_VEL = 0.34

# Stab rhythms (beats within a bar)
STAB_BEATS_A = [1.5, 3.5]
STAB_BEATS_B = [0.5, 1.5, 2.5, 3.5, 3.75]   # v2: extra 16th pickup in chorus


# ============================================================================
# Event building (shared by the audio renderer and the MIDI writer)
# ============================================================================
def build_events():
    """Return (drum_events, note_events).
    drum_events: (time_beats, kind, vel)
    note_events: (time_beats, dur_beats, midi, vel, part)
    """
    drums, notes = [], []

    def chord_of(bar_in_section):
        return PROG[bar_in_section % 4]

    for si, sec in enumerate(FORM):
        sec_start = si * SECTION_BARS * BEATS_PER_BAR
        for bar in range(SECTION_BARS):
            t0 = sec_start + bar * BEATS_PER_BAR
            ch = chord_of(bar)
            last_bar = bar == SECTION_BARS - 1

            # ---------------- drums ----------------
            for b in range(BEATS_PER_BAR):                       # kick 4/floor
                drums.append((t0 + b, "kick", 1.0))
            drums.append((t0 + 1, "clap", 0.85))                 # claps 2 & 4
            drums.append((t0 + 3, "clap", 0.85))

            for b, kind, v in HAT_PATTERN:                       # hi-hats
                drums.append((t0 + b, kind, v))

            if sec == "B":
                if bar == 0:
                    drums.append((t0, "crash", 0.8))
                for i in range(8):                               # shaker 8ths
                    drums.append((t0 + i * 0.5, "shaker", 0.30 if i % 2 else 0.42))

            if sec == "A2":                                      # busier drums
                for i in range(16):                              # shaker 16ths
                    v = 0.40 if i % 4 == 0 else (0.30 if i % 2 == 0 else 0.20)
                    drums.append((t0 + i * 0.25, "shaker", v))
                drums.append((t0 + 1.75, "rim", 0.5))            # rim syncopation
                drums.append((t0 + 3.25, "rim", 0.5))
                if bar % 4 == 3:
                    drums.append((t0 + 3.5, "clap", 0.5))        # extra clap push

            if sec in ("A", "A2") and last_bar:                  # fill into B
                for i, b in enumerate((3.0, 3.25, 3.5, 3.75)):   # clap roll
                    drums.append((t0 + b, "clap", 0.35 + 0.15 * i))
            if sec in ("A", "A2") and bar >= SECTION_BARS - 2:   # 2-bar riser
                if bar == SECTION_BARS - 2:
                    drums.append((t0, "riser", 0.5))

            # ---------------- bass ----------------
            for b, off, v, d in BASS_PATTERN:
                notes.append((t0 + b, d, ch["root"] + off, v, "bass"))

            # ---------------- stabs ----------------
            stab_beats = STAB_BEATS_B if sec == "B" else STAB_BEATS_A
            stab_vel = 0.80 if sec == "B" else 0.70
            for b in stab_beats:
                for p in ch["stab"]:
                    notes.append((t0 + b, 0.30, p, stab_vel, "stab"))

            # ---------------- chorus-only layers ----------------
            if sec == "B":
                for p in ch["pad"]:                              # sustained pad
                    notes.append((t0, 4.0, p, 0.55, "pad"))
                # v2: added high pad shimmer note an octave above the voicing
                notes.append((t0, 4.0, ch["pad"][-1] + 12, 0.40, "pad"))
                for i in range(16):                              # 16th arp
                    p = ch["pad"][i % len(ch["pad"])] + ARP_OCTAVES[i % 2]
                    v = ARP_VEL_ACCENT if i % 4 == 0 else ARP_VEL
                    notes.append((t0 + i * 0.25, 0.22, p, v, "arp"))

        # ---------------- lead melody (per 4-bar phrase) ----------------
        mel = MEL_B if sec == "B" else MEL_A
        for phrase in range(SECTION_BARS // 4):
            p0 = sec_start + phrase * 4 * BEATS_PER_BAR
            for b, pitch, d, v in mel:
                if sec == "B":
                    # v2 lift: main line an octave up + harmony underneath
                    notes.append((p0 + b, d, pitch + LEAD_B_LIFT, v, "lead"))
                    notes.append((p0 + b, d, pitch, v * LEAD_B_HARMONY_VEL,
                                  "lead"))
                else:
                    notes.append((p0 + b, d, pitch, v, "lead"))

    return drums, notes


# ============================================================================
# Synthesis helpers
# ============================================================================
def m2f(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def fft_band(sig, lo, hi):
    """Brickwall bandpass via FFT (fine for percussion)."""
    S = np.fft.rfft(sig)
    freqs = np.fft.rfftfreq(len(sig), 1.0 / SR)
    S[(freqs < lo) | (freqs > hi)] = 0.0
    return np.fft.irfft(S, len(sig))


def bl_saw(f0, n, cutoff, rolloff_pow=3.0, phase=0.0):
    """Band-limited saw with a spectral-tilt 'filter' above cutoff."""
    t = np.arange(n) / SR
    sig = np.zeros(n)
    kmax = int(min(0.45 * SR / f0, 80))
    for k in range(1, kmax + 1):
        fk = k * f0
        a = 1.0 / k
        if fk > cutoff:
            a *= (cutoff / fk) ** rolloff_pow
        if a < 0.0015:
            break
        sig += a * np.sin(2 * np.pi * fk * t + phase * k)
    return sig


def bl_square(f0, n, cutoff):
    t = np.arange(n) / SR
    sig = np.zeros(n)
    kmax = int(min(0.45 * SR / f0, 60))
    for k in range(1, kmax + 1, 2):
        fk = k * f0
        a = 1.0 / k
        if fk > cutoff:
            a *= (cutoff / fk) ** 3
        if a < 0.002:
            break
        sig += a * np.sin(2 * np.pi * fk * t)
    return sig


def env_pluck(n, attack=0.003, tau=0.15):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    na = max(1, int(attack * SR))
    e[:na] *= np.linspace(0.0, 1.0, na)
    return e


def env_adsr(n, a, d, s, r, dur):
    t = np.arange(n) / SR
    e = np.zeros(n)
    e[t < a] = t[t < a] / a
    m = (t >= a) & (t < a + d)
    e[m] = 1.0 + (s - 1.0) * (t[m] - a) / d
    m = (t >= a + d) & (t < dur)
    e[m] = s
    m = t >= dur
    e[m] = s * np.exp(-(t[m] - dur) / r)
    return e


# ---------------------------------------------------------------------------
# Drum voices
# ---------------------------------------------------------------------------
def synth_kick(vel):
    n = int(0.40 * SR)
    t = np.arange(n) / SR
    f = 42.0 + 105.0 * np.exp(-t / 0.032)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.16)
    click = RNGS["kick"].standard_normal(int(0.006 * SR))
    click = np.diff(click, prepend=0.0) * 0.20 * np.exp(-np.arange(len(click)) / (0.002 * SR))
    body[: len(click)] += click
    return vel * body


def synth_clap(vel):
    n = int(0.22 * SR)
    sig = np.zeros(n)
    for i, dt in enumerate((0.0, 0.011, 0.022)):
        j = int(dt * SR)
        burst = RNGS["clap"].standard_normal(n - j) * np.exp(-np.arange(n - j) / (0.008 * SR))
        sig[j:] += burst * (0.8 + 0.1 * i)
    tail = RNGS["clap"].standard_normal(n) * np.exp(-np.arange(n) / (0.055 * SR)) * 0.5
    sig += tail
    return vel * 0.8 * fft_band(sig, 700.0, 5500.0)


def synth_hat_closed(vel):
    n = int(0.07 * SR)
    sig = RNGS["ch"].standard_normal(n) * np.exp(-np.arange(n) / (0.013 * SR))
    return vel * 0.7 * fft_band(sig, 6500.0, 16000.0)


def synth_hat_open(vel):
    n = int(0.40 * SR)
    sig = RNGS["oh"].standard_normal(n) * np.exp(-np.arange(n) / (0.085 * SR))
    return vel * 0.6 * fft_band(sig, 5500.0, 16000.0)


def synth_shaker(vel):
    n = int(0.09 * SR)
    e = np.exp(-np.arange(n) / (0.020 * SR))
    na = int(0.010 * SR)
    e[:na] *= np.linspace(0, 1, na)
    sig = RNGS["shaker"].standard_normal(n) * e
    return vel * 0.55 * fft_band(sig, 3000.0, 10000.0)


def synth_rim(vel):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    ping = np.sin(2 * np.pi * 830.0 * t) * np.exp(-t / 0.008)
    snap = RNGS["rim"].standard_normal(n) * np.exp(-t / 0.003)
    return vel * 0.6 * (ping + 0.4 * fft_band(snap, 1500.0, 8000.0))


def synth_crash(vel):
    n = int(1.6 * SR)
    sig = RNGS["crash"].standard_normal(n) * np.exp(-np.arange(n) / (0.45 * SR))
    return vel * 0.35 * fft_band(sig, 4000.0, 16000.0)


def synth_riser(vel):
    """Two-bar noise sweep leading into the chorus."""
    n = int(2 * BEATS_PER_BAR * BEAT * SR)
    t = np.arange(n) / SR
    ramp = (t / t[-1]) ** 2.2
    sig = RNGS["riser"].standard_normal(n) * ramp
    return vel * 0.30 * fft_band(sig, 2500.0, 12000.0)


DRUM_SYNTH = {
    "kick": synth_kick, "clap": synth_clap, "ch": synth_hat_closed,
    "oh": synth_hat_open, "shaker": synth_shaker, "rim": synth_rim,
    "crash": synth_crash, "riser": synth_riser,
}
DRUM_PAN = {"kick": 0.0, "clap": 0.06, "ch": -0.25, "oh": 0.25,
            "shaker": -0.35, "rim": 0.35, "crash": 0.0, "riser": 0.0}


# ---------------------------------------------------------------------------
# Pitched voices
# ---------------------------------------------------------------------------
def synth_bass(midi, dur, vel):
    p = BASS_TIMBRE
    f0 = m2f(midi)
    n = int((dur + 0.15) * SR)
    saw = bl_saw(f0, n, p["cutoff"], p["rolloff_pow"])
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * f0 * t)
    sig = p["saw_mix"] * saw + p["sub_mix"] * sub
    sig = np.tanh(p["drive"] * sig)
    return vel * 0.85 * sig * env_adsr(n, 0.004, 0.10, 0.55, 0.05, dur)


def synth_stab(midi, dur, vel):
    f0 = m2f(midi)
    n = int((dur + 0.20) * SR)
    sig = bl_saw(f0 * 0.997, n, 4000.0) + bl_saw(f0 * 1.003, n, 4000.0, phase=0.7)
    return vel * 0.30 * sig * env_pluck(n, 0.002, 0.11)


def synth_pad(midi, dur, vel, detune):
    f0 = m2f(midi) * detune
    n = int((dur + 0.6) * SR)
    sig = bl_saw(f0, n, 2400.0, rolloff_pow=4.0)
    return vel * 0.16 * sig * env_adsr(n, 0.35, 0.2, 0.85, 0.5, dur)


def synth_lead(midi, dur, vel):
    f0 = m2f(midi)
    n = int((dur + 0.35) * SR)
    t = np.arange(n) / SR
    vib = 1.0 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(t / 0.25, 1.0)
    sig = bl_square(f0, n, 5200.0)
    # cheap chorus: detuned second voice
    sig = sig + 0.6 * bl_square(f0 * 1.006, n, 5200.0)
    sig *= vib  # subtle AM shimmer standing in for vibrato
    return vel * 0.30 * sig * env_adsr(n, 0.006, 0.12, 0.65, 0.18, dur)


def synth_arp(midi, dur, vel):
    f0 = m2f(midi)
    n = int((dur + 0.12) * SR)
    sig = bl_saw(f0, n, 3600.0)
    return vel * 0.22 * sig * env_pluck(n, 0.002, 0.07)


NOTE_SYNTH = {"bass": synth_bass, "stab": synth_stab, "lead": synth_lead,
              "arp": synth_arp}


# ============================================================================
# Audio rendering
# ============================================================================
def place(bus, t_sec, sig, pan=0.0):
    i0 = int(t_sec * SR)
    i1 = min(i0 + len(sig), bus.shape[1])
    if i1 <= i0:
        return
    seg = sig[: i1 - i0]
    gl = np.sqrt(0.5 * (1.0 - pan))
    gr = np.sqrt(0.5 * (1.0 + pan))
    bus[0, i0:i1] += gl * seg
    bus[1, i0:i1] += gr * seg


def render_audio(drums, notes, path):
    n_total = int((TOTAL_BEATS * BEAT + TAIL_SEC) * SR)
    bus_drums = np.zeros((2, n_total))
    bus_duck = np.zeros((2, n_total))   # bass/stab/pad/arp — sidechain pumped
    bus_lead = np.zeros((2, n_total))

    for tb, kind, vel in drums:
        place(bus_drums, tb * BEAT, DRUM_SYNTH[kind](vel), DRUM_PAN[kind])

    arp_side = 1
    for tb, dur_b, midi, vel, part in notes:
        t = tb * BEAT
        d = dur_b * BEAT
        if part == "pad":
            place(bus_duck, t, synth_pad(midi, d, vel, 0.9965), -0.55)
            place(bus_duck, t, synth_pad(midi, d, vel, 1.0035), 0.55)
        elif part == "lead":
            sig = synth_lead(midi, d, vel)
            place(bus_lead, t, sig, 0.0)
            # dotted-8th echoes
            place(bus_lead, t + 0.75 * BEAT, 0.32 * sig, -0.45)
            place(bus_lead, t + 1.50 * BEAT, 0.16 * sig, 0.45)
        elif part == "arp":
            arp_side = -arp_side
            place(bus_duck, t, synth_arp(midi, d, vel), 0.4 * arp_side)
        else:
            pan = 0.0 if part == "bass" else 0.12
            place(bus_duck, t, NOTE_SYNTH[part](midi, d, vel), pan)

    # Sidechain pump on the harmonic bus, synced to the 4/4 kick.
    t = np.arange(n_total) / SR
    pos = np.mod(t, BEAT)
    pump = 1.0 - 0.38 * np.exp(-pos / 0.085)
    end_of_beats = TOTAL_BEATS * BEAT
    pump[t >= end_of_beats] = 1.0
    bus_duck *= pump

    mix = bus_drums + bus_duck + 0.9 * bus_lead
    # Fixed-gain master: tanh bounds the output, so no adaptive normalization
    # (keeps untouched elements bit-identical when one part is edited).
    mix = 0.95 * np.tanh(1.15 * mix)

    data = (mix.T * 32767.0).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"wrote {path}  ({n_total / SR:.1f}s)")


# ============================================================================
# MIDI export (Standard MIDI File, format 1)
# ============================================================================
TPB = 480
GM_DRUM = {"kick": 36, "clap": 39, "ch": 42, "oh": 46, "shaker": 70,
           "rim": 37, "crash": 49, "riser": 55}  # riser -> splash stand-in
PART_CH = {"bass": 0, "stab": 1, "pad": 2, "lead": 3, "arp": 4}
# v3: bass GM patch 38 (Synth Bass 1) -> 39 (Synth Bass 2, darker) to mirror
# the darker synthesized bass timbre; all bass notes/rhythm unchanged.
PART_PROG = {"bass": 39, "stab": 17, "pad": 89, "lead": 80, "arp": 81}


def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append(0x80 | (n & 0x7F))
        n >>= 7
    return bytes(reversed(out))


def midi_track(msgs):
    """msgs: list of (tick, priority, bytes). Returns a complete MTrk chunk."""
    msgs = sorted(msgs, key=lambda m: (m[0], m[1]))
    data = b""
    last = 0
    for tick, _, msg in msgs:
        data += vlq(tick - last) + msg
        last = tick
    data += vlq(0) + b"\xff\x2f\x00"
    return b"MTrk" + len(data).to_bytes(4, "big") + data


def write_midi(drums, notes, path):
    tempo = int(60_000_000 / BPM)
    t0 = [(0, 0, b"\xff\x51\x03" + tempo.to_bytes(3, "big")),
          (0, 0, b"\xff\x58\x04\x04\x02\x18\x08")]
    tracks = [midi_track(t0)]

    dmsgs = []
    for tb, kind, vel in drums:
        tick = round(tb * TPB)
        v = max(1, min(127, int(vel * 127)))
        note = GM_DRUM[kind]
        dmsgs.append((tick, 1, bytes([0x99, note, v])))
        dmsgs.append((tick + TPB // 8, 0, bytes([0x89, note, 0])))
    tracks.append(midi_track(dmsgs))

    by_part = {}
    for tb, dur_b, midi, vel, part in notes:
        by_part.setdefault(part, []).append((tb, dur_b, midi, vel))
    for part, evs in by_part.items():
        ch = PART_CH[part]
        msgs = [(0, 0, bytes([0xC0 | ch, PART_PROG[part]]))]
        for tb, dur_b, midi, vel in evs:
            on = round(tb * TPB)
            off = max(on + 10, round((tb + dur_b) * TPB))
            v = max(1, min(127, int(vel * 127)))
            msgs.append((on, 1, bytes([0x90 | ch, midi, v])))
            msgs.append((off, 0, bytes([0x80 | ch, midi, 0])))
        tracks.append(midi_track(msgs))

    header = b"MThd" + (6).to_bytes(4, "big") + (1).to_bytes(2, "big") \
        + len(tracks).to_bytes(2, "big") + TPB.to_bytes(2, "big")
    with open(path, "wb") as f:
        f.write(header + b"".join(tracks))
    print(f"wrote {path}")


# ============================================================================
if __name__ == "__main__":
    drums, notes = build_events()
    render_audio(drums, notes, os.path.join(OUT_DIR, "house_f-minor_122.wav"))
    write_midi(drums, notes, os.path.join(OUT_DIR, "house_f-minor_122.mid"))
