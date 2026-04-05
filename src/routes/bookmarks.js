/**
 * ROUTE: /api/me/bookmarks — User's personal agenda
 */
import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware.js';

const router = Router();

// GET my bookmarks
router.get('/', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT session_id FROM bookmarks WHERE user_id = $1',
    [req.user.userId]
  );
  res.json({ ids: result.rows.map(r => r.session_id) });
});

// PUT sync bookmarks (replace all)
router.put('/', requireAuth, async (req, res) => {
  const { ids } = req.body; // ["sess-1", "sess-5"]
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids debe ser un array' });

  const client = (await import('../db.js')).default;
  const conn = await client.connect();
  try {
    await conn.query('BEGIN');
    await conn.query('DELETE FROM bookmarks WHERE user_id = $1', [req.user.userId]);
    for (const sid of ids) {
      await conn.query(
        'INSERT INTO bookmarks (user_id, session_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.user.userId, sid]
      );
    }
    await conn.query('COMMIT');
    res.json({ ok: true, count: ids.length });
  } catch (err) {
    await conn.query('ROLLBACK');
    throw err;
  } finally {
    conn.release();
  }
});

export default router;
