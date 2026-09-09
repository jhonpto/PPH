import { Pool } from 'pg';

const connectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error(
    'Nenhuma connection string de banco encontrada. Defina POSTGRES_URL (ou DATABASE_URL) nas variáveis de ambiente.'
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __ddvPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __ddvSchemaReady: Promise<void> | undefined;
}

export const pool =
  global.__ddvPool ??
  new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
  });
if (process.env.NODE_ENV !== 'production') global.__ddvPool = pool;

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      extra_mensal NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS debts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'outra',
      saldo NUMERIC NOT NULL,
      taxa_mensal NUMERIC NOT NULL,
      minimo NUMERIC NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS checklist_state (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export function ensureSchema(): Promise<void> {
  if (!global.__ddvSchemaReady) {
    global.__ddvSchemaReady = createSchema();
  }
  return global.__ddvSchemaReady;
}

export async function query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const result = await pool.query(text, params);
  return result.rows as T[];
}
