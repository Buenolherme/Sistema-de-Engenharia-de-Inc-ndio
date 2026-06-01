import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest, serveUploadRequest } from './api.js';

const ROOT_DIR = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST_DIR = join(ROOT_DIR, 'dist');
const PORT = Number(process.env.PORT ?? 4173);

const MIME_BY_EXT = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function getPathname(req) {
  return decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
}

async function serveFile(res, filePath, cache = false) {
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) throw new Error('Not a file');
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_BY_EXT[extname(filePath).toLowerCase()] ?? 'application/octet-stream');
  if (cache) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  createReadStream(filePath).pipe(res);
}

async function serveStatic(req, res) {
  if (!existsSync(DIST_DIR)) {
    res.statusCode = 503;
    res.end('Build não encontrado. Execute npm run build antes de usar npm run preview/start.');
    return;
  }

  const pathname = getPathname(req);
  const requested = pathname === '/' ? '/index.html' : pathname;
  const target = resolve(DIST_DIR, `.${requested}`);
  const distRoot = resolve(DIST_DIR);

  if (!target.startsWith(distRoot + sep) && target !== distRoot) {
    res.statusCode = 403;
    res.end('Acesso negado');
    return;
  }

  try {
    await serveFile(res, target, pathname.startsWith('/assets/'));
  } catch {
    await serveFile(res, join(DIST_DIR, 'index.html'));
  }
}

createServer(async (req, res) => {
  if (await handleApiRequest(req, res)) return;
  if (await serveUploadRequest(req, res)) return;
  await serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`IZ CODE rodando em http://localhost:${PORT}`);
});
