import { google } from 'googleapis';
import { config } from 'dotenv';
import { resolve } from 'path';
import sgMail from '@sendgrid/mail';

// Load .env.local in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

// Send email notification for signup form submission
async function sendSignupNotification(data: {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  signupDate: string;
}): Promise<void> {
  const sendGridApiKey = process.env.SENDGRID_API_KEY || process.env.VITE_SENDGRID_API_KEY;
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'yourpersonalaimatchmaker@gmail.com';

  if (!sendGridApiKey) {
    console.log('SendGrid API key not configured - skipping email notification');
    return;
  }

  try {
    sgMail.setApiKey(sendGridApiKey);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; }
          .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .success-box { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ New Signup!</h1>
          </div>
          
          <div class="success-box">
            <p style="margin: 0; font-size: 18px;"><strong>Someone just joined your matchmaker community!</strong></p>
          </div>
          
          <div class="section">
            <h2>User Information</h2>
            <p><span class="label">User ID:</span> <span class="value">${data.userId}</span></p>
            <p><span class="label">Name:</span> <span class="value">${data.name}</span></p>
            <p><span class="label">Email:</span> <span class="value"><a href="mailto:${data.email}">${data.email}</a></span></p>
            ${data.phone ? `<p><span class="label">Phone:</span> <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span></p>` : ''}
            ${data.location ? `<p><span class="label">Location:</span> <span class="value">${data.location}</span></p>` : ''}
            <p><span class="label">Sign-up Date:</span> <span class="value">${new Date(data.signupDate).toLocaleString()}</span></p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated notification from your matchmaker app.</p>
            <p>View full profile details in your Google Sheets.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Signup!

Someone just joined your matchmaker community!

User Information:
- User ID: ${data.userId}
- Name: ${data.name}
- Email: ${data.email}
${data.phone ? `- Phone: ${data.phone}` : ''}
${data.location ? `- Location: ${data.location}` : ''}
- Sign-up Date: ${new Date(data.signupDate).toLocaleString()}

View full profile details in your Google Sheets.
    `;

    await sgMail.send({
      to: notificationEmail,
      from: process.env.SENDGRID_FROM_EMAIL || notificationEmail,
      subject: `✨ New Signup: ${data.name} joined your matchmaker community!`,
      text: emailText,
      html: emailHtml,
    });

    console.log('Signup email notification sent successfully');
  } catch (error: any) {
    console.error('Error sending signup email notification:', error);
    // Don't throw - we don't want email failures to break form submissions
  }
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
      // Clean up sheetId if it contains the variable name (common mistake in env vars)
      if (sheetId) {
        sheetId = sheetId.replace(/^GOOGLE_SHEET_ID\s*=\s*/i, '');
        // Remove ALL newlines and carriage returns from anywhere in the string (these cause 404 errors)
        sheetId = sheetId.replace(/[\r\n]+/g, '');
        sheetId = sheetId.trim();
      }
    } else {
      // Also clean sheetId if it comes from the request body
      sheetId = sheetId.replace(/[\r\n]+/g, '').trim();
    }

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

    // Send email notification if this is a signup form submission (Users sheet)
    if (range.includes('Users!') || range === 'Users!A:Z') {
      try {
        // Extract user data from the values array
        // Expected order: userId, signupDate, name, dateOfBirth, height, email, phone, location, ...
        const row = values[0];
        if (row && row.length >= 7) {
          await sendSignupNotification({
            userId: row[0] || '',
            name: row[2] || '',
            email: row[5] || '',
            phone: row[6] || '',
            location: row[7] || '',
            signupDate: row[1] || new Date().toISOString(),
          });
        }
      } catch (error: any) {
        console.error('Email notification failed (non-critical):', error);
        // Continue even if email fails
      }
    }

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

