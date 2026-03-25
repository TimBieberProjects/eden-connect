/**
 * Get-or-create functions for each level of Nickson's five-level hierarchy.
 * Each function uses INSERT ... ON CONFLICT DO UPDATE ... RETURNING id
 * so it always returns the row's UUID regardless of whether it was just created.
 */

async function getOrCreateProvince(client, name) {
  const { rows } = await client.query(
    `INSERT INTO provinces (name)
     VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name]
  );
  return rows[0].id;
}

async function getOrCreateDistrict(client, name, provinceId) {
  const { rows } = await client.query(
    `INSERT INTO districts (name, province_id)
     VALUES ($1, $2)
     ON CONFLICT (name, province_id) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, provinceId]
  );
  return rows[0].id;
}

async function getOrCreateLLG(client, name, districtId) {
  const { rows } = await client.query(
    `INSERT INTO llgs (name, district_id)
     VALUES ($1, $2)
     ON CONFLICT (name, district_id) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, districtId]
  );
  return rows[0].id;
}

async function getOrCreateAgency(client, name) {
  const { rows } = await client.query(
    `INSERT INTO agencies (name)
     VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name]
  );
  return rows[0].id;
}

async function getOrCreateFacility(client, name, llgId, agencyId) {
  const { rows } = await client.query(
    `INSERT INTO health_facilities (name, llg_id, agency_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (name, llg_id) DO UPDATE SET agency_id = EXCLUDED.agency_id
     RETURNING id`,
    [name, llgId, agencyId]
  );
  return rows[0].id;
}

async function getOrCreateCommunity(client, name, facilityId) {
  const { rows } = await client.query(
    `INSERT INTO communities (name, health_facility_id)
     VALUES ($1, $2)
     ON CONFLICT (name, health_facility_id) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, facilityId]
  );
  return rows[0].id;
}

/**
 * Resolve all five levels from a flat row object.
 * Returns { provinceId, districtId, llgId, agencyId, facilityId }
 */
async function resolveHierarchy(client, row) {
  const province = row['Province'] || 'Unknown Province';
  const district = row['District'] || 'Unknown District';
  const llg      = row['LLG'] || row['Local Level Government'] || 'Unknown LLG';
  const agency   = row['Agency Name'] || 'Unknown Agency';
  const facility = row['Health Facility Name'] || 'Unknown Facility';

  const provinceId = await getOrCreateProvince(client, province);
  const districtId = await getOrCreateDistrict(client, district, provinceId);
  const llgId      = await getOrCreateLLG(client, llg, districtId);
  const agencyId   = await getOrCreateAgency(client, agency);
  const facilityId = await getOrCreateFacility(client, facility, llgId, agencyId);

  return { provinceId, districtId, llgId, agencyId, facilityId };
}

module.exports = {
  getOrCreateProvince,
  getOrCreateDistrict,
  getOrCreateLLG,
  getOrCreateAgency,
  getOrCreateFacility,
  getOrCreateCommunity,
  resolveHierarchy,
};
