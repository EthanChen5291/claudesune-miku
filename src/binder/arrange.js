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
// `entry` is the order a part joins the arrangement over time (D47). Toby Fox's
// own paradigm, from the Undertale deconstruction: the ostinato is introduced
// first, then the midground, then the melody. Bed before motion before doubling.
export const PARTS = {
  melody_backup: {
    adds: 0, mass: 0.45, needsCut: 0.5, derives: 'lead', wants: 'tempo', entry: 'double',
    contributes: 'doubles the lead line so it reads louder and wider without adding any new rhythm',
  },
  melody_takeover: {
    wants: 'tempo', adds: 0, mass: 0.3, needsCut: 0.7, derives: 'lead', canLead: true, entry: 'lead',
    contributes: 'takes the melody over from the piano at a section boundary — the tune changes voice without a gap',
  },
  alternate_melody: {
    wants: 'tempo', adds: 0, mass: 0.5, needsCut: 0.55, derives: 'lead-rhythm', entry: 'motion',
    contributes: 'a second melody on the lead’s rhythm but its own pitches — thickens the tune while staying rhythmically locked to it',
  },
  counter_melody: {
    wants: 'tempo', adds: 3, mass: 0.5, needsCut: 0.5, derives: 'independent', entry: 'motion',
    contributes: 'an independent sparse line that moves in the gaps of the other parts',
  },
  additional_harmony: {
    wants: 'quick', adds: 4, mass: 0.6, needsCut: 0.4, derives: 'figuration', entry: 'bed',
    contributes: 'a second accompaniment figure — more harmonic motion underneath',
  },
  harmony_support: {
    wants: 'sustain', adds: 0, mass: 0.7, needsCut: 0.2, derives: 'chords', entry: 'bed',
    contributes: 'sustained chord tones underneath, adding body and weight but no motion',
  },
};

// Which parts each dramatic role wants, best first. Truncated by headroom.
//
// Each role offers SEVERAL slates and the song picks one by a stable hash of its
// own name (D46). One fixed slate per role gave 43 cutscenes the same two parts
// and made harmony_support 54% of every layer in the corpus — over half the
// arrangement was a sustained drone, which is the opposite of what Ethan heard
// and liked in Gaster's Theme: two busy voices countering each other. Varying
// the slate is the same move as varying a rhythm — chosen from the song's
// context, never sampled — so the corpus stops sounding like one arrangement.
// A slate is a ROSTER, not a simultaneity (D47). Before the form existed every
// cast layer played from bar one to the end, so the roster had to be small or
// the song was mud — mean 1.47 layers per song, which is why Ethan could hear
// "only the music box and the piano". Now that sections decide who is playing
// when, a song can carry four voices and still only sound two or three at once,
// and the extra ones become the arrangement's events rather than its texture.
const ROLE_SLATE = {
  boss: [
    ['melody_backup', 'counter_melody', 'harmony_support'],
    ['harmony_support', 'melody_backup', 'additional_harmony', 'counter_melody'],
    ['counter_melody', 'additional_harmony', 'harmony_support', 'melody_takeover'],
    ['counter_melody', 'harmony_support', 'melody_backup', 'alternate_melody'],
  ],
  battle: [
    ['melody_backup', 'counter_melody', 'harmony_support'],
    ['harmony_support', 'counter_melody', 'additional_harmony'],
    ['counter_melody', 'additional_harmony', 'melody_backup', 'harmony_support'],
  ],
  chase: [
    ['melody_backup', 'additional_harmony', 'harmony_support'],
    ['counter_melody', 'harmony_support', 'melody_backup', 'additional_harmony'],
  ],
  cutscene: [
    ['counter_melody', 'harmony_support', 'melody_backup'],
    ['melody_backup', 'harmony_support', 'alternate_melody'],
    ['alternate_melody', 'harmony_support', 'counter_melody', 'melody_takeover'],
    ['counter_melody', 'melody_backup', 'harmony_support', 'additional_harmony'],
    ['melody_takeover', 'counter_melody', 'harmony_support'],
  ],
  character: [
    ['counter_melody', 'alternate_melody', 'harmony_support'],
    ['melody_takeover', 'counter_melody', 'additional_harmony'],
    ['alternate_melody', 'additional_harmony', 'harmony_support', 'counter_melody'],
  ],
  credits: [
    ['harmony_support', 'counter_melody', 'melody_backup'],
    ['melody_backup', 'harmony_support', 'alternate_melody', 'counter_melody'],
  ],
  ending: [
    ['harmony_support', 'counter_melody', 'melody_backup'],
    ['melody_takeover', 'harmony_support', 'counter_melody', 'alternate_melody'],
  ],
  town: [
    ['additional_harmony', 'counter_melody', 'harmony_support'],
    ['counter_melody', 'alternate_melody', 'harmony_support', 'melody_backup'],
    ['melody_takeover', 'additional_harmony', 'counter_melody', 'harmony_support'],
  ],
  overworld: [
    ['counter_melody', 'harmony_support', 'melody_backup'],
    ['melody_backup', 'harmony_support', 'additional_harmony'],
    ['alternate_melody', 'counter_melody', 'harmony_support', 'melody_backup'],
    ['melody_takeover', 'harmony_support', 'counter_melody'],
  ],
  shop: [
    ['additional_harmony', 'counter_melody', 'harmony_support'],
    ['alternate_melody', 'additional_harmony', 'counter_melody', 'harmony_support'],
  ],
  diegetic: [
    ['additional_harmony', 'counter_melody', 'harmony_support'],
    ['melody_takeover', 'additional_harmony', 'harmony_support', 'counter_melody'],
  ],
  menu: [['counter_melody', 'harmony_support'], ['melody_takeover', 'harmony_support', 'counter_melody']],
  joke: [
    ['alternate_melody', 'counter_melody', 'additional_harmony'],
    ['melody_takeover', 'additional_harmony', 'counter_melody', 'harmony_support'],
  ],
};
const DEFAULT_SLATE = [
  ['counter_melody', 'harmony_support', 'melody_backup'],
  ['melody_backup', 'counter_melody', 'harmony_support', 'additional_harmony'],
  ['alternate_melody', 'harmony_support', 'counter_melody'],
];

