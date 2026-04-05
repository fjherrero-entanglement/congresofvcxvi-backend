/**
 * Auth — JWT + Google OAuth token verification
 */
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { config } from './config.js';
import { query } from './db.js';

const googleClient = new OAuth2Client(config.googleClientId);

/**
 * Verify a Google ID token, upsert the user, return a JWT.
 */
export async function loginWithGoogle(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });
  const { email, name, picture } = ticket.getPayload();

  // Upsert user
  const result = await query(
    `INSERT INTO users (email, name, avatar_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       avatar_url = EXCLUDED.avatar_url
     RETURNING id, email, name, role`,
    [email, name, picture]
  );

  const user = result.rows[0];

  // Sign JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return { token, user };
}

/**
 * Verify a JWT and return the payload.
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
