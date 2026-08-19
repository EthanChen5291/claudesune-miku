#!/usr/bin/env python3
"""
Groove in 7/8 — D dorian, 140 BPM, form A B C A (8-bar sections).
C is a bridge that withholds the bass entirely; the bass returning in the
final A is the payoff.

Outputs (next to this script):
  groove.mid  — standard MIDI file (GM), for any DAW / synth
  groove.wav  — fully synthesized stereo render, ready to listen to

Pure Python + numpy. Deterministic (seeded noise per event).
"""

import math
import os
import struct
import wave
import zlib

import numpy as np

# ----------------------------------------------------------------------------
# Version switches (edited per change request)
# ----------------------------------------------------------------------------
SWING_HATS = 0.64      # shuffle: offbeat-16th hi-hats land 64% through the eighth (hi-hats ONLY)
SPARSE_A_LEAD = False  # True = thinned-out lead melody in the A sections only

# ----------------------------------------------------------------------------
# Global musical constants
# ----------------------------------------------------------------------------
BPM = 140.0                      # quarter-note BPM
SPE = 60.0 / BPM / 2.0           # seconds per eighth note (the 7/8 pulse unit)
BAR = 7                          # eighths per bar (grouped 2 + 2 + 3)
SECTION_BARS = 8
SECTIONS = ["A", "B", "C", "A"]  # 8 bars each
TOTAL_E = BAR * SECTION_BARS * len(SECTIONS)   # 224 eighths
SR = 44100

# D dorian pitch helpers (MIDI numbers)
D2, E2, F2, G2, A2, B2, C3, D3 = 38, 40, 41, 43, 45, 47, 48, 50
D4, E4, F4, G4, A4b, B4, C5, D5 = 62, 64, 65, 67, 69, 71, 72, 74
E5, F5, G5, A5, B5 = 76, 77, 79, 81, 83

CHORDS = {
    "Dm7":   [62, 65, 69, 72],        # D F A C
    "Dm9":   [62, 65, 69, 72, 76],    # D F A C E
    "G7":    [65, 67, 71, 74],        # F G B D  (dorian's major IV)
    "Cmaj":  [64, 67, 72, 76],        # E G C E
    "Fmaj7": [65, 69, 72, 76],        # F A C E
    "Am7":   [64, 67, 69, 72],        # E G A C
    "Em7":   [64, 67, 71, 74],        # E G B D
    "G7sus": [65, 67, 72, 74],        # F G C D
    "DmAdd9":[62, 65, 69, 76, 81],    # final ring-out
}

# Event = (track, start_eighths, dur_eighths, midi_pitch, velocity)
# Drum tracks use pitch as the GM drum note.
KICK, SNARE, HATC, HATO, CRASH = 36, 38, 42, 46, 49


# ----------------------------------------------------------------------------
# Composition
# ----------------------------------------------------------------------------
def bass_bar_A(ev, bar_start, root, variant=0):
    """Main 2+2+3 funk riff for A sections."""
    b = bar_start
    ev.append(("bass", b + 0.0, 1.0, root, 112))
    ev.append(("bass", b + 1.5, 0.5, root, 84))
    ev.append(("bass", b + 2.0, 1.0, root + 7, 102))     # fifth
    ev.append(("bass", b + 3.0, 0.5, root + 10, 90))     # b7
    ev.append(("bass", b + 3.5, 0.5, root + 12, 96))     # octave
    ev.append(("bass", b + 4.0, 1.5, root, 110))         # 3-group downbeat
    if variant == 0:
        ev.append(("bass", b + 5.5, 0.5, root + 10, 86))
        ev.append(("bass", b + 6.0, 0.5, root + 7, 92))
        ev.append(("bass", b + 6.5, 0.5, root + 10, 98))
    else:  # pickup walk into the next bar
        ev.append(("bass", b + 5.5, 0.5, root + 12, 88))
        ev.append(("bass", b + 6.0, 1.0, root + 10, 96))


