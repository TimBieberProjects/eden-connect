const { fetchSheetData } = require('../sheets/client');
const { resolveHierarchy, getOrCreateCommunity } = require('./hierarchy');

const SHEET_ID = process.env.BASELINE_SHEET_ID || '1DjU4cy-X7l2qN-FqW_DIJXosRRwJagPU6lXaoSJf_Zo';

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
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ── main export ───────────────────────────────────────────────────────────────

/**
 * Sync baseline survey sheet → Postgres baseline_surveys table.
 * @param {import('pg').PoolClient} client
 * @param {boolean} dryRun
 * @returns {{ inserted: number, updated: number, errors: string[] }}
 */
async function syncBaseline(client, dryRun = false) {
  console.log('  Fetching baseline survey sheet…');
  const rows = await fetchSheetData(SHEET_ID);
  console.log(`  Found ${rows.length} data rows`);

  let inserted = 0, updated = 0;
  const errors = [];

  for (const row of rows) {
    try {
      const { provinceId, districtId, llgId, agencyId, facilityId } =
        await resolveHierarchy(client, row);

      const communityName = row['Community Name'] || 'Unknown Community';
      const communityId = await getOrCreateCommunity(client, communityName, facilityId);

      const record = {
        community_id:          communityId,
        health_facility_id:    facilityId,
        llg_id:                llgId,
        agency_id:             agencyId,

        submitted_at:          parseDate(row['Timestamp']),
        survey_phase:          row['Survey Phase'] || null,
        coordinator_name:      row['Name of Agency Health Promotion Coordinator'] || null,
        officer_name:          row['Name of Facility Health Promotion Officer'] || null,
        person_interviewed:    row['Name of Person Interviewed'] || null,
        phone_number:          row['Phone Number'] || null,
        role_in_community:     row['Role in Community'] || null,

        ward_development_plan:              parseBool(row['Ward Development Plan']),
        ward_development_committee_active:  parseBool(row['Ward Development Committee Active']),
        training_conducted_last_2_years:    parseBool(row['Training Conducted Last 2 Years']),
        training_organisation:              row['Organisation Facilitating Training'] || null,
        assistance_from_llg_government:     parseBool(row['Assistance from LLG/Government']),
        community_general_look:             row['General Look of Community'] || null,
        community_described_as_healthy:     parseBool(row['Community Described as Healthy']),
        common_illnesses:                   row['Common Illnesses'] || null,
        disease_numbers_changed:            parseBool(row['Change in Disease Numbers This Year']),

        bush_material_houses:  parseNum(row['Bush Material Houses']),
        semi_permanent_houses: parseNum(row['Semi-Permanent Houses']),
        permanent_houses:      parseNum(row['Permanent Houses']),
        septic_toilets:        parseNum(row['Septic Toilets']),
        pit_toilets:           parseNum(row['Pit Toilets']),
        rubbish_pits:          parseNum(row['Rubbish Pits']),
        dish_racks:            parseNum(row['Dish Racks']),
        separated_kitchens:    parseNum(row['Separated Kitchens']),
        hand_washing_dishes:   parseNum(row['Hand Washing Dishes']),
        faith_gardens:         parseNum(row['Faith Gardens']),

        children_under_1yr:  parseNum(row['Number of Children Under 1yr']),
        children_1_5yrs:     parseNum(row['Number of Children 1-5yrs']),
        children_6_14yrs:    parseNum(row['Number of Children 6-14yrs']),
        people_15_49yrs:     parseNum(row['Number of People 15-49yrs']),
        people_50yrs_plus:   parseNum(row['Number of People 50yrs+']),
        total_population:    parseNum(row['Total Population']),
        total_households:    parseNum(row['Number of Households']),

        deaths_babies_under_1yr:       parseNum(row['Babies Under 1yr Died Last Year']),
        deaths_children_1_5yrs:        parseNum(row['Children 1-5yrs Died Last Year']),
        deaths_children_over_5_adults: parseNum(row['Children Over 5 and Adults Died Last Year']),
        deaths_women_childbirth:       parseNum(row['Women Died in Childbirth Last Year']),

        outpatient_total_last_year:         parseNum(row['Outpatient Total Last Year']),
        outpatient_total_this_year_to_date: parseNum(row['Outpatient Total This Year to Date']),
        malaria_cases_this_year:            parseNum(row['Malaria Cases This Year']),
        pneumonia_cases_this_year:          parseNum(row['Pneumonia Cases This Year']),
        simple_cough_cases_this_year:       parseNum(row['Simple Cough Cases This Year']),
        skin_disease_cases_this_year:       parseNum(row['Skin Disease Cases This Year']),
        diarrhea_cases_this_year:           parseNum(row['Diarrhea Cases This Year']),
        malnutrition_cases_this_year:       parseNum(row['Malnutrition Cases This Year']),

        water_source:                             row['Main Water Source'] || null,
        water_fetch_time_minutes:                 parseNum(row['Time to Fetch Water (minutes)']),
        water_source_reliable_extreme_weather:    parseBool(row['Community Relies on Water Source in Extreme Weather']),
        distance_to_school_km:                    parseNum(row['Distance to Nearest School (km)']),
        education_no_formal:                      parseNum(row['No Formal Education']),
        education_primary_complete:               parseNum(row['Completed Primary Education']),
        education_high_school:                    parseNum(row['High School']),
        education_secondary:                      parseNum(row['Secondary School']),
        education_tertiary:                       parseNum(row['Tertiary/University']),

        sheets_row_index: row._rowIndex,
        synced_at:        new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      };

      if (dryRun) {
        console.log(`    [dry-run] Would upsert baseline for community: ${communityName}`);
        inserted++;
        continue;
      }

      const cols = Object.keys(record);
      const vals = Object.values(record);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const updates = cols
        .filter(c => !['community_id', 'survey_phase'].includes(c))
        .map(c => `${c} = EXCLUDED.${c}`)
        .join(', ');

      const result = await client.query(
        `INSERT INTO baseline_surveys (${cols.join(', ')})
         VALUES (${placeholders})
         ON CONFLICT (community_id, survey_phase)
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

module.exports = { syncBaseline };
