#!/usr/bin/env python3
"""
F-minor house track, 122 BPM, form A B A' B (16-bar sections).

One event list drives two outputs rendered next to this script:
  fminor_house.wav  -- stereo 44.1 kHz, the listenable deliverable
  fminor_house.mid  -- same notes as General MIDI, for DAW import

Section design:
  A  (verse)  : kick 4-floor, offbeat closed hats, sparse open hat, clap 2+4,
                offbeat bass, two chord stabs/bar, melody in C4-C5.
  B  (chorus) : lifts -- melody up in C5-C6 and denser, plus sustained pads,
                8th-note arp, open hats on every offbeat, 16th hat ticks, shaker.
  A' (verse') : same melody/harmony as A, busier drums (ride 8ths, extra
                16th hats, ghost clap at 4-bar turnarounds).

Run:  python3 house_track.py
"""

import os
import wave
import zlib
import numpy as np

SR = 44100
BPM = 122.0
BEAT = 60.0 / BPM          # seconds per beat
NBARS = 64                 # 4 sections x 16 bars
TAIL = 2.0                 # ring-out after the last bar
TOTAL = NBARS * 4 * BEAT + TAIL
OUT = os.path.dirname(os.path.abspath(__file__))

SECTIONS = [('A', 0), ('B', 16), ('Ap', 32), ('B', 48)]  # (name, start bar)

BASS_PROG = 38  # GM "Synth Bass 1" for the MIDI mirror of the bass patch


def mf(m):
    """MIDI note number -> frequency in Hz."""
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def rng_for(tag, tbeats):
    """Deterministic per-event noise seed (stable across versions/edits)."""
    return np.random.default_rng(zlib.crc32(f"{tag}:{tbeats:.4f}".encode()))


# --------------------------------------------------------------- musical data
# F natural minor: F G Ab Bb C Db Eb.  One chord per bar, 4-bar loop:
# Fm | Db | Ab | Eb  (i - VI - III - VII)
PROG = [
    dict(root=41, stab=[53, 56, 60], arp=[65, 68, 72, 77]),  # Fm : F3 Ab3 C4
    dict(root=37, stab=[53, 56, 61], arp=[61, 65, 68, 73]),  # Db : F3 Ab3 Db4
    dict(root=44, stab=[51, 56, 60], arp=[63, 68, 72, 75]),  # Ab : Eb3 Ab3 C4
    dict(root=39, stab=[51, 55, 58], arp=[63, 67, 70, 75]),  # Eb : Eb3 G3 Bb3
]

# The bass line (offsets in beats, duration in beats, semitone offset from root).
# This line is fixed: it is the same in every section.
BASS_LINE = [(0.5, 0.45, 0), (1.5, 0.45, 0), (2.5, 0.45, 0),
             (3.5, 0.25, 0), (3.75, 0.22, 12)]

# Verse melody: 4-bar motif, repeats 4x per 16-bar section. (bar, beat, midi, dur)
MELODY_A = [
    (0, 0.0, 65, 0.75), (0, 1.0, 68, 0.50), (0, 1.5, 67, 0.50), (0, 2.0, 65, 1.25),
    (1, 0.5, 61, 0.75), (1, 1.5, 63, 0.50), (1, 2.0, 65, 1.50),
    (2, 0.0, 68, 0.75), (2, 1.0, 72, 0.50), (2, 1.5, 70, 0.50), (2, 2.0, 68, 1.25),
    (3, 0.5, 67, 0.75), (3, 1.5, 65, 0.50), (3, 2.0, 63, 1.00), (3, 3.0, 60, 0.75),
]

# Chorus melody: higher register (C5-C6) and denser rhythm than the verse.
MELODY_B = [
    (0, 0.0, 77, 0.5), (0, 0.5, 80, 0.5), (0, 1.0, 84, 0.75),
    (0, 2.0, 80, 0.5), (0, 2.5, 79, 0.5), (0, 3.0, 77, 0.5), (0, 3.5, 75, 0.5),
    (1, 0.0, 73, 0.5), (1, 0.5, 77, 0.5), (1, 1.0, 80, 0.75),
    (1, 2.0, 77, 0.5), (1, 2.5, 75, 0.5), (1, 3.0, 73, 0.5), (1, 3.5, 72, 0.5),
    (2, 0.0, 72, 0.5), (2, 0.5, 75, 0.5), (2, 1.0, 79, 0.75),
    (2, 2.0, 80, 0.5), (2, 2.5, 79, 0.5), (2, 3.0, 75, 0.5), (2, 3.5, 72, 0.5),
    (3, 0.0, 75, 0.5), (3, 0.5, 79, 0.5), (3, 1.0, 82, 1.0),
    (3, 2.5, 80, 0.5), (3, 3.0, 79, 1.0),
]

