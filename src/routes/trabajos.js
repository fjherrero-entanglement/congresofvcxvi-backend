/**
 * ROUTE: /api/trabajos — CRUD for scientific works
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET all
router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM trabajos ORDER BY id');
  res.json(result.rows);
});

// GET one
router.get('/:id', async (req, res) => {
  const result = await query('SELECT * FROM trabajos WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Trabajo no encontrado' });
  res.json(result.rows[0]);
});

// POST create (admin)
router.post('/', async (req, res) => {
  const { title, author, type, category, abstract: abs } = req.body;
  const result = await query(
    `INSERT INTO trabajos (title, author, type, category, abstract)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [title, author, type, category, abs]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update (admin)
router.put('/:id', async (req, res) => {
  const { title, author, type, category, abstract: abs } = req.body;
  const result = await query(
    `UPDATE trabajos SET title=$1, author=$2, type=$3, category=$4, abstract=$5, updated_at=now()
     WHERE id=$6 RETURNING *`,
    [title, author, type, category, abs, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Trabajo no encontrado' });
  res.json(result.rows[0]);
});

// DELETE (admin)
router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM trabajos WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Trabajo no encontrado' });
  res.json({ deleted: true });
});

export default router;
