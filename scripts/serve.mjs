#!/usr/bin/env node
// Serve audition/ over http so the pages' download links work in every
// browser (a file:// page cannot fetch its own wavs, and Safari ignores
// <a download> there). Range requests are honoured so <audio> can seek.
//   node scripts/serve.mjs [port]      → http://localhost:8765/songs.html
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)), 'audition');
const PORT = Number(process.argv[2] || 8765);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  let st;
  try { st = statSync(file); } catch { res.writeHead(404); return res.end('not found: ' + path); }
  if (st.isDirectory()) { res.writeHead(302, { Location: '/songs.html' }); return res.end(); }
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes' });
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`serving audition/ at http://localhost:${PORT}/  (songs.html, vocaloid.html, vocalab.html, vocal.html …)`));
