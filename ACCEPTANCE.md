# §5 Acceptance checklist — run 2026-08-21T02:30

- [x] deterministic test suite green — _112 pass / 0 fail (npm test)_
- [x] §5(a) scoped edit passes — _test/harness.test.js "ACCEPTANCE (a)"_
- [x] §5(b) leaky edit rejected — _test/harness.test.js "ACCEPTANCE (b)"_
- [x] §5(c) must-violating chorus flagged with measured values — _test/binder.test.js "ACCEPTANCE (c)"_
- [x] compiler: spec -> labeled file honoring §3.1 — _test/compiler.test.js_
- [x] binder: harmonic snapping, accents→gain, swing, complement scoring — _test/binder.test.js_
- [x] rhythms ≥12 with real accent profiles (24) — _src/lib/rhythms.js_
- [x] contours ≥10 (12) — _src/lib/contours.js_
- [x] voicing shapes ≥5 after audition r1 kills (5) — _src/lib/voicings.js_
- [x] interlock pairs ≥4 (5) — _src/lib/interlocks.js_
- [x] transitions ≥6 (7) — _src/lib/transitions.js_
- [x] every entry documents the taste it encodes — _character fields, asserted in tests_
- [x] two demo songs, different genres (deep house / odd-meter instrumental) — _songs/_
- [x] one demo in a non-4/4 meter (7/8) — _songs/aksak-lantern_
- [x] neon-undertow: paste-ready .strudel + listen.html + report.md + meta — _songs/neon-undertow/_
- [x] aksak-lantern: paste-ready .strudel + listen.html + report.md + meta — _songs/aksak-lantern/_
- [x] listen.html: per-label mutes + before/after A-B + pinned repl bundle — _songs/neon-undertow/listen.html_
- [x] edit session: 6 sequential scoped edits (≥5), 8 versions on disk — _songs/neon-undertow/EDIT_SESSION.md_
- [x] edit session demonstrates a REJECTED leaky edit — _EDIT_SESSION.md rejection demo_
- [x] SESSIONS.md: the 3 commands — _SESSIONS.md_
- [x] README: setup + version pin & why + edit workflow + adding entries — _README.md_
- [x] DECISIONS.md log exists with dated judgment calls — _DECISIONS.md_
- [x] eval: three arms with replicates on disk — _eval/_

**ALL CHECKS PASS**