ARP_IDX = [0, 1, 2, 3, 2, 1, 0, 1]  # chorus arp, 8th notes, up/down


# ------------------------------------------------------------------ sequencer
def build():
    """Return dict stem -> list of (time_beats, dur_beats, midi_or_None, gain)."""
    ev = {k: [] for k in ('kick', 'clap', 'chat', 'ohat', 'shak', 'ride',
                          'bass', 'stab', 'pad', 'lead', 'arp')}
    for sect, bar0 in SECTIONS:
        for b in range(16):
            bar = bar0 + b
            t0 = bar * 4.0
            ch = PROG[b % 4]

            # --- foundation (all sections)
            for k in range(4):
                ev['kick'].append((t0 + k, 0.1, None, 1.0))
            for k in (1, 3):
                ev['clap'].append((t0 + k, 0.1, None, 1.0))
            for (o, d, tr) in BASS_LINE:
                ev['bass'].append((t0 + o, d, ch['root'] + tr, 1.0))
            if b == 0:  # section-downbeat open-hat accent
                ev['ohat'].append((t0, 0.5, None, 1.15))

            if sect in ('A', 'Ap'):
                # --- verse hats: offbeat closed hats, sparse open hat
                for o in (0.5, 1.5, 2.5, 3.5):
                    ev['chat'].append((t0 + o, 0.1, None, 1.0))
                if b % 2 == 1:
                    ev['ohat'].append((t0 + 3.5, 0.4, None, 0.8))
                # --- two stabs per bar
                for o in (1.5, 3.5):
                    for m in ch['stab']:
                        ev['stab'].append((t0 + o, 0.35, m, 1.0))
                # --- verse melody (identical in A and A')
                for (mb, beat, m, d) in MELODY_A:
                    if b % 4 == mb:
                        ev['lead'].append((t0 + beat, d, m, 1.0))
                if sect == 'Ap':
                    # --- A' = busier drums, same melody
                    for o in (0.75, 1.75, 2.75, 3.75):
                        ev['chat'].append((t0 + o, 0.1, None, 0.55))
                    for i8 in range(8):
                        ev['ride'].append((t0 + i8 * 0.5, 0.2, None, 0.5))
                    if b % 4 == 3:
                        ev['clap'].append((t0 + 3.75, 0.1, None, 0.5))
            else:
                # --- chorus drums: denser hats + shaker
                for k in range(4):
                    ev['chat'].append((t0 + k, 0.1, None, 0.70))
                    ev['chat'].append((t0 + k + 0.25, 0.1, None, 0.45))
                    ev['chat'].append((t0 + k + 0.75, 0.1, None, 0.50))
                    ev['ohat'].append((t0 + k + 0.5, 0.4, None, 0.9))
                for i8 in range(8):
                    ev['shak'].append((t0 + i8 * 0.5, 0.15, None, 0.6))
                # --- chorus harmony: stabs on every offbeat + sustained pad
                for o in (0.5, 1.5, 2.5, 3.5):
                    for m in ch['stab']:
                        ev['stab'].append((t0 + o, 0.30, m, 1.0))
                for m in ch['stab']:
                    ev['pad'].append((t0, 4.0, m + 12, 1.0))
                # --- chorus arp (8ths) and melody
                for i8, idx in enumerate(ARP_IDX):
                    ev['arp'].append((t0 + i8 * 0.5, 0.22, ch['arp'][idx], 0.8))
                for (mb, beat, m, d) in MELODY_B:
                    if b % 4 == mb:
                        ev['lead'].append((t0 + beat, d, m, 1.0))
    return ev


