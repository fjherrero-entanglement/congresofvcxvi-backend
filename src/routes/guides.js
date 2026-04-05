/**
 * ROUTE: /api/guides — CRUD for guides & protocols
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET all
router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM guides ORDER BY id');
  res.json(result.rows);
});

// GET one
router.get('/:id', async (req, res) => {
  const result = await query('SELECT * FROM guides WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Guía no encontrada' });
  res.json(result.rows[0]);
});

// POST create (admin)
router.post('/', async (req, res) => {
  const { title, file_type, category, size, pages, author, file_url } = req.body;
  const result = await query(
    `INSERT INTO guides (title, file_type, category, size, pages, author, file_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [title, file_type, category, size, pages, author, file_url]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update (admin)
router.put('/:id', async (req, res) => {
  const { title, file_type, category, size, pages, author, file_url } = req.body;
  const result = await query(
    `UPDATE guides SET title=$1, file_type=$2, category=$3, size=$4, pages=$5,
     author=$6, file_url=$7, updated_at=now()
     WHERE id=$8 RETURNING *`,
    [title, file_type, category, size, pages, author, file_url, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Guía no encontrada' });
  res.json(result.rows[0]);
});

// DELETE (admin)
router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM guides WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Guía no encontrada' });
  res.json({ deleted: true });
});

export default router;
