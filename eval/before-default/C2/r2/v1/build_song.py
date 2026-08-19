#!/usr/bin/env python3
"""
Seven Over -- instrumental groove.

  * 7/8 (grouped 2+2+3) at 140 BPM
  * D dorian
  * Form: A B C A, 8-bar sections (+ one-bar coda hit)
  * C is a bridge that withholds the bass entirely; the bass returning
    in the final A is the payoff.

Outputs (next to this script):
  seven_over.mid  -- standard MIDI file (format 1, GM programs)
  seven_over.wav  -- rendered stereo audio (44.1 kHz / 16-bit) via a
                     small additive/subtractive softsynth (numpy only)

Run:  python3 build_song.py
"""

import os
import wave
import numpy as np

# ---------------------------------------------------------------- timing ---

BPM = 140.0
EIGHTH = 60.0 / BPM / 2.0        # seconds per eighth note (~0.2143 s)
BAR = 7                          # eighths per bar of 7/8
SECTION_BARS = 8
TPQ = 480                        # MIDI ticks per quarter note
TICKS_PER_EIGHTH = TPQ // 2
SR = 44100

# --------------------------------------------------------------- harmony ---
# D dorian: D E F G A B C.  All chords diatonic to the mode.

CHORDS = {
    #            bass root  3rd   keys voicing (midi)
    'Dm7':   dict(root=38, third=3, voicing=[62, 65, 69, 72]),
    'G7':    dict(root=43, third=4, voicing=[59, 62, 65, 67]),
    'Cmaj7': dict(root=36, third=4, voicing=[60, 64, 67, 71]),
    'Fmaj7': dict(root=41, third=4, voicing=[60, 64, 65, 69]),
    'Am7':   dict(root=45, third=3, voicing=[57, 60, 64, 67]),
    'Em7':   dict(root=40, third=3, voicing=[59, 62, 64, 67]),
    'G7sus': dict(root=43, third=5, voicing=[60, 62, 65, 67]),
}

SECTIONS = [
    ('A', ['Dm7', 'Dm7', 'G7', 'Dm7', 'Dm7', 'Dm7', 'Cmaj7', 'Dm7']),
    ('B', ['Fmaj7', 'G7', 'Am7', 'G7', 'Fmaj7', 'G7', 'Em7', 'Am7']),
    ('C', ['Fmaj7', 'Em7', 'Fmaj7', 'G7sus', 'Am7', 'G7', 'Fmaj7', 'G7sus']),
    ('A', ['Dm7', 'Dm7', 'G7', 'Dm7', 'Dm7', 'Dm7', 'Cmaj7', 'Dm7']),
]

# ------------------------------------------------------------------ lead ---
# Each section melody: 8 bars, each bar a list of (pos_in_eighths, midi, dur, vel).

LEAD_A = [
    [(0, 74, 1, 100), (1, 77, 0.5, 86), (1.5, 79, 0.5, 88), (2, 81, 1.5, 102),
     (4, 79, 1, 94), (5, 77, 1, 90), (6, 76, 1, 88)],
    [(0, 74, 2, 96), (4, 72, 1, 88), (5, 74, 0.5, 84), (5.5, 76, 0.5, 86),
     (6, 77, 1, 92)],
    [(0, 79, 1.5, 100), (2, 83, 1, 98), (3, 81, 1, 94), (4, 79, 2, 96),
     (6, 77, 1, 88)],
    [(0, 76, 1, 90), (1, 74, 1, 88), (2, 76, 1.5, 92), (4, 74, 2.5, 95)],
    [(0, 74, 1, 100), (1, 77, 0.5, 86), (1.5, 79, 0.5, 88), (2, 81, 1.5, 102),
     (4, 84, 1, 100), (5, 83, 0.5, 92), (5.5, 81, 0.5, 90), (6, 79, 1, 92)],
    [(0, 81, 2, 98), (4, 79, 1, 90), (5, 77, 1, 88), (6, 74, 1, 86)],
    [(0, 76, 1, 92), (1, 79, 1, 94), (2, 84, 1.5, 102), (4, 83, 1, 96),
     (5, 81, 1, 90), (6, 79, 1, 88)],
    [(0, 77, 1, 92), (1, 76, 1, 88), (2, 74, 3.5, 100)],
]

