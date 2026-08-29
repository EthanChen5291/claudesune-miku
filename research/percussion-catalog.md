<!-- researched 2026-08-27, genre-expansion round (workflow wf_e7d3e012) -->

# Percussion Expansion — Research Catalog

## Headline finding: most of the ask is ALREADY VENDORED

Both `vendor/sfz/VSCO-2-CE/` **and** `vendor/sfz/VCSL/` are on disk, and VCSL (CC0) contains far more percussion than the engine currently exposes (only glock/vibraphone/xylo are wired into `vendor/sfz/gen/`). Verified local inventory (upstream `sgossner/VCSL` matches — no djembe/taiko upstream either):

**VCSL vendored, unwired** (`vendor/sfz/VCSL/`): Darbuka (5 strokes × 2vl × 2rr), Frame Drum (hand/muted/open, 18 files), Bongos (H/L, open+muted+rolls, 3vl×2rr), Conga, Cajon (3vl×2rr), Shaker Large + Small + Legacy, Cabasa, Guiro, Claves, Woodblock (10 vel files), Cowbells, Agogo, Vibraslap, Slapstick, Finger Cymbals (1 sample), Ratchet, Flexatone, Sleigh Bells, Tambourines 1–5, Triangles, **Anvil** (2 hit points × 3vl), **Brake Drum**, Slit/Log Drum (Hi/Lo), Ocean Drum (sustains), Bass Drums 1–3, Snares Modern 1–3 + **Rope-Tension (military) snare** with sidestick, Toms 1–2 (stick/mallet/rim), Timpani 1–2, gongs, clash/sus cymbals, bell tree, mark tree, claps.

**VSCO-2-CE adds** (`vendor/sfz/VSCO-2-CE/Percussion/` + `VSCO 1 Percussion/`): conga family (Quinto/Conga/Tumba), snare rolls + taps, tambourine shake/roll, triangle rolls, gong scrapes, sus-cymbal crescendi (short/med/long — ready-made risers), bass-drum 7vl×2rr, maracas, extra guiro lengths, slapstick, wood clicks, "alien"/zap FX.

**True gaps requiring download**: taiko/war-drum ensemble, djembe, waterphone, thunder sheet, deeper industrial metal (pipes/chains).

---

## 1. Catalog by signal (20 entries)