// Mood words used to score instrument fit. Mode alone is far too coarse — it
// says "minor" for half the corpus and would cast the same favourite every
// time — so the song's curated dramatic ROLE contributes the more specific
// half of the vocabulary and the harmonic family fills in behind it.
const FAMILY_MOODS = {
  minor: ['sad', 'dark', 'eerie', 'grave', 'ominous'],
  major: ['warm', 'bright', 'hopeful', 'gentle', 'innocent'],
  modal: ['eerie', 'dreamy', 'spacious', 'lonely'],
};
const ROLE_MOODS = {
  boss: ['epic', 'driving', 'dark', 'noble', 'heroic', 'ominous', 'tense'],
  battle: ['epic', 'driving', 'dark', 'tense', 'triumphant'],
  chase: ['driving', 'retro', 'dark', 'tense', 'sneaking'],
  cutscene: ['tender', 'nostalgic', 'plaintive', 'intimate', 'dreamy', 'sad'],
  character: ['quirky', 'playful', 'eerie', 'intimate', 'comic', 'sly'],
  credits: ['nostalgic', 'noble', 'sacred', 'sweeping', 'hopeful'],
  ending: ['nostalgic', 'sacred', 'tender', 'grave', 'sweeping'],
  town: ['warm', 'folk', 'relaxed', 'gentle', 'jazzy'],
  overworld: ['spacious', 'pastoral', 'airy', 'lonely', 'questing', 'calm'],
  shop: ['playful', 'folk', 'retro', 'jazzy', 'quirky'],
  diegetic: ['retro', 'warm', 'jazzy', 'sly'],
  menu: ['bright', 'magical', 'calm'],
  joke: ['quirky', 'playful', 'bright', 'comic', 'baroque'],
};

