// Shared song analysis (D52), lifted verbatim out of scripts/import-undertale.mjs
// so a second corpus can be ingested by the SAME code rather than a copy of it.
//
// `import-undertale.mjs --check` is the guard on this move: it re-runs the whole
// import and diffs the generated library against what is committed, so if
// extracting these functions changed any behaviour the test suite says so.

import { basename } from 'node:path';
import { readMidi, triage } from './midi.js';
import { splitHands, chordTimeline, solveKeyKS, barFigures, pickGrid, chordAt } from './piano.js';

export const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);

/**
 * One MIDI file -> everything the extractors need: the hands split, the key
 * solved, the chord timeline, the accompaniment figures on both the true
 * half-bar timeline and the bar-locked one.
 *
 * `titleOf` lets a corpus strip its own filename convention ("Undertale - X").
 * Throws nothing: an unreadable or empty file returns null with a reason.
 */
export function loadSong(path, { titleOf = (f) => basename(f, '.mid'), dropPercussion = true } = {}) {
  let midi;
  const f = basename(path);
  try { midi = readMidi(path); } catch (e) { return { skipped: `${f} — ${e.message}` }; }
  if (!midi.notes.length) return { skipped: `${f} — no notes` };

  // GM channel 10 (0-indexed 9) is PERCUSSION: its "pitches" are drum-kit slots,
  // not notes. Nothing here — key solving, chord labelling, hand splitting,
  // melodic intervals — means anything applied to them.
  //
  // This never mattered before because the Undertale corpus is piano
  // arrangements (0.3% of notes, 2 files). Game MIDI is 24% percussion across
  // 52 of 60 files, and it broke the ingest three ways at once: splitHands()
  // picks the highest-mean-pitch track as the melody, and a hi-hat pattern sits
  // high enough to WIN that, so the "melody" profile was measuring drum
  // patterns (9 onsets a bar, 90% cell repetition); the chord labeller counted
  // drum-slot pitch classes as harmony, which is what pushed coverage under the
  // gate and left only 33 progressions out of 391 songs.
  if (dropPercussion) {
    const keep = (n) => n.channel !== 9;
    const notes = midi.notes.filter(keep);
    if (!notes.length) return { skipped: `${f} — percussion only` };
    midi = {
      ...midi,
      notes,
      tracks: midi.tracks.map((t) => ({ ...t, notes: t.notes.filter(keep) })).filter((t) => t.notes.length),
    };
  }

  const title = titleOf(f);
  const barTicks = midi.ppq * 4 * (midi.timeSig[0] / midi.timeSig[1]);
  const totalBars = Math.max(1, Math.round(midi.endTick / barTicks));
  const tri = triage(midi);
  const { acc, mel, method } = splitHands(midi, barTicks);
  const key = solveKeyKS(midi.notes);
  const timeline = chordTimeline(midi.notes, barTicks, totalBars, { melody: mel, key });
  const grid = acc.length ? pickGrid(acc, barTicks, midi.timeSig[0]) : null;
  const figs = grid ? barFigures(acc, timeline, barTicks, totalBars, grid.grid) : [];
  // BAR-LOCKED timeline: every bar wears its bar-start chord. Own-figure tokens
  // are computed against THIS (not the half-bar truth) so that re-rendering the
  // figure over bar-start chords round-trips to the exact source pitches —
  // notes the bar-start chord doesn't contain become '~n' literals, which
  // preserve the interval verbatim.
  const tlLocked = [];
  for (let b = 0; b < totalBars; b++) {
    const seg = chordAt(timeline, b * 2);
    tlLocked.push(seg
      ? { start: b * 2, end: b * 2 + 2, rootPc: seg.rootPc, quality: seg.quality, coverage: seg.coverage }
      : { start: b * 2, end: b * 2 + 2, rootPc: 0, quality: '', coverage: 0 });
  }
  const figsLocked = grid ? barFigures(acc, tlLocked, barTicks, totalBars, grid.grid) : [];
  return {
    file: f, title, slug: slug(title), midi, barTicks, totalBars, tri, acc, mel, method,
    key, timeline, grid: grid?.grid ?? null, figs, figsLocked,
    meter: `${midi.timeSig[0]}/${midi.timeSig[1]}`,
    bpm: midi.tempoBpm ? Math.round(midi.tempoBpm) : null,
  };
}

