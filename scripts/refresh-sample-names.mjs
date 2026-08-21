#!/usr/bin/env node
// Refresh src/ingest/sample-names.json from the sample maps the audition pages load.
// A sound name that is not in one of those maps plays SILENCE — which looks exactly
// like a broken page — so the generators check every name they emit against this
// list, and the test suite asserts it offline.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const MAPS = {
  drums: 'https://raw.githubusercontent.com/tidalcycles/dirt-samples/master/strudel.json',
  piano: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json',
};
const names = new Set();
for (const [k, url] of Object.entries(MAPS)) {
  const json = await (await fetch(url)).json();
  for (const name of Object.keys(json)) if (!name.startsWith('_')) names.add(name);
  console.log(`${k}: ${Object.keys(json).length} entries from ${url}`);
}
const out = {
  _comment: 'Sample names available from the maps the audition pages load. Committed so the generators and tests can verify a sound name offline; a name absent here plays SILENCE, which is indistinguishable from a broken page. Refresh with: node scripts/refresh-sample-names.mjs',
  maps: MAPS,
  names: [...names].sort(),
};
writeFileSync(join(fileURLToPath(new URL('..', import.meta.url)), 'src/ingest/sample-names.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`wrote ${out.names.length} names`);
