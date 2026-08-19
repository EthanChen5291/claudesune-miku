#!/usr/bin/env python3
"""
Melodic trance track generator.
Form: A (intro/groove) B (chorus) C (breakdown) B (final chorus), 16 bars each.
138 BPM. Writes a General-MIDI file and a fully synthesized stereo WAV
(pure-numpy additive synthesis, no external audio deps).

Outputs (next to this script): melodic_trance.mid, melodic_trance.wav
"""

import os
import wave
import numpy as np

# ----------------------------------------------------------------------------
# CONFIG (edited per version)
# ----------------------------------------------------------------------------
TRANSPOSE = 0                 # semitones applied to all pitched material
KEY_NAME = "A minor"
KEY_SF = 0                    # sharps in MIDI key signature (A minor = 0)
FINAL_TRANSITION = "normal"   # "normal" = 2-bar riser + 1-bar fill into final B
                              # "big"    = 4-bar riser + 2-bar escalating fill

SR = 44100
BPM = 138.0
BEAT = 60.0 / BPM
PPQ = 480

PITCHED = {"bass", "pluck", "arp", "lead", "pad", "riser"}

# ----------------------------------------------------------------------------
# SONG DATA  (times/durations in beats; 4 beats per bar; sections 16 bars)
# Section starts: A=bar 0, B1=bar 16, C=bar 32, B2=bar 48. Total 64 bars.
# ----------------------------------------------------------------------------

# i - VI - III - VII in the minor key (Am F C G before transposition)
ROOTS = [33, 29, 36, 31]                     # bass roots (A1 F1 C2 G1)
VOIC = [[57, 60, 64],                        # Am: A3 C4 E4
        [57, 60, 65],                        # F:  A3 C4 F4
        [55, 60, 64],                        # C:  G3 C4 E4
        [55, 59, 62]]                        # G:  G3 B3 D4

# 8-bar lead phrase (start_beat, dur_beats, midi_note)
PHRASE = [
    (0.0, 0.75, 69), (0.75, 0.75, 72), (1.5, 0.5, 76), (2.0, 1.0, 74), (3.0, 1.0, 72),
    (4.0, 0.75, 72), (4.75, 0.75, 69), (5.5, 0.5, 77), (6.0, 1.0, 76), (7.0, 1.0, 74),
    (8.0, 0.75, 76), (8.75, 0.75, 79), (9.5, 0.5, 72), (10.0, 1.0, 76),
    (11.0, 0.5, 74), (11.5, 0.5, 72),
    (12.0, 0.75, 71), (12.75, 0.75, 74), (13.5, 0.5, 67), (14.0, 1.0, 71), (15.0, 1.0, 74),
    (16.0, 0.75, 69), (16.75, 0.75, 72), (17.5, 0.5, 76), (18.0, 1.0, 74), (19.0, 1.0, 72),
    (20.0, 0.75, 72), (20.75, 0.75, 69), (21.5, 0.5, 77), (22.0, 1.0, 76), (23.0, 1.0, 74),
    (24.0, 0.75, 76), (24.75, 0.75, 79), (25.5, 1.5, 81),
    (28.0, 1.0, 79), (29.0, 0.5, 76), (29.5, 0.5, 74), (30.0, 1.0, 71), (31.0, 1.0, 74),
]


