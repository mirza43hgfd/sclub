// PostgreSQL connection (Neon serverless driver).
// The client is created lazily so `next build` never needs a live DB.
import { neon } from '@neondatabase/serverless';

let _sql = null;

export function sql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    _sql = neon(url);
  }
  return _sql;
}
