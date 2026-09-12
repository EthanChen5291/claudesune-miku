// r36 — REAL Japanese lyrics, written from grammar + vocabulary and BOUND to
// the melody (his "currently, our vocaloid produces random japanese syllables.
// it should actually produce real japanese lyrics, of course with parts bound
// to the melody").
//
// What the r34 pool did: pick words by hash until the mora count was met, so
// a line read "ka ze ga a sa wa ta shi" — words, not a sentence, and the word
// boundaries fell wherever the count ran out, across rests and off the held
// notes. What this module does instead:
//
//   1. A SENTENCE per line. Each 2-bar phrase of the score gets one Japanese
//      clause built from a TEMPLATE (subject-ga verb / object-o verb-te /
//      noun-ni verb-tai / topic-wa predicate / adverb verb / fragment …) whose
//      slots are filled from a tagged lexicon (nouns by kind: person, place,
//      thing, abstract, time; verbs with a conjugation class and an argument
//      frame; i-adjectives; adverbs). Verbs are CONJUGATED here (godan /
//      ichidan / kuru / au: dictionary, -te, -ta, -tai, -nai, volitional,
//      -teru), so "kimi no koe ga hibiku" and "sora o koete ikou" are the
//      grammar's output, not stored lines. NOTHING IN THIS FILE IS A LINE FROM
//      A SONG (D137's "patterns yes, tunes no", on the text side): only single
//      words and ordinary set phrases (arigatou, mou ichido) are stored.
//
//   2. BOUND TO THE MELODY. A phrase is cut into SEGMENTS at its rests (any
//      gap >= 60 ms — the singer inserts an SP there anyway) and a bunsetsu
//      (word + its particle) may never straddle a rest. A LONG note (>= 1.5x
//      the phrase's median and >= 0.3 s) that is not last in its segment asks
//      for a word boundary right after it (scored, not forced). The mora count
//      of a segment is met EXACTLY, or met one short with the segment's final
//      vowel HELD over its last note (a chōon, 'ー' — what a singer does with a
//      long note), never by a stray syllable. A phrase whose final note is long
//      may take a line-ending particle (yo / ne / sa) on that note. Every note
//      still takes exactly one mora (the r36 melisma law: `melismaUnder` 0).
//
//   3. THE FORM WRITES THE REFRAIN. With the page's `sections` on the score
//      (letter, role, bars — vocal pages only), a CHORUS phrase is keyed by its
//      ordinal in the letter, so every statement of B sings the same words
//      (re-bound to that statement's rhythm; a fresh variant only when the
//      sentence cannot be re-bound); a VERSE statement is keyed by statement,
//      so verse 2 has new words over verse 1's tune; a bridge is its own. With
//      no sections (songs.html), the r34 contour key stands in.
//
//   4. THE PROMPT PICKS THE WORDS. The environment, the emotion and the
//      description's own nouns (rain, station, fireworks, robot, mirror …) map
//      to lexicon TAGS; tagged words sort first in every slot, so a rainy
//      goodbye sings ame / eki / namida and a festival sings hanabi / natsu /
//      te. The chorus leans on the wish forms (-tai, -ou, -te yo), the verse
//      on scene forms (ga + dict, wa + noun, adjective + noun).
//
// Every mora is spelled into the Tiger voicebank's phoneme set through
// lyrics-ja.js's moraPhonemes (a geminate っ is the `q` closure carried as the
// leading consonant of the next mora — the singer places consonants before
// the beat, which is exactly where a closure sits; a chōon is the previous
// vowel on a new note; を is sung [oo]). Kana is derived from the moras
// (hiragana; loanwords too — the voice sings hiragana anyway).
//
// Determinism: a pure function of (seed, phrase key, theme). Word choice is a
// hash-rotated POOL (D95): adding a word re-rolls unpinned lines. Nothing here
// reaches the judged instrumental pages; the lines land only in a song's
// vocal score.

import { moraPhonemes } from './lyrics-ja.js';

const fnv = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };

// ---- romaji -> moras -> kana ------------------------------------------------
const CONS = ['ky', 'gy', 'sh', 'ch', 'ts', 'ny', 'hy', 'by', 'py', 'my', 'ry', 'j', 'k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'f', 'b', 'p', 'm', 'y', 'r', 'w'];
/** "kimi" -> ['ki','mi']; "arigato-" -> ['a','ri','ga','to','ー']; "matte" ->
 *  ['ma','tte'] (geminate carried on the next mora); "kon'ya" -> ['ko','n','ya'] */
export function moras(romaji) {
  const out = [];
  let s = romaji.toLowerCase();
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '-') { out.push('ー'); i++; continue; }
    if (c === "'" || c === ' ') { i++; continue; }
    if (c === 'n') {
      const nx = s[i + 1];
      if (nx == null || nx === "'" || nx === ' ' || nx === '-' || !/[aiueoy]/.test(nx)) { out.push('n'); i++; continue; }
    }
    let gem = '';
    if (/[kgsztdhfbpmr]/.test(c) && s[i + 1] === c) { gem = 'q'; i++; }
    else if (c === 't' && s.slice(i, i + 3) === 'tch') { gem = 'q'; i++; }
    let cons = '';
    for (const k of CONS) if (s.startsWith(k, i)) { cons = k; break; }
    const v = s[i + cons.length];
    if (!/[aiueo]/.test(v ?? '')) throw new Error(`cannot tokenise romaji "${romaji}" at ${i}`);
    out.push((gem ? 'q' : '') + cons + v);
    i += cons.length + 1;
  }
  return out;
}
const KANA_BASE = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ', za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と', da: 'だ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の', ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ', pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も', ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ', wa: 'わ', wo: 'を', n: 'ん', 'ー': 'ー',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ', sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ', bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ', rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ', je: 'じぇ', she: 'しぇ', che: 'ちぇ', fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', ti: 'てぃ', di: 'でぃ',
};
export function moraKana(m) {
  if (m === 'wa_') return 'は';          // the topic particle は, sung "wa"
  if (m === 'e_') return 'へ';           // the direction particle へ, sung "e"
  if (m.startsWith('q')) return 'っ' + moraKana(m.slice(1));
  const k = KANA_BASE[m];
  if (!k) throw new Error(`no kana for mora ${m}`);
  return k;
}
/** phonemes for one mora, with the writer's extras (っ, を, ー) */
export function moraPh(m, prevVowel = 'a') {
  if (m === 'ー') return [prevVowel];
  if (m === 'wa_') return ['w', 'a'];
  if (m === 'e_') return ['ee'];
  if (m === 'wo') return ['oo'];
  if (m.startsWith('q')) return ['q', ...moraPh(m.slice(1), prevVowel)];
  if (m === 'ti') return ['tx', 'iy'];
  if (m === 'di') return ['d', 'iy'];
  if (m === 'je') return ['jh', 'ee'];
  if (m === 'she') return ['sh', 'ee'];
  if (m === 'che') return ['ch', 'ee'];
  if (/^f[aieo]$/.test(m)) return ['fp', { a: 'a', i: 'iy', e: 'ee', o: 'oo' }[m[1]]];
  return moraPhonemes(m);
}

