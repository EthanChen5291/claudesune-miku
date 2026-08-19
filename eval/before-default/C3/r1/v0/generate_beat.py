#!/usr/bin/env python3
"""
Lo-fi hip-hop beat generator — "Half Asleep in C Minor"
C minor, 84 BPM, form A B A B (8-bar sections), swung hats,
jazzy extended chords (7ths/9ths), sleepy vibraphone melody.

Outputs:
  lofi_cm_84.mid  — standard MIDI file (4 instrument tracks + drums)
  lofi_cm_84.wav  — rendered audio (built-in numpy synth, 44.1 kHz stereo)

Single source of truth: the note list below feeds both the MIDI writer
and the audio renderer.
"""

import struct
import wave

import numpy as np

# ----------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------
BPM = 84
BEATS_PER_BAR = 4
BARS_PER_SECTION = 8
SECTIONS = ["A", "B", "A", "B"]

# Harmonic rhythm: how many bars each chord lasts.
BARS_PER_CHORD = 1

# Drum velocity: uniform (every drum hit at the same velocity).
DRUM_VELOCITY_CONTOUR = False
DRUM_UNIFORM_VEL = 96

SWING = 2.0 / 3.0  # swung 8ths: offbeat lands at 2/3 of the beat

SR = 44100
TAIL_SECONDS = 2.0

MIDI_PATH = "lofi_cm_84.mid"
WAV_PATH = "lofi_cm_84.wav"

# ----------------------------------------------------------------------
# Harmony: chord = (name, bass_root_midi, voicing_midi_notes)
# Rootless-ish EP voicings; bass supplies the root.
# ----------------------------------------------------------------------
Cm9 = ("Cm9", 36, [63, 67, 70, 74])      # Eb G Bb D
Fm9 = ("Fm9", 41, [63, 67, 68, 72])      # Eb G Ab C
Abmaj9 = ("Abmaj9", 44, [60, 63, 67, 70])  # C Eb G Bb
G7b9 = ("G7b9", 43, [59, 65, 68, 74])    # B F Ab D
Ebmaj9 = ("Ebmaj9", 39, [62, 65, 67, 70])  # D F G Bb
Dm7b5 = ("Dm7b5", 38, [60, 65, 68, 72])  # C F Ab C
Bb13 = ("Bb13", 46, [62, 67, 68, 72])    # D G Ab C
Gm9 = ("Gm9", 43, [58, 62, 65, 69])      # Bb D F A
Bb9 = ("Bb9", 46, [62, 65, 68, 72])      # D F Ab C

PROG_A = [Cm9, Fm9, Abmaj9, G7b9, Cm9, Ebmaj9, Dm7b5, G7b9]
PROG_B = [Abmaj9, Bb13, Gm9, Cm9, Fm9, Bb9, Ebmaj9, G7b9]

# ----------------------------------------------------------------------
# Melody: per section, (start_beat_in_section, dur_beats, pitch, velocity)
# Sparse, laid back, mostly stepwise — "sleepy".
# ----------------------------------------------------------------------
MEL_A = [
    (1.5, 0.5, 67, 62), (2.0, 1.9, 72, 70),     # G4 pickup -> C5
    (5.0, 1.0, 70, 64), (6.5, 1.4, 68, 60),     # Bb4, Ab4
    (8.5, 0.5, 67, 58), (9.0, 2.4, 72, 66),     # G4 -> C5 (3rd of Abmaj9)
    (12.5, 0.5, 74, 62), (13.0, 2.0, 71, 64),   # D5 -> B4 (3rd of G7)
    (16.0, 2.9, 72, 66),                        # long C5 resolution
    (20.5, 0.5, 70, 58), (21.0, 1.4, 67, 62),   # Bb4, G4
    (24.0, 1.4, 65, 60), (25.5, 1.0, 63, 58),   # F4, Eb4
    (28.0, 1.4, 62, 60), (29.5, 2.0, 67, 56),   # D4, G4 tail
]
MEL_B = [
    (0.0, 1.4, 75, 70), (1.5, 0.5, 74, 60), (2.0, 1.9, 72, 66),  # Eb5 D5 C5
    (5.0, 1.0, 74, 64), (6.5, 1.4, 70, 60),                      # D5, Bb4
    (8.0, 1.9, 74, 66), (10.5, 1.4, 70, 60),                     # D5, Bb4
    (12.5, 0.5, 67, 56), (13.0, 2.4, 75, 64),                    # G4 -> Eb5
    (16.0, 1.4, 72, 64), (17.5, 0.5, 70, 56), (18.0, 1.9, 68, 62),  # C5 Bb4 Ab4
    (21.0, 1.0, 74, 60), (22.0, 1.4, 72, 58),                    # D5, C5
    (24.0, 2.9, 70, 62),                                         # long Bb4
    (28.5, 0.5, 68, 56), (29.0, 1.4, 67, 60), (30.5, 1.4, 62, 54),  # Ab G D tail
]
MELODIES = {"A": MEL_A, "B": MEL_B}

