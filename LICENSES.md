# Asset provenance and licences (r38 packaging)

Every third-party asset the engine touches, what it is licensed under, and
whether it can be SHIPPED (bundled/redistributed to users) or only HOSTED
(rendered server-side, where users receive audio and never the samples).

**Not legal advice.** Each row names where the claim was read so it can be
re-checked. Rows marked *verify* are the ones to confirm before money changes
hands.

## The distinction that decides the architecture

Two rows below permit commercial *use* but not commercial *redistribution*.
That single split is why server-side rendering works and a bundled package does
not: a rendered song is a transformation, and transformations are permitted;
shipping the sample library (or `audition/sample-pack.js`, which embeds the same
audio as mp3 data-URIs) is redistribution, and it is not.

## Composition tier — ships freely

| what | licence | source |
|---|---|---|
| `src/` (the engine) | Ethan Chen, all rights reserved | `package.json` (`UNLICENSED` — **placeholder, must be decided**) |
| `@strudel/*` 1.1.0 | AGPL-3.0 | upstream — **verify**: AGPL on a dependency has reach, see note below |
| `@tonejs/midi`, `acorn`, `acorn-walk` | MIT | upstream |

> **AGPL note, unresolved.** The Strudel packages are AGPL-3.0. The engine
> imports them at runtime. For a hosted service AGPL §13 can require offering
> source to users of that service. This needs a real answer before launch and it
> is not a sample-licensing question — it is the *engine's* licence question.

## Sample tier

| pack | used as | licence | ship? | read from |
|---|---|---|---|---|
| VCSL | `vc_*` percussion, drum lanes | **CC0** | yes | `vendor/sfz/VCSL/LICENSE` |
| VSCO-2 CE | orchestral, `vc_*` | **CC0** | yes | `vendor/sfz/VSCO-2-CE/LICENSE` |
| Salamander Grand Piano | piano | **CC-BY 3.0** | yes, with attribution | `.../readme.txt` |
| Unreal "Standard Guitar" | `gm_electric_guitar_*` | **licence-free, no credit required** | yes | `見てね♡/説明および注意事項.txt` (Shift-JIS): 「ライセンスフリーです / クレジット表記は不要です」 — *verify*: silent on redistributing the library itself |
| SSO Chorus (Sonatina v4) | `choir_*` | **CC Sampling Plus 1.0** | **HOST ONLY** | `scripts/build-choir-sfz.mjs:2` |
| Miraleste (685floyd) | `md_kick md_snare md_hat md_ohat md_clap md_stick md_metal` | **commercial, purchased** | **NO** | `.gitignore` (`audios/miraleste/`) |
| his horror FX | `hx_*` | Ethan's own | yes | `audios/horror-fx/` |
| NAM amp capture | guitar amp | **GPL-3.0** | data file, keep the process separate | `vendor/nam-models/` |
| ripped BRR / game audio | `audition/triage-clips.js` | none — rips | **NO** | his r16 ruling |

### CC Sampling Plus 1.0 (SSO Chorus) — the exact terms

Verified against the legal code (retired by Creative Commons in 2011):

- Derivative works **may** be distributed commercially.
- *"You may not exercise any of the rights granted to You in any manner that is
  primarily intended for or directed toward commercial advantage"* — this binds
  redistribution of the **whole work**.
- *"All advertising and promotional uses are excluded"*, except promoting your
  own derivative.

So: rendering choir into a song and selling the song is fine. Shipping the
choir samples is not. **Advertising use is excluded outright** — worth knowing
before any of this audio goes in a promo video.

## Vocal tier

| what | licence | status |
|---|---|---|
| DiffSinger **Tiger** voicebank | commercial use requires a purchased licence | **buyable** — `tora@tora-ouji.com`, per `vendor/vocal/tiger/voicebank/extra/LICENSE.md` |
| RVC `infamous_miku_v2` | unofficial Hatsune Miku clone | **BLOCKER — replace.** Crypton's character licence will not cover a commercial product, hosted or shipped |
| DiffSinger / RVC code | MIT / AGPL-ish, *verify* | per upstream repos |

## Plugins (not currently in the render path)

SSD5 and Triaz are per-seat commercial VST3s. `src/lib/hq-instruments.js`
references neither — nothing depends on them today. Neither may be
redistributed, and hosting one for third parties needs a specific server
licence from the vendor.

## What this means

1. **Server-side rendering is the only architecture that clears every row.**
   Users receive audio; samples never leave the server.
2. A bundled sample download is possible but **only CC0 + Salamander + guitar** —
   it must exclude SSO choir and Miraleste drums.
3. Two blockers are unavoidable regardless of architecture: the **Miraleste
   `md_*` rows** (remap to CC0 — VCSL has equivalents) and the **Miku RVC
   model** (replace).
4. Two questions are open and neither is about samples: the **engine's own
   licence**, and **AGPL reach from Strudel** on a hosted service.
