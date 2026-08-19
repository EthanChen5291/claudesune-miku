#!/usr/bin/env python3
"""
Lo-fi hip-hop beat generator — "Half Asleep in C Minor"

Version: v2 (change request 2: drum velocity contour — accents and ghost
notes replace the uniform hits; timing and which drums hit are unchanged.
Carries forward v1's halved harmonic rhythm.)

C minor, 84 BPM, 4/4. Form A B A B (verse/chorus), 8-bar sections,
plus a 1-bar tonic tag at the end so the track resolves.
Swung 8th hats, jazzy extended chords (m9 / maj9 / 13 / altered dominants),
sparse sleepy melody.

Outputs (next to this script):
  lofi-beat.mid  — standard MIDI file (GM program numbers), renderable anywhere
  lofi-beat.wav  — rendered audio from the built-in numpy synthesizer
  lofi-beat.mp3  — mp3 encode of the wav (needs ffmpeg on PATH; skipped if absent)

No dependencies beyond numpy (and ffmpeg for the mp3).
"""

import math
import os
import struct
import subprocess
import wave

import numpy as np

# ----------------------------------------------------------------------------
# Global musical parameters
# ----------------------------------------------------------------------------
BPM = 84
BEATS_PER_BAR = 4
SECTION_BARS = 8
FORM = ["A", "B", "A", "B"]          # verse / chorus / verse / chorus
SWING = 0.60                          # offbeat 8ths land at 60% of the beat
PPQ = 480                             # MIDI ticks per quarter note
SR = 44100                            # audio sample rate
BARS_PER_CHORD = 2                    # harmonic rhythm: bars each chord lasts
TAIL_SECONDS = 2.5                    # ring-out after the last bar

SEC_PER_BEAT = 60.0 / BPM

# ----------------------------------------------------------------------------
# Pitch helpers
# ----------------------------------------------------------------------------
_PCS = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def n2m(name):
    """'Eb4' -> MIDI number (C4 = 60)."""
    pc = _PCS[name[0]]
    idx = 1
    while name[idx] in "b#":
        pc += 1 if name[idx] == "#" else -1
        idx += 1
    octave = int(name[idx:])
    return 12 * (octave + 1) + pc


def m2f(midi):
    return 440.0 * 2.0 ** ((midi - 69) / 12.0)


# ----------------------------------------------------------------------------
# Harmony: chord dictionary (bass root + rootless e-piano voicing)
# ----------------------------------------------------------------------------
CHORDS = {
    #  name      bass root   e-piano voicing
    "Cm9":     ("C2",  ["Eb4", "G4", "Bb4", "D5"]),
    "Fm9":     ("F2",  ["Eb4", "G4", "Ab4", "C5"]),
    "Abmaj9":  ("Ab2", ["C4", "Eb4", "G4", "Bb4"]),
    "G7b13":   ("G2",  ["F4", "Ab4", "B4", "Eb5"]),
    "Bb13":    ("Bb2", ["D4", "G4", "Ab4", "C5"]),
    "Ebmaj9":  ("Eb2", ["D4", "F4", "G4", "Bb4"]),
    "G7b9":    ("G2",  ["F4", "Ab4", "B4", "D5"]),
}

VERSE_LOOP = ["Cm9", "Fm9", "Abmaj9", "G7b13"]       # section A
CHORUS_LOOP = ["Abmaj9", "Bb13", "Ebmaj9", "G7b9"]   # section B
OUTRO_CHORD = "Cm9"


def chord_timeline():
    """One chord name per bar for the whole piece (incl. the 1-bar tag)."""
    bars = []
    for sec in FORM:
        loop = VERSE_LOOP if sec == "A" else CHORUS_LOOP
        sec_bars = []
        i = 0
        while len(sec_bars) < SECTION_BARS:
            name = loop[i % len(loop)]
            for _ in range(BARS_PER_CHORD):
                if len(sec_bars) < SECTION_BARS:
                    sec_bars.append(name)
            i += 1
        bars.extend(sec_bars)
    bars.append(OUTRO_CHORD)
    return bars