// ---- lexicon ----------------------------------------------------------------
// kinds: person place thing abstract time. tags: the theme hooks.
const POSS = { you: 'your', I: 'my', 'the two of us': 'our', everyone: "everyone's", myself: 'my own', someone: "someone's" };
const N = (r, g, kind, tags = []) => ({ t: 'N', r, m: moras(r), g, kind, tags, gp: POSS[g] });
const NOUNS = [
  N('kimi', 'you', 'person', ['love', 'you']), N('boku', 'I', 'person', ['self']), N('watashi', 'I', 'person', ['self']),
  N('anata', 'you', 'person', ['love', 'you']), N('futari', 'the two of us', 'person', ['love']), N('minna', 'everyone', 'person', ['festival']),
  N('robotto', 'robot', 'person', ['robot']), N('dareka', 'someone', 'person', ['alone', 'secret']), N('jibun', 'myself', 'person', ['self', 'mirror']),
  N('sora', 'sky', 'place', ['sky', 'space', 'far']), N('hoshi', 'star', 'thing', ['star', 'space', 'night']), N('tsuki', 'moon', 'thing', ['moon', 'night']),
  N('hoshizora', 'starry sky', 'place', ['star', 'night', 'space']), N('ginga', 'galaxy', 'place', ['space', 'star']), N('uchu-', 'space', 'place', ['space']),
  N('yoru', 'night', 'time', ['night', 'dark']), N('asa', 'morning', 'time', ['morning']), N('yu-gure', 'dusk', 'time', ['evening', 'festival']),
  N('hikari', 'light', 'thing', ['light', 'shine']), N('kaze', 'wind', 'thing', ['wind', 'run', 'calm']), N('ame', 'rain', 'thing', ['rain', 'sad', 'water']),
  N('umi', 'sea', 'place', ['sea', 'water']), N('nami', 'wave', 'thing', ['wave', 'sea', 'water']), N('kumo', 'cloud', 'thing', ['sky']),
  N('niji', 'rainbow', 'thing', ['rain', 'sky']), N('yuki', 'snow', 'thing', ['snow', 'winter']), N('machi', 'city', 'place', ['city', 'street', 'night']),
  N('michi', 'road', 'place', ['road', 'run', 'journey']), N('mado', 'window', 'thing', ['city', 'rain', 'shop']), N('eki', 'station', 'place', ['station']),
  N('densha', 'train', 'thing', ['station']), N('hanabi', 'fireworks', 'thing', ['fire', 'summer', 'festival']), N('natsu', 'summer', 'time', ['summer', 'festival']),
  N('fuyu', 'winter', 'time', ['snow', 'winter']), N('haru', 'spring', 'time', ['flower']), N('matsuri', 'festival', 'thing', ['festival']),
  N('taiko', 'drum', 'thing', ['festival', 'sound']), N('hana', 'flower', 'thing', ['flower']), N('kagami', 'mirror', 'thing', ['mirror']),
  N('kage', 'shadow', 'thing', ['dark', 'shadow', 'scary']), N('yami', 'darkness', 'thing', ['dark', 'villain', 'scary']), N('sekai', 'world', 'place', []),
  N('mirai', 'future', 'time', ['hope']), N('ima', 'now', 'time', []), N('kino-', 'yesterday', 'time', ['memory']), N('ano hi', 'that day', 'time', ['memory']),
  N('kioku', 'memory', 'abstract', ['memory']), N('omoide', 'memories', 'abstract', ['memory', 'nostalgic']), N('kokoro', 'heart', 'abstract', ['love']),
  N('yume', 'dream', 'abstract', ['dream', 'hope']), N('koe', 'voice', 'thing', ['sound', 'you']), N('uta', 'song', 'thing', ['sound']),
  N('kotoba', 'words', 'thing', ['love', 'goodbye']), N('namida', 'tears', 'thing', ['tear', 'sad', 'goodbye']), N('egao', 'smile', 'thing', ['smile', 'happy']),
  N('negai', 'wish', 'abstract', ['hope']), N('inori', 'prayer', 'abstract', ['hope', 'somber']), N('kiseki', 'miracle', 'abstract', ['hope']),
  N('iki', 'breath', 'thing', ['breath', 'run', 'snow']), N('te', 'hand', 'thing', ['hand']), N('mune', 'chest', 'thing', ['love']),
  N('me', 'eyes', 'thing', []), N('ashi', 'feet', 'thing', ['run']), N('hata', 'flag', 'thing', ['flag', 'march']), N('chikara', 'strength', 'abstract', ['strength', 'fight']),
  N('kizu', 'wound', 'thing', ['wound', 'fight']), N('uso', 'lie', 'abstract', ['villain', 'dark']), N('himitsu', 'secret', 'abstract', ['secret', 'villain']),
  N('ko-hi-', 'coffee', 'thing', ['coffee', 'cafe']), N('gakko-', 'school', 'place', ['school']), N('ro-ka', 'corridor', 'place', ['school', 'scary']),
  N('okashi', 'sweets', 'thing', ['sweet', 'eat', 'kitchen']), N('kaidan', 'stairs', 'place', ['school', 'scary']), N('heya', 'room', 'place', ['alone', 'rest']),
  N('toki', 'time', 'time', []), N('hajimari', 'beginning', 'abstract', ['hope']), N('owari', 'end', 'abstract', ['goodbye']), N('tabi', 'journey', 'abstract', ['journey', 'road']),
  N('basho', 'place', 'place', ['memory']), N('maho-', 'magic', 'abstract', ['dream', 'sweet']), N('tobira', 'door', 'thing', ['secret', 'hope']),
  N('kagi', 'key', 'thing', ['secret']), N('oto', 'sound', 'thing', ['sound']), N('rizumu', 'rhythm', 'thing', ['sound', 'dance']),
  N('sute-ji', 'stage', 'place', ['festival', 'shine']), N('kanpai', 'cheers', 'thing', ['festival', 'eat']), N('yakusoku', 'promise', 'abstract', ['love', 'hope']),
  N('kotae', 'answer', 'abstract', ['secret', 'mirror']), N('itami', 'pain', 'abstract', ['wound', 'sad']), N('ashita', 'tomorrow', 'time', ['hope']),
  N('shiro-', 'castle', 'place', ['march', 'fight']), N('senjo-', 'battlefield', 'place', ['fight', 'march']), N('ashioto', 'footsteps', 'thing', ['march', 'scary']),
  N('nabe', 'pot', 'thing', ['kitchen']), N('tamago', 'egg', 'thing', ['kitchen', 'eat']), N('sato-', 'sugar', 'thing', ['sweet', 'kitchen']),
  N('mori', 'forest', 'place', ['jungle', 'forest']), N('kawa', 'river', 'place', ['jungle', 'water']), N('sabaku', 'desert', 'place', ['desert']),
  N('suna', 'sand', 'thing', ['desert']), N('honoo', 'flame', 'thing', ['fire', 'fight']), N('kane', 'bell', 'thing', ['shrine', 'somber']),
];
// verbs: cls g (godan) | i (ichidan) | kuru | au; subj: agent | thing | any;
// frame: the argument slot the verb takes (o / ni / e / to / null) and the
// noun kinds it accepts there
const V = (r, cls, g, subj, frame = null, tags = []) => ({ t: 'V', r, cls, g, subj, frame, tags });
const VERBS = [
  V('hibiku', 'g', 'echo', 'thing', null, ['sound']), V('kagayaku', 'g', 'shine', 'thing', null, ['shine', 'star']), V('hikaru', 'g', 'glow', 'thing', null, ['light']),
  V('kieru', 'i', 'vanish', 'any', null, ['sad', 'dark']), V('furu', 'g', 'fall', 'thing:rain,snow,water', null, ['rain', 'snow']), V('tokeru', 'i', 'melt', 'thing', null, ['snow', 'night']),
  V('moeru', 'i', 'burn', 'thing', null, ['fire', 'fight']), V('tsuzuku', 'g', 'go on', 'any', null, []), V('todoku', 'g', 'reach', 'thing', null, ['hope', 'sound']),
  V('mawaru', 'g', 'spin', 'any', null, ['dance', 'goofy']), V('nagareru', 'i', 'flow', 'thing', null, ['water', 'time']), V('saku', 'g', 'bloom', 'thing:flower', null, ['flower']),
  V('yureru', 'i', 'sway', 'thing', null, ['calm', 'wave']), V('kawaru', 'g', 'change', 'any', null, []), V('hajimaru', 'g', 'begin', 'thing', null, ['hope']),
  V('naru', 'g', 'become', 'agent', { p: 'ni', kinds: ['thing', 'abstract'] }, []), V('hashiru', 'g', 'run', 'agent', { p: 'o', kinds: ['place'], opt: true }, ['run']),
  V('tobu', 'g', 'fly', 'agent', { p: 'e', kinds: ['place'], opt: true }, ['sky', 'run']), V('aruku', 'g', 'walk', 'agent', { p: 'o', kinds: ['place'], opt: true }, ['calm', 'road']),
  V('kakeru', 'i', 'dash', 'agent', { p: 'o', kinds: ['place'], opt: true }, ['run']), V('nigeru', 'i', 'run away', 'agent', null, ['tense', 'scary']),
  V('oikakeru', 'i', 'chase', 'agent', { p: 'o', kinds: ['person', 'thing', 'abstract'] }, ['tense', 'run']), V('sakebu', 'g', 'shout', 'agent', null, ['fight', 'tense']),
  V('utau', 'g', 'sing', 'agent', { p: 'o', kinds: ['thing:song,uta'], opt: true }, ['sound', 'happy']), V('odoru', 'g', 'dance', 'agent', null, ['dance', 'festival']),
  V('warau', 'g', 'laugh', 'agent', null, ['smile', 'happy', 'villain', 'goofy']), V('naku', 'g', 'cry', 'agent', null, ['tear', 'sad']), V('matsu', 'g', 'wait for', 'agent', { p: 'o', kinds: ['person', 'time'] }, ['love']),
  V('sagasu', 'g', 'look for', 'agent', { p: 'o', kinds: ['person', 'thing', 'abstract'] }, ['secret']), V('mitsukeru', 'i', 'find', 'agent', { p: 'o', kinds: ['thing', 'abstract'] }, ['hope']),
  V('tsunagu', 'g', 'join', 'agent', { p: 'o', kinds: ['thing:te,hand'] }, ['hand', 'love']), V('dakishimeru', 'i', 'hold', 'agent', { p: 'o', kinds: ['person'] }, ['love']),
  V('wasureru', 'i', 'forget', 'agent', { p: 'o', kinds: ['person', 'thing', 'abstract', 'time'] }, ['memory']), V('shinjiru', 'i', 'believe in', 'agent', { p: 'o', kinds: ['person', 'abstract'] }, ['hope']),
  V('mamoru', 'g', 'protect', 'agent', { p: 'o', kinds: ['person', 'abstract', 'place'] }, ['fight', 'love']), V('koeru', 'i', 'go beyond', 'agent', { p: 'o', kinds: ['place', 'time', 'abstract'] }, ['strength', 'hope']),
  V('tsukamu', 'g', 'grab', 'agent', { p: 'o', kinds: ['thing', 'abstract'] }, ['fight', 'hope']), V('miageru', 'i', 'look up at', 'agent', { p: 'o', kinds: ['place:sora,hoshizora', 'thing:hoshi,tsuki,hanabi,sora'] }, ['sky', 'star']),
  V('miru', 'i', 'see', 'agent', { p: 'o', kinds: ['person', 'thing', 'abstract', 'place'] }, []), V('kiku', 'g', 'hear', 'agent', { p: 'o', kinds: ['thing:koe,uta,oto,ashioto,kane'] }, ['sound']),
  V('yobu', 'g', 'call', 'agent', { p: 'o', kinds: ['person'] }, ['love', 'sad']), V('kanaeru', 'i', 'make come true', 'agent', { p: 'o', kinds: ['abstract:yume,negai'] }, ['hope']),
  V('kazoeru', 'i', 'count', 'agent', { p: 'o', kinds: ['thing:hoshi,ashioto,namida'] }, ['star', 'night']), V('negau', 'g', 'wish', 'agent', null, ['hope']),
  V('kaeru', 'g', 'go home', 'agent', { p: 'ni', kinds: ['place'], opt: true }, ['memory', 'nostalgic']), V('iku', 'g', 'go', 'agent', { p: 'e', kinds: ['place'], opt: true }, ['run', 'hope']),
  V('kuru', 'kuru', 'come', 'any', null, []), V('okiru', 'i', 'wake up', 'agent', null, ['morning']), V('nemuru', 'g', 'sleep', 'agent', null, ['rest', 'somber', 'lullaby']),
  V('ikiru', 'i', 'live', 'agent', null, ['strength']), V('tsutaeru', 'i', 'tell', 'agent', { p: 'o', kinds: ['abstract', 'thing:kotoba,koe'] }, ['love']),
  V('kakageru', 'i', 'raise', 'agent', { p: 'o', kinds: ['thing:hata,te'] }, ['flag', 'march']), V('katsu', 'g', 'win', 'agent', null, ['fight', 'triumphant']),
  V('tatakau', 'g', 'fight', 'agent', null, ['fight']), V('hiraku', 'g', 'open', 'agent', { p: 'o', kinds: ['thing:tobira,mado,me'] }, ['hope', 'secret']),
  V('tojiru', 'i', 'close', 'agent', { p: 'o', kinds: ['thing:me,tobira,mado'] }, ['rest', 'sad']), V('nomu', 'g', 'drink', 'agent', { p: 'o', kinds: ['thing:ko-hi-'] }, ['cafe']),
  V('taberu', 'i', 'eat', 'agent', { p: 'o', kinds: ['thing:okashi,tamago'] }, ['eat', 'kitchen']), V('mazeru', 'i', 'stir', 'agent', { p: 'o', kinds: ['thing:nabe,tamago,sato-'] }, ['kitchen']),
  V('oboeru', 'i', 'remember', 'agent', { p: 'o', kinds: ['person', 'thing', 'abstract', 'time'] }, ['memory']), V('au', 'au', 'meet', 'agent', { p: 'ni', kinds: ['person'] }, ['love', 'goodbye']),
  V('sawagu', 'g', 'make a racket', 'agent', null, ['festival', 'goofy']), V('tomaru', 'g', 'stop', 'any', null, ['calm', 'time']),
  V('suberu', 'g', 'slip', 'agent', null, ['goofy', 'snow']), V('kakusu', 'g', 'hide', 'agent', { p: 'o', kinds: ['abstract', 'thing'] }, ['secret', 'villain']),
  V('damasu', 'g', 'fool', 'agent', { p: 'o', kinds: ['person'] }, ['villain']),
  V('furueru', 'i', 'tremble', 'any', null, ['scary', 'tense']), V('susumu', 'g', 'go forward', 'agent', { p: 'o', kinds: ['place'], opt: true }, ['march', 'strength']),
];
// i-adjectives (prenominal or predicate) and prenominal-only modifiers
const A = (r, g, kinds, tags = [], pren = false) => ({ t: 'A', r, m: moras(r), g, kinds, tags, pren });
const ADJS = [
  A('aoi', 'blue', ['thing', 'place'], ['sky', 'sea', 'water']), A('akai', 'red', ['thing'], ['fire', 'festival']), A('shiroi', 'white', ['thing'], ['snow', 'winter']),
  A('to-i', 'far', ['place', 'time', 'thing'], ['far', 'space', 'memory']), A('tsuyoi', 'strong', ['thing', 'abstract', 'person'], ['strength', 'fight']),
  A('yasashii', 'gentle', ['thing', 'person', 'abstract'], ['calm', 'love', 'lullaby']), A('atarashii', 'new', ['thing', 'place', 'abstract', 'time'], ['hope']),
  A('nagai', 'long', ['time', 'place'], ['night', 'road']), A('samui', 'cold', ['time', 'place'], ['snow', 'winter', 'alone']), A('atsui', 'hot', ['time', 'thing'], ['summer', 'fire']),
  A('amai', 'sweet', ['thing', 'abstract'], ['sweet', 'love']), A('kurai', 'dark', ['place', 'time'], ['dark', 'scary']), A('akarui', 'bright', ['place', 'time', 'thing'], ['light', 'happy']),
  A('hayai', 'fast', ['thing'], ['run']), A('itoshii', 'beloved', ['person'], ['love']), A('sabishii', 'lonely', ['time', 'place'], ['alone', 'sad']),
  A('kanashii', 'sad', ['time', 'thing', 'abstract'], ['sad']), A('kowai', 'scary', ['thing', 'place'], ['scary']), A('tanoshii', 'fun', ['time', 'thing'], ['happy', 'festival']),
  A('chiisana', 'little', ['thing', 'person', 'place'], ['lullaby', 'calm'], true), A('o-kina', 'big', ['thing', 'place'], ['festival', 'fight'], true),
  A('atatakai', 'warm', ['thing', 'place'], ['love', 'cafe']), A('shizukana', 'quiet', ['place', 'time'], ['calm', 'rest', 'somber'], true),
];
const ADV = (r, g, tags = []) => ({ t: 'ADV', r, m: moras(r), g, tags });
const ADVS = [
  ADV('mo- ichido', 'once more', ['love', 'hope', 'memory']), ADV('zutto', 'always', ['love']), ADV('kitto', 'surely', ['hope']), ADV('motto', 'more', ['run', 'festival']),
  ADV('mada', 'still', ['sad', 'memory']), ADV('itsumo', 'always', []), ADV('sotto', 'softly', ['calm', 'lullaby', 'love']), ADV('takaku', 'high', ['sky', 'shine']),
  ADV('to-ku', 'far', ['far', 'run']), ADV('tsuyoku', 'strongly', ['strength', 'fight']), ADV('ima', 'now', []), ADV('hayaku', 'quickly', ['run', 'tense']),
  ADV('dokomademo', 'as far as it goes', ['run', 'sky']), ADV('futatabi', 'again', ['memory']), ADV('yukkuri', 'slowly', ['calm', 'rest']),
];
const PARTICLE = { ga: 'が', wa: 'は', wo: 'を', ni: 'に', e: 'へ', to: 'と', no: 'の', mo: 'も', de: 'で' };
const ENDERS = ['yo', 'ne', 'sa', 'na'];
// tags that name a WORLD: a word carrying one and none of the song's tags is off-theme
const DOMAIN = new Set(['kitchen', 'eat', 'sweet', 'cafe', 'coffee', 'festival', 'robot', 'school', 'station', 'march', 'flag', 'fight', 'wound', 'villain', 'scary', 'desert', 'jungle', 'forest', 'shrine', 'snow', 'winter', 'sea', 'wave', 'rain', 'space', 'mirror', 'dance', 'goofy', 'lullaby', 'summer', 'fire']);
// ordinary set phrases (common language, not lines)
const SET = [
  { r: 'arigato-', g: 'thank you', tags: ['love', 'goodbye'] }, { r: 'sayonara', g: 'goodbye', tags: ['goodbye', 'sad'] },
  { r: 'daisuki', g: 'I love you', tags: ['love'] }, { r: 'ohayo-', g: 'good morning', tags: ['morning'] }, { r: 'mata ne', g: 'see you', tags: ['goodbye'] },
  { r: 'oyasumi', g: 'good night', tags: ['lullaby', 'rest', 'night'] }, { r: 'ikuzo', g: "let's go", tags: ['fight', 'run', 'festival'] },
  { r: 'itadakimasu', g: "let's eat", tags: ['kitchen', 'eat'] }, { r: 'gomen ne', g: 'sorry', tags: ['sad', 'goodbye'] },
];