def bass_bar_B(ev, bar_start, root, sixth=False):
    """Rounder riff for the B section. sixth=True uses the 6th color tone."""
    b = bar_start
    color = root + (9 if sixth else 10)
    ev.append(("bass", b + 0.0, 1.5, root, 108))
    ev.append(("bass", b + 1.5, 0.5, root + 12, 86))
    ev.append(("bass", b + 2.0, 1.5, root + 7, 100))
    ev.append(("bass", b + 3.5, 0.5, root + 7, 84))
    ev.append(("bass", b + 4.0, 1.0, root, 106))
    ev.append(("bass", b + 5.0, 1.0, color, 94))
    ev.append(("bass", b + 6.0, 1.0, root + 12, 98))


def comp_bar(ev, bar_start, chord, pickup=False, vel=86):
    """Rhodes-style stabs: on the 'and' of 1 and on the 3-group downbeat."""
    b = bar_start
    for p in CHORDS[chord]:
        ev.append(("chords", b + 1.5, 0.5, p, vel - 10))
        ev.append(("chords", b + 4.0, 1.5, p, vel))
        if pickup:
            ev.append(("chords", b + 6.0, 1.0, p, vel - 16))


def pad_chord(ev, bar_start, chord, bars=2, vel=72):
    for p in CHORDS[chord]:
        ev.append(("pad", bar_start, BAR * bars - 0.5, p, vel))


def lead_phrase_P1(ev, b, sparse):
    """A-section hook, 2 bars starting at eighth b."""
    if not sparse:
        ev.append(("lead", b + 0.0, 1.5, D5, 102))
        ev.append(("lead", b + 1.5, 0.5, E5, 86))
        ev.append(("lead", b + 2.0, 1.0, F5, 96))
        ev.append(("lead", b + 3.0, 1.0, E5, 90))
        ev.append(("lead", b + 4.0, 1.5, C5, 98))
        ev.append(("lead", b + 5.5, 1.5, D5, 94))
        ev.append(("lead", b + 8.0, 1.0, A4b, 84))
        ev.append(("lead", b + 9.0, 1.0, C5, 88))
        ev.append(("lead", b + 10.0, 1.0, D5, 92))
        ev.append(("lead", b + 11.0, 2.0, E5, 96))
        ev.append(("lead", b + 13.5, 0.5, C5, 80))
    else:  # skeleton of the hook: fewer notes, same anchors
        ev.append(("lead", b + 0.0, 1.5, D5, 102))
        ev.append(("lead", b + 2.0, 1.0, F5, 96))
        ev.append(("lead", b + 4.0, 1.5, C5, 98))
        ev.append(("lead", b + 10.0, 1.0, D5, 92))
        ev.append(("lead", b + 11.0, 2.0, E5, 96))


def lead_phrase_P2(ev, b, sparse):
    """A-section bars 5-6, leaning on B natural (the dorian sixth) over G7."""
    if not sparse:
        ev.append(("lead", b + 0.0, 1.5, B4, 96))
        ev.append(("lead", b + 1.5, 0.5, A4b, 84))
        ev.append(("lead", b + 2.0, 1.0, G4, 90))
        ev.append(("lead", b + 3.0, 1.0, A4b, 88))
        ev.append(("lead", b + 4.0, 1.5, B4, 95))
        ev.append(("lead", b + 5.5, 1.5, D5, 92))
        ev.append(("lead", b + 8.0, 1.5, E5, 94))
        ev.append(("lead", b + 9.5, 0.5, D5, 84))
        ev.append(("lead", b + 10.0, 1.0, B4, 90))
        ev.append(("lead", b + 11.0, 2.0, A4b, 92))
        ev.append(("lead", b + 13.0, 1.0, G4, 82))
    else:
        ev.append(("lead", b + 0.0, 1.5, B4, 96))
        ev.append(("lead", b + 4.0, 1.5, B4, 95))
        ev.append(("lead", b + 8.0, 1.5, E5, 94))
        ev.append(("lead", b + 11.0, 2.0, A4b, 92))


def lead_phrase_P3(ev, b, sparse):
    """A-section bars 7-8 turnaround (C -> Dm)."""
    if not sparse:
        ev.append(("lead", b + 0.0, 1.0, E5, 95))
        ev.append(("lead", b + 1.0, 1.0, G5, 97))
        ev.append(("lead", b + 2.0, 1.0, E5, 92))
        ev.append(("lead", b + 3.0, 1.0, D5, 90))
        ev.append(("lead", b + 4.0, 3.0, C5, 96))
        ev.append(("lead", b + 7.0, 4.0, D5, 102))
        ev.append(("lead", b + 12.0, 2.0, A4b, 80))
    else:
        ev.append(("lead", b + 1.0, 1.0, G5, 97))
        ev.append(("lead", b + 4.0, 3.0, C5, 96))
        ev.append(("lead", b + 7.0, 4.0, D5, 102))


