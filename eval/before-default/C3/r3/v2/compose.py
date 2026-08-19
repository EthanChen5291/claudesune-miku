#!/usr/bin/env python3
"""
Lo-fi hip-hop beat -- C minor, 84 BPM, A B A B (8-bar sections).
Swung 8th hats, jazzy extended chords (7ths/9ths), sleepy melody.

Self-contained: writes a Format-1 MIDI file and renders a stereo WAV
with a small numpy softsynth (EP chords, synth bass, vibes melody,
synthesized drums, vinyl crackle).

Usage: python3 compose.py
Outputs (next to this script): lofi_cminor_84.mid, lofi_cminor_84.wav
"""

import os
import struct
import wave

import numpy as np

# ----------------------------------------------------------------------
# Global musical parameters
# ----------------------------------------------------------------------
BPM = 84
PPQ = 480                      # MIDI ticks per quarter note
SR = 44100                     # audio sample rate
SPB = 60.0 / BPM               # seconds per beat
SWING = 0.13                   # offbeat 8ths land at beat + 0.5 + SWING (~63%)
HARMONIC_RHYTHM = 2            # bars per chord change (2 = chord changes every other bar)

BARS_PER_SECTION = 8
SECTION_ORDER = ["A", "B", "A", "B"]
TOTAL_BARS = BARS_PER_SECTION * len(SECTION_ORDER)   # 32
TOTAL_BEATS = TOTAL_BARS * 4                          # 128

OUT_BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lofi_cminor_84")

# ----------------------------------------------------------------------
# Harmony: (name, bass_root_midi, EP voicing midi notes)
# ----------------------------------------------------------------------
A_CHORDS = [
    ("Cm9",    36, [51, 55, 58, 62]),   # Eb G Bb D
    ("Fm9",    41, [56, 60, 63, 67]),   # Ab C Eb G
    ("Abmaj9", 44, [55, 58, 60, 63]),   # G Bb C Eb
    ("G7b9",   43, [53, 56, 59, 62]),   # F Ab B D
    ("Cm9",    36, [51, 55, 58, 62]),
    ("Ebmaj9", 39, [55, 58, 62, 65]),   # G Bb D F
    ("Dm7b5",  38, [53, 56, 60, 62]),   # F Ab C D
    ("G7b9",   43, [53, 56, 59, 62]),
]
B_CHORDS = [
    ("Fm9",    41, [56, 60, 63, 67]),
    ("Bb13",   46, [56, 60, 62, 67]),   # Ab C D G
    ("Ebmaj9", 39, [55, 58, 62, 65]),
    ("Abmaj9", 44, [55, 58, 60, 63]),
    ("Dm7b5",  38, [53, 56, 60, 62]),
    ("G7b9",   43, [53, 56, 59, 62]),
    ("Cm9",    36, [51, 55, 58, 62]),
    ("Cm9",    36, [51, 55, 58, 62]),
]
SECTION_CHORDS = {"A": A_CHORDS, "B": B_CHORDS}


