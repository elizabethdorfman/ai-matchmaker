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
    const { sheetId, range, values } = req.body;

    console.log('Append request received:', {
      hasSheetId: !!sheetId,
      range,
      valuesCount: values?.length,
      rowLength: values?.[0]?.length,
    });

    if (!sheetId || !range || !values) {
      return res.status(400).json({ error: 'Missing required parameters', received: { hasSheetId: !!sheetId, hasRange: !!range, hasValues: !!values } });
    }

    // Initialize Google Sheets API with service account
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      console.error('Missing Google credentials:', {
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!privateKey,
        envVars: {
          GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
          VITE_GOOGLE_PRIVATE_KEY: !!process.env.VITE_GOOGLE_PRIVATE_KEY,
        }
      });
      return res.status(500).json({ 
        error: 'Google service account credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.',
        hint: 'For Vercel serverless functions, use environment variables WITHOUT the VITE_ prefix in your .env.local file. Make sure to restart vercel dev after updating .env.local'
      });
    }

    // Handle private key formatting - remove quotes if present, replace \n with actual newlines
    privateKey = privateKey.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    privateKey = privateKey.replace(/\\n/g, '\n'); // Replace \n with actual newlines

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Attempting to append to sheet:', sheetId, 'range:', range);

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('Successfully appended to sheet');
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error appending to Google Sheets:', error);
    
    // Extract detailed error message
    let errorMessage = 'Failed to append to Google Sheets';
    if (error?.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: error?.response?.data || error?.stack 
    });
  }
}