# ------------------------------------------------------------------ synthesis
def tone_add(freq, n, bright_hz, roll, detunes=(0.0,), vib=0.0):
    """Band-limited additive oscillator, peak-normalized."""
    t = np.arange(n) / SR
    out = np.zeros(n)
    v = None
    if vib:
        v = 1.0 + vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1.0, t / 0.25)
    for d in detunes:
        f0 = freq * (1.0 + d)
        ph = 2 * np.pi * (np.cumsum(f0 * v) / SR if vib else f0 * t)
        K = max(1, int(min(bright_hz, 0.45 * SR) / f0))
        for k in range(1, K + 1):
            out += np.sin(k * ph + 0.7 * k) / k ** roll
    return out / (np.max(np.abs(out)) + 1e-9)


def _gate(n, dur, fade):
    """Ones for the note length, then a linear release fade."""
    g = np.ones(n)
    f0 = min(n - 1, int(dur * SR))
    g[f0:] = np.linspace(1.0, 0.0, n - f0)
    return g


def kick_hit(rng, gain):
    dur = 0.32
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 46.0 + 105.0 * np.exp(-t * 32.0)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8.5)
    out = body * (1 - np.exp(-t * 3000.0))
    click = np.diff(rng.standard_normal(int(0.004 * SR)), prepend=0.0)
    click /= (np.max(np.abs(click)) + 1e-9)
    out[:len(click)] += click * 0.35
    return out * gain


def clap_hit(rng, gain):
    dur = 0.32
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.diff(rng.standard_normal(n), prepend=0.0)
    x = np.convolve(x, np.ones(3) / 3.0, mode='same')
    x /= (np.max(np.abs(x)) + 1e-9)
    env = np.zeros(n)
    for st, a, rate in [(0.000, 1.00, 28.0), (0.011, 0.85, 28.0),
                        (0.022, 0.70, 28.0), (0.033, 0.95, 11.0)]:
        i = int(st * SR)
        env[i:] = np.maximum(env[i:], a * np.exp(-(t[i:] - st) * rate))
    return x * env * gain * 0.9


def chat_hit(rng, gain):
    dur = 0.07
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.diff(np.diff(rng.standard_normal(n), prepend=0.0), prepend=0.0)
    x /= (np.max(np.abs(x)) + 1e-9)
    return x * np.exp(-t * 70.0) * gain * 0.9


def ohat_hit(rng, gain):
    dur = 0.45
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.diff(np.diff(rng.standard_normal(n), prepend=0.0), prepend=0.0)
    x /= (np.max(np.abs(x)) + 1e-9)
    return x * np.exp(-t * 7.5) * gain * 0.8


def shak_hit(rng, gain):
    dur = 0.12
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.diff(rng.standard_normal(n), prepend=0.0)
    x /= (np.max(np.abs(x)) + 1e-9)
    env = (1 - np.exp(-t * 80.0)) * np.exp(-t * 30.0)
    return x * env * gain


def ride_hit(rng, gain):
    dur = 0.45
    n = int(dur * SR)
    t = np.arange(n) / SR
    tones = sum(np.sin(2 * np.pi * f * t) for f in (2510.0, 3357.0, 4870.0)) / 3.0
    noise = np.diff(rng.standard_normal(n), prepend=0.0)
    noise /= (np.max(np.abs(noise)) + 1e-9)
    x = 0.55 * tones + 0.45 * noise
    return x * np.exp(-t * 7.0) * gain * 0.8


def bass_note(freq, dur, gain):
    """v0 bass patch: two detuned saws + light sub, fairly bright."""
    n = int((dur + 0.06) * SR)
    t = np.arange(n) / SR
    body = tone_add(freq, n, 2400.0, 1.0, (-0.004, 0.004))
    sub = np.sin(2 * np.pi * freq * t)
    x = 0.75 * body + 0.5 * sub
    env = (1 - np.exp(-t * 900.0)) * np.exp(-t * 2.2)
    return x * env * _gate(n, dur, 0.06) * gain


def stab_note(freq, dur, gain):
    n = int((dur + 0.05) * SR)
    t = np.arange(n) / SR
    body = tone_add(freq, n, 3200.0, 1.25, (-0.003, 0.003))
    env = (1 - np.exp(-t * 700.0)) * np.exp(-t * 5.5)
    return body * env * _gate(n, dur, 0.05) * gain