def build_song():
    parts = {k: [] for k in ["kick", "fillkick", "clap", "snare", "hatc", "hato",
                             "crash", "bass", "pluck", "arp", "lead", "pad", "riser"]}

    def add(part, start, dur, note, vel):
        if part in PITCHED:
            note += TRANSPOSE
        parts[part].append((start, dur, note, int(vel)))

    def chord_of(bar):
        return bar % 4

    groove_bars = list(range(0, 15)) + list(range(16, 32)) + list(range(48, 64))

    # Kick: four on the floor (drops out on the fill bar before B1)
    for b in groove_bars:
        for k in range(4):
            add("kick", b * 4 + k, 0.25, 36, 120)

    # Offbeat bass on chord roots
    for b in groove_bars:
        r = ROOTS[chord_of(b)]
        for k in range(4):
            add("bass", b * 4 + k + 0.5, 0.4, r, 112)

    # Hats
    for b in range(0, 15):                                    # section A
        for k in range(4):
            add("hatc", b * 4 + k + 0.5, 0.2, 42, 78)
    for b in list(range(16, 32)) + list(range(48, 64)):       # choruses
        for k in range(4):
            for q, vv in [(0.0, 52), (0.25, 66), (0.75, 84)]:
                add("hatc", b * 4 + k + q, 0.12, 42, vv)
            add("hato", b * 4 + k + 0.5, 0.4, 46, 92)

    # Claps on 2 and 4 in choruses
    for b in list(range(16, 32)) + list(range(48, 64)):
        add("clap", b * 4 + 1, 0.3, 39, 106)
        add("clap", b * 4 + 3, 0.3, 39, 106)

    # Rolling offbeat-16th pluck stabs
    pluck_bars = list(range(8, 15)) + list(range(16, 32)) + list(range(48, 64))
    for b in pluck_bars:
        v = VOIC[chord_of(b)]
        for k in range(4):
            for q, vv in [(0.25, 84), (0.75, 100)]:
                for j, n in enumerate(v):
                    add("pluck", b * 4 + k + q, 0.6, n, vv - 4 * j)

    # 16th arpeggio
    arp_bars = (list(range(12, 15)) + list(range(16, 32)) +
                list(range(40, 48)) + list(range(48, 64)))
    for b in arp_bars:
        v = VOIC[chord_of(b)]
        seq = [v[0], v[1], v[2], v[0] + 12]
        base = 84
        if 40 <= b < 48:                       # breakdown build: ramp up
            base = 50 + (b - 40) * 6
        for k in range(4):
            for s in range(4):
                vel = base + (8 if s == 0 else 0) - (6 if s == 1 else 0)
                add("arp", b * 4 + k + s * 0.25, 0.35, seq[s], vel)

    # Pads: one chord per bar, richer voicing in the breakdown
    for b in range(0, 64):
        v = list(VOIC[chord_of(b)])
        vel = 66
        if 32 <= b < 48:
            v = [ROOTS[chord_of(b)] + 12] + v + [v[0] + 12]
            vel = 88
        for n in v:
            add("pad", b * 4, 4.0, n, vel)

    # Lead melody: both choruses (final chorus doubled an octave up)
    for start in [64, 96, 192, 224]:
        for (t, d, n) in PHRASE:
            add("lead", start + t, d, n, 108)
            if start >= 192:
                add("lead", start + t, d, n + 12, 84)

    # Breakdown: long emotive line (bars 32-39), then the phrase (bars 40-47)
    long_line = [72, 72, 76, 74, 72, 72, 76, 74]
    for i, n in enumerate(long_line):
        add("lead", (32 + i) * 4, 4.0, n, 72)
    for (t, d, n) in PHRASE:
        add("lead", 160 + t, d, n, 92)

    # Crashes on both chorus downbeats
    add("crash", 64, 8, 49, 118)
    add("crash", 192, 8, 49, 118)

    # --- Transition into first chorus (B1): 2-bar riser + 1-bar snare fill ---
    add("riser", 56, 8, 69, 100)
    for i in range(8):
        add("snare", 60 + i * 0.5, 0.25, 38, 62 + i * 7.5)

    # --- Transition into final chorus (B2) ---
    if FINAL_TRANSITION == "normal":
        add("riser", 184, 8, 69, 100)
        for i in range(8):
            add("snare", 188 + i * 0.5, 0.25, 38, 62 + i * 7.5)
    else:  # "big": 4-bar riser, 2-bar escalating drum fill with kick roll
        add("riser", 176, 16, 69, 112)
        for i in range(8):                     # bar 46: eighth-note snares
            add("snare", 184 + i * 0.5, 0.25, 38, 52 + i * 4)
        for i in range(16):                    # bar 47: sixteenth-note roll
            add("snare", 188 + i * 0.25, 0.2, 38, 72 + i * 3.4)
        for k in range(4):                     # bar 47: driving kick roll
            add("fillkick", 188 + k, 0.25, 36, 96 + k * 8)

    # Closing hit at bar 64
    add("crash", 256, 8, 49, 112)
    add("bass", 256, 8, 33, 100)
    for n in [45, 57, 60, 64, 69]:
        add("pad", 256, 8, n, 92)

    return parts


