// describe.js — a deterministic FREE-TEXT prompt parser.
//
// The engine compiles songs from `{ emotion, environment }` only (vibes.js).
// Ethan's ask: a suite whose prompts are "actual descriptions (like mock-ups
// of user descriptions, not just two words)". This module maps such a sentence
// onto the closed vocabulary — one of the 12 EMOTIONS and one of the 23
// ENVIRONMENTS — plus a handful of engine-option HINTS read from EXPLICIT words
// only. It is a pure function: no randomness, no I/O, no imports beyond
// vibes.js. Same text in → deep-equal result out.
//
// Scoring: every emotion / environment carries a generous synonym table here
// (weights 1–3), and each entry's own `moods` / `tags` / `envMoods` words score
// 1 per hit. The highest total wins; ties go to the FIRST key in vibes.js key
// order (deterministic, and documented in the result's notes). A text with no
// hits at all falls back to happy × shop with a note saying so.
//
// Matching: text is lowercased and split on non-alphanumerics; every token is
// matched as a whole word, with simple plurals folded (synths → synth,
// memories → memory, waves → wave). Multi-word entries ("piano and strings",
// "no drums") are matched as phrases on the normalised text.

import { EMOTIONS, ENVIRONMENTS } from './vibes.js';

// ---------------------------------------------------------------------------
// vocabulary
// ---------------------------------------------------------------------------
// Each row: word-or-phrase → weight. Phrases contain a space.

