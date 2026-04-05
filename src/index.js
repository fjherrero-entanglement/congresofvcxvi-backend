/**
 * ═══════════════════════════════════════════════
 * VACUNAR API — Express Entry Point
 * Cloud Run serves on PORT (default 8080)
 * ═══════════════════════════════════════════════
 */
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { loginWithGoogle } from './auth.js';

// Routes
import syncRouter     from './routes/sync.js';
import sessionsRouter from './routes/sessions.js';
import speakersRouter from './routes/speakers.js';
import surveysRouter  from './routes/surveys.js';
import bookmarksRouter from './routes/bookmarks.js';
import pushRouter     from './routes/push.js';

const app = express();

// ─── Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'Vacunar API',
    version: '1.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ─── Auth ─────────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken requerido' });
    const result = await loginWithGoogle(idToken);
    res.json(result);
  } catch (err) {
    console.error('[Auth] Error:', err.message);
    res.status(401).json({ error: 'Autenticación fallida' });
  }
});

// ─── API Routes ───────────────────────────────
app.use('/api/sync',      syncRouter);
app.use('/api/sessions',  sessionsRouter);
app.use('/api/speakers',  speakersRouter);
app.use('/api/surveys',   surveysRouter);
app.use('/api/me/bookmarks', bookmarksRouter);
app.use('/api/push',      pushRouter);

// ─── Error handler ────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Start ────────────────────────────────────
app.listen(config.port, () => {
  console.log(`[API] Vacunar API listening on port ${config.port}`);
  console.log(`[API] Health: http://localhost:${config.port}/`);
  console.log(`[API] Sync:   http://localhost:${config.port}/api/sync`);
});