/**
 * The chord loops a song actually cycles.
 *
 * Half-bar ROOT sequence. Loop matching runs on roots only: the quality
 * labeler flaps between colour spellings of one chord (Bb5 -> Bb6 while a 6th
 * passes through) and matching on full labels shredded real loops into
 * 13-"chord" runs. Root movement IS the progression; each merged segment's
 * quality is then the coverage-weighted majority of its half-bar labels.
 *
 * D96 — WHY MATCHING IS TOLERANT, AND WHY A LOOP IS VOTED. The r15 corpus
 * classification found 377 of 1786 files extracting NO loop at all despite
 * 500-3300 melody notes, among them tracks that are audibly one vamp end to
 * end (SMB2's overworld, Pokemon's champion battle, SMW's ghost house).
 * Measured on those files: exact repeats at the searched lengths = ZERO, while
 * repeats at ONE BAR = 27-43. Two causes, both here rather than in the
 * labeller (the bar grid and key were verified correct on the failures):
 *
 *   1. one-bar loops were never searched at all (lengths started at 2 bars);
 *   2. equality was total. A four-bar loop whose last bar takes a turnaround —
 *      which is most of them — matched nothing, because a single differing
 *      half-bar out of eight vetoed the whole repeat.
 *
 * So a repeat now needs `tolerance` of its slots to agree rather than all of
 * them, and the loop that comes out is VOTED across its repetitions rather
 * than read off the first pass: each slot takes the coverage-weighted majority
 * root over all reps. That is strictly more robust than trusting one pass —
 * the varied turnaround bar loses the vote to the three plain ones — and at
 * tolerance 1 it returns exactly what exact matching returned.
 *
 * An unlabelled slot counts as a MISMATCH, never as a free pass; a slot that
 * is unlabelled in every repetition still discards the span.
 */
export const LOOP_PROFILES = {
  // What the COMMITTED packs (progressions-vgmusic.js, progressions-undertale.js)
  // were extracted with. Frozen deliberately: re-extracting them under
  // `repaired` changes 33 of the 43 songs INCLUDING KEPT ONES, because clicked
  // entries feed retrieval pools and the counted harmony model ranks the
  // variation ops off the same corpus (the D95 lesson). Flipping the importers
  // to `repaired` is a real round of work — re-audition the affected songs and
  // pin them — not a side effect of fixing a bug.
  legacy: { tolerance: 1, lengths: [16, 12, 8, 6, 4], consensus: false },
  // The repaired extractor (D96). Default for anything ANALYSING a corpus.
  repaired: { tolerance: 0.85, lengths: [16, 12, 8, 6, 4, 2], consensus: true },
};