const EMOTION_WORDS = {
  happy: {
    happy: 2, happiness: 2, cheerful: 2, cheery: 2, joyful: 2, joy: 2, joyous: 2, upbeat: 2, sunny: 2,
    fun: 2, smile: 2, smiling: 2, glad: 2, merry: 2, jolly: 2, delighted: 2, lighthearted: 2,
    carefree: 2, bouncy: 2, chipper: 2, jaunty: 2, giddy: 2, sunshine: 2, bright: 1, warm: 1,
    hopeful: 2, sunrise: 1,
  },
  sad: {
    sad: 2, sadness: 2, heartbreak: 3, heartbroken: 3, goodbye: 3, farewell: 3, grief: 3, grieving: 3,
    lonely: 2, loneliness: 2, mourning: 2, loss: 2, tears: 2, crying: 2, cry: 2, weeping: 2,
    melancholy: 2, melancholic: 2, bittersweet: 2, sorrow: 2, sorrowful: 2, blue: 1, wistful: 1,
    regret: 2, missing: 1, longing: 1, hurt: 1, broken: 1, alone: 2, parting: 2, losing: 2,
  },
  calm: {
    calm: 2, gentle: 2, gently: 2, soft: 2, softly: 2, quiet: 2, quietly: 2, peaceful: 2, serene: 2,
    tranquil: 2, relaxed: 2, relaxing: 2, chill: 2, mellow: 2, lazy: 2, still: 1, soothing: 2,
    meditative: 2, ambient: 2, floating: 2, drifting: 2, dreamy: 1, sleepy: 2, lullaby: 3,
    breeze: 1, hush: 2, hushed: 2, unhurried: 2, easygoing: 2,
  },
  excited: {
    excited: 2, exciting: 2, excitement: 2, thrilling: 2, thrill: 2, chase: 2, race: 2, racing: 2,
    rush: 2, rushing: 2, frantic: 1, breathless: 1, adrenaline: 2, wild: 1, energetic: 2, energy: 1,
    hype: 2, hyped: 2, pumped: 2, fast: 1, party: 2, dance: 1, electric: 1, sprint: 2, running: 1,
    run: 1, dash: 2, dashing: 2, exhilarating: 2, opening: 2, 'anime opening': 3, 'sugar rush': 3,
    hyper: 2, hyperactive: 2,
  },
  tense: {
    tense: 2, tension: 2, furious: 3, angry: 3, anger: 3, rage: 3, raging: 3, fury: 3, frantic: 2,
    nervous: 2, anxious: 2, anxiety: 2, panic: 2, panicked: 2, urgent: 2, urgency: 2, pressure: 2,
    danger: 2, dangerous: 2, threat: 2, threatening: 2, suspense: 2, suspenseful: 2, stress: 2,
    stressed: 2, pursued: 2, hunted: 2, desperate: 2, paranoid: 2, dread: 1, uneasy: 2, edgy: 2,
    fight: 2, fighting: 2, breakneck: 3, shouting: 2, shout: 2, shouted: 2, 'no room to breathe': 2,
    defiant: 1, relentless: 2,
  },
  scary: {
    scary: 2, scared: 2, fear: 2, fearful: 2, terror: 2, terrifying: 2, horror: 2, haunted: 2,
    haunting: 2, creepy: 2, eerie: 2, ghost: 2, ghostly: 2, monster: 2, nightmare: 2, dread: 2,
    sinister: 2, menacing: 2, spooky: 2, chilling: 2, evil: 2, cursed: 2, demon: 2, frightening: 2,
    villain: 2,
  },
  mysterious: {
    mysterious: 2, mystery: 2, mystical: 2, enigmatic: 2, strange: 2, uncanny: 2, puzzle: 2,
    puzzling: 2, riddle: 2, secret: 2, hidden: 2, magic: 2, magical: 2, arcane: 2, curious: 2,
    wonder: 2, odd: 1, unknown: 2, foggy: 2, fog: 2, mist: 2, misty: 2, cryptic: 2, otherworldly: 2,
    villain: 1,
  },
  triumphant: {
    triumphant: 2, triumph: 2, victory: 2, victorious: 2, heroic: 2, hero: 2, glory: 2, glorious: 2,
    epic: 3, anthem: 2, anthemic: 2, majestic: 2, grand: 2, fanfare: 2, conquering: 2, champion: 2,
    winning: 2, win: 1, proud: 2, pride: 2, noble: 2, soaring: 2, uplifting: 2, valiant: 2,
    defiant: 1, opening: 1, 'anime opening': 2,
  },
  nostalgic: {
    nostalgic: 2, nostalgia: 2, memory: 2, remember: 2, remembering: 2, childhood: 2, retro: 2,
    vintage: 2, old: 1, past: 1, yesterday: 2, faded: 2, sepia: 2, homesick: 2, home: 1, wistful: 2,
    reminiscing: 2, throwback: 2, bygone: 2, hometown: 2,
  },
  romantic: {
    romantic: 2, romance: 2, love: 2, loving: 2, lover: 2, kiss: 2, kissing: 2, tender: 2,
    tenderness: 2, intimate: 2, sweet: 2, sweetheart: 2, crush: 2, date: 1, valentine: 2,
    affection: 2, affectionate: 2, passion: 2, passionate: 2, longing: 2, yearning: 2, embrace: 2,
    dreamy: 1, soft: 1, heartfelt: 1, confession: 2, confess: 2, rooftop: 1, sunrise: 1,
  },
  somber: {
    somber: 2, sombre: 2, solemn: 2, grave: 2, funeral: 2, mourning: 2, bleak: 2, grim: 2, heavy: 1,
    weary: 2, elegy: 2, elegiac: 2, requiem: 2, lament: 2, lamenting: 2, sacred: 1, hymn: 2,
    dirge: 2, desolate: 2, hopeless: 2, despair: 2, mournful: 2, sorrowful: 1, tragic: 2,
  },
  goofy: {
    goofy: 2, silly: 2, comic: 2, comedy: 2, comical: 2, funny: 2, joke: 2, quirky: 2, wacky: 2,
    zany: 2, cartoon: 2, cartoonish: 2, clumsy: 2, ridiculous: 2, absurd: 2, slapstick: 2,
    whimsical: 2, playful: 1, bumbling: 2, dorky: 2, kooky: 2, clownish: 2, daft: 2,
  },
};