// ---- conjugation --------------------------------------------------------------
const GODAN = {
  u: { i: 'i', a: 'wa', o: 'ou', te: 'tte', ta: 'tta' }, ku: { i: 'ki', a: 'ka', o: 'kou', te: 'ite', ta: 'ita' }, gu: { i: 'gi', a: 'ga', o: 'gou', te: 'ide', ta: 'ida' },
  su: { i: 'shi', a: 'sa', o: 'sou', te: 'shite', ta: 'shita' }, tsu: { i: 'chi', a: 'ta', o: 'tou', te: 'tte', ta: 'tta' }, nu: { i: 'ni', a: 'na', o: 'nou', te: 'nde', ta: 'nda' },
  bu: { i: 'bi', a: 'ba', o: 'bou', te: 'nde', ta: 'nda' }, mu: { i: 'mi', a: 'ma', o: 'mou', te: 'nde', ta: 'nda' }, ru: { i: 'ri', a: 'ra', o: 'rou', te: 'tte', ta: 'tta' },
};
/** conjugate a verb entry: dict | te | ta | tai | nai | you | teru -> romaji */
export function conjugate(v, form) {
  if (v.cls === 'kuru') return { dict: 'kuru', te: 'kite', ta: 'kita', tai: 'kitai', nai: 'konai', you: 'koyou', teru: 'kiteru' }[form];
  if (v.cls === 'au') return { dict: 'au', te: 'atte', ta: 'atta', tai: 'aitai', nai: 'awanai', you: 'aou', teru: 'atteru' }[form];
  if (v.cls === 'i') {
    const stem = v.r.slice(0, -2);
    return { dict: v.r, te: stem + 'te', ta: stem + 'ta', tai: stem + 'tai', nai: stem + 'nai', you: stem + 'you', teru: stem + 'teru' }[form];
  }
  // the ending kana: tsu, or a consonant+u (ku/gu/su/nu/bu/mu/ru), or a bare u
  // (utau -> u, not "au")
  const end = v.r.endsWith('tsu') ? 'tsu' : /[kgsnbmr]u$/.test(v.r) ? v.r.slice(-2) : 'u';
  const stem = v.r.slice(0, -end.length);
  const g = GODAN[end];
  if (!g) throw new Error(`no godan class for ${v.r}`);
  if (v.r === 'iku' && (form === 'te' || form === 'ta')) return form === 'te' ? 'itte' : 'itta';
  return { dict: v.r, te: stem + g.te, ta: stem + g.ta, tai: stem + g.i + 'tai', nai: stem + g.a + 'nai', you: stem + g.o, teru: stem + g.te + 'ru' }[form];
}
const FORM_GLOSS = { dict: (g) => g, te: (g) => `${g}, and`, ta: (g) => `${g} (past)`, tai: (g) => `want to ${g}`, nai: (g) => `won't ${g}`, you: (g) => `let's ${g}`, teru: (g) => `${g.replace(/e$/, '')}ing` };

