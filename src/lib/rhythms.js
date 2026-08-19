// Rhythm library (§3.5). ABSTRACT ONLY: onsets as cycle fractions (strings keep
// them exact) or euclid [k,n,rot]; accents are REAL profiles (uniform velocity is
// a bug); swing/microtiming are data the binder applies. Never mini-notation —
// these must survive any meter. `character` documents the taste each entry encodes.
// Retrieval is by computed properties (density/syncopation/downbeat anchoring),
// not genre tags — tags are secondary hints.

export const RHYTHMS = {
  four_floor: {
    onsets: ['0', '1/4', '1/2', '3/4'],
    accents: [1.0, 0.85, 0.92, 0.85],
    meter_class: '4/4', tags: ['kick', 'house', 'techno'],
    character: 'The floor. Beat 3 slightly heavier than 2/4 so the bar breathes instead of marching.',
  },
  offbeat_8ths: {
    onsets: ['1/8', '3/8', '5/8', '7/8'],
    accents: [0.75, 0.6, 0.8, 0.62],
    meter_class: '4/4', tags: ['hat', 'bass', 'house'],
    character: 'Pure offbeat pulse — the exhale between four-floor kicks. Accent tilts to the 3& lift.',
  },
  backbeat_ghost: {
    onsets: ['1/4', '7/16', '3/4', '15/16'],
    accents: [1.0, 0.35, 0.95, 0.4],
    meter_class: '4/4', tags: ['snare', 'breaks', 'dnb'],
    character: 'Backbeat 2 & 4 with ghost 16ths dragging into the next beat — the ghosts ARE the groove.',
  },
  tresillo: {
    euclid: [3, 8],
    accents: [1.0, 0.7, 0.85],
    meter_class: '4/4', tags: ['kick', 'latin', 'reggaeton', 'pop'],
    character: '3-in-8, the most exported rhythm on earth. Middle onset softest so the last one pushes forward.',
  },
  son_clave_3: {
    onsets: ['0', '3/16', '3/8', '5/8', '3/4'],
    accents: [1.0, 0.8, 0.9, 0.7, 0.85],
    meter_class: '4/4', tags: ['perc', 'latin', 'melodic'],
    character: 'One-bar son clave (3+2 compressed). Works as melodic rhythm as well as percussion.',
  },
  dembow: {
    onsets: ['0', '3/16', '1/2', '11/16', '7/8'],
    accents: [1.0, 0.85, 0.9, 0.85, 0.55],
    meter_class: '4/4', tags: ['composite', 'reggaeton'],
    character: 'Dembow skeleton — boom-ch-boom-chick with a soft pickup into the next bar.',
  },
  sixteenth_drive: {
    onsets: ['0','1/16','1/8','3/16','1/4','5/16','3/8','7/16','1/2','9/16','5/8','11/16','3/4','13/16','7/8','15/16'],
    accents: [1.0, 0.4, 0.62, 0.4, 0.82, 0.4, 0.62, 0.42, 0.9, 0.4, 0.62, 0.4, 0.82, 0.42, 0.66, 0.46],
    meter_class: '4/4', tags: ['hat', 'trance', 'house'],
    character: 'Continuous 16ths with a beat-weighted accent hierarchy — drive without flatness. The last two lift into the next bar.',
  },
  swung_lofi_hats: {
    onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    accents: [0.9, 0.42, 0.72, 0.46, 0.86, 0.4, 0.72, 0.52],
    swing: 0.55,
    meter_class: '4/4', tags: ['hat', 'lofi', 'hiphop'],
    character: 'Straight 8ths swung hard (0.55). Accents lean on 1 and 3 so the swing reads as lazy, not lopsided.',
  },
  lazy_dilla: {
    onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    accents: [0.95, 0.5, 0.75, 0.55, 0.9, 0.5, 0.7, 0.6],
    microtiming: ['0', '1/64', '0', '1/48', '0', '1/64', '0', '1/48'],
    meter_class: '4/4', tags: ['hat', 'perc', 'lofi', 'hiphop'],
    character: 'Dilla drag: every offbeat lands late by an uneven hair (1/64 vs 1/48) — drunk but deliberate.',
  },
  two_step_kick: {
    onsets: ['0', '3/8', '5/8'],
    accents: [1.0, 0.65, 0.85],
    meter_class: '4/4', tags: ['kick', 'garage', 'dnb'],
    character: 'UKG two-step kick — hole on beat 2 is the point; the 3& shoves the bar forward.',
  },
  anticipation_bass: {
    onsets: ['0', '7/16', '1/2', '15/16'],
    accents: [0.95, 0.6, 0.85, 0.7],
    meter_class: '4/4', tags: ['bass', 'funk', 'house'],
    character: 'Bass that pre-empts beats 2 and 1 by a 16th — the push-pull against a straight kick.',
  },
  push_pull_16s: {
    onsets: ['0', '3/16', '3/8', '5/8', '3/4', '15/16'],
    accents: [1.0, 0.5, 0.8, 0.6, 0.9, 0.4],
    meter_class: '4/4', tags: ['melodic', 'verified'],
    character: 'The §2 handoff rhythm: strong anchors on 1 and 4 with syncopated pushes between — verified ground truth.',
  },
  gallop_arp: {
    onsets: ['0','1/8','3/16','1/4','3/8','7/16','1/2','5/8','11/16','3/4','7/8','15/16'],
    accents: [1.0, 0.45, 0.6, 0.85, 0.45, 0.6, 0.9, 0.45, 0.6, 0.85, 0.5, 0.65],
    meter_class: '4/4', tags: ['melodic', 'arp', 'trance'],
    character: 'Trance gallop (dum-da-da ×4). Accents on the long note; the two shorts stay under 0.7 so snapping leaves them free.',
  },
  sparse_pedal: {
    onsets: ['0', '3/4'],
    accents: [1.0, 0.6],
    meter_class: 'any', tags: ['bass', 'pad', 'breakdown'],
    character: 'Two anchors per bar. For breakdowns and bridges — space is the material.',
  },
  seven_pulse_223: {
    onsets: ['0', '2/7', '4/7'],
    accents: [1.0, 0.82, 0.9],
    meter_class: '7/8', tags: ['kick', 'aksak'],
    character: '7/8 anchor in 2+2+3: the long third group gets the secondary weight, which is what makes 7 feel intentional.',
  },
  seven_hats_223: {
    onsets: ['0', '1/7', '2/7', '3/7', '4/7', '5/7', '6/7'],
    accents: [1.0, 0.4, 0.78, 0.42, 0.85, 0.45, 0.58],
    meter_class: '7/8', tags: ['hat', 'aksak'],
    character: 'All seven pulses, accented at group starts (1, 3, 5) so the 2+2+3 grouping is audible without a kick.',
  },
  seven_syncopated: {
    onsets: ['0', '3/14', '2/7', '1/2', '9/14', '11/14'],
    accents: [1.0, 0.5, 0.8, 0.9, 0.55, 0.72],
    meter_class: '7/8', tags: ['melodic', 'aksak'],
    character: 'Melodic 7/8 line that ghosts between group boundaries — anchors on 1 and the 4th pulse, pushes elsewhere.',
  },
  waltz_lift: {
    onsets: ['0', '1/3', '2/3'],
    accents: [1.0, 0.55, 0.7],
    meter_class: '3/4', tags: ['kick', 'perc', 'waltz'],
    character: 'ONE-two-three with the lift on 3, not 2 — the third beat leads back to the downbeat.',
  },
};