const ENVIRONMENT_WORDS = {
  shop: {
    shop: 2, store: 2, market: 2, marketplace: 2, merchant: 2, vendor: 2, buying: 2, shopping: 2,
    cafe: 2, coffee: 2, bakery: 2, everyday: 2, daily: 2, errand: 2, town: 1, village: 1, cozy: 1,
    cosy: 1, inn: 2, tavern: 1, shopkeeper: 2, browsing: 2, grocery: 2, mall: 2,
  },
  fight: {
    fight: 2, fighting: 2, battle: 2, combat: 2, battlefield: 2, enemy: 2, attack: 2, sword: 2,
    arena: 2, duel: 2, war: 2, clash: 2, brawl: 2, chase: 2, showdown: 1, skirmish: 2, versus: 2,
    warrior: 2, strike: 1, 'anime opening': 1,
  },
  boss: {
    boss: 3, villain: 3, nemesis: 2, dragon: 2, titan: 2, overlord: 2, demon: 1, showdown: 1,
    ultimate: 1, colossal: 2, giant: 2, tyrant: 2, doom: 2, evil: 1, 'final battle': 3,
    'final boss': 3, 'last stand': 2, archenemy: 3, 'boss fight': 3, army: 1, march: 1,
    marching: 1, losing: 1,
  },
  construction: {
    construction: 3, building: 2, builder: 2, factory: 2, crane: 2, hammer: 2, machinery: 2,
    machine: 2, industrial: 2, scaffold: 2, scaffolding: 2, worker: 2, steel: 2, girder: 2,
    demolition: 2, wrench: 2, bulldozer: 2, jackhammer: 2, 'construction site': 3,
  },
  stealth: {
    stealth: 3, stealthy: 3, sneak: 2, sneaking: 2, sneaky: 2, spy: 2, infiltrate: 2,
    infiltration: 2, heist: 2, hide: 2, hiding: 2, shadow: 1, tiptoe: 2, creeping: 2, prowl: 2,
    prowling: 2, thief: 2, burglar: 2, espionage: 2, guard: 1, undercover: 2, lurking: 2,
  },
  snow: {
    snow: 2, snowy: 2, snowing: 2, winter: 2, wintry: 2, ice: 2, icy: 2, frozen: 2, frost: 2,
    frosty: 2, blizzard: 2, glacier: 2, tundra: 2, arctic: 2, cold: 1, chilly: 1, sled: 2,
    sledding: 2, snowflake: 2, christmas: 2, holiday: 1, igloo: 2, snowman: 2,
  },
  water: {
    water: 2, rain: 2, raining: 2, rainy: 2, sea: 2, ocean: 2, river: 2, lake: 2, wave: 2, beach: 2,
    shore: 2, coast: 2, coastal: 2, underwater: 2, tide: 2, pond: 2, stream: 2, harbor: 2,
    harbour: 2, boat: 2, sailing: 2, island: 2, drizzle: 2, storm: 1, puddle: 2, seaside: 2,
    aquatic: 2, dock: 1, waterfall: 2, lagoon: 2, surf: 2,
  },
  desert: {
    desert: 3, sand: 2, dune: 2, oasis: 2, camel: 2, cactus: 2, canyon: 2, sahara: 2, arid: 2,
    scorching: 2, caravan: 2, bazaar: 2, mirage: 2, pyramid: 2, wasteland: 1, badlands: 2,
    sandstorm: 2, nomad: 2,
  },
  cave: {
    cave: 3, cavern: 2, underground: 2, mine: 2, mining: 2, tunnel: 2, crystal: 2, stalactite: 2,
    depth: 1, subterranean: 2, grotto: 2, dripping: 2, echoing: 2, echo: 1, dungeon: 1, chasm: 2,
  },
  lab: {
    lab: 3, laboratory: 3, science: 2, scientist: 2, experiment: 2, robot: 2, robotic: 2,
    computer: 2, cyber: 2, cybernetic: 2, glitch: 2, glitchy: 2, circuit: 2, hologram: 2,
    futuristic: 1, android: 2, mutant: 2, beaker: 2, 'mad scientist': 3,
  },
  casino: {
    casino: 3, gamble: 2, gambling: 2, poker: 2, slot: 2, roulette: 2, dice: 2, jackpot: 2,
    vegas: 2, neon: 2, nightclub: 2, club: 2, lounge: 2, bar: 1, cocktail: 2, city: 1,
    nightlife: 2, night: 1, swanky: 2, glitz: 2, glamour: 2, cabaret: 2, 'high roller': 3,
  },
  festival: {
    festival: 3, fair: 2, carnival: 2, parade: 2, firework: 2, summer: 2, celebration: 2,
    celebrate: 2, celebrating: 2, school: 2, holiday: 1, lantern: 2, crowd: 2, matsuri: 3,
    picnic: 2, fete: 2, street: 1, stall: 2, dancing: 1, village: 1, 'summer break': 3,
    'school day': 3, classroom: 2,
    // Open-air town material (100-140, major): a rooftop pop-rock build lives
    // here rather than in `rest` (cutscene, 50-80 bpm).
    rooftop: 2, sunrise: 1,
  },
  kitchen: {
    kitchen: 3, cooking: 2, cook: 2, chef: 2, restaurant: 2, food: 2, baking: 2, bake: 2, recipe: 2,
    dinner: 2, pot: 1, pan: 1, stove: 2, soup: 2, feast: 2, pizza: 2, noodle: 2, diner: 2,
    breakfast: 2, lunch: 2, sizzling: 2,
  },
  training: {
    training: 3, workout: 2, exercise: 2, gym: 2, practice: 2, practicing: 2, drill: 2, sparring: 2,
    montage: 2, dojo: 2, coach: 2, tutorial: 2, lesson: 2, warmup: 2, jog: 2, jogging: 2,
    treadmill: 2, running: 1, race: 1, chase: 1, 'level up': 2, 'getting stronger': 2,
    'anime opening': 2, opening: 1,
  },
  rest: {
    rest: 2, resting: 2, campfire: 2, camp: 2, camping: 2, bedroom: 2, bed: 2, sleep: 2,
    sleeping: 2, nap: 2, evening: 1, fireplace: 2, hearth: 2, cottage: 2, cabin: 2, sunset: 1,
    dusk: 1, porch: 2, blanket: 2, goodnight: 2, lullaby: 1, 'save point': 3, 'safe room': 3,
    inn: 1, sunrise: 1, confession: 1,
  },
  menu: {
    menu: 3, title: 2, select: 2, selection: 2, setting: 2, option: 2, loading: 2, interface: 2,
    startup: 2, splash: 2, 'main menu': 3, 'title screen': 3, 'character select': 3,
    'pause screen': 3,
  },
  aftermath: {
    aftermath: 3, ruin: 2, ruined: 2, wreckage: 2, defeat: 2, defeated: 2, survivor: 2, ash: 2,
    silence: 1, empty: 1, hollow: 1, devastation: 2, destroyed: 2, rubble: 2, memorial: 2,
    graveyard: 1, funeral: 1, 'after the battle': 3, 'after the war': 3, smoldering: 2,
  },
  space: {
    space: 3, galaxy: 2, galactic: 2, star: 2, starlight: 2, planet: 2, orbit: 2, orbital: 2,
    nebula: 2, cosmic: 2, cosmos: 2, moon: 2, lunar: 2, astronaut: 2, rocket: 2, spaceship: 2,
    void: 2, city: 2, neon: 1, night: 1, synth: 1, cyberpunk: 2, skyline: 2, skyscraper: 2,
    metropolis: 2, midnight: 1, streetlight: 2, highway: 2, futuristic: 1, scifi: 2, 'sci fi': 2,
    alien: 2, satellite: 2, 'outer space': 3, 'late night': 1,
  },
  jungle: {
    jungle: 3, forest: 2, wood: 1, woodland: 2, tree: 2, vine: 2, rainforest: 3, tropical: 2,
    canopy: 2, monkey: 2, parrot: 2, safari: 2, wilderness: 2, overgrown: 2, bamboo: 2, swamp: 2,
    undergrowth: 2, tribal: 2, grove: 2, ruins: 1,
  },
  manor: {
    manor: 3, mansion: 3, haunted: 2, estate: 2, hallway: 2, corridor: 2, attic: 2, cellar: 2,
    ballroom: 2, victorian: 2, gothic: 1, portrait: 2, candlelight: 2, candle: 2, dusty: 2,
    cobweb: 2, ghost: 1, 'haunted house': 3, parlor: 2, parlour: 2, villain: 1,
  },
  catacombs: {
    catacombs: 3, catacomb: 3, crypt: 2, tomb: 2, skeleton: 2, bone: 2, undead: 2, zombie: 2,
    ossuary: 2, necropolis: 2, dungeon: 2, sewer: 2, graveyard: 2, coffin: 2, mausoleum: 2,
    burial: 2,
  },
  citadel: {
    citadel: 3, castle: 2, fortress: 2, tower: 2, throne: 2, cathedral: 2, kingdom: 2, empire: 2,
    gate: 1, siege: 2, stronghold: 2, spire: 2, gothic: 2, organ: 1, bell: 1, 'dark lord': 3,
    rampart: 2, battlement: 2, army: 2, march: 2, marching: 2, choir: 2, losing: 1, legion: 2,
  },
  shrine: {
    shrine: 3, temple: 2, altar: 2, sacred: 2, holy: 2, prayer: 2, praying: 2, monk: 2, chapel: 2,
    church: 2, sanctuary: 2, spirit: 2, blessing: 2, blessed: 2, incense: 2, pilgrim: 2,
    pilgrimage: 2, ritual: 2, meditation: 2, zen: 2, garden: 1, divine: 2,
  },
};

