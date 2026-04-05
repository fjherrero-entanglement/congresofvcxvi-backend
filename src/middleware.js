/**
 * Middleware — auth guards
 */
import { verifyToken } from './auth.js';

/**
 * Requires a valid JWT in Authorization header.
 * Sets req.user = { userId, email, role }
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Requires admin role (must be used AFTER requireAuth).
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado — requiere admin' });
  }
  next();
}