// Register lanes and the octave each one PROPOSES. 'lead' is the piano melody's
// lane; the piano accompaniment's octave is occupied before any layer is cast.
//
// A lane is a plan for the arrangement; an instrument's `range` is a fact about
// the instrument (D46). Where they disagree the instrument wins — a music box
// on the 'high' lane is a needle, a cello there is nothing at all — so the lane
// proposes and the range clamps. Occupancy is then tracked by the OCTAVE THAT
// RESULTS, never by the lane's name: two layers in nominally different lanes
// can clamp onto the same octave, and calling that "different registers" would
// be a lie the plan then tells the edit pass.
const LANE_OCTAVE = { low: 3, mid: 4, lead: 5, high: 6 };
const octaveFor = (lane, inst) => {
  const [lo, hi] = inst.range ?? [1, 7];
  return Math.max(lo, Math.min(hi, LANE_OCTAVE[lane]));
};

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
  const maxLayers = s.maxLayers ?? 4;
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
  const massAtOnce = Math.max(0.7, Math.min(1.8, 0.7 + Math.max(0, headroom) / 8));
  // ...but the SLATE is a roster, not a simultaneity (D47). The form decides who
  // plays in which section, so a song may carry more voices than it ever sounds
  // at once; `massAtOnce` is the ceiling any one section must respect, and this
  // looser number is what the roster may hold. Before the form existed these
  // were the same number and the arrangement averaged 1.47 voices.
  const ROSTER_SLACK = 2.1;
  let massBudget = massAtOnce * ROSTER_SLACK;
  notes.push(`mass ${massAtOnce.toFixed(2)}/section sounding at once, roster budget ${massBudget.toFixed(2)}`);

  // ---- 3. slate ----------------------------------------------------------
  const options = ROLE_SLATE[s.role] ?? DEFAULT_SLATE;
  const slateIx = fnv(`${s.name}|slate`) % options.length;
  let slate = options[slateIx].slice();
  notes.push(`slate ${slateIx + 1}/${options.length} for role "${s.role ?? 'none'}": ${slate.join(' + ')}`);
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
  // the piano's own two octaves are spoken for before anything is cast
  const pianoOctaves = new Set([LANE_OCTAVE.lead]);
  if (s.accOctave != null) pianoOctaves.add(s.accOctave);
  const takenOctaves = new Set(pianoOctaves);
  const sharedOctaves = new Set();
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
        // D63: an ENVIRONMENT's timbre affinity (vibes.js instBias) — one
        // additive term, optional; a situation without it behaves as before
        const envFit = s.instBias
          ? (s.instBias.boost?.includes(name) ? 1.0 : 0) - (s.instBias.avoid?.includes(name) ? 1.5 : 0)
          : 0;
        const score = moodHit * 1.2 + cutFit * 2 + weightFit + attackFit(inst) * 1.5 + envFit;
        return { name, inst, score, moodHit, attackFit: attackFit(inst) };
      })
      .sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1));
    if (!candidates.length) { notes.push(`skipped ${part}: no palette instrument plays it`); continue; }

    // Among instruments that fit this song about equally well, the pick is a
    // stable hash of the song — deterministic, but not the same favourite for
    // every card. Only near-equals are eligible; a clearly better fit wins
    // outright. The tied band is tried in hash-rotated order and the rest of
    // the ranking behind it, because an instrument can fit the part perfectly
    // and still have nowhere to stand: dropping the whole PART when the first
    // pick has no free octave left 14 songs with no arrangement at all.
    const best = candidates[0].score;
    const tied = candidates.filter((c) => c.score >= best - 0.5);
    const rot = fnv(`${s.name}|${part}`) % tied.length;
    const order = [...tied.slice(rot), ...tied.slice(0, rot), ...candidates.slice(tied.length)];

    // Lane: the first preference whose CLAMPED octave is still free. Otherwise
    // share an octave, but only when the touch contrasts — a slow swell under a
    // struck piano reads as depth, a second struck voice in the same octave
    // reads as mud. Ethan's rule: a different octave is the preference, not a
    // law, because instruments can stand apart on touch alone.
    // A takeover silences the piano melody, so the lead octave is its to claim;
    // otherwise the layer is pushed down into a register the piano has just
    // vacated and the song loses its top voice entirely.
    const free = new Set(takenOctaves);
    if (spec.canLead) free.delete(LANE_OCTAVE.lead);
    const place = (c) => {
      let lane = c.inst.lanes.find((l) => !free.has(octaveFor(l, c.inst)));
      let shared = false;
      if (!lane) {
        const contrasts = c.inst.attack === 'slow' || c.inst.sustain === 'long';
        // Sharing is a bargain struck with the PIANO — its touch is known and
        // the contrast is the whole justification. Two LAYERS in one octave is
        // just a collision: neither was written to be heard through the other.
        // ...and only ONCE per piano octave. The piano can carry one voice
        // alongside it; a second sharer is two layers in one register, which is
        // the collision the free-octave search was avoiding in the first place.
        lane = contrasts
          ? c.inst.lanes.find((l) => pianoOctaves.has(octaveFor(l, c.inst)) && !sharedOctaves.has(octaveFor(l, c.inst)))
          : null;
        if (!lane) return null;
        shared = true;
      }
      const octave = octaveFor(lane, c.inst);
      // Sharing the piano ACCOMPANIMENT's octave is the contrast case above.
      // Sharing the piano LEAD's octave is not the same bargain: two
      // independent melodic lines in one register is the mud this rule exists
      // to prevent. Allowed only for a part playing the lead's own notes.
      if (octave === LANE_OCTAVE.lead && !spec.canLead && spec.derives !== 'lead') return null;
      return { lane, octave, shared };
    };
    let chosen = null, spot = null;
    for (const c of order) { spot = place(c); if (spot) { chosen = c; break; } }
    if (!chosen) { notes.push(`skipped ${part}: no instrument that plays it has an octave left to stand in`); continue; }
    const { lane, octave, shared } = spot;
    if (shared) sharedOctaves.add(octave);
    const clamped = octave !== LANE_OCTAVE[lane];
    takenOctaves.add(octave);
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
      octave,
      range: chosen.inst.range ?? null,
      clampedToRange: clamped,
      sharesLaneWithPiano: shared,
      derives: spec.derives,
      canLead: !!spec.canLead,
      entry: spec.entry,
      addsDensity: spec.adds,
      mass: spec.mass,
      gain: gainFor(part, chosen.inst),
      level: chosen.inst.level ?? 1,
      seed: fnv(`${s.name}::${part}`),
      why: [
        `${part}: ${chosen.name} picked from ${tied.length} near-equal fits`,
        `(mood ${chosen.moodHit}, cuts ${chosen.inst.cuts}, speaks-at-tempo ${chosen.attackFit.toFixed(2)})`,
        shared
          ? `sharing octave ${octave} with the piano, allowed because its ${chosen.inst.attack} attack / ${chosen.inst.sustain} sustain contrasts`
          : `in the free ${lane} lane`,
        clamped
          ? `at octave ${octave}, not the lane's ${LANE_OCTAVE[lane]}: its range is ${chosen.inst.range.join('-')}`
          : `at octave ${octave}`,
        `gain ${gainFor(part, chosen.inst)} (part base × level ${chosen.inst.level ?? 1})`,
      ].join('; '),
    });
  }

  return {
    name: s.name, song: s.song, role: s.role ?? null, family: s.family,
    loopBars: s.loopBars ?? 4, leadPeriod: s.leadPeriod ?? null,
    budget, spent: Math.round(spent * 10) / 10,
    headroomStart: Math.round((budget - spent) * 10) / 10,
    headroomLeft: Math.round(headroom * 10) / 10,
    massAtOnce: Math.round(massAtOnce * 100) / 100,
    massLeft: Math.round(massBudget * 100) / 100,
    base: {
      instrument: 'piano',
      accompaniment: { density: s.accDensity ?? 0, octave: s.accOctave ?? null },
      lead: { density: s.leadDensity ?? 0, octave: 5 },
    },
    layers,
    notes,
  };
}

// ---------------------------------------------------------------------------
// FORM (D47) — who is playing WHEN.
//
// Everything above decides the cast. This decides the arrangement over time,
// and it exists because a constant texture stops being heard. From the music-
// psychology literature: repetition buys processing fluency, but it also buys
// habituation — "the more one particular layer doesn't change, the more your
// ears adjust to hear beyond it" — and the entrance of an instrument is the
// event that resets attention. Ethan heard exactly that failure: "currently I
// can only hear the music box and the piano", in an arrangement where every
// voice had been sounding continuously since bar one.
//
// The vocabulary is game audio's: VERTICAL LAYERING (stems fading in and out of
// one piece) crossed with HORIZONTAL RESEQUENCING (distinct sections in
// sequence). The entry ORDER is Toby Fox's own, from the Undertale composition
// deconstruction: the ostinato is introduced first, then the midground, then
// the melody with its drums — and "everything melodic is repeated twice" before
// new material arrives, which is why sections come in pairs.
//
// One rule outranks the rest, and it is the answer to "sometimes the lead
// melody just stops": ONCE THE TUNE HAS ARRIVED, SOMETHING IS ALWAYS CARRYING
// IT. A takeover is a handoff at a section boundary, never a gap.
// ---------------------------------------------------------------------------

