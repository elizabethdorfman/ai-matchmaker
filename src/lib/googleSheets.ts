import { SignUpFormData } from '../types/form';

// Note: For production, this should be moved to a backend API (Vercel serverless function)
// to keep service account credentials secure. For MVP, we'll use a REST API approach.
// The googleapis package is Node.js only, so we use fetch with OAuth2 or service account JWT.

// Note: getAccessToken function removed - Google Sheets API calls are now handled by Vercel serverless functions

// Use Vercel serverless functions (API routes)
// In development: http://localhost:5173/api (if proxied) or use full URL
// In production: /api (relative path works on same domain)
const API_BASE_URL = '/api';

export async function appendToSheet(data: SignUpFormData & { userId: string; signupDate: string; status: string; requestedMatchUserId?: string }): Promise<void> {
  try {
    // Prepare row data in the order of the sheet columns
    const height = `${data.heightFeet}'${data.heightInches}"`;
    const fullLocation = data.location === 'Other' ? (data.locationOther || data.location) : data.location;
    const fullReligiousObservance = data.religiousObservance === 'Other' ? (data.religiousObservanceOther || data.religiousObservance) : data.religiousObservance;
    
    const row = [
      data.userId,                    // User ID
      data.signupDate,                // Sign-up Date
      data.name,                      // Name
      data.dateOfBirth,               // Age (storing DOB, age calculated on display)
      height,                         // Height
      data.email,                     // Email
      data.phone,                     // Phone
      fullLocation,                   // Location
      fullReligiousObservance,        // Religious Observance
      data.education,                 // Education
      data.university || '',          // University
      data.role,                      // Role
      data.company,                   // Company
      data.industry,                  // Industry
      data.interests,                 // Interests
      data.values,                    // Values
      '',                             // Relationship Goals (not collected in form, empty for now)
      data.agePreferenceMin.toString(), // Age Preference Min
      data.agePreferenceMax.toString(), // Age Preference Max
      data.otherPreferences || '',    // Other Preference
      data.instagramHandle || '',     // Instagram Handle
      data.linkedInUrl || '',         // LinkedIn URL
      data.headshotPhotoUrl || '',    // Headshot Photo URL
      data.fullBodyPhotoUrl || '',    // Full Body Photo URL
      data.videoUrl || '',            // Video URL
      data.status,                    // Status
      '',                             // Notes
      data.requestedMatchUserId || '', // Requested Match With
    ];

    // Call backend API endpoint (to be created as Vercel serverless function)
    const response = await fetch(`${API_BASE_URL}/sheets/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
        range: 'Users!A:Z',
        values: [row],
      }),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If response isn't JSON, use status text
        errorData = { error: response.statusText };
      }
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('Google Sheets API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        details: errorData.details,
        fullError: errorData
      });
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
}

export async function getSheetData(userId: string): Promise<Record<string, any> | null> {
  try {
    // Call backend API endpoint
    const response = await fetch(`${API_BASE_URL}/sheets/get-user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error getting data from Google Sheets:', error);
    return null;
  }
}

export async function addMatchToSheet(matchData: {
  userId1: string;
  userId2: string;
  compatibilityScore: number;
  matchDate: string;
}): Promise<void> {
  try {
    // Generate match ID
    const matchId = `M${Date.now()}`;

    const row = [
      matchId,
      matchData.userId1,
      matchData.userId2,
      matchData.matchDate,
      matchData.compatibilityScore.toString(),
      'Pending',
      '', // Introduction email sent date
      '', // User 1 response
      '', // User 2 response
      '', // Notes
      '', // Feedback
    ];

    // Call backend API endpoint
    const response = await fetch(`${API_BASE_URL}/sheets/add-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
        range: 'Matches!A:K',
        values: [row],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add match to Google Sheets');
    }
  } catch (error) {
    console.error('Error adding match to Google Sheets:', error);
    throw error;
  }
}

