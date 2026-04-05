/**
 * ROUTE: /api/sessions — CRUD
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET all
router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM sessions ORDER BY date, time_start');
  res.json(result.rows);
});

// GET one
router.get('/:id', async (req, res) => {
  const result = await query('SELECT * FROM sessions WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Sesión no encontrada' });
  res.json(result.rows[0]);
});

// POST create (admin)
router.post('/', async (req, res) => {
  const { id, title, time_start, time_end, duration, day, date, type, room, speaker, speaker_id, description } = req.body;
  const result = await query(
    `INSERT INTO sessions (id, title, time_start, time_end, duration, day, date, type, room, speaker, speaker_id, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [id, title, time_start, time_end, duration, day, date, type, room, speaker, speaker_id, description]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update (admin)
router.put('/:id', async (req, res) => {
  const { title, time_start, time_end, duration, day, date, type, room, speaker, speaker_id, description } = req.body;
  const result = await query(
    `UPDATE sessions SET title=$1, time_start=$2, time_end=$3, duration=$4, day=$5, date=$6,
     type=$7, room=$8, speaker=$9, speaker_id=$10, description=$11, updated_at=now()
     WHERE id=$12 RETURNING *`,
    [title, time_start, time_end, duration, day, date, type, room, speaker, speaker_id, description, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Sesión no encontrada' });
  res.json(result.rows[0]);
});

// DELETE (admin)
router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM sessions WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Sesión no encontrada' });
  res.json({ deleted: true });
});

export default router;
