// Natural-language prompt parser — "real prompts that users would do" (r21).
//
// Extracted from scripts/audition-corpus-suite.mjs so BOTH generators read the
// same words from the same sentence. The A/B comparison build depends on that:
// if the two backends disagreed about what "groovy jazzy lounge music for a
// casino level" means, the comparison would be measuring the parser, not the
// music.
//
// PURE — no side effects, no retrieval pools, nothing hashed. Adding a synonym
// here can move which vibe a PROMPT compiles to, but it touches no song built
// from a structured {emotion, environment} pair, which is every judged song in
// audition/songs.html.


const EMO_WORDS = {
  happy: ['happy', 'cheerful', 'joyful', 'upbeat', 'sunny', 'bright', 'fun'],
  sad: ['sad', 'sorrow', 'grief', 'crying', 'heartbreak', 'depressing', 'dies', 'death of', 'funeral'],
  calm: ['calm', 'chill', 'relaxing', 'peaceful', 'gentle', 'quiet', 'ambient', 'background', 'soothing', 'serene'],
  excited: ['excited', 'energetic', 'hype', 'intense', 'fast', 'adrenaline', 'action-packed', 'pumping'],
  tense: ['tense', 'tension', 'suspense', 'nervous', 'anxious', 'stealth', 'sneaking', 'danger', 'uneasy', 'on edge'],
  scary: ['scary', 'horror', 'terrifying', 'frightening', 'creepy', 'dread', 'nightmare', 'haunting', 'sinister'],
  mysterious: ['mysterious', 'mystery', 'strange', 'curious', 'enigmatic', 'secret', 'eerie', 'otherworldly', 'unknown'],
  triumphant: ['triumphant', 'victory', 'victorious', 'heroic', 'epic', 'glorious', 'triumph', 'win'],
  nostalgic: ['nostalgic', 'nostalgia', 'memory', 'memories', 'wistful', 'bittersweet', 'looking back'],
  romantic: ['romantic', 'love', 'tender', 'sweet', 'intimate'],
  somber: ['somber', 'sombre', 'solemn', 'mournful', 'melancholy', 'melancholic', 'lonely', 'desolate', 'bleak'],
  goofy: ['goofy', 'silly', 'comedic', 'comic', 'wacky', 'quirky', 'cartoonish', 'bouncy', 'playful', 'unserious'],
};
const ENV_WORDS = {
  desert: ['desert', 'sand', 'dune', 'oasis', 'pyramid', 'arabian', 'wasteland', 'canyon', 'bazaar', 'middle eastern'],
  jungle: ['jungle', 'rainforest', 'tropical', 'vines', 'safari', 'tribal', 'amazon'],
  space: ['space', 'galaxy', 'cosmic', 'nebula', 'orbit', 'planet', 'starship', 'spaceship', 'alien', 'sci-fi', 'station', 'zero gravity'],
  manor: ['mansion', 'manor', 'haunted house', 'victorian', 'estate', 'attic', 'chandelier'],
  catacombs: ['catacomb', 'crypt', 'tomb', 'ossuary', 'burial', 'undead', 'dungeon'],
  citadel: ['citadel', 'cathedral', 'fortress', 'keep', 'gothic', 'castle', 'throne'],
  shrine: ['shrine', 'temple', 'sanctuary', 'altar', 'sacred', 'holy'],
  cave: ['cave', 'cavern', 'grotto', 'underground', 'mine', 'tunnel', 'depths'],
  water: ['water', 'ocean', 'sea', 'underwater', 'lake', 'river', 'beach', 'reef', 'harbor'],
  snow: ['snow', 'ice', 'frozen', 'glacier', 'arctic', 'tundra', 'winter', 'blizzard'],
  fight: ['fight', 'battle', 'combat', 'duel', 'skirmish', 'brawl', 'war'],
  boss: ['boss', 'final boss', 'showdown', 'mech battle', 'monster'],
  stealth: ['stealth', 'sneak', 'sneaking', 'infiltrate', 'infiltration', 'heist', 'undercover', 'covert'],
  lab: ['lab', 'laboratory', 'facility', 'experiment', 'research', 'sterile', 'clinical'],
  shop: ['shop', 'store', 'market', 'merchant', 'vendor', 'trading post'],
  casino: ['casino', 'gambling', 'poker', 'slot', 'vegas', 'jazzy lounge'],
  festival: ['festival', 'carnival', 'parade', 'celebration', 'fair', 'party'],
  kitchen: ['kitchen', 'cooking', 'restaurant', 'diner', 'cafe', 'bakery'],
  training: ['training', 'practice', 'tutorial', 'dojo', 'gym', 'workout'],
  rest: ['rest', 'camp', 'campfire', 'inn', 'save point', 'resting'],
  menu: ['menu', 'title screen', 'main menu', 'options', 'pause screen', 'elevator'],
  aftermath: ['aftermath', 'ruins', 'destroyed', 'wreckage', 'devastation', 'ashes'],
  construction: ['construction', 'factory', 'industrial', 'machinery', 'workshop', 'foundry', 'metal'],
};
// modifiers a user actually types that should reach the arrangement
const MODIFIERS = [
  [/\b(lots of|heavy|big|driving|pounding)\s+(drums|percussion|beat)/, { perc: 'foreground' }],
  [/\b(no|without|minimal|light)\s+(drums|percussion|beat)/, { perc: 'light' }],
  [/\b(piano[- ]only|just piano|solo piano|piano piece)\b/, { soloPiano: true }],
  [/\b(choir|choral|chanting|voices)\b/, { choir: true }],
  [/\b(strings|orchestral|orchestra|cinematic)\b/, { strings: true }],
  [/\b(synth|synthy|electronic|retro|chiptune|8[- ]bit)\b/, { synth: true }],
  [/\b(slow|slower|laid back|dragging)\b/, { tempo: -0.18 }],
  [/\b(fast|faster|quick|driving|frantic|urgent)\b/, { tempo: +0.16 }],
  [/\b(simple|sparse|minimal|stripped)\b/, { sparse: true }],
  [/\b(busy|layered|complex|dense|lots going on)\b/, { dense: true }],
  [/\b(loop|loopable|background|ambient bed)\b/, { ambient: true }],
  [/\b(music box|musicbox)\b/, { musicBox: true }],
  [/\b(bass[- ]heavy|deep bass|sub)\b/, { bassHeavy: true }],
  [/\b(groov\w*|funky|swagger|bounce)\b/, { groove: true }],
];

export function parsePrompt(text) {
  const t = ' ' + text.toLowerCase().replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ') + ' ';
  const score = (table) => {
    const hits = [];
    for (const [key, words] of Object.entries(table))
      for (const w of words) if (t.includes(' ' + w) || t.includes(w + ' ')) { hits.push([key, w.length]); break; }
    return hits.sort((a, b) => b[1] - a[1]);
  };
  const emos = score(EMO_WORDS), envs = score(ENV_WORDS);
  const mods = {};
  for (const [re, m] of MODIFIERS) if (re.test(t)) Object.assign(mods, m);
  return {
    emotion: emos.length ? emos[0][0] : null,
    environment: envs.length ? envs[0][0] : null,
    altEmotions: emos.slice(1).map((e) => e[0]),
    altEnvironments: envs.slice(1).map((e) => e[0]),
    mods,
  };
}