// ---------------------------------------------------------------------------
// Computed indexing (retrieval by musical function, §3.5)
// ---------------------------------------------------------------------------
import { normalizeRhythm } from '../binder/bind.js';

export function rhythmProperties(entry) {
  const r = normalizeRhythm(entry);
  const meterNum = entry.meter_class && entry.meter_class !== 'any'
    ? Number(entry.meter_class.split('/')[0]) : 4;
  const onGrid = ([n, d]) => (n * meterNum) % d === 0;
  const off = r.onsets.filter((o) => !onGrid(o)).length;
  return {
    density: r.onsets.length,
    syncopation: r.onsets.length ? off / r.onsets.length : 0,
    downbeatAnchored: r.onsets.some(([n]) => n === 0),
    swung: (entry.swing ?? 0) > 0 || !!entry.microtiming,
    accentSpread: Math.max(...entry.accents) - Math.min(...entry.accents),
  };
}

/** Retrieve by musical function: filters over computed properties + meter fit. */
export function findRhythms({ meter = '4/4', minDensity = 0, maxDensity = Infinity, syncopation = null, downbeatAnchored = null, tag = null } = {}) {
  const out = [];
  for (const [name, entry] of Object.entries(RHYTHMS)) {
    if (entry.meter_class !== 'any' && entry.meter_class !== meter) continue;
    const p = rhythmProperties(entry);
    if (p.density < minDensity || p.density > maxDensity) continue;
    if (syncopation === 'high' && p.syncopation < 0.4) continue;
    if (syncopation === 'low' && p.syncopation >= 0.4) continue;
    if (downbeatAnchored != null && p.downbeatAnchored !== downbeatAnchored) continue;
    if (tag && !entry.tags.includes(tag)) continue;
    out.push({ name, entry, properties: p });
  }
  return out;
}