def pad_note(freq, dur, gain):
    n = int((dur + 0.10) * SR)
    t = np.arange(n) / SR
    body = tone_add(freq, n, 2600.0, 1.4, (-0.006, 0.006))
    env = (1 - np.exp(-t / 0.15)) * np.exp(-t * 0.5)
    return body * env * _gate(n, dur, 0.10) * gain


def lead_note(freq, dur, gain):
    n = int((dur + 0.10) * SR)
    t = np.arange(n) / SR
    body = tone_add(freq, n, 4200.0, 1.15, (-0.002, 0.002), vib=0.004)
    env = (1 - np.exp(-t * 1200.0)) * (0.30 + 0.70 * np.exp(-t * 2.2))
    return body * env * _gate(n, dur, 0.10) * gain


def arp_note(freq, dur, gain):
    n = int((dur + 0.04) * SR)
    t = np.arange(n) / SR
    body = tone_add(freq, n, 2800.0, 1.4)
    env = (1 - np.exp(-t * 1500.0)) * np.exp(-t * 7.0)
    return body * env * _gate(n, dur, 0.04) * gain


# ------------------------------------------------------------------ rendering
def place(buf, t_sec, sig):
    i = int(round(t_sec * SR))
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[:j - i]


def render(ev):
    N = int(TOTAL * SR)
    stems = {k: np.zeros(N) for k in ev}
    for name, lst in ev.items():
        for (t, d, m, g) in lst:
            ts, ds = t * BEAT, d * BEAT
            if name == 'kick':
                sig = kick_hit(rng_for('kick', t), g)
            elif name == 'clap':
                sig = clap_hit(rng_for('clap', t), g)
            elif name == 'chat':
                sig = chat_hit(rng_for('chat', t), g)
            elif name == 'ohat':
                sig = ohat_hit(rng_for('ohat', t), g)
            elif name == 'shak':
                sig = shak_hit(rng_for('shak', t), g)
            elif name == 'ride':
                sig = ride_hit(rng_for('ride', t), g)
            elif name == 'bass':
                sig = bass_note(mf(m), ds, g)
            elif name == 'stab':
                sig = stab_note(mf(m), ds, g)
            elif name == 'pad':
                sig = pad_note(mf(m), ds, g)
            elif name == 'lead':
                sig = lead_note(mf(m), ds, g)
            else:
                sig = arp_note(mf(m), ds, g)
            place(stems[name], ts, sig)
    return stems


def mix(stems):
    N = len(next(iter(stems.values())))
    t = np.arange(N) / SR
    # sidechain-style pump keyed to the beat grid
    pump = 1.0 - 0.55 * np.exp(-np.mod(t, BEAT) / 0.085)
    for k in ('bass', 'stab', 'pad', 'arp'):
        stems[k] = stems[k] * pump

    L = np.zeros(N)
    R = np.zeros(N)

    def add(x, gl, gr):
        nonlocal L, R
        L += x * gl
        R += x * gr

    def dly(x, sec):
        d = int(sec * SR)
        y = np.zeros_like(x)
        y[d:] = x[:len(x) - d]
        return y

    add(stems['kick'], 0.95, 0.95)
    add(stems['clap'], 0.50, 0.50)
    add(stems['chat'], 0.13, 0.17)
    add(stems['ohat'], 0.18, 0.14)
    add(stems['shak'], 0.08, 0.12)
    add(stems['ride'], 0.11, 0.07)
    add(stems['bass'], 0.52, 0.52)
    add(stems['stab'], 0.26, 0.0)
    add(dly(stems['stab'], 0.009), 0.0, 0.26)
    add(stems['pad'], 0.22, 0.0)
    add(dly(stems['pad'], 0.013), 0.0, 0.22)
    add(stems['lead'], 0.30, 0.30)
    add(dly(stems['lead'], 0.75 * BEAT), 0.10, 0.0)   # dotted-8th echo L
    add(dly(stems['lead'], 1.50 * BEAT), 0.0, 0.055)  # 2nd tap R
    add(stems['arp'], 0.16, 0.11)
    add(dly(stems['arp'], 0.75 * BEAT), 0.0, 0.06)

    return 0.92 * np.tanh(1.25 * L), 0.92 * np.tanh(1.25 * R)