// ---- theme --------------------------------------------------------------------
const ENV_TAGS = {
  space: ['space', 'star', 'sky', 'night', 'far', 'light'], water: ['water', 'sea', 'rain', 'wave', 'tear'], festival: ['festival', 'summer', 'fire', 'night', 'sound', 'dance'],
  fight: ['fight', 'strength', 'wound', 'run', 'fire'], boss: ['fight', 'strength', 'wound', 'shadow'], training: ['run', 'strength', 'morning', 'road'],
  shop: ['city', 'street', 'morning', 'shop', 'coffee'], snow: ['snow', 'winter', 'breath', 'light'], casino: ['night', 'light', 'city', 'dream'], jungle: ['jungle', 'forest', 'rain', 'water', 'wind'],
  rest: ['rest', 'calm', 'morning', 'wind'], kitchen: ['kitchen', 'eat', 'sweet', 'goofy'], cave: ['dark', 'secret', 'shadow'], manor: ['dark', 'scary', 'secret'], catacombs: ['dark', 'scary', 'shadow'],
  citadel: ['march', 'flag', 'fight'], construction: ['city', 'strength', 'morning'], stealth: ['secret', 'shadow', 'night'], desert: ['desert', 'wind', 'far'], lab: ['secret', 'light', 'robot'],
  menu: ['calm', 'light'], aftermath: ['sad', 'memory', 'wound'], shrine: ['shrine', 'somber', 'hope'],
};
const EMO_TAGS = {
  excited: ['run', 'shine', 'festival', 'summer', 'hope'], happy: ['smile', 'happy', 'light', 'dance', 'sound'], sad: ['sad', 'tear', 'rain', 'goodbye', 'far', 'memory'],
  romantic: ['love', 'hand', 'you', 'star'], tense: ['tense', 'run', 'dark', 'breath', 'shadow'], triumphant: ['strength', 'fight', 'triumphant', 'sky', 'flag'],
  nostalgic: ['memory', 'nostalgic', 'far', 'goodbye'], somber: ['somber', 'rest', 'dark', 'sad'], calm: ['calm', 'wind', 'morning', 'rest'],
  mysterious: ['secret', 'dark', 'moon'], goofy: ['goofy', 'dance', 'eat', 'sweet'], scary: ['scary', 'dark', 'shadow', 'night'],
};
const DESC_TAGS = [
  [/\brain/, 'rain'], [/\btrain|station/, 'station'], [/firework/, 'fire'], [/summer/, 'summer'], [/dusk|sunset/, 'evening'], [/sunrise|morning|dawn/, 'morning'],
  [/rooftop|sky/, 'sky'], [/school/, 'school'], [/midnight|night/, 'night'], [/corridor|haunt|eerie|ghost/, 'scary'], [/robot|android|machine/, 'robot'],
  [/mall|city|street|town/, 'city'], [/mirror|reflection/, 'mirror'], [/army|march|soldier/, 'march'], [/kitchen|cook|recipe/, 'kitchen'], [/cafe|coffee/, 'cafe'],
  [/sugar|candy|sweet/, 'sweet'], [/\bsea\b|ocean|wave/, 'sea'], [/snow|winter/, 'snow'], [/\bstar/, 'star'], [/\bmoon/, 'moon'], [/goodbye|farewell/, 'goodbye'],
  [/lonely|alone|empty/, 'alone'], [/villain|sinister|smirk|teasing/, 'villain'], [/chase|breathless|frantic/, 'tense'], [/confess|love|romantic/, 'love'],
  [/breath/, 'breath'], [/lullaby|hum|sleep|tender/, 'lullaby'], [/fight|boss|battle/, 'fight'], [/festival|idol|clap/, 'festival'], [/hope|soaring|triumph/, 'hope'],
  [/dream/, 'dream'], [/memor|nostalg/, 'memory'], [/flag|anthem/, 'flag'], [/wound|losing|defeat/, 'wound'], [/secret|mystery/, 'secret'], [/dance|bounc/, 'dance'],
  [/shrine|temple|bell/, 'shrine'], [/forest|jungle/, 'forest'], [/desert|sand/, 'desert'], [/fire|flame|burn/, 'fire'],
];
export function themeTags(theme = {}) {
  const tags = new Set();
  for (const t of ENV_TAGS[theme.environment] ?? []) tags.add(t);
  for (const t of EMO_TAGS[theme.emotion] ?? []) tags.add(t);
  const d = String(theme.description ?? '').toLowerCase();
  for (const [re, t] of DESC_TAGS) if (re.test(d)) tags.add(t);
  return tags;
}

