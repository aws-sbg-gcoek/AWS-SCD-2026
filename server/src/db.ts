import { Pool, type PoolClient } from 'pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { ticketCatalog } from './ticketCatalog.js';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.DATABASE_SSL ? { rejectUnauthorized: config.databaseSslRejectUnauthorized } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  application_name: 'aws-scd-payments-api',
});

pool.on('error', (error) => {
  // Never log attendee data or credentials. This event is for idle pooled clients.
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function migrateAndSeed(): Promise<void> {
  const migrationPath = fileURLToPath(new URL('../migrations/001_initial.sql', import.meta.url));
  const sql = await readFile(migrationPath, 'utf8');
  await pool.query(sql);

  for (const ticket of ticketCatalog) {
    await pool.query(
      `INSERT INTO ticket_types
        (code, label, price_paise, starts_at, ends_at, enabled, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (code) DO UPDATE SET
         label = EXCLUDED.label,
         price_paise = EXCLUDED.price_paise,
         starts_at = EXCLUDED.starts_at,
         ends_at = EXCLUDED.ends_at,
         enabled = EXCLUDED.enabled,
         capacity = GREATEST(EXCLUDED.capacity, ticket_types.sold_count + ticket_types.reserved_count),
         updated_at = NOW()`,
      [ticket.code, ticket.label, ticket.pricePaise, ticket.startsAt, ticket.endsAt, ticket.enabled, ticket.capacity],
    );
  }
}