// Energy is a weighted tally, low vs high. Words that describe ONE PART of a
// song rather than its energy (quiet verse / whispered verses / belted chorus)
// carry weight 1, so "quiet verse … soaring chorus" reads high and "whispered
// verses … belted chorus" cancels to mid; whole-song words carry 2–3.
const ENERGY_WORDS = {
  low: {
    slow: 2, slowly: 2, gentle: 2, gently: 2, quiet: 1, quietly: 1, whisper: 1, whispered: 1,
    whispering: 1, soft: 2, softly: 2, hushed: 2, still: 1, lazy: 2, sleepy: 2, drowsy: 2, calm: 2,
    mellow: 2, tender: 2, lullaby: 2, unhurried: 2, sparse: 2, minimal: 2, ambient: 2, floating: 2,
    serene: 2, tranquil: 2, hum: 1, murmur: 1, murmured: 1, 'barely above a hum': 2,
    somber: 1, sombre: 1, solemn: 1,
  },
  high: {
    driving: 2, frantic: 2, fast: 2, breathless: 2, rush: 2, rushing: 2, anthem: 1, anthemic: 2,
    racing: 2, race: 2, chase: 2, sprint: 2, pounding: 2, hectic: 2, relentless: 2, furious: 2,
    frenzied: 2, frenzy: 2, hype: 2, hyped: 2, pumping: 2, thrashing: 2, blistering: 2, urgent: 2,
    adrenaline: 2, energetic: 2, banger: 2, explosive: 2, intense: 2, wild: 2, dash: 2, dashing: 2,
    galloping: 2, upbeat: 2, manic: 2, breakneck: 3, shouting: 2, soaring: 2, builds: 1,
    belted: 1, belting: 1, 'no room to breathe': 2, hyper: 2, 'sugar rush': 3,
    backbeat: 1, clap: 1, 'clap along': 2, stomping: 2,
  },
};

