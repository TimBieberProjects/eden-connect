#!/usr/bin/env node
require('dotenv').config();

const pool = require('../db/client');
const { syncBaseline } = require('./baseline');
const { syncQuarterly } = require('./quarterly');

const DRY_RUN = process.argv.includes('--dry-run');

async function recordSyncRun(client, sheetName, sheetId, status, stats, error) {
  await client.query(
    `INSERT INTO sync_runs (sheet_name, sheet_id, rows_processed, rows_inserted, rows_updated, status, error_message, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [
      sheetName,
      sheetId,
      (stats?.inserted || 0) + (stats?.updated || 0),
      stats?.inserted || 0,
      stats?.updated || 0,
      status,
      error || null,
    ]
  );
}

async function main() {
  console.log(`\nEDEN Connect Sync — ${new Date().toISOString()}`);
  if (DRY_RUN) console.log('Mode: DRY RUN (no writes to database)\n');
  else console.log('Mode: LIVE\n');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── Baseline Surveys ────────────────────────────────────────────────────
    console.log('► Baseline Surveys');
    let baselineStats;
    try {
      baselineStats = await syncBaseline(client, DRY_RUN);
      console.log(`  ✓ inserted: ${baselineStats.inserted}, updated: ${baselineStats.updated}`);
      if (baselineStats.errors.length > 0) {
        console.log(`  ⚠ errors: ${baselineStats.errors.length}`);
        baselineStats.errors.forEach(e => console.log('    -', e));
      }
      if (!DRY_RUN) {
        await recordSyncRun(client, 'Baseline Surveys', process.env.BASELINE_SHEET_ID, 'success', baselineStats, null);
      }
    } catch (err) {
      console.error('  ✗ Fatal error syncing baseline surveys:', err.message);
      if (!DRY_RUN) {
        await recordSyncRun(client, 'Baseline Surveys', process.env.BASELINE_SHEET_ID, 'error', null, err.message);
      }
    }

    // ── Quarterly Reports ───────────────────────────────────────────────────
    console.log('\n► Quarterly Reports');
    let quarterlyStats;
    try {
      quarterlyStats = await syncQuarterly(client, DRY_RUN);
      console.log(`  ✓ inserted: ${quarterlyStats.inserted}, updated: ${quarterlyStats.updated}`);
      if (quarterlyStats.errors.length > 0) {
        console.log(`  ⚠ errors: ${quarterlyStats.errors.length}`);
        quarterlyStats.errors.forEach(e => console.log('    -', e));
      }
      if (!DRY_RUN) {
        await recordSyncRun(client, 'Quarterly Reports', process.env.QUARTERLY_SHEET_ID, 'success', quarterlyStats, null);
      }
    } catch (err) {
      console.error('  ✗ Fatal error syncing quarterly reports:', err.message);
      if (!DRY_RUN) {
        await recordSyncRun(client, 'Quarterly Reports', process.env.QUARTERLY_SHEET_ID, 'error', null, err.message);
      }
    }

    if (DRY_RUN) {
      await client.query('ROLLBACK');
      console.log('\nDry run complete — no changes committed.');
    } else {
      await client.query('COMMIT');
      console.log('\nSync complete — all changes committed.');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\nFatal sync error — rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
