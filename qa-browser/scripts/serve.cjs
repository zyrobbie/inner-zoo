// Deliberately serves dist only, and only on runner loopback. No tunnelling.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { dist, qa } = require('./paths.cjs');
const root = fs.realpathSync(dist);
const mime = { '.html':'text/html; charset=utf-8', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.css':'text/css', '.js':'text/javascript' };
const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1:4173').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
  if (pathname === '/baseline/index.html') {
    const file = path.join(qa, 'fixtures/baseline/index.html');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'");
    res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8', 'Content-Length':fs.statSync(file).size });
    if(req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  const target = path.resolve(root, '.' + pathname);
  if (!target.startsWith(root + path.sep) || pathname.split('/').some(s => s.startsWith('.'))) { res.writeHead(403).end(); return; }
  let real;
  try { real = fs.realpathSync(target); if (!real.startsWith(root + path.sep) || !fs.statSync(real).isFile()) throw Error(); }
  catch { res.writeHead(404).end(); return; }
  const type = mime[path.extname(real)];
  if (!type) { res.writeHead(403).end(); return; }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': fs.statSync(real).size });
  if (req.method === 'HEAD') res.end(); else fs.createReadStream(real).pipe(res);
});
server.listen(4173, '127.0.0.1', () => console.log('QA static dist available only at http://127.0.0.1:4173'));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
