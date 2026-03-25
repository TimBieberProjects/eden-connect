require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const KEY_FILE = path.resolve(process.env.GOOGLE_KEY_FILE || './credentials/eden-connect-API-key.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: SCOPES });
  return google.sheets({ version: 'v4', auth });
}

/**
 * Fetch all rows from a sheet tab as an array of objects keyed by header row.
 * @param {string} spreadsheetId
 * @param {string} [range] - e.g. 'Sheet1' or 'Sheet1!A:Z'. Defaults to first tab.
 */
async function fetchSheetData(spreadsheetId, range) {
  const sheets = await getSheetsClient();

  // If no range specified, discover first tab name
  if (!range) {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    range = meta.data.sheets[0].properties.title;
  }

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row, rowIndex) => {
    const obj = { _rowIndex: rowIndex + 2 }; // 1-indexed, +1 for header
    headers.forEach((header, i) => {
      obj[header.trim()] = (row[i] || '').trim();
    });
    return obj;
  });
}

module.exports = { getSheetsClient, fetchSheetData };
