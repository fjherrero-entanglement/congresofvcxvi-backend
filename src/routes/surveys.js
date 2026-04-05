/**
 * ROUTE: /api/surveys — CRUD + respond
 */
import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await query('SELECT * FROM surveys ORDER BY id');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { id, title, subtitle, questions } = req.body;
  const result = await query(
    'INSERT INTO surveys (id,title,subtitle,questions) VALUES ($1,$2,$3,$4) RETURNING *',
    [id, title, subtitle, JSON.stringify(questions)]
  );
  res.status(201).json(result.rows[0]);
});

// POST respond to a survey (user)
router.post('/:id/respond', async (req, res) => {
  const { answers, user_id } = req.body;
  try {
    const result = await query(
      `INSERT INTO survey_responses (survey_id, user_id, answers)
       VALUES ($1, $2, $3) RETURNING id, submitted_at`,
      [req.params.id, user_id || (req.user && req.user.userId) || 'anonymous', JSON.stringify(answers)]
    );
    res.status(201).json({ ok: true, ...result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Ya respondiste esta encuesta' });
    }
    throw err;
  }
});

// GET results (admin)
router.get('/:id/results', async (req, res) => {
  const result = await query(
    'SELECT answers, submitted_at FROM survey_responses WHERE survey_id = $1',
    [req.params.id]
  );
  res.json({ surveyId: req.params.id, total: result.rows.length, responses: result.rows });
});

export default router;