def section_A(ev, start_bar, final=False):
    """8 bars: the main groove. Dm7 x4 | G7 x2 | Cmaj | Dm7."""
    s = start_bar * BAR
    sparse = SPARSE_A_LEAD
    ev.append(("crash", s, 2.0, CRASH, 92 if not final else 104))

    roots = [D2, D2, D2, D2, G2, G2, C3, D2]
    chords = ["Dm7", "Dm7", "Dm7", "Dm7", "G7", "G7", "Cmaj", "Dm7"]
    for i in range(SECTION_BARS):
        b = s + i * BAR
        # bass
        if i == 7:
            if final:  # last bar of the piece's body: land and hold
                ev.append(("bass", b + 0.0, 1.0, D2, 112))
                ev.append(("bass", b + 1.5, 0.5, D2, 84))
                ev.append(("bass", b + 2.0, 1.0, A2, 102))
                ev.append(("bass", b + 4.0, 3.0, D2, 112))
            else:      # walk up D E F into the B section
                bass_bar_A(ev, b, roots[i], variant=1)
                ev.pop()  # drop the two variant tail notes,
                ev.pop()  # then walk up instead
                ev.append(("bass", b + 5.5, 0.5, E2, 90))
                ev.append(("bass", b + 6.0, 1.0, F2, 98))
        else:
            bass_bar_A(ev, b, roots[i], variant=(1 if i in (3, 5) else 0))
        # comp
        comp_bar(ev, b, chords[i], pickup=(i % 2 == 1))
        # drums
        drum_bar(ev, b, fill=(i == 7 and not final), style="full")
    # lead: P1 P1 P2 P3 across the 8 bars
    lead_phrase_P1(ev, s + 0 * BAR, sparse)
    lead_phrase_P1(ev, s + 2 * BAR, sparse)
    lead_phrase_P2(ev, s + 4 * BAR, sparse)
    lead_phrase_P3(ev, s + 6 * BAR, sparse)


def section_B(ev, start_bar):
    """8 bars: lifts away from D. Fmaj7 x2 | G7 x2 | Am7 x2 | Cmaj | G7sus."""
    s = start_bar * BAR
    ev.append(("crash", s, 2.0, CRASH, 88))

    plan = [
        (F2, "Fmaj7", True), (F2, "Fmaj7", True),
        (G2, "G7", False),   (G2, "G7", False),
        (A2, "Am7", False),  (A2, "Am7", False),
        (C3, "Cmaj", True),  (G2, "G7sus", False),
    ]
    for i, (root, chord, sixth) in enumerate(plan):
        b = s + i * BAR
        bass_bar_B(ev, b, root, sixth=sixth)
        comp_bar(ev, b, chord, pickup=(i % 2 == 1), vel=82)
        drum_bar(ev, b, fill=(i == 7), style="full")

    # Lead: longer arcs, climbing register
    L = [  # (offset_eighths, dur, pitch, vel)
        (0.0, 3.0, A5, 96), (3.0, 1.0, G5, 86), (4.0, 3.0, E5, 92),
        (7.0, 2.0, F5, 90), (9.0, 2.0, G5, 92), (11.0, 3.0, A5, 96),
        (14.0, 2.0, G5, 92), (16.0, 2.0, A5, 94), (18.0, 3.0, B5, 100),
        (21.0, 1.5, A5, 90), (22.5, 1.5, G5, 86), (24.0, 2.0, E5, 88), (26.0, 2.0, D5, 84),
        (28.0, 1.5, E5, 90), (29.5, 0.5, G5, 84), (30.0, 2.0, A5, 94),
        (32.0, 1.5, G5, 90), (33.5, 1.5, E5, 86),
        (35.0, 2.0, D5, 88), (37.0, 2.0, C5, 84), (39.0, 3.0, D5, 92),
        (42.0, 2.0, E5, 92), (44.0, 1.0, D5, 86), (45.0, 1.0, C5, 84), (46.0, 3.0, B4, 92),
        (49.0, 2.5, A4b, 86), (51.5, 1.5, B4, 88), (53.0, 3.0, D5, 94),
    ]
    for off, dur, p, v in L:
        ev.append(("lead", s + off, dur, p, v))