// What each archetype asks for. `take` names which entry groups are sounding;
// `lead` names who has the tune.
const ARCHETYPES = {
  ostinato: {
    lead: null, take: [], energy: 1,
    why: 'the accompaniment alone — the ostinato states the groove before anything is asked of it',
  },
  bed: {
    lead: null, take: ['bed'], energy: 2,
    why: 'sustain joins underneath, still with no tune, so that the melody’s entry is an event and not a texture',
  },
  statement: {
    lead: 'piano', take: ['bed'], energy: 3,
    why: 'the melody arrives over the bed it has been waiting behind',
  },
  answer: {
    lead: 'piano', take: ['bed', 'motion'], energy: 4,
    why: 'a second line answers the tune — the two-hand counterpoint, not more of the same',
  },
  handoff: {
    lead: 'takeover', take: ['bed', 'motion'], energy: 4,
    why: 'the tune changes voice at a phrase boundary: the piano hands it over rather than dropping it',
  },
  // D59, from the video corpus (D57): call & response is TURN-TAKING BETWEEN
  // INSTRUMENTS, never two leads at once — video 10's accordion asks two bars
  // and the whistle answers two, and the two never sound together. So this is
  // a form-level scheduling rule: within the section, the piano owns the lead
  // lane for `phraseBars` bars, then the answering voice owns it, alternating.
  // The masks (maskFor / pianoLeadMask) implement the alternation; nothing
  // about the melody itself changes — the answer voice plays the section's own
  // line, which is what an echoed answer is.
  dialogue: {
    lead: 'dialogue', take: ['bed'], energy: 3.5,
    why: 'call & response: the piano asks a two-bar phrase and another voice answers it — the two take turns owning the lead lane, never sounding together',
  },
  // The peak is allowed past the standing mass ceiling. That ceiling is what a
  // song can carry INDEFINITELY without turning to mud; a peak is by definition
  // the one moment that is denser than the rest, and it only lasts a section.
  full: {
    lead: 'piano', take: ['bed', 'motion', 'double'], energy: 5, massMul: 1.35,
    why: 'everything at once, the doubling included — the peak the rest of the form was building toward',
  },
  fullHandoff: {
    lead: 'takeover', take: ['bed', 'motion', 'double'], energy: 5, massMul: 1.35,
    why: 'the peak, with the new voice carrying the tune',
  },
  breakdown: {
    lead: 'piano', take: ['motion'], energy: 2,
    why: 'strip back to the tune and one line so the return lands',
  },
  tag: {
    lead: null, take: ['bed'], energy: 1,
    why: 'the tune withdraws and the bed closes it out before the loop comes round',
  },
};

// Form shapes, per role, chosen by the song's own hash. Each is an energy
// contour over the loop's repetitions: something rises, peaks, and gives way.
// `handoff` degrades to its non-handoff twin when no layer can lead.
const ROLE_FORM = {
  boss: [
    ['statement', 'full', 'breakdown', 'full'],
    ['bed', 'statement', 'answer', 'full'],
    ['statement', 'answer', 'full', 'fullHandoff'],
    ['ostinato', 'statement', 'full', 'full'],
  ],
  battle: [
    ['statement', 'answer', 'full', 'breakdown'],
    ['bed', 'statement', 'full', 'full'],
    ['statement', 'full', 'handoff', 'full'],
  ],
  chase: [
    ['statement', 'full', 'full', 'breakdown'],
    ['bed', 'statement', 'answer', 'full'],
  ],
  cutscene: [
    ['ostinato', 'bed', 'statement', 'answer'],
    ['bed', 'statement', 'answer', 'full'],
    ['ostinato', 'statement', 'answer', 'full', 'tag'],
    ['statement', 'answer', 'handoff', 'full'],
    ['bed', 'statement', 'full', 'breakdown', 'full'],
    ['bed', 'statement', 'dialogue', 'full'],
  ],
  character: [
    ['statement', 'answer', 'handoff', 'full'],
    ['ostinato', 'statement', 'answer', 'full'],
    ['statement', 'breakdown', 'answer', 'full'],
    ['statement', 'dialogue', 'answer', 'full'],
  ],
  credits: [
    ['ostinato', 'bed', 'statement', 'answer', 'full'],
    ['bed', 'statement', 'answer', 'full', 'tag'],
  ],
  ending: [
    ['ostinato', 'bed', 'statement', 'full', 'tag'],
    ['bed', 'statement', 'handoff', 'full', 'tag'],
  ],
  town: [
    ['statement', 'answer', 'full', 'breakdown'],
    ['bed', 'statement', 'answer', 'full'],
    ['statement', 'handoff', 'answer', 'full'],
    ['statement', 'dialogue', 'full', 'breakdown'],
  ],
  overworld: [
    ['ostinato', 'bed', 'statement', 'answer'],
    ['bed', 'statement', 'answer', 'full'],
    ['ostinato', 'statement', 'full', 'breakdown', 'full'],
    ['statement', 'answer', 'handoff', 'full'],
    ['ostinato', 'statement', 'dialogue', 'full'],
  ],
  shop: [
    ['statement', 'answer', 'full', 'answer'],
    ['bed', 'statement', 'answer', 'full'],
    ['statement', 'dialogue', 'answer', 'full'],
  ],
  diegetic: [
    ['ostinato', 'statement', 'answer', 'full'],
    ['statement', 'answer', 'handoff', 'full'],
  ],
  menu: [['statement', 'answer'], ['bed', 'statement', 'answer', 'full']],
  joke: [
    ['statement', 'handoff', 'answer', 'full'],
    ['statement', 'answer', 'breakdown', 'full'],
  ],
};
const DEFAULT_FORM = [
  ['ostinato', 'statement', 'answer', 'full'],
  ['bed', 'statement', 'answer', 'full'],
  ['statement', 'answer', 'full', 'breakdown'],
];