# ----------------------------------------------------------------------------
# Melody (sleepy, C-minor pentatonic + 9ths, section-relative beats)
# ----------------------------------------------------------------------------
VERSE_MELODY = [
    ("G4", 2.5, 1.5), ("Bb4", 4.0, 1.0), ("C5", 5.0, 2.5),
    ("Eb5", 10.0, 1.5), ("C5", 11.5, 0.5), ("D5", 12.0, 2.0), ("G4", 14.0, 1.5),
    ("G4", 18.5, 1.5), ("Bb4", 20.0, 1.0), ("D5", 21.0, 2.5),
    ("Eb5", 26.0, 1.0), ("C5", 27.0, 1.0), ("Bb4", 28.0, 1.5), ("G4", 29.5, 2.0),
]

CHORUS_MELODY = [
    ("Eb5", 0.5, 1.0), ("F5", 1.5, 0.5), ("G5", 2.0, 2.0),
    ("F5", 4.5, 1.0), ("D5", 5.5, 1.5),
    ("Bb4", 8.0, 1.0), ("C5", 9.0, 1.0), ("D5", 10.0, 2.0),
    ("F5", 12.0, 1.5), ("D5", 13.5, 1.0),
    ("G5", 16.5, 1.5), ("F5", 18.0, 1.0), ("D5", 19.0, 2.0),
    ("C5", 24.0, 1.0), ("D5", 25.0, 1.0), ("Eb5", 26.0, 1.5),
    ("Bb4", 28.0, 1.0), ("G4", 29.0, 2.5),
]

MELODY_VEL = 76

# ----------------------------------------------------------------------------
# Comping / bass patterns (bar-relative beats)
# ----------------------------------------------------------------------------
CHORD_VEL = 64
BASS_VEL = 82


def comp_pattern(bar):
    """E-piano hits for one bar: list of (onset_beat, duration_beats)."""
    if bar % 2 == 0:
        return [(0.0, 2.5), (2.5, 1.5)]
    return [(0.0, 2.0), (2.5, 0.75), (3.5, 0.5)]


def bass_pattern(root, next_root):
    """Bass notes for one bar: list of (onset, dur, midi)."""
    events = [(0.0, 1.75, root), (2.5, 0.75, root + 7)]
    if next_root != root:
        approach = next_root - 1 if next_root > root else next_root + 1
        events.append((3.5, 0.5, approach))
    else:
        events.append((3.5, 0.5, root))
    return events


# ----------------------------------------------------------------------------
# Drums (bar-relative beats).  GM: kick 36, snare 38, closed hat 42, open 46.
# ----------------------------------------------------------------------------
KICK, SNARE, CHAT, OHAT = 36, 38, 42, 46


def drum_hits(bar):
    """All drum hits for one full bar: list of (drum, onset_beat)."""
    hits = [(KICK, 0.0), (KICK, 2.5)]
    if bar % 4 == 3:
        hits.append((KICK, 3.75))
    hits += [(SNARE, 1.0), (SNARE, 3.0)]
    hits.append((SNARE, 1.75))                 # ghost-position hit
    if bar % 2 == 1:
        hits.append((SNARE, 3.25))             # ghost-position hit
    for k in range(8):
        pos = k * 0.5
        if pos == 3.5 and bar % 4 == 3:
            hits.append((OHAT, pos))
        else:
            hits.append((CHAT, pos))
    return hits


# Closed-hat contour across the 8 swung 8ths of a bar:
# strong downbeat, breathy offbeats, secondary accent on beat 3.
_HAT_CONTOUR = {0.0: 96, 0.5: 60, 1.0: 76, 1.5: 56,
                2.0: 88, 2.5: 60, 3.0: 78, 3.5: 64}


def drum_velocity(drum, pos, bar):
    """v2: velocity contour — accents and ghost notes, same hits as before."""
    if drum == KICK:
        if pos == 0.0:
            return 114                      # downbeat boom
        if pos == 2.5:
            return 98                       # swung pickup kick, softer
        return 82                           # bar-4 lead-in kick, softest
    if drum == SNARE:
        if pos == 1.0:
            return 104                      # backbeat
        if pos == 3.0:
            return 110                      # accented second backbeat
        return 34                           # ghost notes (1.75 / 3.25)
    if drum == CHAT:
        v = _HAT_CONTOUR[pos]
        if bar % 2 == 1 and pos == 1.5:
            return v + 14                   # small alternating-bar lilt
        return v
    return 88                               # open hat, slight accent