// ---- templates ------------------------------------------------------------------
// A template is a list of slots; each slot yields ONE bunsetsu (chunk). Slot
// fields: t (N/V/A/ADV/SET/END), p (particle after a noun), kind (noun kinds
// allowed), forms (verb forms allowed), opt (may be skipped), role weights.
const T = (name, gloss, slots, roles = { verse: 1, chorus: 1, bridge: 1 }) => ({ name, gloss, slots, roles });
const TEMPLATES = [
  T('S-V', '{0} {1}', [{ t: 'N', p: 'ga', kind: ['thing', 'abstract'], subjOf: 1 }, { t: 'V', subj: 'thing', forms: ['dict', 'teru', 'ta'] }], { verse: 3, chorus: 1, bridge: 2 }),
  T('MOD-S-V', "{0}'s {1} {2}", [{ t: 'N', p: 'no', kind: ['person', 'place', 'time'] }, { t: 'N', p: 'ga', kind: ['thing', 'abstract'], subjOf: 2 }, { t: 'V', subj: 'thing', forms: ['dict', 'teru'] }], { verse: 3, chorus: 1, bridge: 2 }),
  T('O-V', '{0} {1}', [{ t: 'N', p: 'wo', kind: ['thing', 'abstract', 'place', 'person', 'time'], objOf: 1 }, { t: 'V', subj: 'agent', needsObj: true, forms: ['te', 'dict', 'tai', 'you', 'nai', 'teru'] }], { verse: 2, chorus: 3, bridge: 2 }),
  T('MOD-O-V', "{0}'s {1} {2}", [{ t: 'N', p: 'no', kind: ['person', 'place', 'time'] }, { t: 'N', p: 'wo', kind: ['thing', 'abstract'], objOf: 2 }, { t: 'V', subj: 'agent', needsObj: true, forms: ['te', 'dict', 'tai', 'you', 'nai'] }], { verse: 2, chorus: 3, bridge: 2 }),
  T('A-O-V', '{0} {1} {2}', [{ t: 'A', modOf: 1 }, { t: 'N', p: 'wo', kind: ['thing', 'abstract', 'place'], objOf: 2 }, { t: 'V', subj: 'agent', needsObj: true, forms: ['te', 'dict', 'tai', 'you'] }], { verse: 2, chorus: 2, bridge: 2 }),
  T('NI-V', '{0} {1}', [{ t: 'N', p: 'ni', kind: ['person', 'thing', 'abstract', 'place'], objOf: 1 }, { t: 'V', subj: 'agent', needsObj: true, frameP: 'ni', forms: ['tai', 'dict', 'you', 'te'] }], { verse: 1, chorus: 3, bridge: 2 }),
  T('E-V', '{0} {1}', [{ t: 'N', p: 'e', kind: ['place'], objOf: 1 }, { t: 'V', subj: 'agent', needsObj: true, frameP: 'e', forms: ['you', 'dict', 'te', 'tai'] }], { verse: 1, chorus: 3, bridge: 2 }),
  T('TO-V', 'with {0}, {1}', [{ t: 'N', p: 'to', kind: ['person:kimi,anata,minna,futari,dareka,robotto'] }, { t: 'V', subj: 'agent', noObj: true, forms: ['you', 'dict', 'tai', 'te'] }], { verse: 1, chorus: 3, bridge: 1 }),
  T('T-N', '{0} is {1}', [{ t: 'N', p: 'wa', kind: ['person', 'time', 'place'] }, { t: 'N', kind: ['abstract', 'thing:hikari,kaze,hoshi,yume,uta,koe,hana,honoo,kage'] }, { t: 'END', opt: true }], { verse: 2, chorus: 1, bridge: 1 }),
  T('T-A', '{0} is {1}', [{ t: 'N', p: 'wa', kind: ['time', 'place', 'thing', 'abstract'], modBy: 1 }, { t: 'A', pred: true }, { t: 'END', opt: true }], { verse: 3, chorus: 1, bridge: 2 }),
  T('ADV-V', '{0} {1}', [{ t: 'ADV' }, { t: 'V', subj: 'any', noObj: true, forms: ['you', 'dict', 'tai', 'te', 'teru'] }], { verse: 1, chorus: 3, bridge: 2 }),
  T('ADV-O-V', '{0} {1} {2}', [{ t: 'ADV' }, { t: 'N', p: 'wo', kind: ['thing', 'abstract', 'person'], objOf: 2 }, { t: 'V', subj: 'agent', needsObj: true, forms: ['you', 'tai', 'te', 'dict'] }], { verse: 1, chorus: 3, bridge: 2 }),
  T('O-Vte-V', '{0} {1} {2}', [{ t: 'N', p: 'wo', kind: ['thing', 'abstract', 'place'], objOf: 1 }, { t: 'V', subj: 'agent', needsObj: true, forms: ['te'] }, { t: 'V', subj: 'agent', noObj: true, forms: ['you', 'dict', 'tai'] }], { verse: 1, chorus: 3, bridge: 2 }),
  T('MO-MO-V', '{0} and {1} {2}', [{ t: 'N', p: 'mo', kind: ['thing', 'abstract'] }, { t: 'N', p: 'mo', kind: ['thing', 'abstract'], objOf: 2 }, { t: 'V', subj: 'agent', needsObj: true, forms: ['te', 'dict', 'you'] }], { verse: 2, chorus: 2, bridge: 3 }),
  T('V-END', '{0}', [{ t: 'V', subj: 'agent', noObj: true, forms: ['tai', 'nai', 'you', 'teru'] }, { t: 'END', opt: true }], { verse: 1, chorus: 2, bridge: 2 }),
  T('A-N', '{0} {1}', [{ t: 'A', modOf: 1 }, { t: 'N', kind: ['thing', 'place', 'time', 'person', 'abstract'] }, { t: 'END', opt: true }], { verse: 3, chorus: 1, bridge: 2 }),
  T('MOD-N-NAKA-E', 'into {0}\'s {1}', [{ t: 'N', p: 'no', kind: ['person', 'place', 'thing', 'time'] }, { t: 'N', kind: ['thing', 'abstract', 'place'] }, { t: 'W', r: 'no naka e', g: '(into)' }], { verse: 2, chorus: 1, bridge: 2 }),
  T('S-A', '{0} is {1}', [{ t: 'N', p: 'ga', kind: ['thing', 'time', 'place', 'abstract'], modBy: 1 }, { t: 'A', pred: true }], { verse: 2, chorus: 1, bridge: 1 }),
  T('T-V', '{0} {1}', [{ t: 'N', p: 'wa', kind: ['person'] }, { t: 'V', subj: 'agent', noObj: true, forms: ['teru', 'dict', 'you', 'tai'] }], { verse: 2, chorus: 2, bridge: 2 }),
  T('N-TO-N', '{0} and {1}', [{ t: 'N', p: 'to', kind: ['person:kimi,anata,boku,watashi'] }, { t: 'N', kind: ['person:kimi,anata,boku,watashi'] }, { t: 'END', opt: true }], { verse: 1, chorus: 1, bridge: 1 }),
  T('SET', '{0}', [{ t: 'SET' }, { t: 'END', opt: true }], { verse: 0.5, chorus: 1, bridge: 0.5 }),
  T('MOD-N', "{0}'s {1}", [{ t: 'N', p: 'no', kind: ['person', 'place', 'time'] }, { t: 'N', kind: ['thing', 'abstract'] }, { t: 'END', opt: true }], { verse: 2, chorus: 1, bridge: 1 }),
  T('ADV-A-N', '{0} {1} {2}', [{ t: 'ADV' }, { t: 'A', modOf: 2 }, { t: 'N', kind: ['thing', 'place', 'time'] }], { verse: 1, chorus: 1, bridge: 1 }),
];

