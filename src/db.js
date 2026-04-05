/**
 * DB — PostgreSQL connection pool
 */
import pg from 'pg';
import { config } from './config.js';

const pool = new pg.Pool({ connectionString: config.databaseUrl });

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err);
});

/** Run a query */
export const query = (text, params) => pool.query(text, params);

/** Get a client from the pool (for transactions) */
export const getClient = () => pool.connect();

export default pool;