# ----------------------------------------------------------------------------
# Timing: swing map (beats -> swung beats), applied to MIDI and audio alike
# ----------------------------------------------------------------------------
def swung(b):
    f = b - math.floor(b)
    if f <= 0.5:
        f = f / 0.5 * SWING
    else:
        f = SWING + (f - 0.5) / 0.5 * (1.0 - SWING)
    return math.floor(b) + f


def beat_to_sec(b):
    return swung(b) * SEC_PER_BEAT


def beat_to_tick(b):
    return int(round(swung(b) * PPQ))


# ----------------------------------------------------------------------------
# Build the full event list: (track, channel, midi, start_beat, dur_beats, vel)
# ----------------------------------------------------------------------------
def build_events():
    timeline = chord_timeline()
    total_bars = len(timeline)
    ep, bass, mel, drums = [], [], [], []

    for bar, name in enumerate(timeline):
        start = bar * BEATS_PER_BAR
        root = n2m(CHORDS[name][0])
        voicing = [n2m(p) for p in CHORDS[name][1]]

        if bar == total_bars - 1:                       # outro tag bar
            for p in voicing:
                ep.append((p, start, 6.0, CHORD_VEL))
            bass.append((root, start, 4.0, BASS_VEL))
            drums.append((KICK, start, drum_velocity(KICK, 0.0, bar)))
            drums.append((OHAT, start, drum_velocity(OHAT, 0.0, bar)))
            continue

        for onset, dur in comp_pattern(bar):
            for p in voicing:
                ep.append((p, start + onset, dur, CHORD_VEL))

        next_root = n2m(CHORDS[timeline[bar + 1]][0])
        for onset, dur, midi in bass_pattern(root, next_root):
            bass.append((midi, start + onset, dur, BASS_VEL))

        for drum, pos in drum_hits(bar):
            drums.append((drum, start + pos, drum_velocity(drum, pos, bar)))

    for si, sec in enumerate(FORM):
        base = si * SECTION_BARS * BEATS_PER_BAR
        line = VERSE_MELODY if sec == "A" else CHORUS_MELODY
        for pitch, onset, dur in line:
            mel.append((n2m(pitch), base + onset, dur, MELODY_VEL))

    return ep, bass, mel, drums, total_bars


# ----------------------------------------------------------------------------
# MIDI writer (format 1, from scratch)
# ----------------------------------------------------------------------------
def vlq(n):
    out = bytearray([n & 0x7F])
    n >>= 7
    while n:
        out.insert(0, 0x80 | (n & 0x7F))
        n >>= 7
    return bytes(out)


def meta(tick, mtype, data):
    return (tick, 0, bytes([0xFF, mtype]) + vlq(len(data)) + data)


def track_bytes(messages):
    """messages: list of (tick, priority, raw_bytes); priority 0 sorts first."""
    messages = sorted(messages, key=lambda m: (m[0], m[1]))
    out = bytearray()
    prev = 0
    for tick, _, raw in messages:
        out += vlq(tick - prev) + raw
        prev = tick
    out += vlq(0) + b"\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(out)) + bytes(out)


def note_track(name, channel, program, pan, notes, is_drums=False):
    msgs = [meta(0, 0x03, name.encode())]
    if not is_drums:
        msgs.append((0, 0, bytes([0xC0 | channel, program])))
    msgs.append((0, 0, bytes([0xB0 | channel, 10, pan])))
    for midi, start, dur, vel in notes:
        on = beat_to_tick(start)
        off = max(on + 1, beat_to_tick(start + dur))
        msgs.append((on, 1, bytes([0x90 | channel, midi, vel])))
        msgs.append((off, 0, bytes([0x80 | channel, midi, 0])))
    return track_bytes(msgs)


def write_midi(path, ep, bass, mel, drums, total_bars):
    tempo = int(round(60_000_000 / BPM))
    track0 = track_bytes([
        meta(0, 0x03, b"Half Asleep in C Minor"),
        meta(0, 0x58, bytes([4, 2, 24, 8])),                      # 4/4
        meta(0, 0x59, bytes([253, 1])),                            # 3 flats, minor
        meta(0, 0x51, tempo.to_bytes(3, "big")),
        meta(beat_to_tick(total_bars * BEATS_PER_BAR), 0x01, b"end"),
    ])
    drum_notes = [(d, s, 0.25, v) for d, s, v in drums]
    tracks = [
        track0,
        note_track("E.Piano (chords)", 0, 4, 44, ep),
        note_track("Bass", 1, 33, 64, bass),
        note_track("Melody", 2, 11, 82, mel),
        note_track("Drums", 9, 0, 64, drum_notes, is_drums=True),
    ]
    with open(path, "wb") as fh:
        fh.write(b"MThd" + struct.pack(">IHHH", 6, 1, len(tracks), PPQ))
        for t in tracks:
            fh.write(t)


