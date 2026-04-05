/**
 * ROUTE: /api/speakers — CRUD
 */
import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware.js';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM speakers ORDER BY name');
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await query('SELECT * FROM speakers WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Speaker no encontrado' });
  res.json(result.rows[0]);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { id, name, initials, color, text_color, role, bio, photo_url } = req.body;
  const result = await query(
    `INSERT INTO speakers (id,name,initials,color,text_color,role,bio,photo_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, name, initials, color, text_color, role, bio, photo_url]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, initials, color, text_color, role, bio, photo_url } = req.body;
  const result = await query(
    `UPDATE speakers SET name=$1,initials=$2,color=$3,text_color=$4,role=$5,bio=$6,photo_url=$7,updated_at=now()
     WHERE id=$8 RETURNING *`,
    [name, initials, color, text_color, role, bio, photo_url, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Speaker no encontrado' });
  res.json(result.rows[0]);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('DELETE FROM speakers WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Speaker no encontrado' });
  res.json({ deleted: true });
});

export default router;