LEAD_B = [
    [(0, 81, 2, 100), (2, 84, 1, 98), (3, 83, 1, 94), (4, 81, 1.5, 96),
     (6, 79, 1, 90)],
    [(0, 79, 1, 94), (1, 81, 0.5, 88), (1.5, 83, 0.5, 90), (2, 84, 2, 102),
     (4, 83, 1, 94), (5, 81, 1, 92), (6, 79, 1, 88)],
    [(0, 81, 3, 100), (4, 77, 1, 88), (5, 79, 1, 90), (6, 81, 1, 92)],
    [(0, 83, 2, 98), (2, 81, 1, 92), (3, 79, 1, 90), (4, 77, 2, 94),
     (6, 76, 1, 86)],
    [(0, 81, 1, 98), (1, 84, 1, 100), (2, 86, 2, 104), (4, 84, 1, 96),
     (5, 83, 1, 92), (6, 81, 1, 90)],
    [(0, 79, 1.5, 94), (2, 83, 1.5, 98), (4, 84, 1, 100), (5, 83, 0.5, 90),
     (5.5, 81, 0.5, 88), (6, 79, 1, 88)],
    [(0, 76, 2, 92), (2, 79, 1, 90), (3, 81, 1, 92), (4, 83, 2, 96),
     (6, 84, 1, 94)],
    [(0, 81, 2, 98), (2, 79, 1, 90), (3, 77, 1, 88), (4, 76, 1.5, 86),
     (6, 76, 1, 84)],
]

LEAD_C = [
    [(0, 84, 4, 80)],
    [(4, 83, 3, 76)],
    [(0, 81, 4, 78)],
    [(4, 79, 2, 74), (6, 81, 1, 76)],
    [(0, 84, 3, 82)],
    [(2, 83, 2, 76)],
    [(0, 86, 4, 84)],
    [],  # bar 8: silence under the drum build -> tension into the final A
]

LEAD_BY_SECTION = {'A': LEAD_A, 'B': LEAD_B, 'C': LEAD_C}

# ---------------------------------------------------------------- rhythm ---

HAT_VELS = [92, 64, 84, 64, 88, 66, 72]      # accents on the 2+2+3 group starts
HAT_VELS_C = [76, 50, 66, 50, 70, 52, 58]

# Swing/shuffle applied to the hi-hats ONLY: within each pair of eighths,
# the off-eighth (odd position in the bar) is delayed by this many eighths.
# 0.30 ~ a 65% shuffle. Every other instrument stays straight.
HAT_SWING = 0.30


def _hat_pos(i):
    return i + HAT_SWING if i % 2 == 1 else i


def add_drums(section, bi, b, add, final_a):
    """One bar of drums starting at absolute eighth b."""
    if section == 'C':
        # bridge: airy -- hats + sidestick, almost no kick, big build in bar 8
        for i, v in enumerate(HAT_VELS_C):
            add('hat_closed', b + _hat_pos(i), 0.5, 0, v)
        add('stick', b + 2, 0.5, 0, 72)
        add('stick', b + 6, 0.5, 0, 62)
        if bi in (0, 4):
            add('kick', b, 0.5, 0, 88)
        if bi == 7:
            for k, pos in enumerate([3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5]):
                add('snare', b + pos, 0.4, 0, 46 + 9 * k)
        return

    for i, v in enumerate(HAT_VELS):
        if i == 6 and bi in (3, 7):
            add('hat_open', b + _hat_pos(i), 0.9, 0, 88)
        else:
            add('hat_closed', b + _hat_pos(i), 0.5, 0, v)
    add('kick', b, 0.5, 0, 116)
    add('kick', b + 4, 0.5, 0, 106)
    if section == 'B':
        add('kick', b + 2.5, 0.5, 0, 96)
    elif bi in (1, 3, 5):
        add('kick', b + 5.5, 0.5, 0, 90)
    add('snare', b + 2, 0.5, 0, 108)
    add('snare', b + 6, 0.5, 0, 92)
    if bi in (2, 6):
        add('snare', b + 3.5, 0.4, 0, 44)
    if final_a and bi == 0:
        add('crash', b, 0.5, 0, 104)   # the payoff downbeat


def add_bass(section, bi, b, chord, add):
    r, t3 = chord['root'], chord['third']
    if section == 'B':
        pat = [(0, r, 2, 110), (2, r, 1, 88), (3, r + t3, 1, 96),
               (4, r + 7, 2, 104), (6, r + 10, 1, 96)]
    elif bi in (3, 7):   # turnaround climb
        pat = [(0, r, 1.5, 112), (2, r + 7, 1, 100), (3, r + 5, 1, 96),
               (4, r + 7, 1, 102), (5, r + 10, 1, 104), (6, r + 12, 1, 108)]
    else:
        pat = [(0, r, 1.5, 112), (2, r + 7, 1, 102), (3, r + t3, 1, 98),
               (4, r, 1.5, 110), (5.5, r + 10, 0.5, 88), (6, r + 12, 1, 100)]
    for pos, p, d, v in pat:
        add('bass', b + pos, d, p, v)


