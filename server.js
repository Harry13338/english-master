import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Strict Single-Admin Backend Configuration
const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'aingdy924@gmail.com')
  .trim()
  .toLowerCase();
const REQUIRED_ADMIN_PIN = (process.env.ADMIN_PIN || '246810').trim();

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read database.json:', err);
    return null;
  }
}

function writeDb(data) {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

function verifyStrictAdminHeaders(req) {
  const email = String(req.headers['x-admin-email'] || '').trim().toLowerCase();
  const role = String(req.headers['x-admin-role'] || '').trim();
  const pin = String(req.headers['x-admin-pin'] || '').trim();

  return (
    email === AUTHORIZED_ADMIN_EMAIL &&
    role === 'admin' &&
    pin === REQUIRED_ADMIN_PIN
  );
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 15 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.vtt': 'text/vtt; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  // ==========================================================================
  // FULL-STACK REST API ENDPOINTS (/api/*)
  // ==========================================================================
  if (urlPath.startsWith('/api/')) {
    try {
      // 1. GET /api/db -> Load full database state from Server Disk
      if (req.method === 'GET' && urlPath === '/api/db') {
        const db = readDb();
        return sendJson(res, 200, {
          initialized: !!db,
          db: db || null,
        });
      }

      // 2. POST /api/seed-if-empty -> Initialize database.json on first server boot
      if (req.method === 'POST' && urlPath === '/api/seed-if-empty') {
        const existing = readDb();
        if (existing && Array.isArray(existing.lessons) && existing.lessons.length > 0) {
          return sendJson(res, 200, { initialized: true, db: existing });
        }
        const body = await parseJsonBody(req);
        const seeded = writeDb({
          users: Array.isArray(body.users) ? body.users : [],
          lessons: Array.isArray(body.lessons) ? body.lessons : [],
          lessonVideos: Array.isArray(body.lessonVideos) ? body.lessonVideos : [],
          vocabularies: Array.isArray(body.vocabularies) ? body.vocabularies : [],
          quizzes: Array.isArray(body.quizzes) ? body.quizzes : [],
          userProgress: Array.isArray(body.userProgress) ? body.userProgress : [],
          userVideoProgress: Array.isArray(body.userVideoProgress) ? body.userVideoProgress : [],
          flashcardReviews: Array.isArray(body.flashcardReviews) ? body.flashcardReviews : [],
        });
        return sendJson(res, 200, { initialized: true, db: seeded });
      }

      // 3. POST /api/auth/register -> Register new student account on Server DB
      if (req.method === 'POST' && urlPath === '/api/auth/register') {
        const body = await parseJsonBody(req);
        const db = readDb() || {
          users: [],
          lessons: [],
          lessonVideos: [],
          vocabularies: [],
          quizzes: [],
          userProgress: [],
          userVideoProgress: [],
          flashcardReviews: [],
        };
        const cleanEmail = String(body.email || '').trim().toLowerCase();
        if (!cleanEmail) {
          return sendJson(res, 400, { error: 'Email is required' });
        }
        // Strictly enforce role: 'student' on all new signups
        const newUser = {
          id: body.id || 'usr-' + Date.now(),
          name: String(body.name || cleanEmail.split('@')[0]).trim(),
          email: cleanEmail,
          role: 'student',
          current_level: body.current_level || 'A1',
          xp_points: 0,
          streak_count: 1,
          last_active_date: new Date().toISOString().split('T')[0],
          auth_provider: 'email',
        };
        const existingIdx = (db.users || []).findIndex(
          (u) => String(u.email).toLowerCase() === cleanEmail
        );
        if (existingIdx >= 0) {
          db.users[existingIdx] = { ...db.users[existingIdx], ...newUser, role: 'student' };
        } else {
          db.users = [...(db.users || []), newUser];
        }
        writeDb(db);
        return sendJson(res, 200, { user: newUser });
      }

      // 4. POST /api/student/sync -> Save student progress, XP, streak, SRS flashcards to Server DB
      if (req.method === 'POST' && urlPath === '/api/student/sync') {
        const body = await parseJsonBody(req);
        const db = readDb();
        if (!db) {
          return sendJson(res, 404, { error: 'Database not initialized yet' });
        }

        if (body.user && body.user.email) {
          const cleanEmail = String(body.user.email).trim().toLowerCase();
          // Enforce strict single-admin rule on server side
          const safeRole =
            cleanEmail === AUTHORIZED_ADMIN_EMAIL && body.user.role === 'admin'
              ? 'admin'
              : 'student';
          const safeUser = { ...body.user, role: safeRole };
          db.users = db.users || [];
          const uIdx = db.users.findIndex(
            (u) => u.id === safeUser.id || String(u.email).toLowerCase() === cleanEmail
          );
          if (uIdx >= 0) {
            db.users[uIdx] = safeUser;
          } else {
            db.users.push(safeUser);
          }
        }

        if (Array.isArray(body.userProgress)) {
          db.userProgress = body.userProgress;
        }
        if (Array.isArray(body.userVideoProgress)) {
          db.userVideoProgress = body.userVideoProgress;
        }
        if (Array.isArray(body.flashcardReviews)) {
          db.flashcardReviews = body.flashcardReviews;
        }

        const saved = writeDb(db);
        return sendJson(res, 200, { ok: true, updatedAt: saved.updatedAt });
      }

      // 5. POST /api/admin/sync -> Protected Single-Admin Content Sync (Lessons, Videos, VTT Subtitles, Vocabulary, Quizzes)
      if (req.method === 'POST' && urlPath === '/api/admin/sync') {
        if (!verifyStrictAdminHeaders(req)) {
          return sendJson(res, 403, {
            error:
              '403 Forbidden: Only the authorized single admin (aingdy924@gmail.com) with valid ADMIN_PIN can modify course content.',
          });
        }

        const body = await parseJsonBody(req);
        const db = readDb() || {
          users: [],
          lessons: [],
          lessonVideos: [],
          vocabularies: [],
          quizzes: [],
          userProgress: [],
          userVideoProgress: [],
          flashcardReviews: [],
        };

        if (Array.isArray(body.lessons)) db.lessons = body.lessons;
        if (Array.isArray(body.lessonVideos)) db.lessonVideos = body.lessonVideos;
        if (Array.isArray(body.vocabularies)) db.vocabularies = body.vocabularies;
        if (Array.isArray(body.quizzes)) db.quizzes = body.quizzes;
        if (Array.isArray(body.userProgress)) db.userProgress = body.userProgress;
        if (Array.isArray(body.userVideoProgress)) db.userVideoProgress = body.userVideoProgress;
        if (Array.isArray(body.flashcardReviews)) db.flashcardReviews = body.flashcardReviews;

        const saved = writeDb(db);
        return sendJson(res, 200, {
          ok: true,
          updatedAt: saved.updatedAt,
          counts: {
            lessons: saved.lessons.length,
            lessonVideos: saved.lessonVideos.length,
            vocabularies: saved.vocabularies.length,
            quizzes: saved.quizzes.length,
          },
        });
      }

      return sendJson(res, 404, { error: 'API endpoint not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 500, { error: err.message || 'Internal Server Error' });
    }
  }

  // ==========================================================================
  // STATIC FRONTEND & SPA ROUTER
  // ==========================================================================
  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`English Master Full-Stack Server (REST API + Persistent DB) running at http://localhost:${PORT}`);
  console.log(`Database File: ${DB_FILE}`);
  console.log(`Secret Admin Studio: http://localhost:${PORT}/#/studio-manage-9x2k`);
});
