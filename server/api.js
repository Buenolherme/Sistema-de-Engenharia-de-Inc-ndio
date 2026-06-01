import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DATA_DIR = resolve(process.env.IZCODE_DATA_DIR ?? join(ROOT_DIR, 'data'));
const UPLOAD_DIR = resolve(process.env.IZCODE_UPLOAD_DIR ?? join(ROOT_DIR, 'uploads'));
const DATA_FILE = join(DATA_DIR, 'site-content.json');
const COOKIE_NAME = 'izcode_admin';
const MAX_JSON_SIZE = 2 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 65 * 1024 * 1024;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.obj': 'text/plain',
  '.fbx': 'application/octet-stream',
  '.stl': 'model/stl',
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
};

const UPLOAD_RULES = {
  image: {
    extensions: ['.png', '.jpg', '.jpeg', '.webp'],
    mimes: ['image/png', 'image/jpeg', 'image/webp'],
    maxSize: 8 * 1024 * 1024,
  },
  plan2d: {
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.pdf'],
    mimes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
    maxSize: 15 * 1024 * 1024,
  },
  model3d: {
    extensions: ['.glb', '.gltf', '.obj', '.fbx', '.stl'],
    mimes: [
      'model/gltf-binary',
      'model/gltf+json',
      'model/obj',
      'model/stl',
      'application/octet-stream',
      'text/plain',
      '',
    ],
    maxSize: 60 * 1024 * 1024,
  },
};

function readDotEnv() {
  try {
    const envPath = join(ROOT_DIR, '.env');
    if (!existsSync(envPath)) return {};
    const raw = readFileSync(envPath, 'utf8');
    return raw.split(/\r?\n/).reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return acc;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function getEnv(name) {
  return process.env[name] ?? readDotEnv()[name] ?? '';
}

function getAdminPassword() {
  return getEnv('ADMIN_PASSWORD');
}

function getRequestUrl(req) {
  return new URL(req.url ?? '/', 'http://localhost');
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, error) {
  sendJson(res, statusCode, { error });
}

function parseCookies(req) {
  const header = req.headers.cookie ?? '';
  return Object.fromEntries(
    header
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const eq = part.indexOf('=');
        if (eq === -1) return [part, ''];
        return [part.slice(0, eq), decodeURIComponent(part.slice(eq + 1))];
      })
  );
}