def section_C(ev, start_bar):
    """8-bar bridge: NO BASS AT ALL. Suspended pads, sparse floating lead,
    drums thinned to rim-taps and soft hats; a build in the last two bars
    sets up the bass drop back into the final A."""
    s = start_bar * BAR
    ev.append(("crash", s, 3.0, CRASH, 70))

    pads = ["Dm9", "Fmaj7", "Em7", "G7sus"]
    for j, ch in enumerate(pads):
        pad_chord(ev, s + j * 2 * BAR, ch, bars=2, vel=70 if j < 3 else 78)

    for i in range(SECTION_BARS):
        b = s + i * BAR
        drum_bar(ev, b, fill=(i == 7), style=("build" if i >= 6 else "sparse"))

    # floating lead fragments, lots of air
    L = [
        (2.0, 3.0, A5, 84),
        (14.0, 2.0, G5, 82), (18.0, 3.0, E5, 84),
        (30.0, 2.0, D5, 82),
        (35.0, 4.0, E5, 86),
        (44.0, 2.0, G5, 88), (46.0, 3.0, A5, 90),
        (49.0, 4.0, B5, 96),                       # dorian sixth on top, held
        (53.0, 1.0, A5, 88), (54.0, 1.0, G5, 86), (55.0, 1.0, E5, 84),  # run-in
    ]
    for off, dur, p, v in L:
        ev.append(("lead", s + off, dur, p, v))


