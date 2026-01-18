import { google } from 'googleapis';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEET_ID;

    if (!userId || !sheetId) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: {
          hasUserId: !!userId,
          hasSheetId: !!sheetId
        }
      });
    }

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return res.status(500).json({ 
        error: 'Google service account credentials not configured',
        details: {
          hasClientEmail: !!clientEmail,
          hasPrivateKey: !!privateKey
        }
      });
    }

    // Handle private key formatting - remove quotes if present, replace \n with actual newlines
    privateKey = privateKey.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    privateKey = privateKey.replace(/\\n/g, '\n'); // Replace \n with actual newlines

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get all data from Users sheet (extended to AA to include all columns including photos)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Users!A:AA',
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return res.status(404).json({ error: 'User not found - no data in sheet' });
    }

    // First row is headers
    const headers = rows[0] as string[];
    
    // Find row with matching userId
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === userId) {
        const userData: Record<string, any> = {};
        headers.forEach((header, index) => {
          userData[header] = row[index] || '';
        });
        return res.status(200).json(userData);
      }
    }

    return res.status(404).json({ error: 'User not found - userId not in sheet' });
  } catch (error: any) {
    console.error('Error getting data from Google Sheets:', error);
    const errorMessage = error?.message || 'Unknown error';
    const isKeyError = errorMessage.includes('DECODER') || errorMessage.includes('unsupported');
    
    return res.status(500).json({ 
      error: 'Failed to get user data',
      message: errorMessage,
      hint: isKeyError ? 'Private key format issue - check that GOOGLE_PRIVATE_KEY is properly formatted with \\n for newlines' : undefined
    });
  }
}

