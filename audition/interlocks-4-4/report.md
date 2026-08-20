# interlocks-4-4 — v0

_2026-08-20 03:43 · 4/4 · cycles 0–16_

## Verification

- lint: clean
- evaluates headlessly: yes
- assertions: 4/4 pass

### interlock
- ✅ `house_pump.layer_a+layer_b` — complement joint=1 (layer_b in layer_a gaps: 1, reverse: 1) [declared pair] [texture grid — complement n/a]
- ✅ `two_step_snap.layer_a+layer_b` — complement joint=1 (layer_b in layer_a gaps: 1, reverse: 1) [declared pair]
- ✅ `clave_push.layer_a+layer_b` — complement joint=1 (layer_b in layer_a gaps: 1, reverse: 1) [declared pair]
- ✅ `dembow_ride.layer_a+layer_b` — complement joint=0.367 (layer_b in layer_a gaps: 0.733, reverse: 0) [declared pair] [texture grid — complement n/a]

## Per-label metrics

| label | onsets | density | span | sync | accVar | variety |
|---|---|---|---|---|---|---|
| layer_a | 60 | 3.75 | 0 | 0.4 | 0.007006 | 0.2 |
| layer_b | 112 | 7 | 0 | 0.714286 | 0.018609 | 0.2 |

---
_Open `listen.html` for per-label mutes and A/B; `*.strudel` files are paste-ready for strudel.cc._