// ---- slot candidates -------------------------------------------------------------
const kindOk = (noun, kinds) => kinds.some((k) => {
  const [kind, list] = k.split(':');
  return noun.kind === kind && (!list || list.split(',').includes(noun.r) || list.split(',').includes(noun.g));
});
const frameKinds = (v) => (v.frame ? v.frame.kinds : []);
const subjOk = (v, noun) => v.subj === 'any' || (v.subj === 'agent' ? noun.kind === 'person' : kindOk(noun, [v.subj]));

function chunk(moraList, gloss, extra = {}) { return { m: moraList, g: gloss, ...extra }; }

/** all chunks a slot can produce, given the fills so far (for agreement) */
function candidates(slot, fills, tmpl, ctx) {
  const out = [];
  const themed = (w) => (w.tags ?? []).some((t) => ctx.tags.has(t));
  // a word that belongs to another song's world (sweets in a rainy goodbye)
  const offTheme = (w) => !themed(w) && (w.tags ?? []).some((t) => DOMAIN.has(t));
  if (slot.t === 'N') {
    for (const n of NOUNS) {
      if (!kindOk(n, slot.kind)) continue;
      // agreement with a verb slot that follows (objOf / subjOf) is checked
      // when the verb is filled; here only the noun's own kind
      const p = slot.p ? [slot.p === 'wa' ? 'wa_' : slot.p === 'e' ? 'e_' : slot.p] : [];
      out.push(chunk([...n.m, ...p], n.g, { word: n, themed: themed(n), off: offTheme(n), p: slot.p }));
      // the particle-less form (a lyric drops が/を/は freely: "kimi omou",
      // "sora miage") — never for の (a bare modifier is a different phrase)
      if (slot.p && slot.p !== 'no' && slot.p !== 'to' && slot.p !== 'mo') out.push(chunk(n.m.slice(), n.g, { word: n, themed: themed(n), off: offTheme(n), p: slot.p, nop: true }));
    }
  } else if (slot.t === 'V') {
    const si = tmpl.slots.indexOf(slot);
    const objSlot = tmpl.slots.findIndex((s) => s.objOf === si);
    const subjSlot = tmpl.slots.findIndex((s) => s.subjOf === si);
    for (const v of VERBS) {
      if (slot.subj === 'agent' && v.subj !== 'agent' && v.subj !== 'any') continue;
      if (slot.subj === 'thing' && v.subj === 'agent') continue;
      if (slot.needsObj) {
        if (!v.frame) continue;
        const want = slot.frameP ?? 'o';
        if (v.frame.p !== want) continue;
        const obj = objSlot >= 0 ? fills[objSlot]?.word : null;
        if (obj && !kindOk(obj, v.frame.kinds)) continue;
      }
      if (slot.noObj && v.frame && !v.frame.opt) continue;
      const subj = subjSlot >= 0 ? fills[subjSlot]?.word : null;
      if (subj && !subjOk(v, subj)) continue;
      for (const f of slot.forms) {
        if ((f === 'tai' || f === 'you' || f === 'nai') && v.subj === 'thing') continue;
        const r = conjugate(v, f);
        out.push(chunk(moras(r), FORM_GLOSS[f](v.g), { word: v, form: f, themed: themed(v), off: offTheme(v) }));
      }
    }
  } else if (slot.t === 'A') {
    const si = tmpl.slots.indexOf(slot);
    const target = slot.modOf != null ? null : tmpl.slots.findIndex((s) => s.modBy === si);
    const noun = target != null && target >= 0 ? fills[target]?.word : null;
    for (const a of ADJS) {
      if (slot.pred && a.pren) continue;
      if (noun && !a.kinds.includes(noun.kind)) continue;
      out.push(chunk(a.m, a.g, { word: a, themed: themed(a), off: offTheme(a) }));
    }
  } else if (slot.t === 'ADV') {
    for (const a of ADVS) out.push(chunk(a.m, a.g, { word: a, themed: themed(a), off: offTheme(a) }));
  } else if (slot.t === 'SET') {
    for (const s of SET) out.push(chunk(moras(s.r), s.g, { word: s, themed: themed(s) }));
  } else if (slot.t === 'END') {
    for (const e of ENDERS) out.push(chunk([e], '', { ender: true }));
  } else if (slot.t === 'W') {
    out.push(chunk(moras(slot.r), slot.g, {}));
  }
  return out;
}

// ---- binding: chunks onto segments ------------------------------------------------
// state: { si (segment index), filled (moras in the current segment), score,
// exts, moras } — `place` lays ONE chunk and returns the next state or null.
// A segment of k notes takes exactly k moras, or k-1 with its final vowel held
// over the last note ('ー'); a chunk never crosses a rest; an ender is last.
function place(st, c, segs, { isLast, allowExt = true }) {
  if (st.si >= segs.length) return [];
  const seg = segs[st.si];
  const len = c.m.length;
  if (c.ender && !isLast) return [];
  if (st.filled + len > seg.k) return [];
  let score = st.score;
  const moras = st.moras.concat(c.m);
  let filled = st.filled + len, si = st.si;
  if (seg.longAfter.has(filled - 1)) score += 1;                              // a word ends on the long note
  for (let j = 1; j < len; j++) if (seg.longAfter.has(filled - len + j - 1)) score -= 1; // a long note inside a word
  const fillAt = st.fillAt;
  if (filled === seg.k) return [{ si: si + 1, filled: 0, score, exts: st.exts, moras, fillAt }];
  const out = [{ si, filled, score, exts: st.exts, moras, fillAt }];
  if (filled === seg.k - 1 && allowExt && !c.ender && c.m[len - 1] !== 'n') {
    // the vowel held over the segment's last note (a chōon) — a second branch;
    // the exact fill is tried first
    out.push({ si: si + 1, filled: 0, score: score - 0.5, exts: st.exts + 1, moras: moras.concat(['ー']), fillAt });
  }
  return out;
}
/** re-bind a stored chunk list onto new segments (refrain returns) */
export function bindChunks(chunks, segs, opts = {}) {
  // DFS over the placement branches (exact fill vs held vowel per chunk)
  let best = null;
  const rec = (ci, st) => {
    if (ci === chunks.length) {
      if (st.si === segs.length && st.filled === 0 && (!best || st.score > best.score)) best = st;
      return;
    }
    for (const nx of place(st, chunks[ci], segs, { isLast: ci === chunks.length - 1, ...opts })) rec(ci + 1, nx);
  };
  rec(0, { si: 0, filled: 0, score: 0, exts: 0, moras: [] });
  return best ? { moras: best.moras, score: best.score, exts: best.exts } : null;
}

