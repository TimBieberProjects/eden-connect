const { fetchSheetData } = require('../sheets/client');
const { resolveHierarchy } = require('./hierarchy');

const SHEET_ID = process.env.QUARTERLY_SHEET_ID || '15HrEcF0xIs0XwNlPyYQJAG1j8qxlX2sWRHBIFEBNv7o';

// ── helpers ──────────────────────────────────────────────────────────────────

function parseBool(val) {
  if (!val) return null;
  return /^yes$/i.test(val.trim());
}

function parseNum(val) {
  if (!val) return null;
  const n = parseFloat(val.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function parseDatetime(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ── main export ───────────────────────────────────────────────────────────────

/**
 * Sync quarterly reports sheet → Postgres quarterly_reports table.
 * @param {import('pg').PoolClient} client
 * @param {boolean} dryRun
 */
async function syncQuarterly(client, dryRun = false) {
  console.log('  Fetching quarterly reports sheet…');
  const rows = await fetchSheetData(SHEET_ID);
  console.log(`  Found ${rows.length} data rows`);

  let inserted = 0, updated = 0;
  const errors = [];

  for (const row of rows) {
    try {
      const { llgId, agencyId, facilityId } = await resolveHierarchy(client, row);

      const record = {
        health_facility_id:  facilityId,
        llg_id:              llgId,
        agency_id:           agencyId,

        submitted_at:          parseDatetime(row['Timestamp']),
        reporting_quarter:     row['Reporting Quarter'] || null,
        date_report_submitted: parseDate(row['Date Report Submitted']),
        compiled_by:           row['Compiled By'] || null,
        coordinator_name:      row['Name of Agency Health Promotion Coordinator'] || null,

        attended_eden_tot_training: parseBool(row['Attended EDEN TOT Training']),
        tot_training_year:          row['When Attended TOT Training'] || null,
        annual_implementation_plan: parseBool(row['Annual Implementation Plan Developed']),
        monthly_grant_allocated:    parseBool(row['20% Monthly Grant Allocated to EDEN']),
        eden_rolled_out:            parseBool(row['EDEN Rolled Out to Facility Catchment Areas']),
        num_facilities_rolling_out: parseNum(row['Number of Facilities Rolling Out EDEN']),

        malaria_cases:       parseNum(row['Total New Malaria Cases This Quarter']),
        malaria_trend:       row['Malaria Increase or Decrease'] || null,
        malaria_explanation: row['Malaria Explanation'] || null,

        malaria_rdt_cases:       parseNum(row['Total Confirmed Malaria RDT Cases']),
        malaria_rdt_trend:       row['RDT Malaria Increase or Decrease'] || null,
        malaria_rdt_explanation: row['RDT Malaria Explanation'] || null,

        diarrhea_cases:       parseNum(row['Total New Diarrhea Cases This Quarter']),
        diarrhea_trend:       row['Diarrhea Increase or Decrease'] || null,
        diarrhea_explanation: row['Diarrhea Explanation'] || null,

        skin_disease_cases:       parseNum(row['Total New Skin Disease Cases This Quarter']),
        skin_disease_trend:       row['Skin Disease Increase or Decrease'] || null,
        skin_disease_explanation: row['Skin Disease Explanation'] || null,

        simple_cough_cases:       parseNum(row['Total New Simple Cough Cases This Quarter']),
        simple_cough_trend:       row['Simple Cough Increase or Decrease'] || null,
        simple_cough_explanation: row['Simple Cough Explanation'] || null,

        pneumonia_cases:       parseNum(row['Total New Pneumonia Cases This Quarter']),
        pneumonia_trend:       row['Pneumonia Increase or Decrease'] || null,
        pneumonia_explanation: row['Pneumonia Explanation'] || null,

        outpatient_total:       parseNum(row['Total Outpatient This Quarter']),
        outpatient_trend:       row['Outpatient Increase or Decrease'] || null,
        outpatient_explanation: row['Outpatient Explanation'] || null,

        total_communities_reached:         parseNum(row['Total Communities Reached']),
        villages_declared_healthy:         parseNum(row['Villages Declared Healthy']),
        healthy_village_names:             row['Healthy Village Names'] || null,
        villages_working_towards_healthy:  parseNum(row['Villages Working Towards Healthy Status']),
        villages_working_names:            row['Villages Working Names'] || null,
        healthy_families_declared:         parseNum(row['Healthy Families Declared']),
        new_villages_currently_working_with: parseNum(row['New Villages Currently Working With']),

        new_permanent_houses:      parseNum(row['New Permanent Houses Built']),
        new_semi_permanent_houses: parseNum(row['New Semi-Permanent Houses Built']),
        new_bush_material_houses:  parseNum(row['New Bush Material Houses Built']),
        new_pit_toilets:           parseNum(row['New Pit Toilets Dug']),
        new_vip_toilets:           parseNum(row['New VIP Toilets Built']),
        new_rubbish_pits:          parseNum(row['New Rubbish Pits Dug']),
        new_roof_catchment_water:  parseNum(row['New Roof Catchment Water Supply Built']),
        new_dish_racks:            parseNum(row['New Dish Racks Built']),
        new_separated_kitchens:    parseNum(row['New Separated Kitchens Built']),
        new_hand_washing_dishes:   parseNum(row['New Hand Washing Dishes Built']),
        new_faith_gardens:         parseNum(row['New Faith Gardens Made']),

        advice_required: row['Advice Required'] || null,
        other_comments:  row['Other Comments'] || null,

        sheets_row_index: row._rowIndex,
        synced_at:        new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      };

      if (dryRun) {
        console.log(`    [dry-run] Would upsert quarterly for facility: ${row['Health Facility Name']} Q: ${record.reporting_quarter}`);
        inserted++;
        continue;
      }

      const cols = Object.keys(record);
      const vals = Object.values(record);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const updates = cols
        .filter(c => !['health_facility_id', 'reporting_quarter'].includes(c))
        .map(c => `${c} = EXCLUDED.${c}`)
        .join(', ');

      const result = await client.query(
        `INSERT INTO quarterly_reports (${cols.join(', ')})
         VALUES (${placeholders})
         ON CONFLICT (health_facility_id, reporting_quarter)
         DO UPDATE SET ${updates}
         RETURNING (xmax = 0) AS was_inserted`,
        vals
      );

      if (result.rows[0].was_inserted) inserted++;
      else updated++;

    } catch (err) {
      const msg = `Row ${row._rowIndex}: ${err.message}`;
      console.error('    ERROR:', msg);
      errors.push(msg);
    }
  }

  return { inserted, updated, errors };
}

module.exports = { syncQuarterly };
