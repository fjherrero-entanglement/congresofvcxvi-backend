/**
 * ═══════════════════════════════════════════════
 * VACUNAR API — Express Entry Point
 * Cloud Run serves on PORT (default 8080)
 * Robust: starts even if optional modules fail
 * ═══════════════════════════════════════════════
 */
import express from 'express';
import cors from 'cors';
import { config } from './config.js';

// Routes — import with error handling
let syncRouter, sessionsRouter, speakersRouter, surveysRouter, bookmarksRouter, pushRouter;
let loginWithGoogle;

try {
  syncRouter     = (await import('./routes/sync.js')).default;
  sessionsRouter = (await import('./routes/sessions.js')).default;
  speakersRouter = (await import('./routes/speakers.js')).default;
} catch (err) {
  console.error('[API] Failed to load core routes:', err.message);
}

try {
  surveysRouter  = (await import('./routes/surveys.js')).default;
  bookmarksRouter = (await import('./routes/bookmarks.js')).default;
} catch (err) {
  console.error('[API] Failed to load user routes:', err.message);
}

try {
  pushRouter = (await import('./routes/push.js')).default;
} catch (err) {
  console.error('[API] Push routes disabled:', err.message);
}

try {
  loginWithGoogle = (await import('./auth.js')).loginWithGoogle;
} catch (err) {
  console.error('[API] Auth disabled:', err.message);
}

const app = express();

// ─── Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'Vacunar API',
    version: '1.0.1',
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: {
      sync: !!syncRouter,
      sessions: !!sessionsRouter,
      speakers: !!speakersRouter,
      surveys: !!surveysRouter,
      bookmarks: !!bookmarksRouter,
      push: !!pushRouter,
      auth: !!loginWithGoogle,
    }
  });
});

// ─── Auth ─────────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  if (!loginWithGoogle) return res.status(503).json({ error: 'Auth no configurado' });
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
if (syncRouter)     app.use('/api/sync',      syncRouter);
if (sessionsRouter) app.use('/api/sessions',  sessionsRouter);
if (speakersRouter) app.use('/api/speakers',  speakersRouter);
if (surveysRouter)  app.use('/api/surveys',   surveysRouter);
if (bookmarksRouter) app.use('/api/me/bookmarks', bookmarksRouter);
if (pushRouter)     app.use('/api/push',      pushRouter);

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