# ----------------------------------------------------------------------
# Drums (GM): 36 kick, 38 snare, 42 closed hat, 46 open hat.
# Two-bar boom-bap loop; hats are swung 8ths (offbeat at SWING of the beat).
# ----------------------------------------------------------------------
KICK, SNARE, CHH, OHH = 36, 38, 42, 46


def drum_hits_for_bar(bar_index):
    """Return list of (beat_in_bar, drum) for the given absolute bar."""
    hits = []
    if bar_index % 2 == 0:
        hits += [(0.0, KICK), (2.5, KICK)]
        hits += [(1.0, SNARE), (3.0, SNARE)]
    else:
        hits += [(0.0, KICK), (1.75, KICK), (2.5, KICK)]
        hits += [(1.0, SNARE), (3.0, SNARE), (3.75, SNARE)]
    for b in range(BEATS_PER_BAR):
        hits.append((float(b), CHH))
        off = b + SWING
        if bar_index % 4 == 3 and b == BEATS_PER_BAR - 1:
            hits.append((off, OHH))  # open hat lifts into the next bar
        else:
            hits.append((off, CHH))
    return hits


def drum_velocity(drum, beat_in_bar):
    """Velocity for one drum hit."""
    if not DRUM_VELOCITY_CONTOUR:
        return DRUM_UNIFORM_VEL
    # Accents and ghost notes (contour only; placement untouched).
    if drum == KICK:
        return {0.0: 114, 1.75: 76, 2.5: 98}.get(beat_in_bar, 96)
    if drum == SNARE:
        return {1.0: 106, 3.0: 104, 3.75: 44}.get(beat_in_bar, 96)
    if drum == CHH:
        onbeat = {0.0: 92, 1.0: 74, 2.0: 86, 3.0: 74}
        if beat_in_bar in onbeat:
            return onbeat[beat_in_bar]
        return 62 if beat_in_bar > 3.0 else 56  # swung offbeats: ghosts
    if drum == OHH:
        return 84
    return DRUM_UNIFORM_VEL