| # | Instrument | Signals | Role | Register/band | Layering with kit |
|---|---|---|---|---|---|
| **JUNGLE / TRIBAL** |
| 1 | Bongos (H/L) | jungle, chase, playful-tropical | timekeeper (8th martillo) + accents | 400–800 Hz, dry | sits above kick/snare; replaces hat chatter |
| 2 | Congas (quinto/conga/tumba) | jungle groove, ritual | timekeeper (tumbao: open tones on 4&, "&" of 4) | 150–400 Hz | can REPLACE kick+snare entirely in breakdowns |
| 3 | Djembe | tribal ceremony, adventure | lead hand-drum: bass(center)/tone/slap vocabulary | bass ~80–120 Hz, slap 2–4 kHz | full-range — use solo or over toms, not over congas |
| 4 | Log/slit drum | deep jungle, mystery, signal-drums | accent, sparse 2-note motifs | 200–500 Hz woody, pitched pair | melodic-ish accent over pads; keep sparse |
| 5 | Guiro | jungle texture, insects, comic | texture: long scrape on beat 1 or "&2" | 2–6 kHz | offbeat color; never continuous |
| 6 | Shaker/maracas | urgency, humidity, motion | timekeeper: straight 16ths, accent grid | 4–10 kHz (hat band) | direct hi-hat substitute; ducks when hat plays |
| **DESERT / MIDDLE-EASTERN** (pairs with the Phrygian-dominant doctrine) |
| 7 | Darbuka/doumbek | desert caravan, bazaar | timekeeper: Maqsum / Malfuf (Dum-Tek grammar) | Dum ~100 Hz, Tek 3–5 kHz | replaces kick+snare — Dum=kick slot, Tek=snare slot |
| 8 | Frame drum (daf/tar) | ancient, open desert, ritual | slow timekeeper / low pulse | 80–250 Hz, airy | under darbuka an octave-feel below; also solo for "vast" |
| 9 | Riq (= VCSL Tambourine + jingle articulations) | desert dance, brightness | jingle offbeats over darbuka | 5–8 kHz | fills hat band while darbuka owns mids |
| 10 | Finger cymbals/zills | oasis shimmer, mysticism | sparse accent, 1 per 2–4 bars | 8–12 kHz ring | ornament tier; silent during melody bars per doctrine |
| **WAR / EPIC TRAILER** |
| 11 | Taiko ensemble | war, army on the march, boss | the trailer figure (grid below); unison hits | fundamental 60–150 Hz + skin slap | replaces the whole kit; add sub-drop layer for hits |
| 12 | Ensemble toms / floor toms | battle prep, tension build | 8th/16th gallop, crescendo rolls | 100–300 Hz | doubles taiko a 5th up in feel; VCSL Tom 1/2 + Legacy Toms |
| 13 | Gran cassa (concert BD) | doom hits, cliff-edge downbeats | accent: beat-1 hits, sub swells | 40–80 Hz | one low voice at a time — mutually exclusive with synth-bass hits |
| 14 | Military/field snare (VCSL Rope-Tension!) | war discipline, march | rolls, flams, 5/9-stroke ruffs; ostinato | 200 Hz shell + 3–8 kHz wires | over taiko; VSCO-2 has recorded rolls to splice |
| 15 | Timpani | heroic, ceremonial war | tonic-dominant hits, crescendo rolls | pitched 65–260 Hz | already partially available; pitch must follow harmony |
| **INDUSTRIAL** |
| 16 | Anvil / brake drum (vendored!) | factory, forge, machinery | accent on offbeats; clock-like ostinato | 1–4 kHz inharmonic ring | replaces cowbell/rim; dry, far-back per cymbal doctrine |
| 17 | Metal pipes/rods, chains | industrial decay, danger | texture + accents; chain = riser/transition | pipes 500 Hz–2 kHz, chains broadband | pipe pair as pitched "tom" substitute; chains in transitions only |
| **HORROR** |
| 18 | Waterphone | dread, the uncanny | riser/stinger, NOT rhythmic | inharmonic 1–6 kHz glissandi | free-time layer over held-root floor; the classic horror sting |
| 19 | Low toms + bass-drum rubs (rubs vendored: `bassdrum_rub*.wav`) | heartbeat dread, stalking | sparse heartbeat figure (1, "&1"), accel. | 60–200 Hz | heartbeat = kick substitute at low density |
| 20 | Thunder sheet / gong scrape (scrapes vendored: `gongscrape_*.wav`) | horror swell, apocalypse | riser into section boundaries | broadband rumble 50 Hz–5 kHz | crescendo into downbeat, then hard cut |
| **PLAYFUL** (piano-territory vibes) | Woodblock, cowbell, vibraslap, slapstick, ratchet, sleigh bells — all vendored | goofy/comic/quirky | accents + comic stingers (vibraslap = punchline) | 800 Hz–5 kHz | ornament tier over piano oom-pah; obey no-uniform-repeats law |

---

## 2. Sourcing table (gaps + upgrades only — everything else is on disk, CC0)

