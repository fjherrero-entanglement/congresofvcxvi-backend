/**
 * ROUTE: /api/push — Web Push subscriptions + send
 */
import { Router } from 'express';
import webpush from 'web-push';
import { query } from '../db.js';
import { config } from '../config.js';
import { requireAuth, requireAdmin } from '../middleware.js';

const router = Router();

// Configure web-push if VAPID keys exist
if (config.vapid.publicKey && config.vapid.privateKey) {
  webpush.setVapidDetails(
    config.vapid.subject,
    config.vapid.publicKey,
    config.vapid.privateKey
  );
}

// POST subscribe (PWA sends its push subscription)
router.post('/subscribe', requireAuth, async (req, res) => {
  const { endpoint, keys } = req.body;
  await query(
    `INSERT INTO push_subscriptions (user_id, endpoint, keys)
     VALUES ($1, $2, $3)
     ON CONFLICT (endpoint) DO UPDATE SET keys = $3`,
    [req.user.userId, endpoint, JSON.stringify(keys)]
  );
  res.json({ ok: true });
});

// POST send notification (admin → all users)
router.post('/send', requireAuth, requireAdmin, async (req, res) => {
  const { title, body, url, store, payload } = req.body;

  const subs = await query('SELECT endpoint, keys FROM push_subscriptions');
  let sent = 0, failed = 0;

  for (const sub of subs.rows) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys },
        JSON.stringify({ title, body, url, store, payload })
      );
      sent++;
    } catch (err) {
      failed++;
      // Remove invalid subscriptions (410 Gone)
      if (err.statusCode === 410 || err.statusCode === 404) {
        await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
      }
    }
  }

  res.json({ sent, failed, total: subs.rows.length });
});

// GET VAPID public key (PWA needs this to subscribe)
router.get('/vapid-key', (_req, res) => {
  res.json({ publicKey: config.vapid.publicKey || null });
});

export default router;