def add_keys(section, bi, b, chord, add):
    v = chord['voicing']
    if section == 'C':
        # sustained airy pad, extra octave on top
        for p in v:
            add('keys', b, 6.5, p, 66)
        add('keys', b, 6.5, v[-1] + 12, 58)
        return
    if section == 'B':
        stabs = [(0, 1.5, 94), (2.5, 0.5, 72), (4, 1, 90), (6, 1, 84)]
    elif bi % 2 == 0:
        stabs = [(0, 1, 92), (4, 2, 88)]
    else:
        stabs = [(0, 0.5, 90), (2.5, 0.5, 72), (4, 1, 86), (6, 1, 80)]
    for pos, d, vel in stabs:
        for p in v:
            add('keys', b + pos, d, p, vel)


# ------------------------------------------------------------ song build ---

def make_song():
    """Return the full piece as a flat list of note events.

    Event: dict(instr, start [eighths], dur [eighths], pitch [midi], vel).
    """
    events = []

    def add(instr, start, dur, pitch, vel):
        events.append(dict(instr=instr, start=float(start), dur=float(dur),
                           pitch=int(pitch), vel=int(vel)))

    for si, (name, chords) in enumerate(SECTIONS):
        base = si * SECTION_BARS * BAR
        final_a = (si == len(SECTIONS) - 1)
        for bi, ch in enumerate(chords):
            b = base + bi * BAR
            chord = CHORDS[ch]
            add_drums(name, bi, b, add, final_a)
            if name != 'C':                       # the bridge withholds bass
                add_bass(name, bi, b, chord, add)
            add_keys(name, bi, b, chord, add)
        for bi, bar in enumerate(LEAD_BY_SECTION[name]):
            for pos, pitch, dur, vel in bar:
                add('lead', base + bi * BAR + pos, dur, pitch, vel)

    # one-bar coda hit: everything lands on D together
    t = len(SECTIONS) * SECTION_BARS * BAR
    add('kick', t, 0.5, 0, 116)
    add('crash', t, 0.5, 0, 106)
    add('bass', t, 4, 38, 110)
    for p in CHORDS['Dm7']['voicing']:
        add('keys', t, 6, p, 82)
    add('lead', t, 5, 74, 90)
    return events


# ------------------------------------------------------------ MIDI writer ---

MIDI_CHAN = {'bass': 0, 'keys': 1, 'lead': 2}
MIDI_PROG = {'bass': 33, 'keys': 4, 'lead': 80}   # fingered bass, EP1, square lead
DRUM_NOTE = {'kick': 36, 'stick': 37, 'snare': 38,
             'hat_closed': 42, 'hat_open': 46, 'crash': 49}


def write_midi(events, path):
    def vlq(n):
        out = [n & 0x7F]
        n >>= 7
        while n:
            out.append(0x80 | (n & 0x7F))
            n >>= 7
        return bytes(reversed(out))

    def serialize(track_events):
        track_events.sort(key=lambda e: (e[0], e[1]))
        data = bytearray()
        last = 0
        for tick, _prio, msg in track_events:
            data += vlq(tick - last) + msg
            last = tick
        data += vlq(0) + b'\xff\x2f\x00'
        return b'MTrk' + len(data).to_bytes(4, 'big') + bytes(data)

    meta = [
        (0, 0, b'\xff\x03' + bytes([10]) + b'Seven Over'),
        (0, 0, b'\xff\x51\x03' + int(60_000_000 / BPM).to_bytes(3, 'big')),
        (0, 0, b'\xff\x58\x04' + bytes([7, 3, 24, 8])),   # 7/8
    ]
    per = {'bass': [], 'keys': [], 'lead': [], 'drums': []}
    for name in ('bass', 'keys', 'lead'):
        per[name].append((0, 0, bytes([0xC0 | MIDI_CHAN[name], MIDI_PROG[name]])))

    for ev in events:
        instr = ev['instr']
        on = int(round(ev['start'] * TICKS_PER_EIGHTH))
        if instr in MIDI_CHAN:
            ch, note, tr = MIDI_CHAN[instr], ev['pitch'], per[instr]
            off = int(round((ev['start'] + ev['dur']) * TICKS_PER_EIGHTH))
        else:
            ch, note, tr = 9, DRUM_NOTE[instr], per['drums']
            off = on + TICKS_PER_EIGHTH // 4
        tr.append((on, 1, bytes([0x90 | ch, note, ev['vel']])))
        tr.append((max(off, on + 1), 0, bytes([0x80 | ch, note, 0])))

    tracks = [serialize(meta)] + [serialize(per[k]) for k in ('bass', 'keys', 'lead', 'drums')]
    with open(path, 'wb') as f:
        f.write(b'MThd' + (6).to_bytes(4, 'big') + (1).to_bytes(2, 'big')
                + len(tracks).to_bytes(2, 'big') + TPQ.to_bytes(2, 'big'))
        for t in tracks:
            f.write(t)


