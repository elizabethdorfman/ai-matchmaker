import { google } from 'googleapis';
import { config } from 'dotenv';
import { resolve } from 'path';
import sgMail from '@sendgrid/mail';

// Load .env.local in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

interface DMRequest {
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  targetUsername: string;
  targetFullName?: string;
  targetInstagramUrl?: string;
  targetProfileId?: string;
  requestDate: string;
  status: string; // 'pending', 'sent', 'responded', 'declined', 'matched'
  notes?: string;
  messageTemplate?: string; // The message that will be sent
  automationEnabled?: boolean; // Whether to use automated DM sending
}

// Generate the DM message template
function generateMessageTemplate(targetName: string): string {
  return `This is matchmaker Aria. We have a member of the toronto jewish community that wanted to know if you're single?`;
}

// Send email notification for DM request
async function sendDMRequestNotification(data: {
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  targetUsername: string;
  targetFullName?: string;
  targetInstagramUrl?: string;
  notes?: string;
  messageTemplate: string;
  requestId: string;
  requestDate: string;
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
          .message-box { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💌 New DM Request Submitted</h1>
          </div>
          
          <div class="section">
            <h2>Request Details</h2>
            <p><span class="label">Request ID:</span> <span class="value">${data.requestId}</span></p>
            <p><span class="label">Date:</span> <span class="value">${new Date(data.requestDate).toLocaleString()}</span></p>
          </div>

          <div class="section">
            <h2>Requester Information</h2>
            <p><span class="label">Name:</span> <span class="value">${data.requesterName}</span></p>
            <p><span class="label">Email:</span> <span class="value"><a href="mailto:${data.requesterEmail}">${data.requesterEmail}</a></span></p>
            ${data.requesterPhone ? `<p><span class="label">Phone:</span> <span class="value"><a href="tel:${data.requesterPhone}">${data.requesterPhone}</a></span></p>` : ''}
          </div>

          <div class="section">
            <h2>Target Profile</h2>
            <p><span class="label">Instagram Username:</span> <span class="value"><a href="https://www.instagram.com/${data.targetUsername.replace('@', '')}" target="_blank">${data.targetUsername}</a></span></p>
            ${data.targetFullName ? `<p><span class="label">Full Name:</span> <span class="value">${data.targetFullName}</span></p>` : ''}
            ${data.targetInstagramUrl ? `<p><span class="label">Profile URL:</span> <span class="value"><a href="${data.targetInstagramUrl}" target="_blank">${data.targetInstagramUrl}</a></span></p>` : ''}
          </div>

          <div class="section">
            <h2>Message to Send</h2>
            <div class="message-box">
              <p>${data.messageTemplate}</p>
            </div>
          </div>

          ${data.notes ? `
          <div class="section">
            <h2>Additional Notes</h2>
            <p>${data.notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated notification from your matchmaker app.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New DM Request Submitted

Request ID: ${data.requestId}
Date: ${new Date(data.requestDate).toLocaleString()}

Requester Information:
- Name: ${data.requesterName}
- Email: ${data.requesterEmail}
${data.requesterPhone ? `- Phone: ${data.requesterPhone}` : ''}

Target Profile:
- Instagram Username: ${data.targetUsername}
${data.targetFullName ? `- Full Name: ${data.targetFullName}` : ''}
${data.targetInstagramUrl ? `- Profile URL: ${data.targetInstagramUrl}` : ''}

Message to Send:
${data.messageTemplate}

${data.notes ? `Additional Notes:\n${data.notes}` : ''}
    `;

    await sgMail.send({
      to: notificationEmail,
      from: process.env.SENDGRID_FROM_EMAIL || notificationEmail,
      subject: `💌 New DM Request: ${data.requesterName} wants to reach out to ${data.targetUsername}`,
      text: emailText,
      html: emailHtml,
    });

    console.log('Email notification sent successfully');
  } catch (error: any) {
    console.error('Error sending email notification:', error);
    // Don't throw - we don't want email failures to break form submissions
  }
}

// Attempt to send DM via Phantombuster (if configured)
async function attemptAutomatedDM(username: string, message: string): Promise<{ success: boolean; message?: string } | null> {
  const phantombusterApiKey = process.env.PHANTOMBUSTER_API_KEY;
  const instagramDmPhantomId = process.env.PHANTOMBUSTER_INSTAGRAM_DM_PHANTOM_ID;

  if (!phantombusterApiKey || !instagramDmPhantomId) {
    return null; // Not configured, will be sent manually
  }

  try {
    // Launch Phantombuster Instagram DM sender phantom
    const launchResponse = await fetch(
      'https://api.phantombuster.com/api/v2/agents/launch',
      {
        method: 'POST',
        headers: {
          'X-Phantombuster-Key': phantombusterApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: instagramDmPhantomId,
          argument: {
            username: username.replace('@', ''),
            message: message,
            // Add delay to avoid rate limits
            delay: 300, // 5 minutes between DMs
          },
        }),
      }
    );

    if (!launchResponse.ok) {
      const errorText = await launchResponse.text();
      console.error('Phantombuster DM launch failed:', errorText);
      return { success: false, message: 'Failed to launch automated DM' };
    }

    const launchData = await launchResponse.json();
    console.log('Phantombuster DM launched:', launchData);

    return { 
      success: true, 
      message: 'DM automation launched successfully. Check Phantombuster dashboard for status.' 
    };
  } catch (error: any) {
    console.error('Error attempting automated DM:', error);
    return { success: false, message: error.message || 'Automation error' };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      requesterName,
      requesterEmail,
      requesterPhone,
      targetUsername,
      targetFullName,
      targetInstagramUrl,
      targetProfileId,
      notes,
      automationEnabled = false,
    }: DMRequest = req.body;

    // Generate the message template
    const messageTemplate = generateMessageTemplate(
      targetFullName || targetUsername
    );

    // Validate required fields
    if (!requesterName || !requesterEmail || !targetUsername) {
      return res.status(400).json({ 
        error: 'Missing required fields: requesterName, requesterEmail, and targetUsername are required' 
      });
    }

    let sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEET_ID;
    if (sheetId) {
      sheetId = sheetId.replace(/^GOOGLE_SHEET_ID\s*=\s*/i, '');
      sheetId = sheetId.replace(/[\r\n]+/g, '').trim();
    }

    if (!sheetId) {
      return res.status(500).json({ error: 'Google Sheet ID not configured' });
    }

    // Initialize Google Sheets API
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return res.status(500).json({ 
        error: 'Google service account credentials not configured' 
      });
    }

    privateKey = privateKey.replace(/^["']|["']$/g, '');
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Generate request ID
    const requestId = `DM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const requestDate = new Date().toISOString();

    // Prepare row data for DMRequests sheet
    // Columns: Request ID, Request Date, Requester Name, Requester Email, Requester Phone,
    // Target Username, Target Full Name, Target Instagram URL, Target Profile ID,
    // Status, Notes, Message Template, Automation Enabled, DM Sent Date, Response Date, Response Status
    const row = [
      requestId,
      requestDate,
      requesterName,
      requesterEmail,
      requesterPhone || '',
      targetUsername,
      targetFullName || '',
      targetInstagramUrl || '',
      targetProfileId || '',
      'pending', // Status
      notes || '',
      messageTemplate, // Message Template
      automationEnabled ? 'Yes' : 'No', // Automation Enabled
      '', // DM Sent Date
      '', // Response Date
      '', // Response Status
    ];

    // Append to DMRequests sheet (create if doesn't exist)
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'DMRequests!A:P',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });
    } catch (error: any) {
      // If sheet doesn't exist, try to create it first
      if (error?.message?.includes('Unable to parse range')) {
        // Try to get spreadsheet to check if it exists
        try {
          const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
          
          // Check if DMRequests sheet exists
          const sheetExists = spreadsheet.data.sheets?.some(
            (sheet: any) => sheet.properties?.title === 'DMRequests'
          );

          if (!sheetExists) {
            // Create the DMRequests sheet
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: sheetId,
              requestBody: {
                requests: [
                  {
                    addSheet: {
                      properties: {
                        title: 'DMRequests',
                      },
                    },
                  },
                ],
              },
            });

            // Add header row
            await sheets.spreadsheets.values.update({
              spreadsheetId: sheetId,
              range: 'DMRequests!A1:P1',
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values: [[
                  'Request ID',
                  'Request Date',
                  'Requester Name',
                  'Requester Email',
                  'Requester Phone',
                  'Target Username',
                  'Target Full Name',
                  'Target Instagram URL',
                  'Target Profile ID',
                  'Status',
                  'Notes',
                  'Message Template',
                  'Automation Enabled',
                  'DM Sent Date',
                  'Response Date',
                  'Response Status',
                ]],
              },
            });

            // Now append the data
            await sheets.spreadsheets.values.append({
              spreadsheetId: sheetId,
              range: 'DMRequests!A:P',
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values: [row],
              },
            });
          }
        } catch (createError: any) {
          console.error('Error creating DMRequests sheet:', createError);
          throw createError;
        }
      } else {
        throw error;
      }
    }

    console.log('Successfully saved DM request:', requestId);

    // Send email notification (non-blocking)
    try {
      await sendDMRequestNotification({
        requesterName,
        requesterEmail,
        requesterPhone,
        targetUsername,
        targetFullName,
        targetInstagramUrl,
        notes,
        messageTemplate,
        requestId,
        requestDate,
      });
    } catch (error: any) {
      console.error('Email notification failed (non-critical):', error);
      // Continue even if email fails
    }

    // If automation is enabled and Phantombuster is configured, attempt to send automatically
    let automationResult = null;
    if (automationEnabled) {
      try {
        automationResult = await attemptAutomatedDM(targetUsername, messageTemplate);
      } catch (error: any) {
        console.error('Automated DM failed, will be sent manually:', error);
        // Don't fail the request if automation fails - it will be sent manually
      }
    }

    return res.status(200).json({ 
      success: true, 
      requestId,
      message: automationResult?.success 
        ? 'DM request submitted and sent automatically!' 
        : automationEnabled && !automationResult
        ? 'DM request submitted. Automated sending not configured - will be sent manually.'
        : 'DM request submitted successfully. The matchmaker will reach out soon!',
      automationResult: automationResult || null,
    });
  } catch (error: any) {
    console.error('Error saving DM request:', error);
    
    let errorMessage = 'Failed to save DM request';
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