def chord_for_bar(section, bar_in_section):
    """Chord sounding during a given bar of a section.

    The harmonic rhythm knob: a chord change happens every
    HARMONIC_RHYTHM bars; between changes the chord from the change-bar
    is held."""
    idx = (bar_in_section // HARMONIC_RHYTHM) * HARMONIC_RHYTHM
    return SECTION_CHORDS[section][idx]


# ----------------------------------------------------------------------
# Melodies: (beat within section, duration in beats, midi pitch)
# Sleepy: sparse, behind-the-beat entrances, long tones.
# ----------------------------------------------------------------------
MELODY_A = [
    (1.0, 2.0, 67), (3.5, 0.5, 70),
    (4.0, 2.5, 72),
    (8.5, 1.0, 70), (10.0, 2.0, 67),
    (12.0, 1.5, 65), (14.0, 2.0, 62),
    (16.5, 1.5, 67), (18.5, 1.5, 70),
    (20.0, 2.0, 74), (22.5, 1.5, 72),
    (24.0, 2.0, 68), (26.0, 2.0, 65),
    (28.0, 1.0, 62), (29.5, 2.5, 67),
]
MELODY_B = [
    (0.0, 1.5, 72), (2.0, 1.5, 75),
    (4.5, 1.0, 74), (6.0, 2.0, 72),
    (8.0, 2.0, 70), (10.5, 1.5, 67),
    (12.5, 1.0, 72), (14.0, 2.0, 75),
    (16.0, 1.5, 74), (18.0, 2.0, 72),
    (20.5, 1.5, 71), (22.0, 2.0, 68),
    (24.0, 2.5, 67), (27.0, 1.0, 70),
    (28.0, 3.5, 72),
]
SECTION_MELODY = {"A": MELODY_A, "B": MELODY_B}


def swing(beat):
    """Delay offbeat 8ths for the swung feel (applies to all parts)."""
    if abs((beat % 1.0) - 0.5) < 1e-6:
        return beat + SWING
    return beat


# ----------------------------------------------------------------------
# Build the full song as instrument events:
#   (instrument, start_beat (swung), dur_beats, pitch, velocity)
# ----------------------------------------------------------------------
def build_song():
    events = []

    # Per-bar chord map for the whole song
    song_chords = []
    for s_i, sec in enumerate(SECTION_ORDER):
        for b in range(BARS_PER_SECTION):
            song_chords.append(chord_for_bar(sec, b))

    # --- EP chords: two lazy stabs per bar ---------------------------------
    for bar in range(TOTAL_BARS):
        t0 = bar * 4
        _, _, voicing = song_chords[bar]
        for p in voicing:
            events.append(("ep", swing(t0 + 0.0), 2.5, p, 66))
            events.append(("ep", swing(t0 + 2.5), 1.5, p, 56))

    # --- Bass: roots and fifths, chromatic approach into changes -----------
    for bar in range(TOTAL_BARS):
        t0 = bar * 4
        _, root, _ = song_chords[bar]
        next_root = song_chords[bar + 1][1] if bar + 1 < TOTAL_BARS else 36
        if bar % 2 == 0:
            events.append(("bass", swing(t0 + 0.0), 2.0, root, 88))
            events.append(("bass", swing(t0 + 2.5), 1.5, root + 7, 82))
        else:
            events.append(("bass", swing(t0 + 0.0), 3.0, root, 88))
            approach = next_root - 1 if next_root != root else root + 7
            events.append(("bass", swing(t0 + 3.5), 0.5, approach, 78))

    # --- Melody -------------------------------------------------------------
    for s_i, sec in enumerate(SECTION_ORDER):
        sec_start = s_i * BARS_PER_SECTION * 4
        vel = 72 if sec == "A" else 78
        for beat, dur, pitch in SECTION_MELODY[sec]:
            events.append(("mel", swing(sec_start + beat), dur, pitch, vel))

    # --- Drums (velocity contour: accents + ghost notes) ---------------------
    # Two-bar loop; open hat closes each 4-bar phrase.
    # Same hits at the same times as before -- only velocities are shaped.
    # Hats: accented on-beats (strongest on 1 and 3), ghosted offbeat 8ths,
    # with the second bar of each 2-bar loop played slightly softer.
    HAT_CONTOUR = [92, 48, 68, 52, 86, 50, 72, 56]   # slots 0,0.5,...,3.5
    KICK_V_DOWN, KICK_V_SYNC, KICK_V_PICKUP = 114, 96, 82
    SNARE_V_2, SNARE_V_4 = 102, 112                  # accent the "4"
    OHAT_V = 78
    for bar in range(TOTAL_BARS):
        t0 = bar * 4
        bar_in_sec = bar % BARS_PER_SECTION
        kicks = [0.0, 2.5] + ([3.5] if bar % 2 == 1 else [])
        for kb in kicks:
            if kb == 0.0:
                kv = KICK_V_DOWN
            elif kb == 2.5:
                kv = KICK_V_SYNC
            else:
                kv = KICK_V_PICKUP
            events.append(("kick", swing(t0 + kb), 0.25, 36, kv))
        for sb, sv in ((1.0, SNARE_V_2), (3.0, SNARE_V_4)):
            events.append(("snare", swing(t0 + sb), 0.25, 38, sv))
        for i in range(8):
            hb = i * 0.5
            hv = HAT_CONTOUR[i] - (6 if bar % 2 == 1 else 0)
            if hb == 3.5 and bar_in_sec in (3, 7):
                events.append(("ohat", swing(t0 + hb), 0.5, 46, OHAT_V))
            else:
                events.append(("chat", swing(t0 + hb), 0.25, 42, hv))

    return events


# ----------------------------------------------------------------------
# MIDI writer (minimal Format-1)
# ----------------------------------------------------------------------
def _vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    return bytes(reversed(out))


def _track_bytes(named_events, name, program=None, channel=0):
    """named_events: list of (tick, is_on, pitch, vel), builds one MTrk."""
    data = bytearray()
    data += _vlq(0) + b"\xff\x03" + _vlq(len(name)) + name.encode()
    if program is not None:
        data += _vlq(0) + bytes([0xC0 | channel, program])
    msgs = sorted(named_events, key=lambda e: (e[0], e[1]))  # offs before ons at same tick
    last = 0
    for tick, is_on, pitch, vel in msgs:
        data += _vlq(tick - last)
        status = (0x90 if is_on else 0x80) | channel
        data += bytes([status, pitch, vel if is_on else 0])
        last = tick
    data += _vlq(0) + b"\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(data)) + bytes(data)


def write_midi(events, path):
    inst_map = {  # instrument -> (track_key, channel, program)
        "ep":    ("chords", 0, 4),    # Electric Piano 1
        "bass":  ("bass",   1, 33),   # Fingered Bass
        "mel":   ("melody", 2, 11),   # Vibraphone
        "kick":  ("drums",  9, None),
        "snare": ("drums",  9, None),
        "chat":  ("drums",  9, None),
        "ohat":  ("drums",  9, None),
    }
    tracks = {"chords": [], "bass": [], "melody": [], "drums": []}
    for inst, start, dur, pitch, vel in events:
        key, ch, _ = inst_map[inst]
        on = int(round(start * PPQ))
        off = int(round((start + dur) * PPQ))
        tracks[key].append((on, True, pitch, vel))
        tracks[key].append((max(off, on + 1), False, pitch, 0))

    # Tempo / meta track
    tempo = int(round(60_000_000 / BPM))
    meta = bytearray()
    meta += _vlq(0) + b"\xff\x51\x03" + struct.pack(">I", tempo)[1:]
    meta += _vlq(0) + b"\xff\x58\x04" + bytes([4, 2, 24, 8])
    meta += _vlq(0) + b"\xff\x2f\x00"
    chunks = [b"MTrk" + struct.pack(">I", len(meta)) + bytes(meta)]

    specs = [
        ("chords", "EP Chords", 0, 4),
        ("bass",   "Bass",      1, 33),
        ("melody", "Melody",    2, 11),
        ("drums",  "Drums",     9, None),
    ]
    for key, name, ch, prog in specs:
        chunks.append(_track_bytes(tracks[key], name, prog, ch))

    header = b"MThd" + struct.pack(">IHHH", 6, 1, len(chunks), PPQ)
    with open(path, "wb") as f:
        f.write(header + b"".join(chunks))


# ----------------------------------------------------------------------
# Softsynth rendering
# ----------------------------------------------------------------------
def _hz(p):
    return 440.0 * 2.0 ** ((p - 69) / 12.0)


def _t(n):
    return np.arange(n) / SR


def synth_ep(f, dur_s, amp, rng):
    n = int((dur_s + 1.4) * SR)
    t = _t(n)
    partials = [(1, 1.0, 1.3), (2, 0.28, 0.8), (3, 0.10, 0.55), (4, 0.06, 0.09)]
    y = np.zeros(n)
    for k, a, tau in partials:
        y += a * np.exp(-t / tau) * np.sin(2 * np.pi * f * k * t)
        y += 0.35 * a * np.exp(-t / tau) * np.sin(2 * np.pi * f * k * 1.0016 * t)
    y *= np.minimum(t / 0.006, 1.0)
    rel = np.ones(n)
    r0 = int(dur_s * SR)
    rl = min(int(0.35 * SR), n - r0)
    if rl > 0:
        rel[r0:r0 + rl] = np.linspace(1, 0, rl)
        rel[r0 + rl:] = 0.0
    return amp * y * rel


def synth_bass(f, dur_s, amp, rng):
    n = int((dur_s + 0.12) * SR)
    t = _t(n)
    y = (np.sin(2 * np.pi * f * t)
         + 0.30 * np.sin(2 * np.pi * 2 * f * t)
         + 0.08 * np.sin(2 * np.pi * 3 * f * t))
    env = np.exp(-t / 1.5) * np.minimum(t / 0.01, 1.0)
    r0 = int(dur_s * SR)
    rl = min(int(0.08 * SR), n - r0)
    if rl > 0:
        env[r0:r0 + rl] *= np.linspace(1, 0, rl)
        env[r0 + rl:] = 0.0
    return amp * y * env


def synth_mel(f, dur_s, amp, rng):
    n = int((dur_s + 1.2) * SR)
    t = _t(n)
    vib = 0.25 * np.minimum(t / 0.4, 1.0) * np.sin(2 * np.pi * 5.2 * t)
    y = np.sin(2 * np.pi * f * t + vib) + 0.15 * np.sin(4 * np.pi * f * t)
    env = np.exp(-t / 1.6) * np.minimum(t / 0.025, 1.0)
    r0 = int(dur_s * SR)
    rl = min(int(0.4 * SR), n - r0)
    if rl > 0:
        env[r0:r0 + rl] *= np.linspace(1, 0, rl)
        env[r0 + rl:] = 0.0
    return amp * y * env


def synth_kick(f, dur_s, amp, rng):
    n = int(0.35 * SR)
    t = _t(n)
    freq = 40 + 60 * np.exp(-t / 0.045)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    y = np.sin(phase) * np.exp(-t / 0.16) * np.minimum(t / 0.002, 1.0)
    click = rng.standard_normal(int(0.004 * SR)) * 0.3
    y[:click.size] += click * np.exp(-np.arange(click.size) / (0.001 * SR))
    return amp * y


def synth_snare(f, dur_s, amp, rng):
    n = int(0.28 * SR)
    t = _t(n)
    noise = rng.standard_normal(n)
    noise = noise - 0.7 * np.roll(noise, 1)
    body = 0.7 * np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.06)
    y = (0.8 * noise * np.exp(-t / 0.075) + body) * np.minimum(t / 0.001, 1.0)
    return amp * y


