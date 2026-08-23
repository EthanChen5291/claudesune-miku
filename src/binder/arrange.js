// The arranger (D43): decide WHICH instruments join a song, WHAT each one
// plays, and record enough about every choice that a later edit pass can talk
// about it — "make the counter quieter", "swap the pad", "drop the backup".
//
// Ethan's brief: keep the piano as it is and layer on top; prefer a different
// octave from the piano but treat that as a preference, not a law (instruments
// can share a register and still stand apart when their touch differs); choose
// zero, one, or several instruments based on what we know of the song; choose
// each one's PART; and make every decision deterministic.
//
// Decision procedure (the D32 house rule: hard rules -> ranked cost -> seeded
// choice; variation only at declared triggers, never per-note dice):
//
//   1. SITUATION      what the song already is: role, mode, tempo, how busy the
//                     two piano hands are, how long the loop is.
//   2. HEADROOM       what is left. Piano accompaniment and lead have already
//                     spent part of the bar's activity; layers may only spend
//                     what remains. This is what stops "add strings" from
//                     turning into mud.
//   3. SLATE          which parts the situation asks for, in priority order,
//                     from a declared per-role table — then truncated to what
//                     headroom affords. A song with no headroom gets a
//                     TAKEOVER (colour without added density) or nothing.
//   4. CASTING        per part, rank the palette on fit (part affinity, mood
//                     match, whether it cuts through this much texture, and
//                     whether its weight fits the remaining budget), then take
//                     the best; ties break on a stable hash of the song name.
//   5. LANES          assign a register. A free lane wins; sharing the piano's
//                     lane is allowed only when the layer's touch contrasts
//                     (a slow pad under a struck piano reads as depth, a
//                     second struck voice in the same octave reads as mud).
//
// Nothing here samples randomness: given the same song and the same libraries,
// planArrangement() returns the same plan forever.

import { bindMelody, bindFigure } from './bind.js';

// ---------------------------------------------------------------------------
// Parts — what a layer can be FOR, and what it COSTS. The two costs are
// separate on purpose: an early version charged everything against one
// "activity" number and concluded that a busy song could take no layers at
// all, which is wrong. A part that plays the lead's own rhythm, or holds one
// chord a bar, introduces no new attacks whatsoever — it cannot make a texture
// rhythmically busier. What it does add is sonic MASS.
//
//   adds   NEW onsets per bar (competes for rhythmic attention) -> headroom
//   mass   spectral weight (competes for spectral room)         -> mass budget
// ---------------------------------------------------------------------------
// `wants` says what the PART needs from an instrument, independent of tempo:
// a sustained pad needs an instrument that can actually sustain, however fast
// the song is, and a figure needs one that speaks quickly.
export const PARTS = {
  melody_backup: {
    adds: 0, mass: 0.45, needsCut: 0.5, derives: 'lead', wants: 'tempo',
    contributes: 'doubles the lead line so it reads louder and wider without adding any new rhythm',
  },
  melody_takeover: {
    wants: 'tempo', adds: 0, mass: 0.3, needsCut: 0.7, derives: 'lead', replacesLead: true,
    contributes: 'plays the lead instead of the piano, changing the song’s voice without adding density',
  },
  alternate_melody: {
    wants: 'tempo', adds: 0, mass: 0.5, needsCut: 0.55, derives: 'lead-rhythm',
    contributes: 'a second melody on the lead’s rhythm but its own pitches — thickens the tune while staying rhythmically locked to it',
  },
  counter_melody: {
    wants: 'tempo', adds: 3, mass: 0.5, needsCut: 0.5, derives: 'independent',
    contributes: 'an independent sparse line that moves in the gaps of the other parts',
  },
  additional_harmony: {
    wants: 'quick', adds: 4, mass: 0.6, needsCut: 0.4, derives: 'figuration',
    contributes: 'a second accompaniment figure — more harmonic motion underneath',
  },
  harmony_support: {
    wants: 'sustain', adds: 0, mass: 0.7, needsCut: 0.2, derives: 'chords',
    contributes: 'sustained chord tones underneath, adding body and weight but no motion',
  },
};

// Which parts each dramatic role wants, best first. Truncated by headroom.
const ROLE_SLATE = {
  boss: ['harmony_support', 'melody_backup', 'counter_melody'],
  battle: ['harmony_support', 'melody_backup', 'counter_melody'],
  chase: ['melody_backup', 'harmony_support'],
  cutscene: ['counter_melody', 'harmony_support'],
  character: ['counter_melody', 'alternate_melody'],
  credits: ['harmony_support', 'counter_melody'],
  ending: ['harmony_support', 'counter_melody'],
  town: ['additional_harmony', 'counter_melody'],
  overworld: ['counter_melody', 'harmony_support'],
  shop: ['additional_harmony', 'counter_melody'],
  diegetic: ['additional_harmony'],
  menu: ['counter_melody'],
  joke: ['alternate_melody', 'counter_melody'],
};
const DEFAULT_SLATE = ['counter_melody', 'harmony_support'];