# ----------------------------------------------------------------------------
# SYNTHESIS
# ----------------------------------------------------------------------------

def m2f(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def _noise(n, seed):
    return np.random.RandomState(seed).randn(n)


def additive(freq, dur, kmax, rolloff, decay, hfdecay, attack, detunes, rel=0.02):
    """Band-limited saw-ish additive tone with per-harmonic decay (pluck filter feel)."""
    n = max(16, int(dur * SR))
    t = np.arange(n) / SR
    out = np.zeros(n)
    for dc in detunes:
        f = freq * 2.0 ** (dc / 1200.0)
        kk = max(1, min(kmax, int(0.45 * SR / f)))
        for k in range(1, kk + 1):
            env = np.exp(-t * (decay + hfdecay * (k - 1)))
            out += np.sin(2 * np.pi * f * k * t) * (env / (k ** rolloff))
    if attack > 0:
        out *= np.clip(t / attack, 0.0, 1.0)
    nr = max(4, int(rel * SR))
    out[-nr:] *= np.linspace(1.0, 0.0, nr)
    return out / len(detunes)


def s_kick(_f, _d):
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 42 + 118 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = _noise(n, 6) * np.exp(-t * 300) * 0.4
    return body + click


def s_snare(_f, _d):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 18) * 0.5
    nz = _noise(n, 3)
    nz = 0.6 * nz + 0.4 * np.concatenate([[0.0], np.diff(nz)]) * 4
    return tone + nz * np.exp(-t * 20) * 0.55


def s_clap(_f, _d):
    n = int(0.30 * SR)
    t = np.arange(n) / SR
    nz = _noise(n, 2)
    nz = 0.5 * nz + 0.5 * np.concatenate([[0.0], np.diff(nz)]) * 4
    env = np.zeros(n)
    for off in [0.0, 0.011, 0.023, 0.034]:
        tt = np.clip(t - off, 0, None)
        env += np.exp(-tt * 70) * (t >= off)
    env += np.exp(-t * 12) * 0.6
    return nz * env * 0.35


def s_hatc(_f, _d):
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    nz = np.concatenate([[0.0], np.diff(_noise(n, 1))]) * 4
    return nz * np.exp(-t * 90)


def s_hato(_f, _d):
    n = int(0.40 * SR)
    t = np.arange(n) / SR
    nz = np.concatenate([[0.0], np.diff(_noise(n, 1))]) * 4
    return nz * np.exp(-t * 9)


def s_crash(_f, _d):
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    nz = np.concatenate([[0.0], np.diff(_noise(n, 4))]) * 4
    return nz * np.exp(-t * 1.9) * 0.7


def s_bass(freq, dur):
    sig = additive(freq, dur, kmax=12, rolloff=1.0, decay=3.0, hfdecay=4.0,
                   attack=0.002, detunes=(0.0,))
    n = len(sig)
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * freq * t) * np.exp(-t * 4) * 0.8
    return sig + sub


def s_pluck(freq, dur):
    return additive(freq, dur, kmax=12, rolloff=1.0, decay=6.0, hfdecay=9.0,
                    attack=0.002, detunes=(-6.0, 6.0))


def s_arp(freq, dur):
    return additive(freq, dur, kmax=8, rolloff=1.0, decay=7.0, hfdecay=10.0,
                    attack=0.002, detunes=(0.0,))


def s_lead(freq, dur):
    return additive(freq, dur, kmax=14, rolloff=1.0, decay=0.8, hfdecay=1.1,
                    attack=0.005, detunes=(-9.0, 0.0, 9.0), rel=0.04)


def s_pad(freq, dur):
    return additive(freq, dur, kmax=7, rolloff=1.2, decay=0.15, hfdecay=1.2,
                    attack=min(0.6, dur * 0.35), detunes=(-5.0, 5.0), rel=0.25)