def synth_hat(f, dur_s, amp, rng, open_=False):
    n = int((0.35 if open_ else 0.08) * SR)
    t = _t(n)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0.0)
    noise = np.diff(noise, prepend=0.0)
    tau = 0.11 if open_ else 0.022
    return amp * 0.25 * noise * np.exp(-t / tau)


SYNTHS = {
    "ep":    (synth_ep,    0.16),
    "bass":  (synth_bass,  0.30),
    "mel":   (synth_mel,   0.20),
    "kick":  (synth_kick,  0.90),
    "snare": (synth_snare, 0.50),
    "chat":  (lambda f, d, a, r: synth_hat(f, d, a, r, open_=False), 0.55),
    "ohat":  (lambda f, d, a, r: synth_hat(f, d, a, r, open_=True), 0.50),
}
PAN = {"ep": 0.15, "bass": 0.0, "mel": -0.12, "kick": 0.0,
       "snare": 0.02, "chat": 0.25, "ohat": 0.25}


def _lowpass_fir(x, cutoff_hz, taps=127):
    fc = cutoff_hz / SR
    k = np.arange(taps) - (taps - 1) / 2
    h = 2 * fc * np.sinc(2 * fc * k) * np.hamming(taps)
    h /= h.sum()
    n = x.size + taps - 1
    N = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(h, N), N)[:n]
    d = (taps - 1) // 2
    return y[d:d + x.size]


