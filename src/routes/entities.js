/**
 * ROUTE: /api/entities — CRUD for sponsors & auspiciantes
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET all
router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM entities ORDER BY name');
  res.json(result.rows);
});

// GET one
router.get('/:id', async (req, res) => {
  const result = await query('SELECT * FROM entities WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Entidad no encontrada' });
  res.json(result.rows[0]);
});

// POST create (admin)
router.post('/', async (req, res) => {
  const { id, name, short_name, category, tier, logo_url, website, description } = req.body;
  const result = await query(
    `INSERT INTO entities (id, name, short_name, category, tier, logo_url, website, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, name, short_name, category, tier, logo_url, website, description]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update (admin)
router.put('/:id', async (req, res) => {
  const { name, short_name, category, tier, logo_url, website, description } = req.body;
  const result = await query(
    `UPDATE entities SET name=$1, short_name=$2, category=$3, tier=$4, logo_url=$5,
     website=$6, description=$7, updated_at=now()
     WHERE id=$8 RETURNING *`,
    [name, short_name, category, tier, logo_url, website, description, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Entidad no encontrada' });
  res.json(result.rows[0]);
});

// DELETE (admin)
router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM entities WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Entidad no encontrada' });
  res.json({ deleted: true });
});

export default router;