# -------------------------------------------------------------- softsynth ---

def _mtof(p):
    return 440.0 * 2.0 ** ((p - 69) / 12.0)


def _adsr(n, attack, release, sustain_curve=None):
    env = np.ones(n)
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    env[:a] = np.linspace(0, 1, a)
    if r < n:
        env[-r:] *= np.linspace(1, 0, r)
    else:
        env *= np.linspace(1, 0, n)
    if sustain_curve is not None:
        env *= sustain_curve
    return env


def synth_bass(freq, dur, rng):
    n = int((dur + 0.10) * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for h in range(1, 9):
        sig += (1.0 / h) * np.exp(-0.30 * (h - 1)) * np.sin(2 * np.pi * freq * h * t)
    sus = 0.72 + 0.28 * np.exp(-t * 6.0)
    sig = np.tanh(1.6 * sig) * _adsr(n, 0.008, 0.06, sus)
    return sig


def synth_keys(freq, dur, rng):
    n = int((dur + 0.35) * SR)
    t = np.arange(n) / SR
    sig = (1.00 * np.exp(-t * 2.6) * np.sin(2 * np.pi * freq * t)
           + 0.40 * np.exp(-t * 4.5) * np.sin(2 * np.pi * freq * 2 * t)
           + 0.15 * np.exp(-t * 6.0) * np.sin(2 * np.pi * freq * 3 * t)
           + 0.08 * np.exp(-t * 9.0) * np.sin(2 * np.pi * freq * 4.2 * t))
    return sig * _adsr(n, 0.004, 0.15)


def synth_lead(freq, dur, rng):
    n = int((dur + 0.12) * SR)
    t = np.arange(n) / SR
    vib_ramp = np.minimum(t / 0.25, 1.0)
    f_inst = freq * (1.0 + 0.007 * vib_ramp * np.sin(2 * np.pi * 5.3 * t))
    phase = 2 * np.pi * np.cumsum(f_inst) / SR
    sig = (np.sin(phase) + 0.15 * np.sin(2 * phase)
           + 0.35 * np.sin(3 * phase) + 0.12 * np.sin(5 * phase))
    sus = 0.62 + 0.38 * np.exp(-t * 0.9)
    return sig * _adsr(n, 0.015, 0.08, sus)


def synth_kick(freq, dur, rng):
    n = int(0.34 * SR)
    t = np.arange(n) / SR
    f_inst = 42 + 85 * np.exp(-t / 0.045)
    body = np.sin(2 * np.pi * np.cumsum(f_inst) / SR) * np.exp(-t * 17)
    click = rng.standard_normal(n) * np.exp(-t * 380)
    click = np.diff(click, prepend=0.0) * 0.25
    return body + click


def synth_snare(freq, dur, rng):
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    noise = np.diff(rng.standard_normal(n), prepend=0.0)
    sig = (0.75 * noise * np.exp(-t * 19)
           + 0.45 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 27)
           + 0.20 * np.sin(2 * np.pi * 286 * t) * np.exp(-t * 34))
    return sig


def synth_stick(freq, dur, rng):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    noise = np.diff(rng.standard_normal(n), prepend=0.0)
    return (0.6 * np.sin(2 * np.pi * 900 * t) * np.exp(-t * 90)
            + 0.5 * noise * np.exp(-t * 120))


def synth_hat_closed(freq, dur, rng):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.diff(np.diff(noise, prepend=0.0), prepend=0.0)
    return noise * np.exp(-t * 65) * 0.5