def render_audio(events, path):
    rng = np.random.default_rng(20260819)
    end_beat = max(s + d for _, s, d, _, _ in events)
    total = int((end_beat * SPB + 3.0) * SR)
    left = np.zeros(total)
    right = np.zeros(total)

    for inst, start, dur, pitch, vel in sorted(events, key=lambda e: e[1]):
        synth, gain = SYNTHS[inst]
        amp = gain * (vel / 127.0) ** 1.5
        sig = synth(_hz(pitch), dur * SPB, amp, rng)
        i0 = int(start * SPB * SR)
        i1 = min(i0 + sig.size, total)
        seg = sig[: i1 - i0]
        pan = PAN[inst]
        left[i0:i1] += seg * np.sqrt(0.5 * (1 - pan))
        right[i0:i1] += seg * np.sqrt(0.5 * (1 + pan))

    # Lo-fi master: mellow lowpass, vinyl crackle + hiss, soft saturation
    left = _lowpass_fir(left, 8200)
    right = _lowpass_fir(right, 8200)

    dur_s = total / SR
    crackle = np.zeros(total)
    for _ in range(int(dur_s * 3)):
        pos = rng.integers(0, total - 200)
        a = rng.uniform(0.02, 0.07) * rng.choice([-1, 1])
        ln = rng.integers(40, 130)
        crackle[pos:pos + ln] += a * np.exp(-np.arange(ln) / 25.0)
    hiss_l = np.convolve(rng.standard_normal(total), np.ones(6) / 6, "same") * 0.0022
    hiss_r = np.convolve(rng.standard_normal(total), np.ones(6) / 6, "same") * 0.0022
    left += crackle + hiss_l
    right += crackle + hiss_r

    left = np.tanh(1.3 * left) / np.tanh(1.3)
    right = np.tanh(1.3 * right) / np.tanh(1.3)

    peak = max(np.abs(left).max(), np.abs(right).max())
    left *= 0.92 / peak
    right *= 0.92 / peak

    fade = int(1.2 * SR)
    ramp = np.linspace(1, 0, fade)
    left[-fade:] *= ramp
    right[-fade:] *= ramp
    left[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    right[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))

    pcm = np.empty(total * 2, dtype=np.int16)
    pcm[0::2] = (left * 32767).astype(np.int16)
    pcm[1::2] = (right * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    events = build_song()
    write_midi(events, OUT_BASE + ".mid")
    render_audio(events, OUT_BASE + ".wav")
    print("wrote", OUT_BASE + ".mid")
    print("wrote", OUT_BASE + ".wav")


if __name__ == "__main__":
    main()
