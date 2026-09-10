import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.PORT ?? 5588);
const HOST = process.env.HOST ?? '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function locate(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl, 'http://localhost');
  } catch {
    return null;
  }
  let decoded;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    // bad percent-encoding: let the app show its 404
    return { file: join(ROOT, 'index.html'), pathname: url.pathname, search: url.search };
  }
  const file = join(ROOT, decoded);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null;
  return { file, pathname: url.pathname, search: url.search };
}

http
  .createServer(async (req, res) => {
    const hit = locate(req.url);
    if (!hit) {
      res.writeHead(403).end();
      return;
    }
    try {
      let file = hit.file;
      if ((await stat(file)).isDirectory()) {
        if (!hit.pathname.endsWith('/')) {
          res.writeHead(302, { Location: `${hit.pathname}/${hit.search}` }).end();
          return;
        }
        file = join(file, 'index.html');
      }
      const data = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    } catch {
      // app route such as /p/sample
      if (!extname(hit.pathname)) {
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
        res.end(await readFile(join(ROOT, 'index.html')));
        return;
      }
      res.writeHead(404).end('Not Found');
    }
  })
  .listen(PORT, HOST, () => {
    console.log(`portfolio: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/`);
  })
  .on('error', (err) => {
    console.error(err.code === 'EADDRINUSE' ? `port ${PORT} in use (run with PORT=<other>)` : err.message);
    process.exit(1);
  });