// Mood words used to score instrument fit. Mode alone is far too coarse — it
// says "minor" for half the corpus and would cast the same favourite every
// time — so the song's curated dramatic ROLE contributes the more specific
// half of the vocabulary and the harmonic family fills in behind it.
const FAMILY_MOODS = {
  minor: ['sad', 'dark', 'eerie', 'grave'],
  major: ['warm', 'bright', 'hopeful', 'gentle'],
  modal: ['eerie', 'dreamy', 'spacious'],
};
const ROLE_MOODS = {
  boss: ['epic', 'driving', 'dark', 'noble'],
  battle: ['epic', 'driving', 'dark'],
  chase: ['driving', 'retro', 'dark'],
  cutscene: ['tender', 'nostalgic', 'plaintive'],
  character: ['quirky', 'playful', 'eerie', 'intimate'],
  credits: ['nostalgic', 'noble', 'sacred'],
  ending: ['nostalgic', 'sacred', 'tender'],
  town: ['warm', 'folk', 'relaxed', 'gentle'],
  overworld: ['spacious', 'pastoral', 'airy'],
  shop: ['playful', 'folk', 'retro'],
  diegetic: ['retro', 'warm', 'jazzy'],
  menu: ['bright', 'magical'],
  joke: ['quirky', 'playful', 'bright'],
};

// Register lanes and the octave each one plays in. 'lead' is the piano
// melody's lane and 'acc' the piano accompaniment's — both are occupied
// before any layer is cast.
const LANE_OCTAVE = { low: 3, mid: 4, lead: 5, high: 6 };

const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};

/**
 * planArrangement(situation) -> plan
 *
 * situation: {
 *   name, song, family, role, moods?, bpm, meter, loopBars,
 *   accDensity, accOctave, leadDensity, palette (INSTRUMENTS), maxLayers?
 * }
 *
 * The returned plan is DATA, not sound: every layer records what instrument it
 * is, what it contributes, where it sits and which rule put it there, so an
 * edit pass can reason about it later without re-deriving anything.
 */
