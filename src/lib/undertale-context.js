// Song context for the Undertale corpus (D35 §1.2 "context" axis) — the one
// atlas axis no computation can produce. HAND-CURATED, not generated:
// build-atlas.mjs merges this into src/lib/atlas.js by song name but never
// writes this file.
//
// Curation policy (D35): every field is stated only where a documented source
// backs it — the community Leitmotif Index (jcoxeye.github.io/leitmotif-index),
// Jason M. Yu's "Leitmotifs in UNDERTALE" analyses (jasonyu.me), and the
// Undertale Wiki. A field the sources don't settle stays null/[] — an invented
// character association is worse than an empty one (the A6.1 spirit). Obscure
// or unused tracks are left uncurated and say so in `notes`.
//
// role:   battle | boss | town | overworld | character | cutscene | menu |
//         shop | credits | diegetic | joke  (controlled vocabulary)
// motifs: leitmotif FAMILY slugs — two songs sharing a slug share documented
//         melodic material; this is real similarity ground truth, not a vibe.
// arc:    early | mid | late | climax | ending — where the song sits in a run.

export const UNDERTALE_CONTEXT = {
  'Once Upon A Time': { role: 'cutscene', character: null, motifs: ['once-upon-a-time'], arc: 'early', notes: 'the opening storybook — the founding motif of the soundtrack' },
  'Ruins': { role: 'overworld', character: null, motifs: ['once-upon-a-time'], arc: 'early', notes: 'first area; the opening motif as an area theme' },
  'Undertale': { role: 'cutscene', character: null, motifs: ['once-upon-a-time'], arc: 'late', notes: 'the monster-history sequence before New Home' },
  'Hopes and Dreams': { role: 'boss', character: 'Asriel', motifs: ['once-upon-a-time'], arc: 'climax', notes: 'Asriel battle — the save-the-world reprise of the opening motif' },
  'SAVE the World': { role: 'boss', character: 'Asriel', motifs: ['once-upon-a-time'], arc: 'climax', notes: 'saving the lost souls; Hopes and Dreams continued' },
  'An Ending': { role: 'cutscene', character: null, motifs: ['once-upon-a-time'], arc: 'ending', notes: 'neutral-route epilogue; a dark reprise of Once Upon a Time' },

  'Heartache': { role: 'boss', character: 'Toriel', motifs: ['fallen-down'], arc: 'early', notes: 'Toriel battle — Fallen Down as a fight' },
  'Fallen Down Reprise': { role: 'cutscene', character: 'Toriel', motifs: ['fallen-down'], arc: 'climax', notes: 'Toriel returns (pacifist)' },
  'Home': { role: 'town', character: 'Toriel', motifs: [], arc: 'early', notes: "Toriel's home" },
  'ASGORE': { role: 'boss', character: 'Asgore', motifs: ['fallen-down'], arc: 'climax', notes: 'quotes Heartache — the Toriel/Asgore mirror the Leitmotif Index documents' },

  'sans': { role: 'character', character: 'Sans', motifs: ['sans'], arc: 'early', notes: "sans's introduction" },
  'Song That Might Play When You Fight Sans': { role: 'character', character: 'Sans', motifs: ['sans'], arc: null, notes: 'joke track from the game files, built on the sans motif' },
  'Megalovania': { role: 'boss', character: 'Sans', motifs: ['megalovania'], arc: 'climax', notes: 'sans (genocide); the motif predates Undertale (EarthBound Halloween hack / Homestuck)' },
  'Its Raining Somewhere Else': { role: 'character', character: 'Sans', motifs: [], arc: 'late', notes: "sans's dinner conversation at MTT Resort" },

  'Nyeh Heh Heh': { role: 'character', character: 'Papyrus', motifs: ['nyeh-heh-heh'], arc: 'early', notes: null },
  'Bonetrousle': { role: 'boss', character: 'Papyrus', motifs: ['nyeh-heh-heh'], arc: 'early', notes: 'Papyrus battle; Nyeh Heh Heh! extended' },
  'Dating Start': { role: 'cutscene', character: 'Papyrus', motifs: ['dating'], arc: 'early', notes: 'the Papyrus date' },
  'Dating Tense': { role: 'cutscene', character: 'Papyrus', motifs: ['dating'], arc: 'early', notes: null },
  'Dating Fight': { role: 'boss', character: 'Papyrus', motifs: ['dating'], arc: 'early', notes: 'the date in fight format; Dating Start sped up' },

  'Undyne': { role: 'character', character: 'Undyne', motifs: ['undyne'], arc: 'mid', notes: 'her motif appears across seven songs (Leitmotif Index)' },
  'NGAHHH': { role: 'cutscene', character: 'Undyne', motifs: ['undyne'], arc: 'mid', notes: 'pre-battle' },
  'Spear of Justice': { role: 'boss', character: 'Undyne', motifs: ['undyne'], arc: 'mid', notes: null },
  'Battle Against a True Hero': { role: 'boss', character: 'Undyne', motifs: ['undyne'], arc: 'climax', notes: 'Undyne the Undying (genocide)' },
  'But the Earth Refused to Die': { role: 'cutscene', character: 'Undyne', motifs: [], arc: 'climax', notes: 'genocide: Undyne refuses to fall' },
  'Run': { role: 'cutscene', character: 'Undyne', motifs: [], arc: 'mid', notes: 'the spear chase' },

  'Alphys': { role: 'character', character: 'Alphys', motifs: ['alphys'], arc: 'mid', notes: null },
  'Confession': { role: 'cutscene', character: null, motifs: [], arc: 'late', notes: 'date-sequence confession cue' },
  'Shes Playing Piano': { role: 'cutscene', character: null, motifs: [], arc: 'late', notes: 'date-sequence piano scene cue' },
  'Death Report': { role: 'cutscene', character: null, motifs: [], arc: 'late', notes: 'genocide phone report' },

  'Metal Crusher': { role: 'boss', character: 'Mettaton', motifs: ['mettaton'], arc: 'mid', notes: null },
  'Its Showtime': { role: 'boss', character: 'Mettaton', motifs: ['mettaton'], arc: 'mid', notes: "Mettaton's quiz show" },
  'Death by Glamour': { role: 'boss', character: 'Mettaton', motifs: ['mettaton'], arc: 'late', notes: 'Mettaton EX' },
  'Power of NEO': { role: 'boss', character: 'Mettaton', motifs: ['mettaton'], arc: 'climax', notes: 'Mettaton NEO (genocide)' },
  'Oh One True Love': { role: 'cutscene', character: 'Mettaton', motifs: ['oh-one-true-love'], arc: 'late', notes: "the stage-play aria" },
  'Oh Dungeon': { role: 'cutscene', character: 'Mettaton', motifs: ['oh-one-true-love'], arc: 'late', notes: 'the stage-play dungeon number' },
  'Hotel': { role: 'town', character: null, motifs: [], arc: 'late', notes: 'MTT Resort lobby' },
  'Can You Really Call This A Hotel I Didnt Receive A Mint On My Pillow Or Anything': { role: 'town', character: null, motifs: [], arc: 'late', notes: 'MTT Resort bedroom music box' },

  'Your Best Friend': { role: 'character', character: 'Flowey', motifs: ['your-best-friend'], arc: 'early', notes: null },
  'You Idiot': { role: 'cutscene', character: 'Flowey', motifs: ['your-best-friend'], arc: 'climax', notes: null },
  'Your Best Nightmare': { role: 'boss', character: 'Flowey', motifs: ['your-best-friend'], arc: 'climax', notes: 'Photoshop Flowey' },
  'Finale': { role: 'boss', character: 'Flowey', motifs: ['your-best-friend'], arc: 'climax', notes: 'the six souls turn; Your Best Friend transfigured' },
  'Burn in Despair': { role: 'boss', character: 'Flowey', motifs: [], arc: 'climax', notes: 'Photoshop Flowey fight phase' },
  'Premonition': { role: 'cutscene', character: 'Flowey', motifs: ['your-best-friend'], arc: null, notes: 'Your Best Friend slowed to a warning' },

  'Ghost Fight': { role: 'battle', character: 'Napstablook', motifs: ['ghost-fight'], arc: 'early', notes: null },
  'Dummy': { role: 'battle', character: null, motifs: ['ghost-fight'], arc: 'mid', notes: 'Mad Dummy; Ghost Fight reworked' },
  'Spooktune  Spookwave': { role: 'diegetic', character: 'Napstablook', motifs: [], arc: 'mid', notes: "CDs at Napstablook's home" },
  'Ghouliday': { role: 'diegetic', character: 'Napstablook', motifs: [], arc: 'mid', notes: "a CD at Napstablook's home" },
  'Thundersnail': { role: 'joke', character: 'Napstablook', motifs: [], arc: 'mid', notes: 'the snail race' },

  'Snowy': { role: 'overworld', character: null, motifs: ['snowy'], arc: 'early', notes: 'Snowdin forest' },
  'Snowdin Town': { role: 'town', character: null, motifs: ['snowy'], arc: 'early', notes: null },
  'Shop': { role: 'shop', character: null, motifs: ['snowy'], arc: 'early', notes: 'the Snowdin shop, on the Snowy material' },
  'Dogsong': { role: 'character', character: 'Annoying Dog', motifs: ['dogsong'], arc: null, notes: null },
  'Dogbass': { role: 'battle', character: null, motifs: [], arc: null, notes: 'dog-encounter battle variant' },
  'Wrong Enemy': { role: 'battle', character: null, motifs: [], arc: null, notes: null },
  'Room of Dog': { role: 'overworld', character: null, motifs: [], arc: null, notes: 'the artifact room' },

  'Waterfall': { role: 'overworld', character: null, motifs: ['waterfall'], arc: 'mid', notes: null },
  'Quiet Water': { role: 'overworld', character: null, motifs: [], arc: 'mid', notes: null },
  'Bird That Carries You Over A Disproportionately Small Gap': { role: 'cutscene', character: null, motifs: [], arc: 'mid', notes: 'the long bird ride (Waterfall gag)' },
  'Temmie Village': { role: 'town', character: 'Temmie', motifs: ['temmie'], arc: 'mid', notes: null },
  'Tem Shop': { role: 'shop', character: 'Temmie', motifs: ['temmie'], arc: 'mid', notes: null },
  'Memory': { role: 'cutscene', character: null, motifs: ['memory'], arc: null, notes: 'the Memory motif stated plainly (shared with His Theme)' },
  'His Theme': { role: 'cutscene', character: 'Asriel', motifs: ['memory'], arc: 'climax', notes: "Asriel's farewell" },

  'Enemy Approaching': { role: 'battle', character: null, motifs: ['enemy-approaching'], arc: 'early', notes: 'the generic encounter theme' },
  'Stronger Monsters': { role: 'battle', character: null, motifs: ['enemy-approaching'], arc: 'late', notes: 'Hotland encounters; Enemy Approaching hardened' },
  'Anticipation': { role: 'battle', character: null, motifs: [], arc: 'early', notes: 'tutorial battle sting' },
  'Unnecessary Tension': { role: 'cutscene', character: null, motifs: [], arc: 'early', notes: 'tension cue' },

  'Another Medium': { role: 'overworld', character: null, motifs: ['another-medium'], arc: 'mid', notes: 'Hotland' },
  'CORE': { role: 'overworld', character: null, motifs: ['core', 'another-medium'], arc: 'late', notes: 'builds on Another Medium' },
  'CORE Approach': { role: 'overworld', character: null, motifs: ['core'], arc: 'late', notes: null },
  'Spider Dance': { role: 'boss', character: 'Muffet', motifs: ['spider-dance'], arc: 'late', notes: null },

  'Here We Are': { role: 'overworld', character: null, motifs: [], arc: 'late', notes: 'True Lab ambience' },
  'Amalgam': { role: 'battle', character: null, motifs: [], arc: 'late', notes: 'True Lab, the Amalgamates' },

  'Uwa So Temperate': { role: 'overworld', character: null, motifs: ['uwa'], arc: null, notes: 'Temmie Chang guest jingle, Waterfall hidden room' },
  'Uwa So Holiday': { role: 'overworld', character: null, motifs: ['uwa'], arc: null, notes: 'Temmie Chang guest jingle, Snowdin hidden room' },
  'Uwa So HEATS': { role: 'overworld', character: null, motifs: ['uwa'], arc: null, notes: 'Temmie Chang guest jingle, Hotland hidden room' },

  'Gasters Theme': { role: 'character', character: 'W. D. Gaster', motifs: ['gaster'], arc: null, notes: 'hidden-room easter egg' },
  'Menu Full': { role: 'menu', character: null, motifs: [], arc: null, notes: null },
  'The Wrong Number Song': { role: 'joke', character: null, motifs: [], arc: 'mid', notes: 'the wrong-number call' },
  'Dont Give Up': { role: 'cutscene', character: null, motifs: [], arc: 'climax', notes: 'pacifist finale, before the barrier breaks' },
  'Reunited': { role: 'cutscene', character: null, motifs: [], arc: 'ending', notes: 'the pacifist reunion' },
  'Last Goodbye': { role: 'cutscene', character: null, motifs: ['memory'], arc: 'ending', notes: 'pacifist ending, on the His Theme material' },
  'Bring It In Guys': { role: 'credits', character: null, motifs: [], arc: 'ending', notes: 'pacifist credits medley reprising many themes' },

  // obscure / unused-adjacent tracks — deliberately uncurated (policy above)
  'Danger Mystery': { role: null, character: null, motifs: [], arc: null, notes: 'obscure cue — not curated (no documented source at hand)' },
  'Dununn  Predummy': { role: null, character: null, motifs: [], arc: null, notes: 'obscure sting — not curated' },
  'For the Fans': { role: null, character: null, motifs: [], arc: null, notes: 'extra track — not curated' },
  'Snore Symphony': { role: null, character: null, motifs: [], arc: null, notes: 'joke cue — not curated' },
  'Star': { role: null, character: null, motifs: [], arc: null, notes: 'obscure track — not curated' },
  'Trouble Dingle': { role: null, character: null, motifs: [], arc: null, notes: 'joke sting — not curated' },
};