/** segments of a phrase (taker notes): cut at rests >= gapS; long notes ask for a boundary */
export function segmentsOf(notes, { gapS = 0.12, longMul = 1.5, longMin = 0.3 } = {}) {
  // gapS: a rest that ends a word. The singer places an SP at any 60 ms gap, but
  // a 16th rest INSIDE a word is sung through (a staccato), so the cut is
  // tempo-relative: 0.4 of a beat (an 8th rest cuts, a 16th does not) — the
  // caller passes it from the score's tempo
  const durs = notes.map((n) => n.dur).sort((a, b) => a - b);
  const med = durs.length ? durs[durs.length >> 1] : 0.25;
  const segs = [];
  let cur = { k: 0, longAfter: new Set() };
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    cur.k++;
    const gap = i + 1 < notes.length ? notes[i + 1].start - (n.start + n.dur) : Infinity;
    if (gap >= gapS) { segs.push(cur); cur = { k: 0, longAfter: new Set() }; continue; }
    if (i + 1 < notes.length && n.dur >= Math.max(longMin, longMul * med)) cur.longAfter.add(cur.k - 1);
  }
  if (cur.k) segs.push(cur);
  return segs;
}

// ---- the search --------------------------------------------------------------------
function orderBy(cands, seed) {
  return cands.map((c, i) => ({ c, s: (c.themed ? 2 : c.off ? -2 : 0) - (c.nop ? 0.5 : 0) + (fnv(`${seed}|${i}`) % 1000) / 1000 })).sort((a, b) => b.s - a.s).map((x) => x.c);
}
const FILLER = chunk(['a'], '', { filler: true });   // a stranded one-note segment sings "a"
const totalOf = (segs) => segs.reduce((a, s) => a + s.k, 0);

/** agreement of a candidate with the fills so far (object/subject kinds) */
function agrees(slot, c, fills, tmpl) {
  if (slot.t !== 'V') {
    if (slot.t === 'A' && slot.modOf == null) {
      const si = tmpl.slots.indexOf(slot);
      const target = tmpl.slots.findIndex((x) => x.modBy === si);
      const noun = target >= 0 ? fills[target]?.word : null;
      if (noun && !c.word.kinds.includes(noun.kind)) return false;
    }
    return true;
  }
  const si = tmpl.slots.indexOf(slot);
  const v = c.word;
  const objSlot = tmpl.slots.findIndex((x) => x.objOf === si);
  const subjSlot = tmpl.slots.findIndex((x) => x.subjOf === si);
  if (slot.needsObj) { const obj = objSlot >= 0 ? fills[objSlot]?.word : null; if (obj && !kindOk(obj, v.frame.kinds)) return false; }
  const subj = subjSlot >= 0 ? fills[subjSlot]?.word : null;
  if (subj && !subjOk(v, subj)) return false;
  // an adjective modifying the object noun (A-O-V): the noun's kind vs the adjective
  const adjSlot = tmpl.slots.findIndex((x) => x.modOf === objSlot);
  if (adjSlot >= 0 && objSlot >= 0 && fills[adjSlot] && fills[objSlot] && !fills[adjSlot].word.kinds.includes(fills[objSlot].word.kind)) return false;
  return true;
}
const CAND_CACHE = new Map();
function baseCands(tmpl, si, tags) {
  const key = `${tmpl.name}|${si}|${[...tags].sort().join(',')}`;
  let c = CAND_CACHE.get(key);
  if (!c) { c = candidates(tmpl.slots[si], [], tmpl, { tags }); CAND_CACHE.set(key, c); }
  return c;
}

/** write one line for a phrase — one clause, or two when one cannot fill it —
 *  returns { chunks, moras, template, gloss, exts, score } or null */
