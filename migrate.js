#!/usr/bin/env node
/**
 * Run all SQL migrations against the Supabase Postgres database.
 * Usage: node migrate.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const isLocal = (process.env.DATABASE_URL || '').includes('127.0.0.1') || (process.env.DATABASE_URL || '').includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function main() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Running ${files.length} migration(s) against ${process.env.DATABASE_URL?.split('@')[1] || 'database'}\n`);

  const client = await pool.connect();
  try {
    for (const file of files) {
      console.log(`  ► ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`    ✓ done`);
    }
    console.log('\nAll migrations complete.');
  } catch (err) {
    console.error('\nMigration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
