/**
 * ROUTE: /api/rooms — CRUD for rooms/salas
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET all
router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM rooms ORDER BY name');
  res.json(result.rows);
});

// GET one
router.get('/:id', async (req, res) => {
  const result = await query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Sala no encontrada' });
  res.json(result.rows[0]);
});

// POST create (admin)
router.post('/', async (req, res) => {
  const { id, name, capacity, floor, color, description } = req.body;
  const result = await query(
    `INSERT INTO rooms (id, name, capacity, floor, color, description)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [id, name, capacity, floor, color, description]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update (admin)
router.put('/:id', async (req, res) => {
  const { name, capacity, floor, color, description } = req.body;
  const result = await query(
    `UPDATE rooms SET name=$1, capacity=$2, floor=$3, color=$4, description=$5, updated_at=now()
     WHERE id=$6 RETURNING *`,
    [name, capacity, floor, color, description, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Sala no encontrada' });
  res.json(result.rows[0]);
});

// DELETE (admin)
router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM rooms WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Sala no encontrada' });
  res.json({ deleted: true });
});

export default router;