def write_wav(path, L, R):
    x = np.clip(np.stack([L, R], axis=1), -1.0, 1.0)
    pcm = (x * 32767.0).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ----------------------------------------------------------------------- MIDI
DRUM_NOTE = {'kick': 36, 'clap': 39, 'chat': 42, 'ohat': 46, 'shak': 70, 'ride': 51}
TPB = 480


def _vlq(v):
    b = [v & 0x7F]
    v >>= 7
    while v:
        b.append(0x80 | (v & 0x7F))
        v >>= 7
    return bytes(reversed(b))


def _track(msgs):
    msgs = sorted(msgs, key=lambda m: (m[0], 0 if (m[1][0] & 0xF0) == 0x80 else 1))
    data = bytearray()
    last = 0
    for tick, msg in msgs:
        data += _vlq(tick - last) + msg
        last = tick
    data += _vlq(0) + b'\xff\x2f\x00'
    return b'MTrk' + len(data).to_bytes(4, 'big') + bytes(data)


def _note_msgs(lst, chn, drum_note=None):
    msgs = []
    for (t, d, m, g) in lst:
        note = drum_note if drum_note is not None else m
        on = int(round(t * TPB))
        off = int(round((t + max(d, 0.05)) * TPB))
        vel = max(1, min(127, int(round(96 * g))))
        msgs.append((on, bytes([0x90 | chn, note, vel])))
        msgs.append((off, bytes([0x80 | chn, note, 0])))
    return msgs


def write_midi(path, ev):
    tempo = int(round(60_000_000 / BPM))
    meta = [(0, b'\xff\x51\x03' + tempo.to_bytes(3, 'big')),
            (0, b'\xff\x58\x04\x04\x02\x18\x08')]
    drums = []
    for name, dn in DRUM_NOTE.items():
        drums += _note_msgs(ev[name], 9, dn)
    tracks = [
        _track(meta),
        _track(drums),
        _track([(0, bytes([0xC0, BASS_PROG]))] + _note_msgs(ev['bass'], 0)),
        _track([(0, bytes([0xC1, 62]))] + _note_msgs(ev['stab'], 1)),
        _track([(0, bytes([0xC2, 81]))] + _note_msgs(ev['lead'], 2)),
        _track([(0, bytes([0xC3, 81]))] + _note_msgs(ev['arp'], 3)),
        _track([(0, bytes([0xC4, 89]))] + _note_msgs(ev['pad'], 4)),
    ]
    header = (b'MThd' + (6).to_bytes(4, 'big') + (1).to_bytes(2, 'big')
              + len(tracks).to_bytes(2, 'big') + TPB.to_bytes(2, 'big'))
    with open(path, 'wb') as f:
        f.write(header + b''.join(tracks))


# ---------------------------------------------------------------------- report
def report(stems, L, R):
    mixed = np.stack([L, R])
    print(f"duration {len(L) / SR:.2f}s  peak {np.max(np.abs(mixed)):.3f}  "
          f"rms {np.sqrt(np.mean(mixed ** 2)):.4f}")
    print("section RMS (lift check):")
    for name, bar0 in SECTIONS:
        i = int(bar0 * 4 * BEAT * SR)
        j = int((bar0 + 16) * 4 * BEAT * SR)
        print(f"  {name:2s} bars {bar0:2d}-{bar0 + 15:2d}: "
              f"{np.sqrt(np.mean(mixed[:, i:j] ** 2)):.4f}")
    print("stem RMS (scoping check):")
    for k in sorted(stems):
        print(f"  {k:5s} {np.sqrt(np.mean(stems[k] ** 2)):.6f}")


if __name__ == '__main__':
    events = build()
    stems = render(events)
    L, R = mix(stems)
    write_wav(os.path.join(OUT, 'fminor_house.wav'), L, R)
    write_midi(os.path.join(OUT, 'fminor_house.mid'), events)
    report(stems, L, R)
    print("wrote fminor_house.wav / fminor_house.mid to", OUT)
