HANDOFF: Strudel Song Engine — iterative AI music generation
You are inheriting a designed-and-partially-validated project. Read this whole document before writing code. The architecture below was developed across a long design conversation and its core mechanics were empirically verified in a sandbox — the verified facts are marked as such and are not up for relitigation. Everything marked "your call" genuinely is.
1. Mission
Build a system that lets an LLM (you) generate and — critically — iteratively edit full songs in Strudel (strudel.cc, the JS port of TidalCycles), such that:
An edit request ("make the hats busier", "the chorus should lift more") modifies only the targeted material. Editing must never degrade into full regeneration. This is enforced mechanically, not by convention.
Songs are full songs with real form (ABAB, ABC, verse/chorus/bridge), not loops. Sections relate to each other structurally: a section knows its place in the song, which sections it partners with, contrasts with, sets up, and resolves.
Melodic/rhythmic material is drawn from a curated abstract library (interval contours, onset sets — never literal note strings) and bound to the current harmonic context, so library material adapts instead of being copy-pasted. Material must respect harmonic anchors (root, dominant, chord tones on strong beats) — never random notes poured into a rhythm.
Library application is selective and scoped: a selection (instrument × contour × rhythm) is bound and applied to exactly ONE labeled track. Most of the song is freely generated; library entries are seasoning, not the meal.
Melody/harmony material is portable across songs: the same contour can be re-bound against a new song's harmony ("renovation").
The human (Ethan) can hear and verify every output easily, and every generated/edited song ships with a machine-verification report.
Design philosophy (the honest version — internalize this)
The system raises the floor, not the ceiling. Constraints and metrics catch failures of function (wrong notes, dead structure, a chorus that doesn't lift, an edit that leaked). They cannot produce "catchy." The bet is: make the human's ear the cheap part of the loop. Fast, surgical, verified iteration is the product. Optimize for iteration latency and edit precision over one-shot quality.
2. Verified ground truth (do not re-derive; trust and build on)
These were run successfully in a Node 22 sandbox:
Headless evaluation works, with a version pin. Latest @strudel/core imports @kabelsalat/web (browser-only) and crashes in Node. Pin @strudel/core@1.1.0, @strudel/mini@1.1.0, @strudel/tonal@1.1.0 (or find/write a shim — your call, but the pin is the known-good path).
The binding pipeline works. Abstract rhythm (onsets as cycle fractions + accent profile) × interval contour (scale degrees) × harmonic anchor → mini-notation grid → .scale() → queryArc() produced correct, in-key, contour-preserving notes on the correct onsets:
js
import { mini } from '@strudel/mini';
import '@strudel/tonal'; // side-effect registers .scale(), .chord(), .voicing()

const rhythm  = { onsets: [0, 3/16, 6/16, 10/16, 12/16, 15/16],
                  accents: [1.0, .5, .8, .6, .9, .4] };
const contour = { degrees: [0, 2, 4, 3, 1, 0] };
const grid = Array(16).fill('~');
rhythm.onsets.forEach((t, i) =>
  grid[Math.round(t * 16)] = String(contour.degrees[i]));
const melody = mini(grid.join(' ')).scale('C4:minor').note();
melody.queryArc(0, 1).filter(h => h.hasOnset());
// => C4 Eb4 G4 F4 D4 C4 at 0, 3/16, 3/8, 5/8, 3/4, 15/16  ✓
The containment diff works. Serializing queryArc(0, N) haps per label for two versions and comparing detects exactly which labels changed. This is the enforcement mechanism for scoped edits.
hap.whole.begin.toFraction(), hap.value (e.g. {note: "C4"}), hap.hasOnset() are the API surface you need for metrics.
3. Architecture (the load-bearing decisions)
3.1 Source format: labeled layers + hoisted bindings
Every song is a single Strudel file using labeled statements (native Strudel: label: pattern, _label: mutes, $: is anonymous). Every cross-cutting concern is hoisted to a named let binding at the top:
js
let key    = "F:minor"
let chords = chord("<Fm9 Bbm9 Db^7 Eb7>/4").dict('ireal')
let form   = { /* section masks derived from the song spec */ }

drums: s("bd*4, ~ sd").bank("tr909").mask(form.drums)
bass:  n("0*4").set(chords).mode("root:g2").voicing().mask(form.bass)
lead:  /* bound library material */ .mask(form.lead)
Invariant: every likely edit request maps to one contiguous source region. Parameter tweak → one method call. Sound swap → one .s(). Rhythm → one layer's pattern string. Key/harmony/arrangement → one hoisted binding. Lay the file out around the edit taxonomy, not around aesthetics.
3.2 Song spec: a section graph, not a section list
A JSON spec is the source of truth; the Strudel file is compiled from it. Sections are nodes with typed relational edges — meaning is relational, not absolute (a chorus is louder than its verse, a breakdown is sparse relative to the drop it sets up):
json
{ "form": "A B A' B C B",
  "meter": "4/4", "genre": "house", "key": "F:minor",
  "motifs": { "m1": { "degrees": [0,2,4,3,1,0] } },
  "sections": {
    "A":  { "role": "verse", "bars": 16, "harmony": "i iv i V",
            "motifs": ["m1"] },
    "B":  { "role": "chorus", "contrasts_with": "A", "resolves": "A",
            "must": { "density": ">1.4x A", "register_span": "wider than A" },
            "motifs": [{ "use": "m1", "transform": "invert+octave_up" }] },
    "A'": { "recalls": "A", "vary": { "drums": "denser", "melody": "keep" } },
    "C":  { "role": "bridge", "sets_up": "B", "withhold": ["bass"] }
  } }
Recurrence (ABAB) is thereby declared, not accidental; recalls + vary distinguishes a varied return from a copy. sets_up + withhold encodes contribution (the withheld bass returning IS the payoff). Cross-song renovation = re-binding a motif's contour against a different song's harmony — same operation as in-song binding.
3.3 The verification harness (build FIRST — everything depends on it)
Headless Node module that evaluates a labeled song file and exposes:
hapsByLabel(file, fromCycle, toCycle) → per-label onset-filtered hap lists
Containment check: given (old file, new file, allowed labels/bindings), assert every non-allowed label's hap signature is identical. An edit that leaks → REJECT, retry. This gates every edit, including your own. It also produces the human-readable changelog ("bass: 8 haps, 3 pitches changed, timing unchanged").
Section metrics (computed per label per section's cycle range): onset density, register span, syncopation (fraction of onsets off strong-beat grid — derive the grid from the meter, do NOT hardcode 4/4), pitch-class entropy, harmonic rhythm, onset variety.
Relational assertions: evaluate each section's must constraints against its referenced partner sections. Fail → report which constraint, by how much.
Harmonic assertions: accented onsets carry chord tones (or documented exceptions); cadence targets land.
Motif assertions: declared transforms preserve interval contour identity.
3.4 The binder
bind(rhythmEntry, contourEntry, harmonyContext, meter) → labeled layer. Rules:
Place contour degrees on onsets; snap degrees on accented onsets to nearest chord tone; weak onsets may pass through as passing/neighbor tones. Exact passing-tone policy: your call, but it must be deterministic given a seed.
Wire accents to .gain() (or velocity), swing to timing (.swingBy() or .late() micro-push). A rhythm entry played at uniform velocity is a bug, not a style.
Respect cadence targets from the section spec (final onset degree constraints).
3.5 Libraries (all abstract; ~30 excellent entries beats 300 mediocre)
Rhythms: { onsets: [fractions] | euclid: [k,n,rot], accents: [...], swing: x, microtiming?: [...], meter_class } — indexed by computed properties (density, syncopation, downbeat-anchored) so retrieval is by musical function, not genre tag. NEVER stored as mini-notation strings (breaks outside 4/4).
Contours: scale-degree sequences + shape metadata (arch, rise, fall, zigzag).
Voicing shapes: offset strings compatible with Strudel's addVoicings format (['0 3 7', '7 12 16']) so they drop into .dict().
Interlock pairs (critical — biggest musical risk in the whole design): great grooves are co-designed; independently-selected components produce jointly mediocre results. Store kick+bass (etc.) as paired entries, and implement a complement score (fraction of one rhythm's onsets falling in the partner's gaps) that the binder checks when combining rhythmic layers. Mix-and-match, but never blindly.
Transitions (first-class, non-optional): fills/risers/drops indexed by (from_role → to_role). Sections butted together without transition material sound like a playlist skipping — this is the most common failure of every existing tool.
3.6 Strudel gotchas (learned the hard way; respect these)
Effects are single-use per pattern: .lpf(100).distort(2).lpf(800) — the second .lpf silently overrides the first. Never emit code relying on effect re-application.
One delay + one reverb per orbit; two patterns on the same orbit with different delay/reverb params = unpredictable. Assign orbits deliberately.
Double-quoted strings are mini-notation in the REPL; in @strudel/web/headless, quote semantics differ — use mini() / evaluate() explicitly in the harness.
LLM training data on Strudel is thin: validate every emitted function name against the installed package exports or @strudel/reference (npm package containing metadata for all documented functions). Unknown function → lint error, not runtime surprise.
4. Creative freedom (genuinely your call)
Repo layout, language/tooling choices, CLI vs. library API design, the spec schema's exact field names and any fields you find missing, the passing-tone policy, additional metrics you think earn their keep, how retrieval scores library entries, seed/determinism design, how transitions are parameterized, and the structural planning of the build beyond the dependency order in §6. If you believe part of the architecture above is wrong, build the specified version first so there's a baseline, then propose the change with a demonstrated diff. Surprise me in the places that are taste; be boring in the places that are plumbing.
5. Deliverables & acceptance criteria
Harness (verify command): containment check + all assertion families + metrics report (JSON + pretty). Acceptance: deterministic test suite in which (a) a scoped edit passes, (b) a deliberately leaky edit is rejected, (c) a chorus violating its must constraints is flagged with the measured values.
Compiler: song spec JSON → labeled Strudel file honoring §3.1.
Binder with harmonic snapping, accents→gain, swing, complement scoring.
Seed libraries: ≥12 rhythm entries (with real accent profiles), ≥10 contours, ≥6 voicing shapes, ≥4 interlock pairs, ≥6 transitions. Quality over count; document the taste each entry encodes.
Two demo songs (different genres, one in a non-4/4 meter) + one demonstrated edit session: a transcript of ≥5 sequential scoped edits on one song, each passing containment, with before/after metrics.
HUMAN VERIFICATION LOOP (non-negotiable — Ethan must be able to test without reading code):
Every song/edit emits a paste-ready .strudel file for strudel.cc.
Additionally emit a local listen.html embedding the @strudel/repl web-component (unpkg bundle) with: the current version loaded, play/stop, and per-label mute toggles (leverage _label: muting) so he can A/B an edit by ear in one click. For an edit, include a before/after switch.
Every emission is accompanied by report.md: what changed (per-label hap diff summary), which assertions passed/failed with numbers, and what to listen for.
A top-level SESSIONS.md explains the 3 commands he needs: generate, edit, verify.
README covering setup (including the version pin and why), the edit workflow, and how to add library entries.
6. Build order (dependency-driven; do not reorder 1→2)
Harness (containment + metrics) — everything else is untestable without it.
Compiler (spec → labeled file) + a hand-written toy song to exercise the harness.
Binder (+ interlock scoring).
Section-graph assertions wired into verify.
Libraries + transitions.
Demo songs + edit-session transcript + listen.html polish.
Work incrementally; keep the harness green at every step. When ambiguity remains after this document, make the call, note it in DECISIONS.md, and keep moving.