const FAMILY_WORDS = {
  minor: [
    'dark', 'sad', 'minor', 'bitter', 'bittersweet', 'eerie', 'gloomy', 'moody', 'grim', 'bleak',
    'melancholy', 'melancholic', 'ominous', 'sinister', 'mournful', 'sorrow', 'sorrowful',
    'furious', 'angry', 'rage', 'tense', 'scary', 'creepy', 'haunted', 'tragic', 'brooding',
    'somber', 'sombre', 'lonely', 'heartbreak', 'heartbroken', 'goodbye', 'grief', 'menacing',
  ],
  major: [
    'bright', 'happy', 'major', 'sunny', 'cheerful', 'joyful', 'upbeat', 'warm', 'hopeful',
    'triumphant', 'glorious', 'radiant', 'sparkling', 'uplifting', 'cheery', 'jolly', 'merry',
    'carefree', 'sunshine', 'playful',
  ],
};

// Genre rows: weight 2 is a real genre word; `pop`'s SYNONYMS (idol, catchy,
// hook…) are a weight-1 FALLBACK (the spec: "else pop if 'pop'/'idol'/'catchy'")
// so they only win when no other genre has a hit. The literal word "pop" is
// the key itself and takes KEY_WEIGHT like every other key. Ties go to this
// key order ("pop-rock" → rock).
const GENRE_WORDS = {
  rock: {
    guitar: 2, rock: 2, band: 2, punk: 2, riff: 2, distortion: 2, distorted: 2, metal: 2,
    grunge: 2, garage: 2, headbanging: 2, 'power chord': 2, 'rock band': 3, shred: 2,
  },
  electro: {
    synth: 2, synthesizer: 2, electro: 2, electronic: 2, edm: 2, techno: 2, dance: 2, house: 1,
    trance: 2, dubstep: 2, neon: 2, chiptune: 2, chip: 1, sequencer: 2, arpeggiator: 2,
    arpeggiated: 2, 'drum machine': 2, rave: 2, club: 1, '8 bit': 2, electronica: 2,
  },
  pop: { pop: 1, idol: 1, catchy: 1, hook: 1, hooky: 1, bubblegum: 1, radio: 1, 'sing along': 1 },
  ballad: {
    ballad: 3, 'piano and strings': 3, 'slow song': 3, 'love song': 2, torch: 2, heartfelt: 1,
    piano: 1, 'strings and piano': 3,
  },
  folk: {
    folk: 2, polka: 2, traditional: 2, accordion: 2, fiddle: 2, banjo: 2, mandolin: 2, celtic: 2,
    irish: 2, shanty: 2, medieval: 2, bagpipe: 2, dulcimer: 2, 'hurdy gurdy': 2, campfire: 1,
  },
  jazz: {
    jazz: 2, jazzy: 2, swing: 2, swinging: 2, lounge: 2, bebop: 2, bossa: 2, 'big band': 3,
    saxophone: 2, sax: 2, brushes: 1, 'walking bass': 2, blues: 2, bluesy: 2, smoky: 1, crooner: 2,
  },
  orchestral: {
    orchestra: 2, orchestral: 2, strings: 2, symphonic: 2, symphony: 2, 'epic score': 3, score: 1,
    cinematic: 2, brass: 2, choir: 2, choral: 2, timpani: 2, violin: 2, cello: 2, horn: 2, film: 1,
  },
};