/**
 * planForm(plan) -> { sectionBars, totalBars, sections, notes }
 *
 * A section is one pass of the loop (or of the melody's phrase, when that is
 * longer — the two must stay aligned or a masked layer would restart mid-
 * phrase). Every section records which layer ids sound, who holds the tune,
 * and why, so the whole shape is inspectable and later editable.
 */
export function planForm(plan, opts = {}) {
  const notes = [];
  const loop = Math.max(1, plan.loopBars ?? 4);
  const lead = plan.leadPeriod ?? loop;
  // sections must contain whole phrases of everything inside them
  const sectionBars = lead % loop === 0 ? lead : loop * lead;
  const byEntry = (g) => plan.layers.filter((l) => l.entry === g);
  const leaders = plan.layers.filter((l) => l.canLead);

  // Build the sections one shape would produce. Called for every candidate,
  // because whether a shape is any good depends on the roster it is applied to.
  const build = (shape) => {
    const secs = [];
    let bar = 0;
    for (let i = 0; i < shape.length; i++) {
      const arch = ARCHETYPES[shape[i]];
      // who plays: the requested entry groups, admitted in Toby's order and
      // stopped at the mass this song can sound AT ONCE (the roster is allowed
      // to be bigger than any one moment of it)
      const wanted = [];
      for (const g of ['bed', 'motion', 'double']) if (arch.take.includes(g)) wanted.push(...byEntry(g));
      const ceiling = plan.massAtOnce * (arch.massMul ?? 1);
      const active = [];
      let mass = 0;
      const dropped = [];
      for (const l of wanted) {
        if (mass + l.mass > ceiling + 1e-9) { dropped.push(l.instrument); continue; }
        active.push(l.id); mass += l.mass;
      }
      // who has the tune. A takeover only ever REPLACES the piano; it never
      // leaves the lead empty, and it is only reachable at a section boundary.
      let leadVoice = 'piano', leadId = null, dialogue = null;
      if (arch.lead === null) leadVoice = 'none';
      else if (arch.lead === 'takeover' && leaders.length) {
        const t = leaders[fnv(`${plan.name}|handoff|${i}`) % leaders.length];
        leadVoice = t.instrument; leadId = t.id;
        if (!active.includes(t.id)) { active.push(t.id); mass += t.mass; }
      } else if (arch.lead === 'dialogue' && leaders.length) {
        // D59 call & response: the piano and the answering voice TAKE TURNS
        // owning the lead lane within the section — two-bar call, two-bar
        // answer (video 10's own phrase length). The masks implement the
        // alternation; the answer voice derives the lead line, so the answer
        // is the call echoed in another instrument's voice.
        const t = leaders[fnv(`${plan.name}|dialogue|${i}`) % leaders.length];
        leadVoice = `piano ⇄ ${t.instrument}`; leadId = t.id;
        dialogue = { answerId: t.id, phraseBars: 2 };
        if (!active.includes(t.id)) { active.push(t.id); mass += t.mass; }
      }
      secs.push({
        index: i, archetype: shape[i], startBar: bar, bars: sectionBars,
        energy: arch.energy, lead: leadVoice, leadLayerId: leadId, dialogue,
        pianoLead: leadVoice === 'piano' || Boolean(dialogue), active,
        massSounding: Math.round(mass * 100) / 100,
        why: arch.why + (dropped.length ? ` (${dropped.join(', ')} held back: this section is already at its mass ceiling)` : ''),
      });
      bar += sectionBars;
    }
    return secs;
  };
  // A section is only an EVENT if it does not sound like the one before it. On
  // a roster with no doubling layer, 'full' takes exactly what 'answer' took
  // and the pair plateaus — measured as `answer:348 full:348` haps, two bars of
  // arrangement that the ear cannot tell apart. So a shape is judged against
  // the roster it will actually be applied to: how many distinct states it
  // produces, and how few adjacent repeats. Ties break on the song's hash, so
  // the choice is still the song's own and still deterministic.
  const options = (ROLE_FORM[plan.role] ?? DEFAULT_FORM).map((shape) => {
    let s = shape.slice();
    // A handoff with nobody to hand off to is a dropout — the exact failure the
    // lead rule exists to stop. Degrade to the equivalent ordinary archetype.
    // A dialogue degrades the same way (no answering voice), and also when the
    // section is too short to hold one call AND one answer — an alternation
    // that never alternates is a dropout wearing a dialogue's name.
    if (!leaders.length) s = s.map((a) => (a === 'handoff' ? 'answer' : a === 'fullHandoff' ? 'full' : a === 'dialogue' ? 'answer' : a));
    if (sectionBars < 4) s = s.map((a) => (a === 'dialogue' ? 'answer' : a));
    // Nor is an arrangement with no tune in it a form.
    if (!s.some((a) => ARCHETYPES[a].lead)) s = ['statement', ...s.slice(1)];
    const secs = build(s);
    const state = (x) => `${[...x.active].sort().join(',')}|${x.lead}`;
    const distinct = new Set(secs.map(state)).size;
    let repeats = 0;
    for (let i = 1; i < secs.length; i++) if (state(secs[i]) === state(secs[i - 1])) repeats++;
    // If a voice was cast specifically to be able to take the tune, a shape
    // that hands it the tune is doing the job the casting intended. Without
    // this the takeover was cast in 43 songs and led in 5, and in the other 38
    // it was forced into the peak by the every-layer-must-be-heard rule — where
    // it played the lead line in unison with the piano, which is a doubling
    // wearing a takeover's name.
    const usesLeader = leaders.length && secs.some((x) => x.leadLayerId);
    return { shape: s, secs, score: distinct * 2 - repeats + (usesLeader ? 3 : 0) };
  }).sort((a, b) => b.score - a.score);
  // D59 addendum (Ethan): call & response must not be "always the case" —
  // "sometimes it's just normal layering or other things". Measured before this
  // guard: every leader-capable town and overworld song picked the dialogue
  // shape, because a dialogue's alternating lead is one extra distinct state
  // and so it strictly outscored its rivals — the hash tie-break never got a
  // say. Whether a song converses AT ALL is a character trait, not a scoring
  // inevitability, so it is decided like every other variety choice (D46): when
  // dialogue and non-dialogue shapes are both within one state's worth of the
  // best score, the song's own hash decides which kind it is — about a third
  // converse — and the best shape of that kind wins.
  let pool = options;
  const NEAR = 2; // one distinct-state's worth of score
  const near = options.filter((o) => o.score >= options[0].score - NEAR);
  const talks = (o) => o.secs.some((x) => x.dialogue);
  if (near.some(talks) && near.some((o) => !talks(o))) {
    const converse = fnv(`${plan.name}|converses`) % 3 === 0;
    pool = near.filter((o) => talks(o) === converse);
    if (!converse) notes.push('this song does not converse — dialogue shapes stood aside (a third of eligible songs take them)');
  }
  const top = pool.filter((o) => o.score >= pool[0].score);
  const pick = top[fnv(`${plan.name}|form`) % top.length];
  const sections = pick.secs;
  notes.push(`form: ${pick.shape.join(' → ')} — ${new Set(pick.secs.map((x) => [...x.active].sort().join(',') + x.lead)).size} distinct states from a roster of ${plan.layers.length}, best of ${options.length} shapes for role "${plan.role ?? 'none'}"`);
  let bar = pick.secs.length ? pick.secs[pick.secs.length - 1].startBar + sectionBars : 0;

  // The rule that outranks the shape: once the tune has arrived it never
  // vanishes again except into a deliberate tag at the very end.
  let arrived = false;
  for (const sec of sections) {
    if (sec.lead !== 'none') { arrived = true; continue; }
    const isTail = sec.index === sections.length - 1;
    if (arrived && !(isTail && sec.archetype === 'tag')) {
      sec.lead = 'piano'; sec.pianoLead = true; sec.archetype = 'statement';
      sec.why = `${ARCHETYPES.statement.why} (the shape asked for no melody here, but the tune had already arrived and dropping it reads as a fault)`;
      notes.push(`section ${sec.index}: restored the piano lead — a silent lead after the tune has arrived is the "melody just stops" failure`);
    }
  }
  // every layer on the roster must be heard SOMEWHERE, or it is dead weight the
  // plan is carrying and the edit pass would have to explain
  const heard = new Set(sections.flatMap((sec) => sec.active));
  for (const l of plan.layers) {
    if (heard.has(l.id)) continue;
    const peak = sections.reduce((a, b) => (b.energy > a.energy ? b : a));
    if (l.canLead) {
      // A voice cast to CARRY the tune must be given the tune, not stacked on
      // top of the piano playing the same line — that is a doubling, and it is
      // how a "takeover" came to sound like nothing in particular.
      peak.lead = l.instrument; peak.leadLayerId = l.id; peak.pianoLead = false;
      peak.archetype = peak.archetype === 'full' ? 'fullHandoff' : 'handoff';
      peak.why = `${ARCHETYPES[peak.archetype].why} (no section had claimed the handoff, and a takeover voice that never takes over is just a second piano)`;
      notes.push(`${l.instrument} was cast to lead but no section handed it the tune — it takes over at the peak instead`);
      peak.active.push(l.id);
      heard.add(l.id);
      continue;
    }
    // An unheard voice has to go SOMEWHERE with room for it — forcing it into
    // the peak regardless is how a mass ceiling stops meaning anything. Take
    // the busiest section that can still afford it; failing that, trade it
    // against the heaviest voice already in the peak, so the roster is heard
    // and the ceiling holds.
    const ceilOf = (sec) => plan.massAtOnce * (ARCHETYPES[sec.archetype]?.massMul ?? 1);
    const room = sections
      .filter((sec) => sec.lead !== 'none' && sec.massSounding + l.mass <= ceilOf(sec) + 1e-9)
      .sort((a, b) => b.energy - a.energy)[0];
    if (room) {
      room.active.push(l.id);
      room.massSounding = Math.round((room.massSounding + l.mass) * 100) / 100;
      notes.push(`${l.instrument} was cast but no section wanted it — it enters at section ${room.index}, the busiest one with room for it`);
    } else {
      // ...and only against a voice that still sounds somewhere else, or the
      // trade just moves the problem onto the layer it displaced
      const elsewhere = (id) => sections.some((sec) => sec !== peak && sec.active.includes(id));
      const heaviest = peak.active
        .map((id) => plan.layers.find((x) => x.id === id))
        .filter((x) => x && !x.canLead && x.mass >= l.mass && elsewhere(x.id))
        .sort((a, b) => b.mass - a.mass)[0];
      if (!heaviest) { notes.push(`${l.instrument} was cast and cannot be fitted anywhere — left silent rather than making the peak mud`); continue; }
      peak.active = peak.active.filter((id) => id !== heaviest.id).concat(l.id);
      peak.massSounding = Math.round((peak.massSounding - heaviest.mass + l.mass) * 100) / 100;
      notes.push(`${l.instrument} traded places with ${heaviest.instrument} at the peak: both were cast, only one fits, and the lighter one is the one that fits`);
    }
    heard.add(l.id);
  }

  // Two adjacent sections that sound the same are one section wearing two
  // names, and the second one is not the event the form promised. Where a shape
  // still plateaus after selection — usually 'answer' into 'full' on a roster
  // with nothing to double the tune — THIN THE EARLIER ONE, so the later
  // becomes a genuine entry. Thinning backwards rather than padding forwards
  // keeps the contour rising and costs no extra mass.
  const stateOf = (x) => `${[...x.active].sort().join(',')}|${x.lead}`;
  for (let i = 1; i < sections.length; i++) {
    if (stateOf(sections[i]) !== stateOf(sections[i - 1])) continue;
    const prev = sections[i - 1];
    // give up the last voice to have joined — the one whose entry is most
    // recent is the one the ear will most readily hear arrive
    const give = prev.active[prev.active.length - 1];
    if (!give || prev.leadLayerId === give) continue;
    prev.active = prev.active.filter((id) => id !== give);
    const gl = plan.layers.find((l) => l.id === give);
    prev.massSounding = Math.round((prev.massSounding - (gl ? gl.mass : 0)) * 100) / 100;
    prev.why += ` — and holds ${gl ? gl.instrument : give} back, so its arrival in the next section is something the ear can catch`;
    notes.push(`sections ${i - 1} and ${i} would have sounded identical: ${gl ? gl.instrument : give} now enters at ${i} instead of ${i - 1}`);
  }


  return { sectionBars, totalBars: bar, sections, notes };
}