# ----------------------------------------------------------------------------
# Numpy synthesizer
# ----------------------------------------------------------------------------
def _t(length):
    return np.arange(int(length * SR)) / SR


def _gate(t, dur, release):
    """1.0 while the note is held, linear fade over `release` after."""
    return np.clip(1.0 - (t - dur) / release, 0.0, 1.0)


def ep_note(freq, dur, vel):
    t = _t(dur + 0.6)
    y = (np.sin(2 * np.pi * freq * t)
         + 0.28 * np.sin(2 * np.pi * 2.001 * freq * t) * np.exp(-t * 4)
         + 0.10 * np.sin(2 * np.pi * 3.0 * freq * t) * np.exp(-t * 7)
         + 0.05 * np.sin(2 * np.pi * 5.02 * freq * t) * np.exp(-t * 9))
    env = np.exp(-t / 1.1) * np.clip(t / 0.006, 0, 1) * _gate(t, dur, 0.25)
    return y * env * (vel / 127.0) ** 1.5


def bass_note(freq, dur, vel):
    t = _t(dur + 0.15)
    y = (np.sin(2 * np.pi * freq * t)
         + 0.30 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 3)
         + 0.06 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 5))
    env = np.exp(-t / 1.8) * np.clip(t / 0.01, 0, 1) * _gate(t, dur, 0.08)
    return y * env * (vel / 127.0) ** 1.5


def mel_note(freq, dur, vel):
    t = _t(dur + 0.5)
    vib = 0.0025 * np.sin(2 * np.pi * 5.0 * t) * np.minimum(t / 0.8, 1.0)
    ph = 2 * np.pi * freq * (t + vib)
    y = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    env = np.exp(-t / 2.8) * np.clip(t / 0.07, 0, 1) * _gate(t, dur, 0.3)
    return y * env * (vel / 127.0) ** 1.5


def kick_hit(vel, seed):
    t = _t(0.32)
    freq = 105 * np.exp(-t * 30) + 42
    phase = 2 * np.pi * np.cumsum(freq) / SR
    rng = np.random.default_rng(seed)
    click = 0.18 * rng.standard_normal(t.size) * np.exp(-t * 900)
    return (np.sin(phase) * np.exp(-t * 9) + click) * (vel / 127.0) ** 1.6


def snare_hit(vel, seed):
    t = _t(0.22)
    rng = np.random.default_rng(seed)
    nz = rng.standard_normal(t.size)
    nz[1:] -= 0.85 * nz[:-1]                       # cheap highpass
    body = (0.5 * np.sin(2 * np.pi * 192 * t) * np.exp(-t * 28)
            + 0.2 * np.sin(2 * np.pi * 286 * t) * np.exp(-t * 30))
    return (0.7 * nz * np.exp(-t * 24) + body) * (vel / 127.0) ** 1.6


def hat_hit(vel, seed, open_hat=False):
    t = _t(0.5 if open_hat else 0.09)
    rng = np.random.default_rng(seed)
    nz = rng.standard_normal(t.size)
    nz = np.diff(nz, prepend=0.0)                  # highpass
    nz += 0.35 * nz * np.sin(2 * np.pi * 6100 * t)  # metallic shimmer
    nz /= max(1e-9, np.max(np.abs(nz)))
    decay = 6.5 if open_hat else 55.0
    return nz * np.exp(-t * decay) * (vel / 127.0) ** 1.6