def drum_bar(ev, b, fill=False, style="full"):
    """One 7/8 bar of drums (2+2+3). Styles: full | sparse | build."""
    if style == "full":
        ev.append(("kick", b + 0.0, 0.5, KICK, 116))
        ev.append(("kick", b + 4.0, 0.5, KICK, 110))
        ev.append(("kick", b + 6.5, 0.5, KICK, 84))   # pickup into next bar
        ev.append(("snare", b + 2.0, 0.5, SNARE, 106))
        ev.append(("snare", b + 5.0, 0.5, SNARE, 100))
        bar_idx = int(b // BAR)
        open_pos = 6.0 if (bar_idx % 2 == 1) else None
        p = 0.0
        while p < BAR:
            if open_pos is not None and p == open_pos:
                ev.append(("ohat", b + p, 0.8, HATO, 78))
            else:
                if p % 1.0 == 0.0:
                    v = 80 if p in (0.0, 2.0, 4.0) else 64
                else:
                    v = 42
                ev.append(("hat", b + p, 0.24, HATC, v))
            p += 0.5
        if fill:  # snare build over the 3-group
            for k, q in enumerate((4.0, 4.5, 5.0, 5.5, 6.0, 6.5)):
                ev.append(("snare", b + q, 0.4, SNARE, 62 + k * 9))
    elif style == "sparse":  # bridge: heartbeat kick, rim-ish snare, soft 8th hats
        if int(b // BAR) % 2 == 0:
            ev.append(("kick", b + 0.0, 0.5, KICK, 74))
        ev.append(("snare", b + 4.0, 0.4, SNARE, 52))
        for p8 in range(BAR):
            ev.append(("hat", b + p8, 0.22, HATC, 40 if p8 % 2 else 50))
    elif style == "build":   # last bars of the bridge: 16th hats swell back in
        ev.append(("kick", b + 0.0, 0.5, KICK, 88))
        ev.append(("kick", b + 4.0, 0.5, KICK, 84))
        ev.append(("snare", b + 2.0, 0.4, SNARE, 70))
        p = 0.0
        while p < BAR:
            base = 58 if p % 1.0 == 0.0 else 36
            ramp = int(18 * p / BAR)
            ev.append(("hat", b + p, 0.24, HATC, base + ramp))
            p += 0.5
        if fill:
            for k, q in enumerate((4.0, 4.5, 5.0, 5.5, 6.0, 6.5)):
                ev.append(("snare", b + q, 0.4, SNARE, 70 + k * 10))


def build_events():
    ev = []
    bar = 0
    for name in SECTIONS[:-1]:
        if name == "A":
            section_A(ev, bar)
        elif name == "B":
            section_B(ev, bar)
        elif name == "C":
            section_C(ev, bar)
        bar += SECTION_BARS
    section_A(ev, bar, final=True)  # the payoff: bass roars back

    # Final ring-out hit one bar after the body ends
    end = TOTAL_E
    ev.append(("crash", end, 6.0, CRASH, 100))
    ev.append(("kick", end, 0.5, KICK, 118))
    ev.append(("bass", end, 10.0, D2, 110))
    for p in CHORDS["DmAdd9"]:
        ev.append(("pad", end, 10.0, p, 78))
    ev.append(("lead", end, 8.0, D5, 92))

    # --- Hi-hat swing (change request 1): delay ONLY the offbeat-16th hats ---
    if SWING_HATS is not None:
        swung = []
        for (trk, st, du, pi, ve) in ev:
            if trk in ("hat", "ohat") and abs(st % 1.0 - 0.5) < 1e-9:
                st = math.floor(st) + SWING_HATS
            swung.append((trk, st, du, pi, ve))
        ev = swung

    ev.sort(key=lambda e: (e[1], e[0], e[3]))
    return ev


# ----------------------------------------------------------------------------
# MIDI writer (SMF type 1)
# ----------------------------------------------------------------------------
TPQ = 480          # ticks per quarter
TPE = TPQ // 2     # ticks per eighth

MIDI_TRACKS = {
    # name: (channel, program) — drums share channel 9
    "bass":   (0, 33),   # Electric Bass (finger)
    "chords": (1, 4),    # Electric Piano 1
    "pad":    (2, 89),   # Pad 2 (warm)
    "lead":   (3, 81),   # Lead 2 (sawtooth)
    "drums":  (9, None),
}
DRUM_TRACKS = {"kick", "snare", "hat", "ohat", "crash"}


def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    return bytes(reversed(out))


def midi_track_chunk(messages):
    """messages: list of (abs_tick, bytes). Returns a complete MTrk chunk."""
    messages.sort(key=lambda m: m[0])
    data = bytearray()
    last = 0
    for tick, msg in messages:
        data += vlq(tick - last) + msg
        last = tick
    data += vlq(0) + b"\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(data)) + bytes(data)


def write_midi(events, path):
    # tempo/meta track
    meta = [
        (0, b"\xff\x51\x03" + struct.pack(">I", int(60_000_000 / BPM))[1:]),  # tempo
        (0, b"\xff\x58\x04" + bytes([7, 3, 24, 8])),                          # 7/8
        (0, b"\xff\x59\x02" + bytes([255 & -1, 0])),                          # 1 flat (d minor-ish)
    ]
    chunks = [midi_track_chunk(meta)]

    by_track = {"bass": [], "chords": [], "pad": [], "lead": [], "drums": []}
    for (trk, st, du, pi, ve) in events:
        tname = "drums" if trk in DRUM_TRACKS else trk
        ch = MIDI_TRACKS[tname][0]
        on = int(round(st * TPE))
        off = int(round((st + du) * TPE))
        if off <= on:
            off = on + 1
        by_track[tname].append((on, bytes([0x90 | ch, pi, ve])))
        by_track[tname].append((off, bytes([0x80 | ch, pi, 0])))

    for tname in ("bass", "chords", "pad", "lead", "drums"):
        ch, prog = MIDI_TRACKS[tname]
        msgs = []
        if prog is not None:
            msgs.append((0, bytes([0xC0 | ch, prog])))
        msgs += by_track[tname]
        chunks.append(midi_track_chunk(msgs))

    header = b"MThd" + struct.pack(">IHHH", 6, 1, len(chunks), TPQ)
    with open(path, "wb") as f:
        f.write(header + b"".join(chunks))


# ----------------------------------------------------------------------------
# Synthesis
# ----------------------------------------------------------------------------
def hz(midi_pitch):
    return 440.0 * 2 ** ((midi_pitch - 69) / 12.0)


def event_rng(trk, idx):
    seed = zlib.crc32(f"{trk}:{idx}".encode()) & 0xFFFFFFFF
    return np.random.default_rng(seed)


def adsr(n, a, d, s_level, r, sr=SR):
    """Attack/decay/sustain across n samples, then release appended."""
    a_n, d_n, r_n = int(a * sr), int(d * sr), int(r * sr)
    env = np.ones(n + r_n)
    a_n = min(a_n, n)
    env[:a_n] = np.linspace(0, 1, a_n, endpoint=False) if a_n else 1.0
    if d_n and a_n < n:
        d_end = min(a_n + d_n, n)
        env[a_n:d_end] = np.linspace(1, s_level, d_end - a_n, endpoint=False)
        env[d_end:n] = s_level
    env[n:] = env[n - 1] * np.linspace(1, 0, r_n) if n > 0 else 0
    return env


def additive_saw(f0, t, n_harm):
    out = np.zeros_like(t)
    for k in range(1, n_harm + 1):
        out += np.sin(2 * np.pi * k * f0 * t) / k
    return out * (2 / np.pi)


def synth_bass(f0, dur, vel):
    n = int(dur * SR)
    t = np.arange(n + int(0.08 * SR)) / SR
    n_h = max(1, min(14, int(2800 / f0)))
    body = additive_saw(f0, t, n_h)
    sub = 0.55 * np.sin(2 * np.pi * f0 * t)
    x = np.tanh(1.6 * (body + sub))
    env = adsr(n, 0.004, 0.10, 0.72, 0.08)
    return x[: len(env)] * env * (vel / 127.0) ** 1.2


def synth_lead(f0, dur, vel):
    n = int(dur * SR)
    t = np.arange(n + int(0.15 * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.3 * t) * np.clip((t - 0.12) / 0.25, 0, 1)
    n_h = max(1, min(22, int(7500 / f0)))
    x = np.zeros_like(t)
    for det in (0.9965, 1.0035):
        phase = np.cumsum(2 * np.pi * f0 * det * vib / SR)
        for k in range(1, n_h + 1):
            x += np.sin(k * phase) / (k ** 1.25)
    x *= 0.35
    env = adsr(n, 0.015, 0.12, 0.8, 0.14)
    return x[: len(env)] * env * (vel / 127.0) ** 1.1


def synth_epiano(f0, dur, vel):
    n = int(dur * SR)
    t = np.arange(n + int(0.25 * SR)) / SR
    x = (np.sin(2 * np.pi * f0 * t)
         + 0.35 * np.sin(2 * np.pi * 2 * f0 * t) * np.exp(-t * 4.0)
         + 0.12 * np.sin(2 * np.pi * 4.02 * f0 * t) * np.exp(-t * 7.0))
    pluck = np.exp(-t * 2.2)
    env = adsr(n, 0.003, 0.0, 1.0, 0.22)
    return x[: len(env)] * pluck[: len(env)] * env * (vel / 127.0) ** 1.3


def synth_pad(f0, dur, vel):
    n = int(dur * SR)
    t = np.arange(n + int(0.5 * SR)) / SR
    x = np.zeros_like(t)
    for det in (0.996, 1.0, 1.004):
        x += np.sin(2 * np.pi * f0 * det * t + 0.7 * np.sin(2 * np.pi * 0.31 * t))
    x += 0.3 * np.sin(2 * np.pi * 2 * f0 * 1.002 * t)
    x *= 0.28
    env = adsr(n, 0.6, 0.4, 0.85, 0.5)
    return x[: len(env)] * env * (vel / 127.0) ** 1.2


def synth_kick(dur, vel, rng):
    n = int(0.30 * SR)
    t = np.arange(n) / SR
    f = 42 + 90 * np.exp(-t * 32)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x += 0.35 * rng.standard_normal(n) * np.exp(-t * 220)   # beater click
    x *= np.exp(-t * 11)
    return np.tanh(2.2 * x) * (vel / 127.0) ** 1.1


def synth_snare(dur, vel, rng):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0.0)                     # brighten
    x = 0.8 * noise * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 186 * t) * np.exp(-t * 30)
    return x * (vel / 127.0) ** 1.2


def synth_hat(dur, vel, rng, open_=False):
    n = int((0.42 if open_ else 0.055) * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.diff(np.diff(noise, prepend=0.0), prepend=0.0)  # steep highpass
    decay = 9 if open_ else 70
    return 0.5 * noise * np.exp(-t * decay) * (vel / 127.0) ** 1.4


def synth_crash(dur, vel, rng):
    n = int(1.8 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0.0)
    shimmer = 1 + 0.25 * np.sin(2 * np.pi * 7 * t)
    return 0.6 * noise * shimmer * np.exp(-t * 2.6) * (vel / 127.0) ** 1.2


TRACK_MIX = {
    # track: (gain, pan [-1..1], reverb_send, delay_send)
    "kick":   (1.00,  0.00, 0.02, 0.0),
    "snare":  (0.80,  0.06, 0.22, 0.0),
    "hat":    (0.34,  0.28, 0.06, 0.0),
    "ohat":   (0.32,  0.28, 0.10, 0.0),
    "crash":  (0.40, -0.12, 0.30, 0.0),
    "bass":   (0.92,  0.00, 0.00, 0.0),
    "chords": (0.42, -0.22, 0.18, 0.0),
    "pad":    (0.30,  0.18, 0.30, 0.0),
    "lead":   (0.50,  0.10, 0.16, 0.30),
}


def fft_convolve(x, h):
    n = len(x) + len(h) - 1
    N = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(h, N), N)[:n]


def render(events, path):
    tail = 3.5
    total = int((TOTAL_E * SPE + BAR * SPE + tail) * SR)
    dry = np.zeros((total, 2))
    rev_send = np.zeros(total)
    dly_send = np.zeros(total)

    counters = {}
    for (trk, st, du, pi, ve) in events:
        idx = counters[trk] = counters.get(trk, 0) + 1
        rng = event_rng(trk, idx)
        dur_s = du * SPE
        if trk == "bass":
            sig = synth_bass(hz(pi), dur_s, ve)
        elif trk == "lead":
            sig = synth_lead(hz(pi), dur_s, ve)
        elif trk == "chords":
            sig = synth_epiano(hz(pi), dur_s, ve)
        elif trk == "pad":
            sig = synth_pad(hz(pi), dur_s, ve)
        elif trk == "kick":
            sig = synth_kick(dur_s, ve, rng)
        elif trk == "snare":
            sig = synth_snare(dur_s, ve, rng)
        elif trk == "hat":
            sig = synth_hat(dur_s, ve, rng, open_=False)
        elif trk == "ohat":
            sig = synth_hat(dur_s, ve, rng, open_=True)
        elif trk == "crash":
            sig = synth_crash(dur_s, ve, rng)
        else:
            continue

        gain, pan, rv, dl = TRACK_MIX[trk]
        i0 = int(st * SPE * SR)
        i1 = min(i0 + len(sig), total)
        seg = sig[: i1 - i0] * gain
        lg, rg = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        dry[i0:i1, 0] += seg * lg
        dry[i0:i1, 1] += seg * rg
        if rv:
            rev_send[i0:i1] += seg * rv
        if dl:
            dly_send[i0:i1] += seg * dl

    # Lead delay: dotted-ish echo (3 sixteenths), feedback
    d = int(1.5 * SPE * SR)
    echo = np.zeros(total)
    fb = 0.42
    src = dly_send.copy()
    for k in range(1, 5):
        g = fb ** k
        echo[k * d:] += src[: total - k * d] * g
    dry[:, 0] += echo * 0.8
    dry[:, 1] += echo * 1.0

    # Simple exponential-noise reverb
    rng = np.random.default_rng(7)
    ir_n = int(1.1 * SR)
    ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 5.5)
    ir = np.diff(ir, prepend=0.0)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fft_convolve(rev_send + 0.5 * echo, ir)[:total] * 0.9
    dry[:, 0] += wet
    dry[:, 1] += np.roll(wet, 199)  # de-correlate channels a touch

    # Master: gentle drive + normalize
    mix = np.tanh(1.15 * dry)
    peak = np.max(np.abs(mix))
    mix = mix / peak * 0.94
    pcm = (mix * 32767).astype("<i2")

    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return total / SR


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    events = build_events()
    write_midi(events, os.path.join(here, "groove.mid"))
    secs = render(events, os.path.join(here, "groove.wav"))
    print(f"{len(events)} events | {secs:.1f}s | swing={SWING_HATS} sparseA={SPARSE_A_LEAD}")


if __name__ == "__main__":
    main()