// Masks are built PER BAR, not per section, because a dialogue section (D59)
// splits its bars between two voices: the piano owns the lead lane for
// `phraseBars` bars, the answering voice owns the next `phraseBars`, and the
// two alternate to the section's end. For every other section a bar inherits
// its section's value, so non-dialogue songs compress to exactly the strings
// the per-section version produced.

/** per-bar 0/1 activity for a layer, dialogue turn-taking included */
export function maskBarsFor(id, form) {
  const bars = [];
  for (const sec of form.sections) {
    const on = sec.active.includes(id);
    if (on && sec.dialogue && sec.dialogue.answerId === id) {
      const pb = sec.dialogue.phraseBars;
      // the answer voice takes the SECOND half of each call/answer pair
      for (let b = 0; b < sec.bars; b++) bars.push(Math.floor(b / pb) % 2 === 1 ? 1 : 0);
    } else {
      for (let b = 0; b < sec.bars; b++) bars.push(on ? 1 : 0);
    }
  }
  return bars;
}
/** per-bar 0/1 for the piano lead — the sections, and in a dialogue the CALLS,
 *  where the piano itself holds the tune */
export function pianoLeadBars(form) {
  const bars = [];
  for (const sec of form.sections) {
    if (sec.dialogue) {
      const pb = sec.dialogue.phraseBars;
      for (let b = 0; b < sec.bars; b++) bars.push(Math.floor(b / pb) % 2 === 0 ? 1 : 0);
    } else {
      for (let b = 0; b < sec.bars; b++) bars.push(sec.pianoLead ? 1 : 0);
    }
  }
  return bars;
}
/** a per-bar 0/1 array as the run-length string `.mask()` takes */
export function maskString(bars) {
  const out = [];
  for (const v of bars) {
    const last = out[out.length - 1];
    if (last && last.v === v) last.n += 1; else out.push({ v, n: 1 });
  }
  return out.map(({ v, n }) => (n === 1 ? `${v}` : `${v}@${n}`)).join(' ');
}