def synth_hat_open(freq, dur, rng):
    n = int(0.50 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.diff(np.diff(noise, prepend=0.0), prepend=0.0)
    return noise * np.exp(-t * 6.5) * 0.45


def synth_crash(freq, dur, rng):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    noise = np.diff(rng.standard_normal(n), prepend=0.0)
    return noise * np.exp(-t * 2.4) * 0.55


SYNTHS = {
    'bass': synth_bass, 'keys': synth_keys, 'lead': synth_lead,
    'kick': synth_kick, 'snare': synth_snare, 'stick': synth_stick,
    'hat_closed': synth_hat_closed, 'hat_open': synth_hat_open,
    'crash': synth_crash,
}
GAIN = {
    'bass': 0.60, 'keys': 0.17, 'lead': 0.40,
    'kick': 0.95, 'snare': 0.55, 'stick': 0.40,
    'hat_closed': 0.60, 'hat_open': 0.55, 'crash': 0.50,
}
PAN = {
    'bass': 0.0, 'keys': -0.28, 'lead': 0.18,
    'kick': 0.0, 'snare': 0.05, 'stick': -0.22,
    'hat_closed': 0.32, 'hat_open': 0.32, 'crash': 0.0,
}
INSTR_ID = {k: i for i, k in enumerate(sorted(SYNTHS))}


def render_wav(events, path):
    end = max(ev['start'] + ev['dur'] for ev in events)
    n_total = int((end * EIGHTH + 3.0) * SR)
    buses = {'mix': np.zeros((n_total, 2)),
             'lead': np.zeros((n_total, 2)),
             'bass': np.zeros((n_total, 2))}
    counters = {k: 0 for k in SYNTHS}

    for ev in events:
        instr = ev['instr']
        idx = counters[instr]
        counters[instr] += 1
        rng = np.random.default_rng(1_000_003 * (INSTR_ID[instr] + 1) + idx)
        freq = _mtof(ev['pitch']) if instr in ('bass', 'keys', 'lead') else 0.0
        sig = SYNTHS[instr](freq, ev['dur'] * EIGHTH, rng)
        sig = sig * GAIN[instr] * (ev['vel'] / 127.0) ** 1.5
        p = PAN[instr]
        l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
        s0 = int(ev['start'] * EIGHTH * SR)
        s1 = min(s0 + len(sig), n_total)
        bus = buses.get(instr, buses['mix']) if instr in ('lead', 'bass') else buses['mix']
        bus[s0:s1, 0] += sig[:s1 - s0] * l
        bus[s0:s1, 1] += sig[:s1 - s0] * r

    # bridge check: the bass bus must be silent across section C
    c0, c1 = int((2 * SECTION_BARS * BAR * EIGHTH + 0.4) * SR), int(3 * SECTION_BARS * BAR * EIGHTH * SR)
    c_rms = float(np.sqrt(np.mean(buses['bass'][c0:c1] ** 2)))
    print(f'bass RMS during bridge (C): {c_rms:.6f} (expect ~0)')

    # dotted-eighth style echo on the lead only (1.5 eighths)
    lead = buses['lead'].copy()
    d = int(1.5 * EIGHTH * SR)
    for k in (1, 2, 3):
        g = 0.32 ** k
        lead[k * d:] += buses['lead'][:n_total - k * d] * g
    mix = buses['mix'] + buses['bass'] + lead

    # small-room reverb: FFT convolution with a decaying-noise IR
    ir_rng = np.random.default_rng(90210)
    ir_n = int(0.9 * SR)
    ir_t = np.arange(ir_n) / SR
    pre = int(0.015 * SR)
    ir = np.zeros((ir_n + pre, 2))
    for chn in range(2):
        ir[pre:, chn] = ir_rng.standard_normal(ir_n) * np.exp(-ir_t * 5.5)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
    n_fft = 1 << int(np.ceil(np.log2(n_total + len(ir))))
    wet = np.empty_like(mix)
    for chn in range(2):
        conv = np.fft.irfft(np.fft.rfft(mix[:, chn], n_fft)
                            * np.fft.rfft(ir[:, chn], n_fft), n_fft)
        wet[:, chn] = conv[:n_total]
    mix = mix + 0.11 * wet

    mix = np.tanh(mix * 1.1)
    mix *= 0.91 / max(1e-9, float(np.max(np.abs(mix))))
    pcm = (mix * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'wav: {path}  ({n_total / SR:.1f} s, peak {float(np.max(np.abs(mix))):.2f})')


# ------------------------------------------------------------------- main ---

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    events = make_song()
    print(f'{len(events)} note events, '
          f'{len(SECTIONS) * SECTION_BARS + 1} bars of 7/8 at {BPM:.0f} BPM')
    write_midi(events, os.path.join(here, 'seven_over.mid'))
    print(f'midi: {os.path.join(here, "seven_over.mid")}')
    render_wav(events, os.path.join(here, 'seven_over.wav'))


if __name__ == '__main__':
    main()