export function planArrangement(s) {
  const palette = s.palette;
  const maxLayers = s.maxLayers ?? 3;
  const notes = [];

  // ---- 2. headroom -------------------------------------------------------
  // The same activity budget the melody uses (looser when slow), minus what
  // the piano's two hands already spend. Negative headroom is not a failure:
  // it is the signal to colour by TAKEOVER instead of by addition.
  const budget = Math.max(8, Math.min(15, Math.round(16 - (s.bpm || 110) / 40)));
  const spent = (s.accDensity ?? 0) + (s.leadDensity ?? 0);
  let headroom = budget - spent;
  notes.push(`activity budget ${budget}/bar at ${s.bpm}bpm; piano spends ${spent.toFixed(1)} (acc ${(s.accDensity ?? 0).toFixed(1)} + lead ${(s.leadDensity ?? 0).toFixed(1)}); headroom ${headroom.toFixed(1)}`);

  // A crowded song can still take a layer — it just cannot take a BUSY one.
  // The mass budget tightens as the piano fills the bar, so what survives is
  // sustain and doubling rather than new independent lines.
  let massBudget = Math.max(0.7, Math.min(1.8, 0.7 + Math.max(0, headroom) / 8));
  notes.push(`mass budget ${massBudget.toFixed(2)}`);

  // ---- 3. slate ----------------------------------------------------------
  let slate = (ROLE_SLATE[s.role] ?? DEFAULT_SLATE).slice();
  if (headroom <= 0.5) {
    const free = slate.filter((p) => PARTS[p].adds === 0);
    slate = free.length ? free : ['melody_takeover'];
    notes.push('no rhythmic headroom — only parts that introduce no new attacks are considered');
  }

  // ---- 4/5. casting + lanes ---------------------------------------------
  const moods = [
    ...(s.moods ?? []),
    ...(ROLE_MOODS[s.role] ?? []),
    ...(FAMILY_MOODS[s.family] ?? []),
  ].map((m) => String(m).toLowerCase());
  const takenLanes = new Set(['lead']);
  if (s.accOctave != null) {
    for (const [lane, oct] of Object.entries(LANE_OCTAVE)) if (oct === s.accOctave) takenLanes.add(lane);
  }
  const usedInstruments = new Set();
  const layers = [];

  for (const part of slate) {
    if (layers.length >= maxLayers) break;
    const spec = PARTS[part];
    if (spec.adds > Math.max(0, headroom)) {
      notes.push(`skipped ${part}: it adds ${spec.adds} onsets/bar and only ${headroom.toFixed(1)} remains`);
      continue;
    }
    if (spec.mass > massBudget) {
      notes.push(`skipped ${part}: mass ${spec.mass} exceeds the remaining budget ${massBudget.toFixed(2)}`);
      continue;
    }
    // texture pressure: the busier it already is, the more the layer must cut
    const pressure = Math.min(1, spent / budget);
    const needCut = Math.max(spec.needsCut, pressure * 0.8);

    // Can it SPEAK at this tempo? A bowed instrument with a slow swell is
    // wasted on a 180bpm line and perfect on a 70bpm one; a bright struck
    // bell is the reverse. This is also the main thing that keeps casting
    // from collapsing onto one favourite: mode alone says "minor" for half
    // the corpus, but tempo genuinely differs song to song.
    const bpm = s.bpm || 110;
    const tempoFit = (inst) => (bpm >= 140
      ? ({ quick: 1, soft: 0.5, slow: 0.15 })[inst.attack]
      : bpm <= 90
        ? ({ quick: 0.5, soft: 0.85, slow: 1 })[inst.attack]
        : ({ quick: 0.85, soft: 0.85, slow: 0.6 })[inst.attack]);
    // what the part itself demands, which outranks tempo where they disagree
    const attackFit = (inst) => {
      if (spec.wants === 'sustain') return ({ long: 1, medium: 0.35, short: 0 })[inst.sustain];
      if (spec.wants === 'quick') return ({ quick: 1, soft: 0.7, slow: 0.2 })[inst.attack];
      return tempoFit(inst);
    };

    const candidates = Object.entries(palette)
      .filter(([name, inst]) => inst.parts.includes(part) && !usedInstruments.has(name))
      .map(([name, inst]) => {
        const moodHit = inst.moods.filter((m) => moods.includes(m)).length;
        const cutFit = inst.cuts >= needCut ? 1 : 1 - (needCut - inst.cuts) * 2;
        const weightFit = inst.weight <= massBudget ? 1 : 0.5;
        const score = moodHit * 1.2 + cutFit * 2 + weightFit + attackFit(inst) * 1.5;
        return { name, inst, score, moodHit, attackFit: attackFit(inst) };
      })
      .sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1));
    if (!candidates.length) { notes.push(`skipped ${part}: no palette instrument plays it`); continue; }

    // Among instruments that fit this song about equally well, the pick is a
    // stable hash of the song — deterministic, but not the same favourite for
    // every card. Only near-equals are eligible; a clearly better fit wins
    // outright.
    const best = candidates[0].score;
    const tied = candidates.filter((c) => c.score >= best - 0.5);
    const chosen = tied[fnv(`${s.name}|${part}`) % tied.length];

    // lane: first preference that is free; otherwise share, but only when the
    // touch contrasts (slow-attack sustain under a struck piano)
    let lane = chosen.inst.lanes.find((l) => !takenLanes.has(l));
    let shared = false;
    if (!lane) {
      const contrasts = chosen.inst.attack === 'slow' || chosen.inst.sustain === 'long';
      if (!contrasts) { notes.push(`skipped ${part}/${chosen.name}: every lane it wants is taken and its attack would collide`); continue; }
      lane = chosen.inst.lanes[0];
      shared = true;
    }
    takenLanes.add(lane);
    usedInstruments.add(chosen.name);
    headroom -= spec.adds;
    massBudget -= spec.mass;

    layers.push({
      id: `${s.name}::${part}`,
      part,
      contributes: spec.contributes,
      instrument: chosen.name,
      instrumentCharacter: chosen.inst.character,
      family: chosen.inst.family,
      attack: chosen.inst.attack,
      sustain: chosen.inst.sustain,
      lane,
      octave: LANE_OCTAVE[lane],
      sharesLaneWithPiano: shared,
      derives: spec.derives,
      replacesLead: !!spec.replacesLead,
      addsDensity: spec.adds,
      mass: spec.mass,
      gain: gainFor(part, chosen.inst),
      seed: fnv(`${s.name}::${part}`),
      why: shared
        ? `${part}: ${chosen.name} picked from ${tied.length} near-equal fits (mood ${chosen.moodHit}, cuts ${chosen.inst.cuts}, speaks-at-tempo ${chosen.attackFit.toFixed(2)}); shares the ${lane} lane with the piano, allowed because its ${chosen.inst.attack} attack / ${chosen.inst.sustain} sustain contrasts`
        : `${part}: ${chosen.name} picked from ${tied.length} near-equal fits (mood ${chosen.moodHit}, cuts ${chosen.inst.cuts}, speaks-at-tempo ${chosen.attackFit.toFixed(2)}) in the free ${lane} lane`,
    });
  }

  return {
    name: s.name, song: s.song, role: s.role ?? null, family: s.family,
    budget, spent: Math.round(spent * 10) / 10,
    headroomStart: Math.round((budget - spent) * 10) / 10,
    headroomLeft: Math.round(headroom * 10) / 10,
    massLeft: Math.round(massBudget * 100) / 100,
    base: {
      instrument: 'piano',
      accompaniment: { density: s.accDensity ?? 0, octave: s.accOctave ?? null },
      lead: { density: s.leadDensity ?? 0, octave: 5, silenced: layers.some((l) => l.replacesLead) },
    },
    layers,
    notes,
  };
}