/** the per-bar mask a layer needs to sound only in the sections (and, in a
 *  dialogue, the turns) it owns */
export function maskFor(id, form) { return maskString(maskBarsFor(id, form)); }
/** the piano lead's mask, as a string */
export function pianoLeadMask(form) { return maskString(pianoLeadBars(form)); }

// ---------------------------------------------------------------------------
// LETTER FORM (D59) — which MELODY is playing when.
//
// D47 answers "who is playing"; this answers "what tune are they playing".
// Ethan's brief: "combine harmony and melody generation, then test how it
// changes throughout the song with both harmony changing and melody changing
// (where melodic changes follow musical structures like ABAB or ABCD or ABCA
// etc)". A letter names a melody: every section with the same letter states
// the SAME melody (same seed — the Theme Transformer lesson, the theme recurs
// recognizably), and a new letter is a genuinely different line (different
// seed, different rhythm cell).
//
// The letter form also decides WHERE the harmony varies. Ethan's variation
// ruling: "songs naturally have variation in the harmony... a sweet treat
// without changing the song itself. these have their place in the song and
// shouldn't be randomly thrown in." The place chosen here is the LAST REPRISE
// — the final return of an already-heard letter — because a variation is only
// audible as a variation against something already known: vary the first A
// and there is no norm to vary from; vary the last and the listener hears the
// familiar tune go somewhere slightly new, which is the sweet treat. A scheme
// with no reprise (ABCD) gets no variation, because with nothing restated
// there is nothing to vary.
// ---------------------------------------------------------------------------

// Candidate letter schemes by how many tune-carrying sections the form has.
// Ethan named ABAB / ABCD / ABCA; the rest are the standard song-form set.
export const LETTER_SCHEMES = {
  1: ['A'],
  2: ['AB', 'AA'],
  3: ['ABA', 'ABC', 'AAB'],
  4: ['ABAB', 'ABCA', 'AABA', 'ABAC', 'ABCD'],
  5: ['ABABC', 'AABAB', 'ABCAB', 'ABACA'],
  6: ['ABABCB', 'AABABC', 'ABCABC'],
};

/**
 * planMelodyForm(form, { name, scheme? }) -> {
 *   scheme, sections: [{ index, letter|null, reprise, varyHarmony }],
 *   letters (distinct, in order of first appearance), varySection, notes }
 *
 * Only sections that carry a tune get letters; an ostinato/bed/tag section has
 * no melody to name. `scheme` forces one (tests, or a caller with a brief);
 * otherwise the song's own hash picks from the candidates for its length,
 * so the choice is deterministic and per-song, like every other form choice.
 */
