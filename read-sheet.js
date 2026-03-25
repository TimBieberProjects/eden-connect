const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '1DjU4cy-X7l2qN-FqW_DIJXosRRwJagPU6lXaoSJf_Zo';
const KEY_FILE = path.join(__dirname, 'credentials', 'eden-connect-API-key.json');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // First, get sheet metadata to find all sheet names
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetNames = meta.data.sheets.map(s => s.properties.title);
  console.log(`Sheets found: ${sheetNames.join(', ')}\n`);

  // Read all rows from the first sheet
  const range = `${sheetNames[0]}`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  console.log(`Total rows: ${rows.length}\n`);
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`, row);
  });
}

readSheet().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