// ---------------------------------------------------------------------------
// text helpers
// ---------------------------------------------------------------------------

function normalise(text) {
  return String(text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function singular(w) {
  if (w.length <= 3) return w;
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (/(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

function wordSet(norm) {
  const set = new Set();
  for (const t of norm.split(' ')) {
    if (!t) continue;
    set.add(t);
    set.add(singular(t));
  }
  return set;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function phraseRe(phrase) {
  return new RegExp(`\\b${phrase.trim().split(/\s+/).map(escapeRe).join('\\s+')}(?:e?s)?\\b`);
}

// Does `entry` (word or phrase) occur in the text? Plain words match the
// plural-folded set; phrases match the normalised text with an optional
// trailing s/es on the last word.
function hit(entry, words, norm) {
  return entry.includes(' ') ? phraseRe(entry).test(norm) : words.has(entry);
}

// A word that IS the key (somber, tense, boss, space …) is the user naming the
// entry outright; it outweighs any synonym.
const KEY_WEIGHT = 4;

// Score one key: the key's own name (KEY_WEIGHT), then the synonym table, then
// the entry's own vocabulary lists — `own` is [[words, weight], …] (emotion
// moods 2, tags 1, envMoods 1). Each word counts once, at the first weight
// that claims it.
function scoreKey(key, table, own, words, norm) {
  let score = 0;
  const matched = [];
  const take = (entry, w) => {
    if (matched.includes(entry) || !hit(entry, words, norm)) return;
    score += w; matched.push(entry);
  };
  take(key, KEY_WEIGHT);
  for (const [entry, w] of Object.entries(table)) take(entry, w);
  for (const [list, w] of own) for (const word of list) take(String(word).toLowerCase(), w);
  return { score, matched };
}

// Pick the best key in KEY ORDER; strictly-greater replaces, so ties keep the
// first key. Returns null when nothing scored.
function pick(keys, scorer) {
  let best = null;
  const all = {};
  for (const k of keys) {
    const r = scorer(k);
    all[k] = r;
    if (r.score > 0 && (best === null || r.score > all[best].score)) best = k;
  }
  const tied = best === null ? [] : keys.filter((k) => k !== best && all[k].score === all[best].score);
  return { best, all, tied };
}

// Weighted tally over a word→weight table (or an array = every word weight 1).
function tally(table, words, norm) {
  const rows = Array.isArray(table) ? table.map((w) => [w, 1]) : Object.entries(table);
  const matched = rows.filter(([w]) => hit(w, words, norm));
  return { matched: matched.map(([w]) => w), sum: matched.reduce((a, [, w]) => a + w, 0) };
}

// ---------------------------------------------------------------------------
// the parser
// ---------------------------------------------------------------------------

const VOICE = '(?:voice|vocals?|vocalist|singer|singing|sung|vox)';
const VOICE_SOFT = '(?:quiet(?:ly)?|soft(?:ly)?|gentl[ey]|behind|whisper(?:ed|ing|y)?|hushed|breathy|low in the mix|buried|subtle|tucked|barely|hum|hummed|murmur(?:ed|ing)?|under the)';
const VOICE_LOUD = '(?:loud(?:ly)?|up front|upfront|forward|in front|belting|belted|big|dominant|blaring|front and cent(?:er|re))';
const NEAR = '(?:\\W+\\w+){0,3}?\\W+';

const RE = {
  bpm: [/\b(\d{2,3})\s*bpm\b/, /\bbpm\s*(?:of|at|=|:)?\s*(\d{2,3})\b/, /\b(\d{2,3})\s*beats per minute\b/],
  noDrums: /\b(?:no|without|zero|drop the|skip the|minus)\s+(?:drums?|percussion|beats?|kick|kit)\b|\bdrumless\b|\bpercussion\s*free\b/,
  noGuitar: /\b(?:no|without|drop the|skip the|minus)\s+guitars?\b|\bguitarless\b/,
  guitar: /\bguitars?\b/,
  fullSynth: /\bsynths?(?:\s+everywhere)?\b|\bsynthesi[sz]ers?\b|\belectro(?:nic)?\b|\bedm\b|\btechno\b|\bsynthwave\b|\bchiptune\b/,
  marcato: /\bmarcato\b|\bstrings?\s+stab(?:s|bing)?\b|\bstab(?:bing|s)?\s+strings\b|\bstaccato\s+strings\b|\bstring\s+hits\b/,
  swing: /\bswing(?:ing|y)?\b|\bswung\b|\bshuffle\b|\bshuffling\b/,
  duet: /\bduet\b|\btwo\s+(?:voices|singers|vocalists)\b|\bcall\s+and\s+response\b|\bboth\s+singers\b|\bharmoni[sz]ing\s+voices\b/,
  voiceSoft: new RegExp(`\\b${VOICE}\\b${NEAR}${VOICE_SOFT}\\b|\\b${VOICE_SOFT}\\b${NEAR}${VOICE}\\b`),
  voiceLoud: new RegExp(`\\b${VOICE}\\b${NEAR}${VOICE_LOUD}\\b|\\b${VOICE_LOUD}\\b${NEAR}${VOICE}\\b`),
};

const EMOTION_KEYS = Object.keys(EMOTIONS);
const ENVIRONMENT_KEYS = Object.keys(ENVIRONMENTS);
const GENRE_KEYS = Object.keys(GENRE_WORDS);

export const DEFAULTS = Object.freeze({ emotion: 'happy', environment: 'shop' });

export function describePrompt(text) {
  const norm = normalise(text);
  const words = wordSet(norm);
  const notes = [];
  const tags = [];

  // --- emotion -----------------------------------------------------------
  const em = pick(EMOTION_KEYS, (k) => scoreKey(
    k, EMOTION_WORDS[k], [[EMOTIONS[k].moods ?? [], 2], [EMOTIONS[k].tags ?? [], 1]], words, norm));
  let emotion = em.best ?? DEFAULTS.emotion;
  if (em.best) {
    const r = em.all[emotion];
    notes.push(`emotion: ${emotion} (${r.matched.join(', ')}; score ${r.score}${em.tied.length ? `, tie with ${em.tied.join('/')} broken by key order` : ''})`);
  } else {
    notes.push(`emotion: no emotion words matched — default '${DEFAULTS.emotion}'`);
  }
  tags.push(`emotion:${emotion}`);

  // --- environment -------------------------------------------------------
  const en = pick(ENVIRONMENT_KEYS, (k) => scoreKey(
    k, ENVIRONMENT_WORDS[k], [[ENVIRONMENTS[k].envMoods ?? [], 1], [ENVIRONMENTS[k].tags ?? [], 1]], words, norm));
  let environment = en.best ?? DEFAULTS.environment;
  if (en.best) {
    const r = en.all[environment];
    notes.push(`environment: ${environment} (${r.matched.join(', ')}; score ${r.score}${en.tied.length ? `, tie with ${en.tied.join('/')} broken by key order` : ''})`);
  } else {
    notes.push(`environment: no environment words matched — default '${DEFAULTS.environment}'`);
  }
  tags.push(`environment:${environment}`);

  // --- energy ------------------------------------------------------------
  const lo = tally(ENERGY_WORDS.low, words, norm);
  const hi = tally(ENERGY_WORDS.high, words, norm);
  const energy = hi.sum > lo.sum ? 'high' : lo.sum > hi.sum ? 'low' : 'mid';
  if (energy === 'mid') notes.push(`energy: mid (${lo.sum + hi.sum ? `low ${lo.sum} [${lo.matched.join(', ')}] vs high ${hi.sum} [${hi.matched.join(', ')}]` : 'no energy words'})`);
  else notes.push(`energy: ${energy} (${(energy === 'high' ? hi : lo).matched.join(', ')}; ${lo.sum} low vs ${hi.sum} high)`);
  tags.push(`energy:${energy}`);

  // --- bpm ---------------------------------------------------------------
  let bpm = null;
  for (const re of RE.bpm) {
    const m = norm.match(re);
    if (m) { bpm = parseInt(m[1], 10); break; }
  }
  if (bpm !== null) { notes.push(`bpm: ${bpm} (explicit)`); tags.push('bpm'); }

  // --- family ------------------------------------------------------------
  const mi = tally(FAMILY_WORDS.minor, words, norm);
  const ma = tally(FAMILY_WORDS.major, words, norm);
  const family = mi.sum > ma.sum ? 'minor' : ma.sum > mi.sum ? 'major' : null;
  if (family) { notes.push(`family: ${family} (${(family === 'minor' ? mi : ma).matched.join(', ')})`); tags.push(`family:${family}`); }
  else notes.push(`family: null (${mi.sum + ma.sum ? `minor ${mi.sum} vs major ${ma.sum}` : 'no mode words'})`);

  // --- genre -------------------------------------------------------------
  const ge = pick(GENRE_KEYS, (k) => scoreKey(k, GENRE_WORDS[k], [], words, norm));
  const genre = ge.best;
  if (genre) {
    const r = ge.all[genre];
    notes.push(`genre: ${genre} (${r.matched.join(', ')}; score ${r.score}${ge.tied.length ? `, tie with ${ge.tied.join('/')} broken by key order` : ''})`);
    tags.push(`genre:${genre}`);
  } else notes.push('genre: null (no genre words)');

  // --- hints (EXPLICIT words only) --------------------------------------
  const hints = {
    guitar: undefined, fullSynth: undefined, marcato: undefined, swing: undefined,
    noDrums: undefined, duet: undefined, vocalDb: undefined, drums: undefined,
  };
  const hintNote = (k, v, why) => { hints[k] = v; notes.push(`hint ${k}=${v} (${why})`); tags.push(`hint:${k}`); };
  if (RE.noDrums.test(norm)) hintNote('noDrums', true, norm.match(RE.noDrums)[0]);
  else if (/\b(?:drums?|beat|backbeat|kick|kit|percussion|footsteps)\b/.test(norm)) hintNote('drums', true, norm.match(/\b(?:drums?|beat|backbeat|kick|kit|percussion|footsteps)\b/)[0]);
  if (RE.noGuitar.test(norm)) hintNote('guitar', false, norm.match(RE.noGuitar)[0]);
  else if (RE.guitar.test(norm)) hintNote('guitar', true, norm.match(RE.guitar)[0]);
  if (RE.fullSynth.test(norm)) hintNote('fullSynth', true, norm.match(RE.fullSynth)[0]);
  if (RE.marcato.test(norm)) hintNote('marcato', true, norm.match(RE.marcato)[0]);
  if (RE.swing.test(norm)) hintNote('swing', 0.585, norm.match(RE.swing)[0]);
  if (RE.duet.test(norm)) hintNote('duet', true, norm.match(RE.duet)[0]);
  const vs = norm.match(RE.voiceSoft);
  const vl = norm.match(RE.voiceLoud);
  if (vs && !vl) hintNote('vocalDb', -1.5, vs[0]);
  else if (vl && !vs) hintNote('vocalDb', 1.5, vl[0]);
  else if (vs && vl) notes.push(`hint vocalDb: both soft ("${vs[0]}") and loud ("${vl[0]}") — left unset`);

  return {
    emotion, environment, energy, bpm, family, genre, tags, hints, notes,
    // The words behind the emotion/environment choice — what `explain` prints.
    evidence: {
      emotion: em.best ? em.all[emotion].matched.slice() : [],
      environment: en.best ? en.all[environment].matched.slice() : [],
    },
  };
}

export function describeMany(texts) {
  return Array.from(texts ?? [], (t) => describePrompt(t));
}

// One line: "excited × fight (chase, breathless) · high · minor · electro"
export function explain(result) {
  const seen = new Set();
  const why = [...(result.evidence?.emotion ?? []), ...(result.evidence?.environment ?? [])]
    .filter((w) => !seen.has(w) && seen.add(w));
  const head = `${result.emotion} × ${result.environment}${why.length ? ` (${why.join(', ')})` : ' (defaults)'}`;
  return [head, result.energy, result.family ?? '—', result.genre ?? '—'].join(' · ');
}