function composeLine(segs, { seed, role, tags, longEnd, avoid, avoidTemplates = new Set() }) {
  const tmpls = TEMPLATES.map((t) => ({ t, s: (t.roles[role] ?? 1) * (0.5 + (fnv(`${seed}|${t.name}`) % 1000) / 1000) })).sort((a, b) => b.s - a.s).map((x) => x.t);
  let best = null, tries = 0;
  const MAX = 6000;
  const finish = (st, clauses) => {
    const chunks = clauses.flat();
    let score = st.score + chunks.filter((c) => c.themed).length * 0.5 - chunks.filter((c) => c.word && avoid.has(c.word.r)).length * 1.0 - (clauses.length - 1) * 0.75 - (st.fillAt ?? []).length;
    score -= chunks.filter((c) => c.off).length * 1.0 + chunks.filter((c) => c.nop).length * 0.3;
    // one-mora nouns (te, me) fit anything — not a reason to sing them
    score -= chunks.filter((c) => c.word?.t === 'N' && c.word.m.length === 1).length * 0.7;
    if (clauses.length === 2 && clauses[0].tmpl === clauses[1].tmpl) score -= 1;
    for (const cl of clauses) if (avoidTemplates.has(cl.tmpl.name)) score -= 0.75;
    if (chunks[chunks.length - 1].ender && !longEnd) score -= 1;
    if (!best || score > best.score) best = { score, chunks, moras: st.moras, exts: st.exts, fillAt: st.fillAt ?? [], template: clauses.map((cl) => cl.tmpl.name).join('+'), clauses };
  };
  const runTemplate = (tmpl, st0, depth, doneClauses, usedWords) => {
    const fills = [];
    const rec = (si, st) => {
      if (tries > MAX) return;
      if (si === tmpl.slots.length) {
        const cl = fills.filter(Boolean); cl.tmpl = tmpl;
        if (!cl.filter((c) => !c.filler).length) return;
        const clauses = doneClauses.concat([cl]);
        if (st.si === segs.length && st.filled === 0) { tries++; finish(st, clauses); return; }
        if (depth < 1 && st.si < segs.length) {
          const used = new Set([...usedWords, ...cl.filter((c) => c.word).map((c) => c.word)]);
          for (const t2 of tmpls) { if (tries > MAX) return; if (t2.slots.length > 3) continue; runTemplate(t2, st, depth + 1, clauses, used); }
        }
        return;
      }
      const slot = tmpl.slots[si];
      const isLastSlot = tmpl.slots.slice(si + 1).every((x) => x.opt);
      if (slot.opt) { fills[si] = null; rec(si + 1, st); if (tries > MAX) return; }
      if (st.si >= segs.length) return;
      // a stranded one-note segment takes a filler vowel instead of a word
      if (segs[st.si].k === 1 && st.filled === 0 && !slot.opt && !(st.fillAt ?? []).includes(st.moras.length)) {
        for (const nx of place(st, FILLER, segs, { isLast: false })) { rec(si, { ...nx, fillAt: [...(st.fillAt ?? []), st.moras.length] }); if (tries > MAX) return; }
      }
      const cands = orderBy(baseCands(tmpl, si, tags), `${seed}|${depth}|${si}`);
      for (const c of cands) {
        if (c.word && (usedWords.has(c.word) || fills.some((f) => f?.word === c.word))) continue;
        if (!agrees(slot, c, fills, tmpl)) continue;
        const nxs = place(st, c, segs, { isLast: isLastSlot });
        if (!nxs.length) continue;
        fills[si] = c;
        for (const nx of nxs) { tries++; rec(si + 1, nx); if (tries > MAX) break; }
        fills[si] = null;
        if (tries > MAX) return;
      }
    };
    rec(0, st0);
  };
  for (const tmpl of tmpls) {
    runTemplate(tmpl, { si: 0, filled: 0, score: 0, exts: 0, moras: [] }, 0, [], new Set());
    if (best && best.score >= 2.5) break;     // a themed, well-placed line: stop early
    if (tries > MAX) break;
  }
  if (!best) return null;
  const gloss = best.clauses.map((cl) => cl.tmpl.gloss.replace(/\{(\d)\}('s)?/g, (_, i, poss) => { const c = cl.filter((x) => !x.ender && !x.filler)[Number(i)]; return c ? (poss ? (c.word?.gp ?? `${c.g}'s`) : c.g) : ''; })).join(', ');
  return { ...best, gloss: gloss.replace(/\s+/g, ' ').trim() };
}

// ---- the writer ----------------------------------------------------------------------
/**
 * writeLyrics(score, opts) — see the header. Mutates score.notes (syl / ph /
 * melisma / ext) and returns the per-phrase line records.
 */
export function writeLyrics(score, { seed = score.name ?? 'song', melismaUnder = 0, theme = score.theme ?? {}, sections = score.sections ?? null, phraseGap = 0.5, longNote = 0.6 } = {}) {
  const notes = score.notes;
  const secPerBar = score.secondsPerBar ?? 2;
  // phrases: the exporter's own index wins
  const phrases = [];
  let cur = [];
  for (const n of notes) {
    const brk = cur.length && (n.phrase != null && cur[0].phrase != null
      ? n.phrase !== cur[0].phrase
      : n.start - (cur[cur.length - 1].start + cur[cur.length - 1].dur) >= phraseGap);
    if (brk) { phrases.push(cur); cur = []; }
    cur.push(n);
  }
  if (cur.length) phrases.push(cur);

  // section of a phrase (by its first note's bar) -> key + role
  const secs = Array.isArray(sections) && sections.length ? sections : null;
  const stmtOf = new Map();
  if (secs) {
    const count = {};
    for (const s of secs) { const base = String(s.letter ?? '').replace('*', ''); if (!base) continue; count[base] = (count[base] ?? 0); stmtOf.set(s, count[base]++); }
  }
  const secOf = (bar) => secs?.find((s) => bar >= s.startBar && bar < s.startBar + s.bars) ?? null;
  const tags = themeTags(theme);
  const signature = (ph) => `${ph.length}:` + ph.map((n, i) => (i ? Math.sign(n.midi - ph[i - 1].midi) : 0)).join('');

  const infos = phrases.map((ph, pi) => {
    const bar = ph[0].bar ?? Math.floor(ph[0].start / secPerBar + 1e-9);
    const sec0 = secOf(bar);
    const sec = sec0 && sec0.letter ? sec0 : null;
    const base = sec ? String(sec.letter ?? '').replace('*', '') : '';
    const role = sec?.role ?? (base === 'B' ? 'chorus' : base ? 'verse' : 'verse');
    return { ph, pi, sec, base, role, stmt: sec ? stmtOf.get(sec) : 0 };
  });
  // ordinal within the section (statement)
  const ordCount = new Map();
  for (const info of infos) {
    if (!info.sec) { info.key = `sig|${signature(info.ph)}`; continue; }
    const sk = `${info.base}|${info.stmt}`;
    const ord = ordCount.get(sk) ?? 0; ordCount.set(sk, ord + 1);
    info.ord = ord;
    // chorus: the same ordinal in every statement shares its words; verse:
    // per statement; bridge: per statement too (it comes once)
    info.key = info.role === 'chorus' ? `${info.base}|${ord}` : `${info.base}|${info.stmt}|${ord}`;
  }

  const lines = new Map();      // key -> { chunks, gloss, template }
  const out = [];
  const recentWords = [];
  const recentTemplates = [];
  const stats = { phrases: phrases.length, refrainReused: 0, refrainRebound: 0, variants: 0, fallbacks: 0, exts: 0, templates: {} };
  for (const info of infos) {
    const { ph } = info;
    const takers = ph.map((n, i) => !(i > 0 && n.dur < melismaUnder && n.start - (ph[i - 1].start + ph[i - 1].dur) < 0.03));
    const tn = ph.filter((_, i) => takers[i]);
    const segs = segmentsOf(tn, { gapS: Math.max(0.1, 0.4 * secPerBar / 4) });
    const last = ph[ph.length - 1];
    const longEnd = last.dur >= longNote;
    let line = lines.get(info.key), bound = null, refrain = false, variant = false;
    if (line) {
      bound = bindChunks(line.chunks, segs);
      if (!bound && line.chunks[line.chunks.length - 1].ender) bound = bindChunks(line.chunks.slice(0, -1), segs);
      if (bound) { refrain = true; stats[bound.moras.length === line.moras.length && bound.moras.join() === line.moras.join() ? 'refrainReused' : 'refrainRebound']++; }
    }
    if (!bound) {
      const avoid = new Set(recentWords.slice(-12));
      const composed = composeLine(segs, { seed: `${seed}|${info.key}`, role: info.role, tags, longEnd, avoid, avoidTemplates: new Set(recentTemplates.slice(-2)) });
      if (composed) {
        bound = { moras: composed.moras, exts: composed.exts, fillAt: composed.fillAt };
        if (line) { variant = true; stats.variants++; } else lines.set(info.key, { chunks: composed.chunks, gloss: composed.gloss, template: composed.template, moras: composed.moras });
        line = { chunks: composed.chunks, gloss: composed.gloss, template: composed.template, moras: composed.moras };
        stats.templates[composed.template] = (stats.templates[composed.template] ?? 0) + 1;
      } else {
        // nothing binds (a phrase of stranded one-note segments): vocalise on open vowels
        stats.fallbacks++;
        const ms = []; for (const s of segs) for (let i = 0; i < s.k; i++) ms.push(i === 0 ? 'ra' : 'a');
        bound = { moras: ms, exts: 0 };
        line = { chunks: [], gloss: '(vocalise)', template: 'vocalise', moras: ms };
      }
    }
    stats.exts += bound.exts ?? 0;
    // owner chunk per mora (a held 'ー' belongs to the word before it; a filler
    // vowel owns nothing) — `n.w` lets a verifier check that no word crosses a rest
    const owners = [];
    { const fillAt = new Set(bound.fillAt ?? []); let pos = 0; const skip = () => { while (fillAt.has(pos)) owners[pos++] = -1; };
      for (let ci = 0; ci < line.chunks.length; ci++) { const c = line.chunks[ci]; skip(); for (let j = 0; j < c.m.length; j++) { owners[pos++] = ci; } skip(); if (bound.moras[pos] === 'ー' && !c.ender) { owners[pos++] = ci; skip(); } }
      while (pos < bound.moras.length) owners[pos++] = -1; }
    let k = 0, lastVowel = 'a';
    for (let i = 0; i < ph.length; i++) {
      const n = ph[i];
      if (takers[i]) {
        const m = bound.moras[k++];
        n.syl = m; n.ph = moraPh(m, lastVowel); n.melisma = false; n.w = owners[k - 1];
        if (m === 'ー') n.ext = true; else delete n.ext;
        lastVowel = n.ph[n.ph.length - 1];
      } else {
        n.syl = '-'; n.ph = [lastVowel]; n.melisma = true;
      }
    }
    for (const c of line.chunks) if (c.word?.r) recentWords.push(c.word.r);
    if (!refrain) recentTemplates.push(...String(line.template).split('+'));
    const words = line.chunks.filter((c) => !c.filler).map((c) => c.m.join('').replace(/_/g, '').replace(/q/g, (x, i, str) => str[i + 1] ?? '')).join(' ');
    out.push({
      start: ph[0].start, notes: ph.length, text: bound.moras.map((m) => m.replace(/_$/, '')).join(' '),
      romaji: words, kana: bound.moras.map(moraKana).join(''), gloss: line.gloss,
      section: info.sec ? `${info.sec.letter}${info.stmt ? `(${info.stmt + 1})` : ''}` : null, role: info.role, key: info.key,
      refrain, variant, template: line.template,
    });
  }
  score.lyricStats = stats;
  return out;
}
