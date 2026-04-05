/**
 * ROUTE: /api/sync — Bulk download for PWA
 * Returns ALL data in one request for offline-first install.
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

/**
 * GET /api/sync
 * Optional: ?since=ISO_TIMESTAMP — returns only rows updated after that time
 */
router.get('/', async (req, res) => {
  try {
    const since = req.query.since || '1970-01-01T00:00:00Z';

    const [sessions, speakers, entities, surveys, trabajos, guides, rooms] =
      await Promise.all([
        query('SELECT * FROM sessions   WHERE updated_at > $1 ORDER BY date, time_start', [since]),
        query('SELECT * FROM speakers   WHERE updated_at > $1', [since]),
        query('SELECT * FROM entities   WHERE updated_at > $1', [since]),
        query('SELECT * FROM surveys    WHERE updated_at > $1', [since]),
        query('SELECT * FROM trabajos   WHERE updated_at > $1 ORDER BY id', [since]),
        query('SELECT id, title, file_type, category, size, pages, author, updated_at FROM guides WHERE updated_at > $1 ORDER BY id', [since]),
        query('SELECT * FROM rooms      WHERE updated_at > $1', [since]),
      ]);

    res.json({
      sessions:  sessions.rows,
      speakers:  speakers.rows,
      sponsors:  entities.rows.filter(e => e.category === 'sponsor'),
      auspiciantes: entities.rows.filter(e => e.category === 'auspiciante'),
      surveys:   surveys.rows,
      trabajos:  trabajos.rows,
      guides:    guides.rows,
      rooms:     rooms.rows,
      syncedAt:  new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Sync] Error:', err);
    res.status(500).json({ error: 'Error al sincronizar datos' });
  }
});

export default router;