def s_riser(root_midi, dur):
    """Noise sweep + tonal sweep from an octave below to an octave above the root."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    nz = _noise(n, 7)
    bright = np.concatenate([[0.0], np.diff(nz)]) * 4
    noise_part = nz * (0.25 + 0.75 * x ** 2) * 0.5 + bright * (x ** 3) * 0.8
    f0 = m2f(root_midi)
    f = f0 * 2.0 ** (2 * x - 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.4 * np.sin(2 * ph + 0.5)
    env = x ** 2.2
    sig = noise_part * env * 0.9 + tone * env * 0.45
    nr = int(0.01 * SR)
    sig[-nr:] *= np.linspace(1.0, 0.0, nr)
    return sig


SYNTHS = {"kick": s_kick, "fillkick": s_kick, "snare": s_snare, "clap": s_clap,
          "hatc": s_hatc, "hato": s_hato, "crash": s_crash, "bass": s_bass,
          "pluck": s_pluck, "arp": s_arp, "lead": s_lead, "pad": s_pad}

GAIN = {"kick": 0.90, "fillkick": 0.90, "snare": 0.50, "clap": 0.50,
        "hatc": 0.22, "hato": 0.28, "crash": 0.45, "bass": 0.70,
        "pluck": 0.30, "arp": 0.22, "lead": 0.50, "pad": 0.40, "riser": 0.60}

_CACHE = {}


def synth(part, note, dur_sec):
    key = (part, note, round(dur_sec, 5))
    if key not in _CACHE:
        if part == "riser":
            _CACHE[key] = s_riser(note, dur_sec)
        else:
            _CACHE[key] = SYNTHS[part](m2f(note), dur_sec)
    return _CACHE[key]


def render(parts, total_beats):
    ntot = int((total_beats * BEAT + 3.0) * SR)
    buses = {b: np.zeros((ntot, 2)) for b in ["drums", "bass", "music", "lead", "fx"]}

    def place(bus, sig, start_sec, amp, pan=0.0):
        i0 = int(start_sec * SR)
        i1 = min(i0 + len(sig), ntot)
        if i1 <= i0:
            return
        seg = sig[: i1 - i0]
        gl = amp * np.cos((pan + 1) * np.pi / 4)
        gr = amp * np.sin((pan + 1) * np.pi / 4)
        buses[bus][i0:i1, 0] += seg * gl
        buses[bus][i0:i1, 1] += seg * gr

    route = {"kick": "drums", "fillkick": "drums", "snare": "drums", "clap": "drums",
             "hatc": "drums", "hato": "drums", "crash": "fx", "riser": "fx",
             "bass": "bass", "pluck": "music", "arp": "music", "pad": "music",
             "lead": "lead"}

    for part, events in parts.items():
        for (start, dur, note, vel) in events:
            sig = synth(part, note, dur * BEAT)
            amp = GAIN[part] * (vel / 127.0) ** 1.6
            pan = 0.0
            if part == "pluck":
                pan = 0.25 if int(start * 4) % 2 else -0.25
            elif part == "arp":
                pan = 0.35 if int(start * 4) % 2 else -0.35
            elif part == "hatc":
                pan = 0.2
            elif part == "hato":
                pan = -0.15
            t0 = start * BEAT
            if part == "pad":  # Haas widening
                place(route[part], sig, t0, amp, -0.3)
                place(route[part], sig, t0 + 0.012, amp * 0.8, 0.3)
            else:
                place(route[part], sig, t0, amp, pan)

    # Ping-pong dotted-eighth delay on the lead
    d = int(0.75 * BEAT * SR)
    mono = buses["lead"].mean(axis=1).copy()
    for i, g in enumerate([0.30, 0.19, 0.11]):
        off = d * (i + 1)
        buses["lead"][off:, i % 2] += mono[:-off] * g

    # Sidechain pump driven by the groove kick only
    pump = np.ones(ntot)
    win = int(0.55 * BEAT * SR)
    duck = 1.0 - 0.62 * np.exp(-np.arange(win) / (0.075 * SR))
    for (start, dur, note, vel) in parts["kick"]:
        i0 = int(start * BEAT * SR)
        i1 = min(i0 + win, ntot)
        pump[i0:i1] = np.minimum(pump[i0:i1], duck[: i1 - i0])

    mix = (buses["drums"] * 0.9 + buses["fx"] * 0.8 +
           (buses["bass"] * 0.85 + buses["music"] * 0.7 + buses["lead"] * 0.75) *
           pump[:, None])
    return np.tanh(mix * 1.05) * 0.9


def write_wav(path, stereo):
    data = (np.clip(stereo, -1.0, 1.0) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


# ----------------------------------------------------------------------------
# MIDI
# ----------------------------------------------------------------------------

def vlq(v):
    out = [v & 0x7F]
    v >>= 7
    while v:
        out.append((v & 0x7F) | 0x80)
        v >>= 7
    return bytes(reversed(out))


def write_midi(path, parts, total_beats):
    def track_chunk(events):
        events.sort(key=lambda e: (e[0], e[1]))
        data = bytearray()
        last = 0
        for (tick, _order, msg) in events:
            data += vlq(tick - last) + msg
            last = tick
        data += vlq(0) + b"\xff\x2f\x00"
        return b"MTrk" + len(data).to_bytes(4, "big") + bytes(data)

    tracks = []

    # Conductor track
    tempo = round(60000000 / BPM)
    ev = [(0, 0, b"\xff\x51\x03" + tempo.to_bytes(3, "big")),
          (0, 0, b"\xff\x58\x04\x04\x02\x18\x08"),
          (0, 0, b"\xff\x59\x02" + bytes([KEY_SF & 0xFF, 1])),
          (0, 0, b"\xff\x03" + bytes([len(b"Melodic Trance")]) + b"Melodic Trance")]
    tracks.append(track_chunk(ev))

    # Drums (channel 10)
    drum_parts = ["kick", "fillkick", "snare", "clap", "hatc", "hato", "crash"]
    ev = [(0, 0, b"\xff\x03\x05Drums")]
    for p in drum_parts:
        for (start, dur, note, vel) in parts[p]:
            on = round(start * PPQ)
            off = round((start + dur) * PPQ)
            ev.append((on, 1, bytes([0x99, note, vel])))
            ev.append((off, 0, bytes([0x89, note, 0])))
    tracks.append(track_chunk(ev))

    # Pitched tracks
    spec = [("bass", 0, 38, "Bass"), ("pluck", 1, 81, "Pluck"),
            ("arp", 2, 81, "Arp"), ("lead", 3, 81, "Lead"),
            ("pad", 4, 88, "Pad"), ("riser", 5, 95, "Riser FX")]
    for part, ch, prog, name in spec:
        ev = [(0, 0, b"\xff\x03" + bytes([len(name)]) + name.encode()),
              (0, 0, bytes([0xC0 | ch, prog]))]
        for (start, dur, note, vel) in parts[part]:
            on = round(start * PPQ)
            off = round((start + dur) * PPQ)
            ev.append((on, 1, bytes([0x90 | ch, note, vel])))
            ev.append((off, 0, bytes([0x80 | ch, note, 0])))
            if part == "riser":  # expression swell
                for i in range(9):
                    tick = on + round((off - on) * i / 8)
                    ev.append((tick, 1, bytes([0xB0 | ch, 11, 20 + round(107 * i / 8)])))
        tracks.append(track_chunk(ev))

    header = (b"MThd" + (6).to_bytes(4, "big") + (1).to_bytes(2, "big") +
              len(tracks).to_bytes(2, "big") + PPQ.to_bytes(2, "big"))
    with open(path, "wb") as f:
        f.write(header)
        for t in tracks:
            f.write(t)


# ----------------------------------------------------------------------------

def main():
    out_dir = os.path.dirname(os.path.abspath(__file__))
    parts = build_song()
    total_beats = 264  # 64 bars + ring-out
    write_midi(os.path.join(out_dir, "melodic_trance.mid"), parts, total_beats)
    audio = render(parts, total_beats)
    write_wav(os.path.join(out_dir, "melodic_trance.wav"), audio)
    n_events = sum(len(v) for v in parts.values())
    print(f"key={KEY_NAME} transpose={TRANSPOSE:+d} final_transition={FINAL_TRANSITION}")
    print(f"events={n_events} duration={len(audio)/SR:.1f}s peak={np.abs(audio).max():.3f}")


if __name__ == "__main__":
    main()