export function planMelodyForm(form, { name = 'song', scheme = null } = {}) {
  const notes = [];
  const tuneIdx = form.sections.filter((s) => s.lead !== 'none').map((s) => s.index);
  const k = tuneIdx.length;
  if (!k) return { scheme: '', sections: form.sections.map((s) => ({ index: s.index, letter: null, reprise: false, varyHarmony: false })), letters: [], varySection: null, notes: ['no section carries a tune — no letters to assign'] };
  const pool = LETTER_SCHEMES[Math.min(k, 6)] ?? LETTER_SCHEMES[6];
  let chosen = scheme ?? pool[fnv(`${name}|letters`) % pool.length];
  // longer forms than the table knows: repeat the scheme (a loop of the form)
  while (chosen.length < k) chosen += chosen;
  chosen = chosen.slice(0, k);
  const byIndex = new Map();
  const seen = new Set();
  let varySection = null;
  tuneIdx.forEach((ix, j) => {
    const letter = chosen[j];
    const reprise = seen.has(letter);
    seen.add(letter);
    if (reprise) varySection = ix; // keeps the LAST reprise
    byIndex.set(ix, { letter, reprise });
  });
  const sections = form.sections.map((s) => {
    const rec = byIndex.get(s.index);
    return {
      index: s.index,
      letter: rec?.letter ?? null,
      reprise: rec?.reprise ?? false,
      varyHarmony: false,
    };
  });
  if (varySection != null) {
    sections[form.sections.findIndex((s) => s.index === varySection)].varyHarmony = true;
    notes.push(`harmony varies at section ${varySection} — the last reprise, where a familiar tune makes the variation audible as one`);
  } else {
    notes.push('no reprise in this scheme — nothing is restated, so nothing is varied');
  }
  notes.push(`letter form ${chosen} over ${k} tune sections (scheme ${scheme ? 'forced' : 'hash-picked'})`);
  return { scheme: chosen, sections, letters: [...seen], varySection, notes };
}

/**
 * renderLetterLead(form, mf, exprFor) -> { lead, perLetter }
 *
 * The piano lead as a stack of per-letter melodies, each masked to the bars
 * where (a) its letter's section is playing and (b) the piano actually owns
 * the lead lane — dialogue answer bars belong to the answering layer, whose
 * own expression is rebound by the caller to the section's letter.
 *
 * `exprFor(letter)` binds and returns that letter's melody expression.
 */
export function renderLetterLead(form, mf, exprFor) {
  const letterOf = new Map(mf.sections.map((s) => [s.index, s.letter]));
  const perLetter = {};
  const parts = [];
  for (const letter of mf.letters) {
    const bars = [];
    for (const sec of form.sections) {
      const mine = letterOf.get(sec.index) === letter;
      if (!mine) { for (let b = 0; b < sec.bars; b++) bars.push(0); continue; }
      if (sec.dialogue) {
        const pb = sec.dialogue.phraseBars;
        for (let b = 0; b < sec.bars; b++) bars.push(Math.floor(b / pb) % 2 === 0 ? 1 : 0);
      } else {
        for (let b = 0; b < sec.bars; b++) bars.push(sec.pianoLead ? 1 : 0);
      }
    }
    if (!bars.some(Boolean)) continue;
    const expr = exprFor(letter);
    if (!expr) continue;
    const m = maskString(bars);
    const masked = /^1(@\d+)?$/.test(m) ? expr : `${expr}.mask("<${m}>")`;
    perLetter[letter] = masked;
    parts.push(masked);
  }
  return {
    perLetter,
    lead: parts.length === 0 ? null : parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`,
  };
}

function gainFor(part, inst) {
  const base = {
    melody_backup: 0.4, melody_takeover: 0.85, alternate_melody: 0.5,
    counter_melody: 0.45, additional_harmony: 0.4, harmony_support: 0.32,
  }[part] ?? 0.4;
  // loud instruments that cut are pulled back so the piano stays the subject
  const trim = inst.cuts > 0.8 ? 0.85 : 1;
  // ...and then the per-voice level correction (D46). GM soundfonts differ by
  // a factor of two in absolute loudness and `cuts` does not describe that: a
  // flute has a bright penetrating tone AND a quiet sample, which is how 34
  // flute layers went unheard. Capped so nothing can shout over the piano.
  const level = inst.level ?? 1;
  return Math.round(Math.min(0.9, base * trim * level) * 100) / 100;
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

/**
 * renderForm(renderedLayers, leadExpr, form) -> { parts, sectionsHtmlSafe }
 *
 * Applies the form to already-rendered expressions: each layer is masked to the
 * sections it belongs to, and the piano lead is masked to the sections where
 * the piano itself holds the tune. `.mask()` gates per bar, so the mask cycles
 * with the whole form while each pattern keeps its own period — which is why
 * planForm() sizes a section to contain whole phrases of everything in it.
 *
 * Returns the layer list with a `formExpr` on each, plus the masked lead.
 */
export function renderForm(layers, leadExpr, form) {
  const out = layers.map((l) => {
    const m = maskFor(l.id, form);
    // a layer that plays in every section needs no mask at all
    const always = /^1(@\d+)?$/.test(m);
    return {
      ...l,
      formMask: m,
      sections: form.sections.filter((s) => s.active.includes(l.id)).map((s) => s.index),
      formExpr: always ? l.expr : `${l.expr}.mask("<${m}>")`,
    };
  });
  const lm = pianoLeadMask(form);
  const leadAlways = /^1(@\d+)?$/.test(lm);
  return {
    layers: out,
    leadMask: lm,
    lead: leadExpr == null ? null
      : leadAlways ? leadExpr : `${leadExpr}.mask("<${lm}>")`,
  };
}