def render_audio(path, ep, bass, mel, drums, total_bars):
    total_sec = beat_to_sec(total_bars * BEATS_PER_BAR) + TAIL_SECONDS
    nsamp = int(total_sec * SR)
    left = np.zeros(nsamp)
    right = np.zeros(nsamp)

    def add(sig, start_sec, pan, gain):
        i0 = int(start_sec * SR)
        i1 = min(nsamp, i0 + sig.size)
        if i1 <= i0:
            return
        seg = sig[: i1 - i0] * gain
        angle = (pan + 1.0) * math.pi / 4.0        # constant-power pan
        left[i0:i1] += seg * math.cos(angle)
        right[i0:i1] += seg * math.sin(angle)

    for midi, start, dur, vel in ep:
        add(ep_note(m2f(midi), dur * SEC_PER_BEAT,  vel),
            beat_to_sec(start), -0.25, 0.50)
    for midi, start, dur, vel in bass:
        add(bass_note(m2f(midi), dur * SEC_PER_BEAT, vel),
            beat_to_sec(start), 0.0, 0.75)
    for midi, start, dur, vel in mel:
        add(mel_note(m2f(midi), dur * SEC_PER_BEAT, vel),
            beat_to_sec(start), 0.20, 0.50)
    for i, (drum, start, vel) in enumerate(drums):
        seed = 1000 + i
        if drum == KICK:
            add(kick_hit(vel, seed), beat_to_sec(start), 0.0, 1.00)
        elif drum == SNARE:
            add(snare_hit(vel, seed), beat_to_sec(start), 0.06, 0.85)
        elif drum == CHAT:
            add(hat_hit(vel, seed), beat_to_sec(start), 0.30, 0.55)
        else:
            add(hat_hit(vel, seed, open_hat=True), beat_to_sec(start), 0.30, 0.45)

    mix = np.stack([left, right])

    # --- lo-fi master chain -------------------------------------------------
    # warm tape EQ: gentle high rolloff + rumble highpass (FFT-domain)
    spec = np.fft.rfft(mix, axis=1)
    freqs = np.fft.rfftfreq(nsamp, 1.0 / SR)
    gain = np.ones_like(freqs)
    lo = np.clip(freqs / 30.0, 0.0, 1.0)
    gain *= lo * lo
    roll = np.clip((freqs - 6500.0) / 9500.0, 0.0, 1.0)
    gain *= 0.20 + 0.80 * 0.5 * (1.0 + np.cos(np.pi * roll))
    mix = np.fft.irfft(spec * gain, n=nsamp, axis=1)

    # vinyl crackle + hiss
    rng = np.random.default_rng(7)
    n_pops = rng.poisson(7 * total_sec)
    pop_kernel_t = _t(0.006)
    for _ in range(n_pops):
        pos = int(rng.uniform(0, nsamp - pop_kernel_t.size))
        amp = rng.uniform(0.004, 0.028) * rng.choice([-1.0, 1.0])
        pop = amp * np.exp(-pop_kernel_t * 700) * np.cos(
            2 * np.pi * rng.uniform(800, 3000) * pop_kernel_t)
        ch = rng.integers(0, 2)
        mix[ch, pos:pos + pop.size] += pop
    mix += 0.0012 * rng.standard_normal(mix.shape)

    # soft clip + normalize
    mix = np.tanh(1.2 * mix) / math.tanh(1.2)
    mix *= 0.89 / max(1e-9, np.max(np.abs(mix)))

    pcm = (mix.T * 32767.0).astype(np.int16)
    with wave.open(path, "wb") as fh:
        fh.setnchannels(2)
        fh.setsampwidth(2)
        fh.setframerate(SR)
        fh.writeframes(pcm.tobytes())


# ----------------------------------------------------------------------------
def main():
    out_dir = os.path.dirname(os.path.abspath(__file__))
    ep, bass, mel, drums, total_bars = build_events()
    mid = os.path.join(out_dir, "lofi-beat.mid")
    wav = os.path.join(out_dir, "lofi-beat.wav")
    mp3 = os.path.join(out_dir, "lofi-beat.mp3")

    write_midi(mid, ep, bass, mel, drums, total_bars)
    render_audio(wav, ep, bass, mel, drums, total_bars)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", wav,
             "-codec:a", "libmp3lame", "-q:a", "2", mp3],
            check=True)
    except (OSError, subprocess.CalledProcessError):
        print("ffmpeg unavailable — skipped mp3")

    print(f"bars={total_bars}  ep={len(ep)} bass={len(bass)} "
          f"mel={len(mel)} drums={len(drums)}")
    print(f"wrote {mid}")
    print(f"wrote {wav}")


if __name__ == "__main__":
    main()