| Instrument | Source | License | Notes |
|---|---|---|---|
| Taiko ensemble | [floe-audio/Taiko-Drums](https://github.com/floe-audio/Taiko-Drums) (SCC Taiko Drums v1.0, orig. [S. Christian Collins](https://schristiancollins.com/vi-percussion.php)) | **CC-BY-SA 4.0** — attribution + share-alike; check comfort with SA before shipping | Multisampled, velocity splits + RR, SFZ-compatible (Floe repo is FLAC — convert) |
| Taiko (CC0 fallback) | [Pixabay taiko hits](https://pixabay.com/sound-effects/search/taiko/) / Freesound CC0 filter | Pixabay license (free, no attribution) / CC0 | Single hits; curate 3–4 velocities by hand |
| Djembe | [Splash Sound Djembe](https://bedroomproducersblog.com/2024/04/18/splash-sound-djembe/) (6 artic × 4vl × 5rr — but plugin, not raw WAV) or [SampleSwap djembe folder](https://sampleswap.org/filebrowser-new.php?d=DRUMS+%28FULL+KITS%29%2FETHNIC+and+WORLD+PERCUSSION%2FDjembe%2F) | Splash: free-account gated, EULA; SampleSwap: free/mostly-PD | SampleSwap WAVs drop straight into an SFZ; Splash needs a DAW bounce (plugin ≠ headless-friendly) |
| World-perc extras (castanets, egg shaker, hand claps) | [FreePats World Percussion](https://freepats.zenvoid.org/Percussion/world-and-rare-percussion.html) | **CC0** | SFZ+WAV download ready-made; partly derived from VCSL |
| Waterphone | [Ghosthack Cinematic Waterphone](https://www.ghosthack.de/free_sample_packs/free-cinematic-waterphone-sounds) or [Freesound pack by kostasvomvolos](https://freesound.org/people/kostasvomvolos/packs/762/) | Ghosthack: royalty-free EULA; Freesound: per-pack CC (verify CC0/CC-BY on page) | One-shots + risers; SFX-tier, single velocity fine |
| Metal pipes | [Freesound: Metal Pipe Sounds by copyc4t](https://freesound.org/people/copyc4t/packs/15077/) | CC-BY (verify on page) | Closed-end pipe struck at various points = pitched set |
| Industrial kit (chains, steel, hydraulics) | [Signature Sounds Industrial Percussion](https://signaturesounds.org/store/p/industrial-percussions-kitfoley); [Freesound: Industrial Percussion by l0calh05t](https://freesound.org/people/l0calh05t/packs/1131/) | Signature Sounds states CC0; Freesound per-pack | Curate ~12 one-shots into one "found-metal" SFZ |
| Thunder sheet / ocean-drum / thunder tube | [99Sounds Percussa Toolbox](https://99sounds.org/percussion-samples/) | 99Sounds royalty-free (free with email; not CC0 — usable in works, no redistribution as samples) | Has thunder tube, ocean drum, bowed cymbals, rain sticks |
| Orchestral odds (whip, tam-tam alt takes) | [Philharmonia sound samples](https://philharmonia.co.uk/resources/sound-samples/) | Free incl. commercial; may NOT be redistributed "as-is" as a sample library | Fine for shipped songs; do not re-vendor publicly |
| Everything in section 1 not listed here | already at `vendor/sfz/VCSL` + `vendor/sfz/VSCO-2-CE` | **CC0** | Just needs `.sfz` maps in `vendor/sfz/gen/` |

Preference order honored: CC0 (VCSL/FreePats/Signature) > CC-BY (freesound packs) > attribution+SA (taiko — flag to Ethan) > EULA freeware (Ghosthack/99Sounds — fine to use, don't re-vendor in a public repo).

## 3. Format guidance

- **Timekeepers** (shaker, darbuka, bongos, congas, djembe, taiko ostinato): **SFZ with ≥2 velocity layers × ≥2 round robins** — machine-gunning is most audible on repeated 8th/16th figures. VCSL already ships vl×rr for exactly these; map `seq_length/seq_position` + `lovel/hivel`. Shakers additionally need the up/down stroke pair (VCSL has `Shake1U/Shake1D`) alternated on the 16th grid.
- **Accents/stingers** (anvil, vibraslap, finger cymbals, waterphone, gong, thunder): **single-velocity WAV one-shots are fine** — they fire ≤1×/bar; use 2–3 dynamic variants selected by hap gain rather than true layers.
- **Rolls/risers** (snare roll, cymbal crescendo, tambourine roll, chains): use the **recorded sustains** (VSCO-2 `Snare2-rollNS_*`, `susCymb1-cresc-{Short,Median,Long}`, `Tamb1-Roll_*`) as time-stretched one-shots aimed to END on the target downbeat — do not synthesize rolls from taps at HQ tier.
- **Taiko**: multi-velocity SFZ mandatory (the whole idiom is accent contrast: don > ka); fold the CC-BY-SA set or hand-build 3vl from CC0 hits.
- Watch D83 key-range folding when mapping unpitched percussion — give every SFZ a single-key `lokey=hikey` mapping per articulation so nothing folds octaves.

## 4. Pattern grids (16th grid, one 4/4 bar = 16 slots, `X`=accent `x`=normal `.`=rest)

**Taiko "action trailer" figure** (D=don/low center, K=ka/rim; 2-bar phrase, the classic gallop-into-unison):

```
slot:      1e&a 2e&a 3e&a 4e&a
bar1 low:  D... ..D. D... ..D.     (dotted-8th "trailer gallop": onsets 0,6,8,14)
bar1 rim:  ..k. k.k. ..k. k.k.
bar2 low:  D.D. D.D. DDDD X...     (8ths → 16th fill → unison downbeat next bar)
bar2 BD:   .... .... .... X...     (gran cassa doubles ONLY the landing)
```

Alternate war-march (with field snare):

```
taiko:  X..x ..X. x..x ..X.       (onsets 0,3,6,8,11,14 — 3+3+2 feel)
snare:  x.xx x.xx x.xx xxxx       (ruff-flavored ostinato, roll into bar 4)
```

**Shaker urgency** (the standing hi-hat substitute; accent every 4th 16th, up/down samples alternate u/d):

```
16ths:  U d u d U d u d U d u d U d u d    (straight, accents on the beat)
tense:  U d u d u d U d u d U d u d u d    (accents 0,6,10 — 3+2+3 displaces the grid = "urgent")
```

**Darbuka Maqsum** (desert timekeeper, D=dum T=tek, 8th grid): `D T . T D . T .` — Malfuf (faster caravan): `D . . T . . T .`

**Horror heartbeat** (low tom/BD): slots 0 and 3 only (`X..x ....  ....  ....`), tempo-creep +2bpm per section.

Engine notes: taiko/darbuka/conga patterns should enter as new `dp_*`-style vouched patterns gated to matching vibe words (war/battle/epic, desert/bazaar, jungle/tribal), obey melody-outranks-drums, and — per the one-low-voice law — taiko/gran cassa must displace the synth-bass hit on shared onsets, not stack. All new material 4/4 only (D92).

Sources: [floe-audio/Taiko-Drums](https://github.com/floe-audio/Taiko-Drums) · [SCC percussion](https://schristiancollins.com/vi-percussion.php) · [FreePats World Percussion](https://freepats.zenvoid.org/Percussion/world-and-rare-percussion.html) · [VCSL repo](https://github.com/sgossner/VCSL) · [Philharmonia samples](https://philharmonia.co.uk/resources/sound-samples/) · [99Sounds Percussa Toolbox](https://99sounds.org/percussion-samples/) · [Ghosthack waterphone](https://www.ghosthack.de/free_sample_packs/free-cinematic-waterphone-sounds) · [Freesound waterphone pack](https://freesound.org/people/kostasvomvolos/packs/762/) · [Freesound metal pipes (copyc4t)](https://freesound.org/people/copyc4t/packs/15077/) · [Freesound industrial (l0calh05t)](https://freesound.org/people/l0calh05t/packs/1131/) · [Signature Sounds industrial kit](https://signaturesounds.org/store/p/industrial-percussions-kitfoley) · [Splash Sound Djembe](https://bedroomproducersblog.com/2024/04/18/splash-sound-djembe/) · [SampleSwap djembe](https://sampleswap.org/filebrowser-new.php?d=DRUMS+%28FULL+KITS%29%2FETHNIC+and+WORLD+PERCUSSION%2FDjembe%2F) · [Pixabay taiko](https://pixabay.com/sound-effects/search/taiko/)
