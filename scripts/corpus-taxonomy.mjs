// Multi-label taxonomy for the vgmusic-full ANALYSIS corpus.
//
// HIS FRAMING: "any song may be multiple genres. for example a passive batman
// song could also be creepy OR heroic depending on the song (do not confuse the
// two though as they are very different) along with being like vigilante OR hero
// music." So labels are MULTI-LABEL and live on independent AXES — scene, mood,
// style, structural function — rather than in one mutually-exclusive bucket.
//
// LABEL QUALITY IS THE WEAKEST LINK IN EVERY NUMBER DOWNSTREAM. VGMusic organises
// by console and game, not by mood; every mood label here is inferred from the
// TRACK TITLE the sequencer typed. So:
//   - each label records WHICH axis and WHICH term fired (auditable, not a guess)
//   - `confidence` is reported, and aggregates filter on it
//   - unlabelled files are counted and reported as unlabelled, never silently
//     folded into a majority class
//   - a hand-checked sample gives the error rate, which the write-up states
//
// Terms are matched word-wise against a normalised "GAME :: TITLE :: FILENAME"
// string. Word-wise matters: "cave" must not fire inside "concave", and — a real
// case in this corpus — "sad" must not fire inside "Sadness of the Heart" being
// fine but "Casadei" not.

const AXES = {
  // ---- WHERE: the scene or environment the cue plays in
  scene: {
    desert: ['desert', 'sand', 'sands', 'dune', 'dunes', 'oasis', 'pyramid', 'sphinx', 'arabia', 'arabian', 'sahara', 'mirage', 'wasteland', 'badlands', 'canyon', 'agrabah'],
    jungle: ['jungle', 'rainforest', 'tropic', 'tropical', 'vine', 'vines', 'safari', 'amazon', 'congo', 'tribal', 'island', 'lagoon'],
    forest: ['forest', 'woods', 'woodland', 'grove', 'jungle', 'tree', 'trees', 'greenwood', 'thicket'],
    cave: ['cave', 'caves', 'cavern', 'caverns', 'grotto', 'underground', 'mine', 'mines', 'subterranean', 'tunnel', 'depths'],
    water: ['water', 'ocean', 'sea', 'underwater', 'aquatic', 'lake', 'river', 'beach', 'coast', 'wave', 'waves', 'marina', 'harbor', 'harbour', 'reef', 'aqua', 'tide'],
    snow: ['snow', 'ice', 'icy', 'frozen', 'glacier', 'arctic', 'tundra', 'winter', 'blizzard', 'frost', 'freeze'],
    volcano: ['volcano', 'volcanic', 'lava', 'magma', 'inferno', 'furnace', 'flame', 'fire', 'ember', 'crater'],
    sky: ['sky', 'cloud', 'clouds', 'heaven', 'heavens', 'aerial', 'flight', 'wind', 'air', 'balloon', 'celestial'],
    // bare 'star' and 'moon' are dropped: they fire on "Sailor Moon", "Starman"
    // and "Star Fox" without the cue being spatial. Compounds are kept.
    space: ['space', 'galaxy', 'galactic', 'cosmic', 'cosmos', 'stellar', 'nebula', 'orbit', 'orbital', 'planet', 'planetary', 'lunar', 'asteroid', 'starship', 'spaceship', 'starfighter', 'alien', 'ufo', 'satellite', 'interstellar', 'astro', 'zero gravity', 'comet'],
    castle: ['castle', 'fortress', 'keep', 'citadel', 'palace', 'tower', 'throne', 'stronghold', 'bastion'],
    town: ['town', 'village', 'city', 'street', 'market', 'plaza', 'inn', 'tavern', 'hometown', 'settlement', 'kingdom'],
    shop: ['shop', 'store', 'merchant', 'item', 'buy', 'market', 'bazaar'],
    dungeon: ['dungeon', 'labyrinth', 'maze', 'catacomb', 'catacombs', 'crypt', 'tomb', 'ruin', 'ruins', 'temple', 'shrine', 'sanctum'],
    haunted: ['haunted', 'ghost', 'ghosts', 'ghostly', 'phantom', 'spirit', 'spectre', 'specter', 'graveyard', 'grave', 'cemetery', 'mansion', 'manor', 'curse', 'cursed', 'undead', 'zombie', 'skeleton', 'wraith', 'poltergeist'],
    factory: ['factory', 'machine', 'mechanical', 'industrial', 'robot', 'laboratory', 'reactor', 'foundry'],
    swamp: ['swamp', 'marsh', 'bog', 'mire', 'poison', 'toxic', 'sewer'],
    field: ['field', 'fields', 'plain', 'plains', 'meadow', 'prairie', 'grassland', 'overworld'],
  },
  // ---- WHAT IT FEELS LIKE. His caution: creepy and heroic are very different
  // and must not be conflated, so they are separate terms on the same axis and a
  // file may legitimately carry both when its title supports both.
  mood: {
    heroic: ['hero', 'heroic', 'heroes', 'brave', 'courage', 'valor', 'valour', 'legend', 'legendary', 'champion', 'knight', 'warrior', 'justice', 'noble'],
    triumphant: ['triumph', 'triumphant', 'victory', 'victorious', 'fanfare', 'celebration', 'glory', 'glorious', 'congratulations'],
    epic: ['epic', 'grand', 'ultimate', 'destiny', 'apocalypse', 'ragnarok', 'ascension'],
    creepy: ['creepy', 'eerie', 'spooky', 'scary', 'horror', 'fear', 'terror', 'dread', 'nightmare', 'sinister', 'ominous', 'macabre', 'chilling', 'unsettling', 'disturbing', 'twisted'],
    tense: ['tense', 'tension', 'danger', 'dangerous', 'alert', 'warning', 'chase', 'escape', 'pursuit', 'urgent', 'emergency', 'crisis', 'panic', 'countdown', 'trap', 'suspense'],
    menacing: ['evil', 'dark', 'darkness', 'demon', 'demonic', 'devil', 'villain', 'malice', 'wicked', 'doom', 'despair', 'shadow', 'shadows', 'nemesis', 'tyrant', 'evil'],
    mysterious: ['mystery', 'mysterious', 'enigma', 'secret', 'secrets', 'hidden', 'unknown', 'strange', 'curious', 'riddle', 'puzzle', 'arcane', 'mystic', 'mystical'],
    somber: ['sad', 'sadness', 'sorrow', 'grief', 'mourning', 'lament', 'tragic', 'tragedy', 'melancholy', 'tears', 'requiem', 'elegy', 'farewell', 'goodbye', 'loss', 'lonely', 'loneliness', 'alone', 'solitude', 'memory', 'memories', 'nostalgia'],
    peaceful: ['peace', 'peaceful', 'calm', 'serene', 'serenity', 'gentle', 'quiet', 'relax', 'tranquil', 'lullaby', 'slumber', 'dream', 'dreams'],
    playful: ['playful', 'fun', 'funny', 'comic', 'comical', 'silly', 'goofy', 'wacky', 'zany', 'bouncy', 'happy', 'cheerful', 'jolly', 'merry', 'circus', 'carnival', 'party', 'toy', 'candy', 'cute'],
    romantic: ['love', 'romance', 'romantic', 'kiss', 'wedding', 'tender'],
    heroic_sad: ['sacrifice', 'fallen', 'hero’s', 'requiem'],
    urgent: ['hurry', 'rush', 'frantic', 'desperate', 'countdown'],
    // 'night' and 'shadow' removed after audit — they fired on "Arabian Night"
    // and the game name "Shadow of the Beast", neither of which is vigilante music.
    vigilante: ['vigilante', 'batman', 'stealth', 'sneak', 'sneaking', 'infiltration', 'undercover', 'covert', 'heist', 'burglar', 'assassin'],
  },
  // ---- WHAT KIND OF CUE it is structurally
  fn: {
    battle: ['battle', 'fight', 'combat', 'versus', 'encounter', 'war', 'skirmish', 'duel', 'showdown'],
    boss: ['boss', 'miniboss', 'subboss'],
    final_boss: ['finalboss', 'lastboss'],
    title: ['title', 'opening', 'intro', 'prologue', 'main theme', 'maintheme'],
    ending: ['ending', 'credits', 'staff roll', 'epilogue', 'finale'],
    gameover: ['gameover', 'game over', 'death', 'died', 'defeat', 'lose', 'loser', 'fail', 'failure', 'continue'],
    menu: ['menu', 'select', 'selection', 'options', 'pause', 'status screen'],
    jingle: ['jingle', 'fanfare', 'stinger', 'obtained', 'level up', 'levelup'],
    cutscene: ['cutscene', 'story', 'dialogue', 'conversation', 'flashback'],
    minigame: ['minigame', 'mini game', 'bonus', 'puzzle', 'quiz', 'training'],
  },
  // ---- MUSICAL STYLE the title advertises
  style: {
    jazz: ['jazz', 'jazzy', 'swing', 'blues', 'bluesy', 'bebop', 'lounge', 'ragtime', 'boogie'],
    waltz: ['waltz', 'minuet', 'ballroom'],
    march: ['march', 'marching', 'parade', 'military', 'anthem'],
    rock: ['rock', 'punk', 'shred', 'hard rock'],
    electronic: ['techno', 'electro', 'electronic', 'trance', 'disco', 'edm'],
    orchestral: ['orchestra', 'orchestral', 'symphony', 'symphonic', 'concerto', 'overture', 'suite'],
    choral: ['choir', 'chorus', 'choral', 'hymn', 'chant', 'gregorian', 'vocal', 'aria', 'requiem'],
    latin: ['latin', 'samba', 'salsa', 'bossa', 'tango', 'mambo', 'rumba', 'flamenco'],
    celtic: ['celtic', 'irish', 'folk', 'medieval', 'renaissance', 'bard'],
    // 'japan'/'japanese' are REGION TAGS in this corpus ("Sailor Moon R (Japan)"),
    // and 'ninja' fired 2653 times mostly from the C64 game "Last Ninja", which has
    // no Asian musical content at all. Both removed after a hand audit.
    asian: ['oriental', 'koto', 'shamisen', 'shakuhachi', 'taiko', 'samurai', 'dojo', 'pagoda'],
    country: ['western', 'cowboy', 'saloon', 'bluegrass', 'hoedown'],
    reggae: ['reggae', 'ska', 'calypso', 'steel drum'],
    ballad: ['ballad', 'lullaby', 'serenade'],
  },
};