function gainFor(part, inst) {
  const base = {
    melody_backup: 0.4, melody_takeover: 0.85, alternate_melody: 0.5,
    counter_melody: 0.45, additional_harmony: 0.4, harmony_support: 0.32,
  }[part] ?? 0.4;
  // loud instruments that cut are pulled back so the piano stays the subject
  const trim = inst.cuts > 0.8 ? 0.85 : 1;
  return Math.round(base * trim * 100) / 100;
}

/**
 * renderArrangement(plan, ctx) -> { layers: [{...layer, expr}], warnings }
 *
 * ctx: { harmonyContext, meter, leadRhythm, leadSeed, style, counterRhythmFor,
 *        figureFor }
 *   leadRhythm       the rhythm entry the piano lead uses (for derived parts)
 *   counterRhythmFor(target, seedName) -> a rhythm entry of about that density
 *   figureFor(seedName) -> a figuration entry for additional_harmony
 */
export function renderArrangement(plan, ctx) {
  const warnings = [];
  const out = [];
  for (const layer of plan.layers) {
    const common = {
      style: ctx.style ?? 'toby-fox', octave: layer.octave,
      sound: layer.instrument, fx: `.gain(${layer.gain})`,
    };
    let expr = null, rhythmSource = null;
    try {
      if (layer.derives === 'lead' || layer.derives === 'lead-rhythm') {
        // backup/takeover reuse the lead's exact line (same seed); an alternate
        // melody keeps the rhythm and takes its own pitches (own seed)
        const seed = layer.derives === 'lead' ? ctx.leadSeed : layer.seed;
        const r = bindMelody(ctx.leadRhythm, ctx.harmonyContext, ctx.meter, { ...common, seed });
        expr = r.expr; rhythmSource = ctx.leadRhythm.name ?? 'lead';
        warnings.push(...r.warnings);
      } else if (layer.derives === 'independent') {
        const rhythm = ctx.counterRhythmFor(Math.max(2, Math.round(layer.addsDensity)), layer.id);
        const r = bindMelody(rhythm, ctx.harmonyContext, ctx.meter, { ...common, seed: layer.seed });
        expr = r.expr; rhythmSource = rhythm.name ?? 'counter';
        warnings.push(...r.warnings);
      } else if (layer.derives === 'figuration') {
        const fig = ctx.figureFor(layer.id);
        const r = bindFigure(fig, ctx.harmonyContext, ctx.meter, { octave: layer.octave, sound: layer.instrument, fx: `.gain(${layer.gain})` });
        expr = r.expr; rhythmSource = fig.name ?? 'figure';
        warnings.push(...r.warnings);
      } else if (layer.derives === 'chords') {
        // One sustained sonority per bar, held. Deliberately ROOT AND FIFTH,
        // not a full triad: a sus2 or sus4 chord has no third, and a pad that
        // supplies one anyway would contradict the harmony the piano is
        // playing. The open fifth is the frame; the piano keeps the colour —
        // the frame/colour split the two-hand analysis (D41) turned up.
        const pad = {
          name: 'sustain', bars: 1, onsets: ['0'], figure: ['R.5'],
          accents: [0.7], octave: layer.octave, legato: true,
        };
        const r = bindFigure(pad, ctx.harmonyContext, ctx.meter, { octave: layer.octave, sound: layer.instrument, fx: `.gain(${layer.gain})` });
        expr = r.expr; rhythmSource = 'sustained';
        warnings.push(...r.warnings);
      }
    } catch (e) {
      warnings.push(`layer ${layer.id} failed to render: ${e.message}`);
      continue;
    }
    if (expr) out.push({ ...layer, rhythmSource, expr });
  }
  return { layers: out, warnings };
}