# ----------------------------------------------------------------------
# Build the full note list (single source of truth).
# Note: dict(track, start_beat, dur_beats, pitch, vel)
# Tracks: "ep", "bass", "mel", "drums"
# ----------------------------------------------------------------------
def build_song():
    notes = []
    total_bars = len(SECTIONS) * BARS_PER_SECTION

    for bar in range(total_bars):
        section = SECTIONS[bar // BARS_PER_SECTION]
        bar_in_section = bar % BARS_PER_SECTION
        bar_start = bar * BEATS_PER_BAR
        prog = PROG_A if section == "A" else PROG_B

        chord_slot = (bar_in_section // BARS_PER_CHORD) % len(prog)
        name, root, voicing = prog[chord_slot]

        # EP comping: dreamy pad hit on 1, softer re-hit on the & of 2.5.
        for i, p in enumerate(voicing):
            roll = 0.02 * i  # gentle roll upward
            notes.append(dict(track="ep", start_beat=bar_start + roll,
                              dur_beats=2.4 - roll, pitch=p, vel=62))
            notes.append(dict(track="ep", start_beat=bar_start + 2.5 + roll,
                              dur_beats=1.4 - roll, pitch=p, vel=52))

        # Bass: root long on 1, root on the & of 3, fifth pickup on 4-&.
        notes.append(dict(track="bass", start_beat=bar_start + 0.0,
                          dur_beats=1.6, pitch=root, vel=88))
        notes.append(dict(track="bass", start_beat=bar_start + 2.5,
                          dur_beats=0.9, pitch=root, vel=78))
        notes.append(dict(track="bass", start_beat=bar_start + 3.5,
                          dur_beats=0.45, pitch=root + 7, vel=68))

        # Drums
        for beat_in_bar, drum in drum_hits_for_bar(bar):
            notes.append(dict(track="drums", start_beat=bar_start + beat_in_bar,
                              dur_beats=0.1, pitch=drum,
                              vel=drum_velocity(drum, beat_in_bar)))

    # Melody: one statement per 8-bar section.
    for s_idx, section in enumerate(SECTIONS):
        s_start = s_idx * BARS_PER_SECTION * BEATS_PER_BAR
        for beat, dur, pitch, vel in MELODIES[section]:
            notes.append(dict(track="mel", start_beat=s_start + beat,
                              dur_beats=dur, pitch=pitch, vel=vel))
    return notes


# ----------------------------------------------------------------------
# MIDI writer (format 1, 480 tpqn) — pure Python
# ----------------------------------------------------------------------
TPQN = 480


def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    return bytes(reversed(out))


def midi_track(events):
    """events: list of (tick, order, bytes) -> chunk with delta times."""
    events = sorted(events, key=lambda e: (e[0], e[1]))
    data = bytearray()
    last = 0
    for tick, _order, msg in events:
        data += vlq(tick - last) + msg
        last = tick
    data += vlq(0) + b"\xff\x2f\x00"  # end of track
    return b"MTrk" + struct.pack(">I", len(data)) + bytes(data)


def write_midi(notes, path):
    tempo = round(60_000_000 / BPM)
    meta = [
        (0, 0, b"\xff\x51\x03" + struct.pack(">I", tempo)[1:]),  # tempo
        (0, 0, b"\xff\x58\x04\x04\x02\x18\x08"),                 # 4/4
        (0, 0, b"\xff\x59\x02" + struct.pack(">bB", -3, 1)),     # C minor
        (0, 0, b"\xff\x03\x14" + b"Half Asleep in C min"),
    ]
    tracks_spec = {
        "ep":   (0, 4,  "Electric Piano"),   # GM 4: Electric Piano 1
        "bass": (1, 32, "Upright Bass"),     # GM 32: Acoustic Bass
        "mel":  (2, 11, "Vibraphone"),       # GM 11: Vibraphone
        "drums": (9, None, "Drums"),
    }
    chunks = [midi_track(meta)]
    for track_name, (ch, prog, label) in tracks_spec.items():
        ev = [(0, 0, b"\xff\x03" + bytes([len(label)]) + label.encode())]
        if prog is not None:
            ev.append((0, 0, bytes([0xC0 | ch, prog])))
        for n in (x for x in notes if x["track"] == track_name):
            on = round(n["start_beat"] * TPQN)
            off = round((n["start_beat"] + n["dur_beats"]) * TPQN)
            ev.append((on, 1, bytes([0x90 | ch, n["pitch"], n["vel"]])))
            ev.append((off, 0, bytes([0x80 | ch, n["pitch"], 0])))
        chunks.append(midi_track(ev))
    header = b"MThd" + struct.pack(">IHHH", 6, 1, len(chunks), TPQN)
    with open(path, "wb") as f:
        f.write(header + b"".join(chunks))


# ----------------------------------------------------------------------
# Audio renderer — small numpy synth
# ----------------------------------------------------------------------
def hz(p):
    return 440.0 * 2 ** ((p - 69) / 12)


def env_exp(n, rate):
    return np.exp(-np.arange(n) / SR * rate)


def attack(sig, seconds):
    n = min(len(sig), max(1, int(seconds * SR)))
    sig[:n] *= np.linspace(0.0, 1.0, n)
    return sig


def gate(sig, dur_s, release_s):
    """Fade out starting at dur_s over release_s."""
    n0 = int(dur_s * SR)
    if n0 >= len(sig):
        return sig
    n1 = min(len(sig), n0 + max(1, int(release_s * SR)))
    sig[n0:n1] *= np.linspace(1.0, 0.0, n1 - n0)
    sig[n1:] = 0.0
    return sig


def ep_note(pitch, dur_s, vel):
    f = hz(pitch)
    n = int((dur_s + 0.35) * SR)
    t = np.arange(n) / SR
    w = (np.sin(2 * np.pi * f * t)
         + 0.35 * np.sin(2 * np.pi * 2 * f * t) * env_exp(n, 4.0)
         + 0.10 * np.sin(2 * np.pi * 3 * f * t) * env_exp(n, 6.0)
         + 0.30 * np.sin(2 * np.pi * f * 1.003 * t))
    w *= env_exp(n, 1.6)
    attack(w, 0.012)
    gate(w, dur_s, 0.3)
    return w * (vel / 127) ** 1.6 * 0.30


def bass_note(pitch, dur_s, vel):
    f = hz(pitch)
    n = int((dur_s + 0.12) * SR)
    t = np.arange(n) / SR
    w = np.sin(2 * np.pi * f * t) + 0.22 * np.sin(2 * np.pi * 2 * f * t)
    w *= env_exp(n, 1.2)
    attack(w, 0.01)
    gate(w, dur_s, 0.1)
    return np.tanh(1.6 * w) * (vel / 127) ** 1.6 * 0.55


def mel_note(pitch, dur_s, vel):
    f = hz(pitch)
    n = int((dur_s + 0.5) * SR)
    t = np.arange(n) / SR
    w = (np.sin(2 * np.pi * f * t)
         + 0.18 * np.sin(2 * np.pi * 4 * f * t) * env_exp(n, 7.0))
    w *= (1 + 0.14 * np.sin(2 * np.pi * 4.5 * t))  # slow vibes tremolo
    w *= env_exp(n, 1.9)
    attack(w, 0.005)
    gate(w, dur_s + 0.2, 0.3)
    return w * (vel / 127) ** 1.6 * 0.34


def drum_sound(drum, vel, rng):
    a = (vel / 127) ** 1.6
    if drum == KICK:
        n = int(0.35 * SR)
        t = np.arange(n) / SR
        freq = 48 + 72 * np.exp(-t * 26)
        phase = 2 * np.pi * np.cumsum(freq) / SR
        w = np.sin(phase) * env_exp(n, 9.0)
        w += 0.25 * rng.standard_normal(n) * env_exp(n, 180.0)  # beater click
        return np.tanh(2.0 * w) * a * 0.85
    if drum == SNARE:
        n = int(0.24 * SR)
        t = np.arange(n) / SR
        noise = rng.standard_normal(n)
        noise = np.diff(noise, prepend=0.0)  # brighten
        w = 0.75 * noise * env_exp(n, 16.0)
        w += 0.5 * np.sin(2 * np.pi * 186 * t) * env_exp(n, 24.0)
        return w * a * 0.55
    if drum == CHH:
        n = int(0.07 * SR)
        noise = np.diff(rng.standard_normal(n), prepend=0.0)
        return noise * env_exp(n, 55.0) * a * 0.30
    if drum == OHH:
        n = int(0.40 * SR)
        noise = np.diff(rng.standard_normal(n), prepend=0.0)
        return noise * env_exp(n, 7.0) * a * 0.22
    return np.zeros(1)


def lowpass(x, fc):
    """Gentle FFT-domain lowpass (smooth ~12 dB/oct rolloff above fc)."""
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1.0 / SR)
    spec *= 1.0 / (1.0 + (freqs / fc) ** 2)
    return np.fft.irfft(spec, n=len(x))


def render_wav(notes, path):
    spb = 60.0 / BPM
    total_beats = len(SECTIONS) * BARS_PER_SECTION * BEATS_PER_BAR
    n_total = int((total_beats * spb + TAIL_SECONDS) * SR)

    buses = {name: np.zeros(n_total) for name in ("ep", "bass", "mel", "drums")}
    rng = np.random.default_rng(529)

    for note in sorted(notes, key=lambda n: n["start_beat"]):
        start = int(note["start_beat"] * spb * SR)
        dur_s = note["dur_beats"] * spb
        tr = note["track"]
        if tr == "ep":
            sig = ep_note(note["pitch"], dur_s, note["vel"])
        elif tr == "bass":
            sig = bass_note(note["pitch"], dur_s, note["vel"])
        elif tr == "mel":
            sig = mel_note(note["pitch"], dur_s, note["vel"])
        else:
            sig = drum_sound(note["pitch"], note["vel"], rng)
        end = min(n_total, start + len(sig))
        buses[tr][start:end] += sig[: end - start]

    # Vinyl bed: soft hiss + sparse crackle
    hiss = lowpass(rng.standard_normal(n_total), 3200) * 0.012
    crackle = np.zeros(n_total)
    pops = rng.integers(0, n_total - 64, size=int(n_total / SR * 9))
    for p in pops:
        ln = int(rng.integers(8, 40))
        crackle[p:p + ln] += rng.standard_normal(ln) * rng.uniform(0.02, 0.10)
    vinyl = hiss + crackle

    # Stereo mix with gentle panning
    def pan(sig, pos):  # pos: -1 left .. +1 right
        left = sig * np.sqrt((1 - pos) / 2)
        right = sig * np.sqrt((1 + pos) / 2)
        return left, right

    L = np.zeros(n_total)
    R = np.zeros(n_total)
    for name, pos in (("ep", 0.25), ("bass", 0.0), ("mel", -0.30), ("drums", 0.05)):
        l, r = pan(buses[name], pos)
        L += l
        R += r
    lv, rv = pan(vinyl, -0.1)
    L += lv
    R += rv

    # Warmth: gentle lowpass, then soft clip and normalize
    L = lowpass(L, 7500)
    R = lowpass(R, 7500)
    mix = np.stack([L, R], axis=1)
    mix = np.tanh(1.2 * mix)
    mix *= 0.88 / max(1e-9, np.max(np.abs(mix)))

    pcm = (mix * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    song = build_song()
    write_midi(song, MIDI_PATH)
    render_wav(song, WAV_PATH)
    beats = len(SECTIONS) * BARS_PER_SECTION * BEATS_PER_BAR
    print(f"notes: {len(song)}  bars: {beats // BEATS_PER_BAR}  "
          f"length: {beats * 60 / BPM + TAIL_SECONDS:.1f}s")
    print(f"wrote {MIDI_PATH} and {WAV_PATH}")