function hmac(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function createSessionToken(password) {
  const issued = Date.now().toString(36);
  const nonce = randomUUID();
  const body = `${issued}.${nonce}`;
  return `${body}.${hmac(body, password)}`;
}

function verifySessionToken(token, password) {
  if (!token || !password) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [issued, nonce, signature] = parts;
  const issuedAt = Number.parseInt(issued, 36);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_TTL_MS) return false;

  const expected = hmac(`${issued}.${nonce}`, password);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function isAuthenticated(req) {
  const password = getAdminPassword();
  return verifySessionToken(parseCookies(req)[COOKIE_NAME], password);
}

function authCookie(token, req) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted;
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_TTL_MS / 1000}`,
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

function clearAuthCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

async function readRequestBuffer(req, maxSize) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxSize) {
      const err = new Error('Arquivo muito grande.');
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJsonBody(req) {
  const body = await readRequestBuffer(req, MAX_JSON_SIZE);
  try {
    return body.length ? JSON.parse(body.toString('utf8')) : {};
  } catch {
    const err = new Error('JSON inválido.');
    err.statusCode = 400;
    throw err;
  }
}

function bufferIndexOf(source, search, start = 0) {
  return source.indexOf(search, start);
}

function splitBuffer(source, separator) {
  const parts = [];
  let start = 0;
  let index = bufferIndexOf(source, separator, start);

  while (index !== -1) {
    parts.push(source.slice(start, index));
    start = index + separator.length;
    index = bufferIndexOf(source, separator, start);
  }
  parts.push(source.slice(start));
  return parts;
}

function parseContentDisposition(header) {
  const result = {};
  header.split(';').forEach(part => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawValue.length) return;
    result[rawKey] = rawValue.join('=').replace(/^"|"$/g, '');
  });
  return result;
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) {
    const err = new Error('Upload inválido.');
    err.statusCode = 400;
    throw err;
  }

  const boundary = Buffer.from(`--${boundaryMatch[1] ?? boundaryMatch[2]}`);
  const fields = {};
  const files = [];

  for (const rawPart of splitBuffer(buffer, boundary)) {
    let part = rawPart;
    if (part.length === 0 || part.equals(Buffer.from('--\r\n')) || part.equals(Buffer.from('--'))) continue;
    if (part.subarray(0, 2).toString() === '\r\n') part = part.subarray(2);
    if (part.subarray(-2).toString() === '\r\n') part = part.subarray(0, -2);
    if (part.subarray(-2).toString() === '--') part = part.subarray(0, -2);

    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) continue;

    const headerLines = part.subarray(0, headerEnd).toString('utf8').split('\r\n');
    const body = part.subarray(headerEnd + 4);
    const headers = Object.fromEntries(headerLines.map(line => {
      const colon = line.indexOf(':');
      return colon === -1 ? [line.toLowerCase(), ''] : [line.slice(0, colon).toLowerCase(), line.slice(colon + 1).trim()];
    }));

    const disposition = parseContentDisposition(headers['content-disposition'] ?? '');
    if (!disposition.name) continue;

    if (disposition.filename) {
      files.push({
        fieldName: disposition.name,
        filename: disposition.filename,
        contentType: headers['content-type'] ?? '',
        data: body,
      });
    } else {
      fields[disposition.name] = body.toString('utf8');
    }
  }

  return { fields, files };
}

function safeFilename(name) {
  const ext = extname(name).toLowerCase();
  const stem = name
    .slice(0, name.length - ext.length)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'arquivo';

  return `${Date.now()}-${randomUUID()}-${stem}${ext}`;
}

function publicUploadUrl(filename) {
  return `/uploads/${encodeURIComponent(filename)}`;
}

function getRule(kind) {
  if (kind === 'plan2d') return UPLOAD_RULES.plan2d;
  if (kind === 'model3d') return UPLOAD_RULES.model3d;
  return UPLOAD_RULES.image;
}

function validateUpload(file, kind) {
  const rule = getRule(kind);
  const ext = extname(file.filename).toLowerCase();
  const mime = file.contentType.toLowerCase();

  if (!rule.extensions.includes(ext)) {
    throw Object.assign(new Error('Formato de arquivo não permitido.'), { statusCode: 400 });
  }
  if (mime && !rule.mimes.includes(mime)) {
    throw Object.assign(new Error('Tipo de arquivo inválido.'), { statusCode: 400 });
  }
  if (file.data.length > rule.maxSize) {
    throw Object.assign(new Error(`Arquivo muito grande. Limite: ${Math.round(rule.maxSize / 1024 / 1024)} MB.`), { statusCode: 413 });
  }
}

function validateContent(content) {
  if (!content || !Array.isArray(content.projects) || typeof content.engineer !== 'object') {
    throw Object.assign(new Error('Dados do site inválidos.'), { statusCode: 400 });
  }

  for (const project of content.projects) {
    if (!project.title || !project.image || !project.beforeImage || !project.floorPlan2d) {
      throw Object.assign(new Error('Preencha imagem principal, imagem antes e planta 2D de todos os projetos.'), { statusCode: 400 });
    }
  }
}

async function ensureStorage() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

async function readContent() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeContent(content) {
  await ensureStorage();
  await writeFile(DATA_FILE, JSON.stringify(content, null, 2), 'utf8');
}

async function handleLogin(req, res) {
  const password = getAdminPassword();
  if (!password) {
    sendError(res, 500, 'ADMIN_PASSWORD não configurada no ambiente do servidor.');
    return true;
  }

  const body = await readJsonBody(req);
  const incoming = String(body.password ?? '');
  const incomingBuffer = Buffer.from(incoming);
  const passwordBuffer = Buffer.from(password);
  const isValid = incomingBuffer.length === passwordBuffer.length
    && timingSafeEqual(incomingBuffer, passwordBuffer);

  if (!isValid) {
    sendError(res, 401, 'Senha inválida.');
    return true;
  }

  res.setHeader('Set-Cookie', authCookie(createSessionToken(password), req));
  sendJson(res, 200, { ok: true });
  return true;
}

async function handleUpload(req, res) {
  if (!isAuthenticated(req)) {
    sendError(res, 401, 'Faça login novamente para enviar arquivos.');
    return true;
  }

  const contentLength = Number(req.headers['content-length'] ?? 0);
  if (contentLength > MAX_UPLOAD_SIZE) {
    sendError(res, 413, 'Arquivo muito grande.');
    return true;
  }

  const contentType = String(req.headers['content-type'] ?? '');
  const buffer = await readRequestBuffer(req, MAX_UPLOAD_SIZE);
  const { fields, files } = parseMultipart(buffer, contentType);
  const file = files[0];

  if (!file) {
    sendError(res, 400, 'Selecione um arquivo para upload.');
    return true;
  }

  const kind = fields.kind ?? 'image';
  validateUpload(file, kind);
  await ensureStorage();

  const storedName = safeFilename(file.filename);
  await writeFile(join(UPLOAD_DIR, storedName), file.data);

  sendJson(res, 201, {
    url: publicUploadUrl(storedName),
    originalName: file.filename,
    storedName,
    type: file.contentType,
    size: file.data.length,
  });
  return true;
}

export async function handleApiRequest(req, res) {
  const { pathname } = getRequestUrl(req);
  if (!pathname.startsWith('/api/')) return false;

  try {
    if (pathname === '/api/admin/login' && req.method === 'POST') return await handleLogin(req, res);

    if (pathname === '/api/admin/logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', clearAuthCookie());
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (pathname === '/api/admin/session' && req.method === 'GET') {
      sendJson(res, 200, { authenticated: isAuthenticated(req) });
      return true;
    }

    if (pathname === '/api/content' && req.method === 'GET') {
      sendJson(res, 200, await readContent());
      return true;
    }

    if (pathname === '/api/content' && req.method === 'PUT') {
      if (!isAuthenticated(req)) {
        sendError(res, 401, 'Faça login novamente para salvar.');
        return true;
      }
      const content = await readJsonBody(req);
      validateContent(content);
      await writeContent(content);
      sendJson(res, 200, content);
      return true;
    }

    if (pathname === '/api/upload' && req.method === 'POST') return await handleUpload(req, res);

    sendError(res, 404, 'Endpoint não encontrado.');
    return true;
  } catch (error) {
    sendError(res, error.statusCode ?? 500, error.message ?? 'Erro interno do servidor.');
    return true;
  }
}

export async function serveUploadRequest(req, res) {
  const { pathname } = getRequestUrl(req);
  if (!pathname.startsWith('/uploads/')) return false;

  const filename = decodeURIComponent(pathname.replace('/uploads/', ''));
  const target = resolve(UPLOAD_DIR, filename);
  const uploadRoot = resolve(UPLOAD_DIR);
  if (!target.startsWith(uploadRoot + sep) && target !== uploadRoot) {
    res.statusCode = 403;
    res.end('Acesso negado');
    return true;
  }

  try {
    const fileStat = await stat(target);
    if (!fileStat.isFile()) throw new Error('Not a file');
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_BY_EXT[extname(target).toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    createReadStream(target).pipe(res);
  } catch {
    res.statusCode = 404;
    res.end('Arquivo não encontrado');
  }

  return true;
}
