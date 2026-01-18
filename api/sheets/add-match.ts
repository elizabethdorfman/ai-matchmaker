import { google } from 'googleapis';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { sheetId, range, values } = req.body;

    // If sheetId is not provided in body, try to get it from env vars
    if (!sheetId) {
      sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEET_ID;
    }

    // Clean up sheetId - remove any newlines and carriage returns (these cause 404 errors)
    if (sheetId) {
      sheetId = sheetId.replace(/^GOOGLE_SHEET_ID\s*=\s*/i, '');
      // Remove ALL newlines and carriage returns from anywhere in the string
      sheetId = sheetId.replace(/[\r\n]+/g, '');
      sheetId = sheetId.trim();
    }

    if (!sheetId || !range || !values) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding match to Google Sheets:', error);
    return res.status(500).json({ error: 'Failed to add match to Google Sheets' });
  }
}