export function chordLoops(song, {
  max = 3,
  tolerance = LOOP_PROFILES.repaired.tolerance,
  lengths = LOOP_PROFILES.repaired.lengths,
  consensus = LOOP_PROFILES.repaired.consensus,
} = {}) {
  const nHalf = song.totalBars * 2;
  const roots = [], quals = [], covs = [];
  for (let h = 0; h < nHalf; h++) {
    const seg = chordAt(song.timeline, h);
    roots.push(seg ? seg.rootPc : -1);
    quals.push(seg ? seg.quality : null);
    covs.push(seg ? seg.coverage : 0);
  }
  /** fraction of slots where the two windows carry the same LABELLED root */
  const simSeg = (i, j, L) => {
    let same = 0;
    for (let k = 0; k < L; k++) if (roots[i + k] >= 0 && roots[i + k] === roots[j + k]) same++;
    return same / L;
  };
  const spans = [];
  for (const L of lengths) {
    for (let i = 0; i + 2 * L <= nHalf; i++) {
      let reps = 1;
      while (i + (reps + 1) * L <= nHalf && simSeg(i, i + reps * L, L) >= tolerance) reps++;
      if (reps >= 2) spans.push({ start: i, L, reps, covered: L * reps });
    }
  }
  spans.sort((a, b) => b.covered - a.covered || a.start - b.start);
  const out = [];
  const seen = new Set();
  const taken = [];
  for (const s of spans) {
    // Vote each slot across the repetitions, then RLE into root segments with
    // quality by weighted vote. Voting is what makes tolerance safe: a slot
    // that disagrees in one rep is outvoted rather than taken on faith.
    // `consensus` is what makes the legacy profile reproducible: voting the
    // quality across every repetition is itself a behaviour change, even when
    // the roots match exactly, so the frozen packs vote over the first pass only.
    const votingReps = consensus ? s.reps : 1;
    const slots = [];
    let dead = false;
    for (let k = 0; k < s.L; k++) {
      const rootVotes = new Map();
      for (let r = 0; r < votingReps; r++) {
        const h = s.start + r * s.L + k;
        if (h >= nHalf || roots[h] < 0) continue;
        rootVotes.set(roots[h], (rootVotes.get(roots[h]) ?? 0) + Math.max(0.01, covs[h]));
      }
      if (!rootVotes.size) { dead = true; break; } // unlabelled in every rep
      const rootPc = [...rootVotes.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
      // quality is voted only among the reps that agreed on the winning root
      const qVotes = new Map();
      for (let r = 0; r < votingReps; r++) {
        const h = s.start + r * s.L + k;
        if (h >= nHalf || roots[h] !== rootPc) continue;
        qVotes.set(quals[h], (qVotes.get(quals[h]) ?? 0) + Math.max(0.01, covs[h]));
      }
      slots.push({ rootPc, qVotes });
    }
    if (dead) continue;
    const chords = [];
    for (const slot of slots) {
      const last = chords[chords.length - 1];
      if (last && last.rootPc === slot.rootPc) {
        last.half++;
        for (const [q, w] of slot.qVotes) last.votes.set(q, (last.votes.get(q) ?? 0) + w);
      } else chords.push({ rootPc: slot.rootPc, half: 1, votes: new Map(slot.qVotes) });
    }
    if (chords.length < 2) continue;
    for (const c of chords) c.quality = [...c.votes.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0][0];
    // a "loop" that is one chord split by a passing label isn't a progression
    if (new Set(chords.map((c) => c.rootPc)).size < 2) continue;
    const sig = chords.map((c) => `${c.rootPc}:${c.quality}x${c.half}`).join(' ');
    if (seen.has(sig)) continue;
    if (taken.some(([a, b]) => s.start < b && s.start + s.covered > a)) continue; // overlaps a better span
    seen.add(sig);
    taken.push([s.start, s.start + s.covered]);
    const cov = mean(covs.slice(s.start, s.start + s.L));
    out.push({ chords, loopBars: s.L / 2, reps: s.reps, atBar: s.start / 2, coverage: cov });
    if (out.length >= max) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Melody: HABITS, never tunes
// ---------------------------------------------------------------------------

/**
 * Does this song's "melody" stream look like an ARPEGGIO CHANNEL rather than a
 * tune? splitHands() picks the highest-mean-pitch track, and game MIDI very
 * often puts a fast broken-chord accompaniment up there — measured across 371
 * track-separated VGMusic files, the median melody stream has 8.8 onsets a bar
 * and p90 is 19.6, which no sung line does.
 *
 * The three signatures together, because none is decisive alone: a bar-rhythm
 * that repeats almost every bar (an ostinato), a high onset count, and a high
 * share of leaps (a broken chord jumps by thirds and fourths constantly). A
 * real tune fails at least one. Catches ~33% of the corpus.
 */
export function looksLikeArpeggio(song) {
  const mel = [...song.mel].sort((a, b) => a.tick - b.tick);
  if (mel.length < 32) return false;
  let leap = 0, n = 0;
  for (let i = 1; i < mel.length; i++) {
    const iv = Math.abs(mel[i].midi - mel[i - 1].midi);
    if (iv <= 24) { n++; if (iv >= 5) leap++; }
  }
  const cells = new Map();
  for (const x of mel) {
    const b = Math.floor(x.tick / song.barTicks);
    const st = Math.round(((x.tick % song.barTicks) / song.barTicks) * 16);
    if (!cells.has(b)) cells.set(b, []);
    cells.get(b).push(st);
  }
  const sigs = new Map();
  for (const [, v] of cells) { const k = v.join(','); sigs.set(k, (sigs.get(k) ?? 0) + 1); }
  let rep = 0;
  for (const [, c] of sigs) if (c > 1) rep += c;
  const onsetsPerBar = [...cells.values()].reduce((a, v) => a + v.length, 0) / Math.max(1, cells.size);
  return rep / Math.max(1, cells.size) > 0.85 && onsetsPerBar >= 6 && leap / Math.max(1, n) > 0.35;
}

/**
 * Measure a corpus's melodic habits into the exact shape MELODY_PROFILES takes.
 *
 * D30'S RULING STANDS AND THIS RESPECTS IT. "Extracting the melody of X would be
 * copying a tune, not abstracting a habit" — so nothing here records a sequence
 * of notes. What comes out is a distribution: how often the line steps versus
 * leaps, whether leaps reverse, how wide it ranges, how many onsets a bar
 * carries, which RHYTHM cells recur. That is the same artifact
 * `melody-profiles.js` already carries for toby-fox, whose numbers came from
 * 37,464 measured intervals of the Undertale import — a profile is a style's
 * measured habits, and habits are not anybody's melody.
 *
 * Returns { profile, evidence } — the profile in MELODY_PROFILES shape, and the
 * counts behind it so a reader can see how thin or thick the evidence is.
 */
export function melodyProfile(songs) {
  const intervals = new Map();
  let leaps = 0, leapReversed = 0, stepPairs = 0, stepSame = 0;
  let onBeat = 0, offBeat = 0, phrases = 0;
  const ranges = [], onsetsPerBar = [], rhythmCells = new Map();
  let barRepeat = 0, barTotal = 0, songsUsed = 0;
  const durRatios = [];

  for (const song of songs) {
    const mel = [...song.mel].sort((a, b) => a.tick - b.tick);
    if (mel.length < 16) continue;
    songsUsed++;
    const beat = song.barTicks / song.midi.timeSig[0];
    ranges.push(Math.max(...mel.map((n) => n.midi)) - Math.min(...mel.map((n) => n.midi)));

    let prevIv = null;
    for (let i = 1; i < mel.length; i++) {
      const gap = mel[i].tick - (mel[i - 1].tick + mel[i - 1].dur);
      if (gap > beat) { phrases++; prevIv = null; continue; }
      const iv = mel[i].midi - mel[i - 1].midi;
      if (Math.abs(iv) > 24) { prevIv = null; continue; }
      intervals.set(iv, (intervals.get(iv) ?? 0) + 1);
      if (Math.abs(iv) >= 5) {
        leaps++;
        if (i + 1 < mel.length) {
          const nxt = mel[i + 1].midi - mel[i].midi;
          if (nxt !== 0 && Math.sign(nxt) !== Math.sign(iv)) leapReversed++;
        }
      }
      // stepInertia: does a step continue the same direction?
      if (prevIv != null && Math.abs(prevIv) <= 2 && prevIv !== 0 && Math.abs(iv) <= 2 && iv !== 0) {
        stepPairs++;
        if (Math.sign(iv) === Math.sign(prevIv)) stepSame++;
      }
      prevIv = iv;
    }

    // rhythm cells + on-beat share + articulation
    const cells = new Map();
    for (const n of mel) {
      const b = Math.floor(n.tick / song.barTicks);
      const step = Math.round(((n.tick % song.barTicks) / song.barTicks) * 16);
      if (!cells.has(b)) cells.set(b, []);
      cells.get(b).push(step);
      const off = n.tick % beat;
      if (off < song.midi.ppq / 8 || beat - off < song.midi.ppq / 8) onBeat++; else offBeat++;
    }
    for (let i = 0; i < mel.length - 1; i++) {
      const gap = mel[i + 1].tick - mel[i].tick;
      if (gap > 0 && gap <= song.barTicks) durRatios.push(Math.min(1.5, mel[i].dur / gap));
    }
    const sigs = new Map();
    for (const [, steps] of cells) {
      const sig = steps.join(',');
      onsetsPerBar.push(steps.length);
      rhythmCells.set(sig, (rhythmCells.get(sig) ?? 0) + 1);
      sigs.set(sig, (sigs.get(sig) ?? 0) + 1);
      barTotal++;
    }
    for (const [, n] of sigs) if (n > 1) barRepeat += n;
  }

  const tot = [...intervals.values()].reduce((a, b) => a + b, 0) || 1;
  const abs = new Map();
  for (const [iv, n] of intervals) abs.set(Math.abs(iv), (abs.get(Math.abs(iv)) ?? 0) + n);
  const share = (...ks) => ks.reduce((a, k) => a + (abs.get(k) ?? 0), 0) / tot;
  const up = [...intervals].filter(([iv]) => iv > 0).reduce((a, [, n]) => a + n, 0);
  const down = [...intervals].filter(([iv]) => iv < 0).reduce((a, [, n]) => a + n, 0);
  const r2 = (x) => Math.round(x * 1000) / 1000;

  return {
    profile: {
      // MELODY_PROFILES.moves is in SCALE STEPS; these are the semitone bands
      // that map onto them (a third is 3-4 semitones, a fourth is 5, etc.)
      moves: {
        repeat: r2(share(0)),
        step: r2(share(1, 2)),
        third: r2(share(3, 4)),
        fourth: r2(share(5)),
        fifth: r2(share(6, 7)),
        sixth: r2(share(8, 9)),
        octave: r2(share(10, 11, 12)),
      },
      upBias: r2(up / Math.max(1, up + down)),
      leapRecovery: r2(leapReversed / Math.max(1, leaps)),
      stepInertia: r2(stepSame / Math.max(1, stepPairs)),
      rangeSteps: Math.max(5, Math.min(14, Math.round(median(ranges) / 12 * 7))),
      cellRepetitionFloor: r2(Math.min(0.9, barRepeat / Math.max(1, barTotal))),
      onBeatShare: r2(onBeat / Math.max(1, onBeat + offBeat)),
      onsetsPerBar: r2(median(onsetsPerBar)),
      legatoShare: r2(durRatios.filter((d) => d >= 0.9).length / Math.max(1, durRatios.length)),
      staccatoShare: r2(durRatios.filter((d) => d < 0.55).length / Math.max(1, durRatios.length)),
    },
    evidence: {
      songs: songsUsed,
      intervals: tot,
      leaps,
      phrases,
      bars: barTotal,
      medianRangeSemitones: median(ranges),
      topRhythmCells: [...rhythmCells.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 12)
        .map(([cell, n]) => ({ cell, n })),
    },
  };
}