// Region tags are cataloguing metadata, not description: "(Japan)", "(USA)",
// "(Europe)" appear in hundreds of game names and must never reach a style label.
const REGION = /\((japan|usa|us|europe|eu|jp|world|korea|france|germany|spain|italy|australia|brazil|beta|proto|unl|rev [a-z0-9]+)\)/gi;

const NORM = (s) => ' ' + String(s || '').replace(REGION, ' ')
  .replace(/[_\-.]+/g, ' ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .toLowerCase()
  .replace(/[^a-z0-9' ]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim() + ' ';

/**
 * label(entry) -> { labels: {axis: [term...]}, hits: [...], confidence, ambiguous }
 * `entry` is a manifest row: { game, title, file, system }.
 */
export function label({ game = '', title = '', file = '', system = '' } = {}) {
  // TITLE + FILENAME ONLY. The game name is a PROPER NOUN and a 40-file hand
  // check showed it leaking everywhere: "Breath of Fire" -> volcano, "Phantom
  // Hourglass" -> haunted, "Jazz Jackrabbit" -> jazz, "Dark Cloud" -> menacing,
  // "Street Fighter" -> town, "Lunar" -> space, "Metal Knight" -> factory+rock.
  // None of those describe the cue. The sequencer's TITLE does.
  const tText = NORM(title) + NORM(file);
  const gText = '';
  const labels = {}, hits = [];
  for (const [axis, terms] of Object.entries(AXES)) {
    for (const [name, words] of Object.entries(terms)) {
      for (const w of words) {
        const pat = ' ' + w + ' ';
        const inTitle = tText.includes(pat);
        const inGame = gText.includes(pat) && (axis === 'scene' || axis === 'style');
        if (!inTitle && !inGame) continue;
        (labels[axis] ||= []).push(name);
        hits.push({ axis, label: name, term: w, from: inTitle ? 'title' : 'game' });
        break;
      }
    }
  }
  for (const k of Object.keys(labels)) labels[k] = [...new Set(labels[k])];

  const fromTitle = hits.filter((h) => h.from === 'title').length;
  const nAxes = Object.keys(labels).length;
  // Confidence is about EVIDENCE, not about how many labels stuck: one strong
  // title term beats three game-name terms.
  const confidence = fromTitle >= 2 ? 'high' : fromTitle === 1 ? 'medium' : hits.length ? 'low' : 'none';
  // Genuinely ambiguous = two mood labels his note says are "very different".
  const m = labels.mood || [];
  const conflict = (m.includes('creepy') || m.includes('menacing')) && (m.includes('heroic') || m.includes('triumphant') || m.includes('playful'));
  return { labels, hits, confidence, nAxes, ambiguous: conflict, unlabelled: !hits.length };
}

export const AXIS_NAMES = Object.keys(AXES);
export const ALL_LABELS = Object.fromEntries(Object.entries(AXES).map(([a, t]) => [a, Object.keys(t)]));
export { AXES };
