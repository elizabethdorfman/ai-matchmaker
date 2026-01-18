import { google } from 'googleapis';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

interface InstagramProfile {
  id: string;
  username: string;
  fullName?: string;
  bio?: string;
  location?: string;
  age?: number;
  profession?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isVerified?: boolean;
  profileUrl?: string;
  imageUrl?: string;
}

async function readProfilesFromGoogleSheets(): Promise<InstagramProfile[]> {
  let sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEET_ID;
  if (sheetId) {
    sheetId = sheetId.replace(/^GOOGLE_SHEET_ID\s*=\s*/i, '');
    sheetId = sheetId.replace(/[\r\n]+/g, '');
    sheetId = sheetId.trim();
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

  if (!sheetId || !clientEmail || !privateKey) {
    throw new Error('Google Sheets not configured');
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

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'InstagramProfiles!A2:Z10000',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return [];
    }

    // Map rows to InstagramProfile objects
    const profiles: InstagramProfile[] = [];
    rows.forEach((row) => {
      if (row.length < 2) return; // Skip invalid rows

      const profile: InstagramProfile = {
        id: row[0] || '',
        username: row[1] || '',
        fullName: row[2] || undefined,
        bio: row[3] || undefined,
        location: row[4] || undefined,
        age: row[5] ? parseInt(row[5]) : undefined,
        profession: row[6] || undefined,
        followersCount: row[7] ? parseInt(row[7]) : undefined,
        followingCount: row[8] ? parseInt(row[8]) : undefined,
        postsCount: row[9] ? parseInt(row[9]) : undefined,
        isVerified: row[10] === 'true',
        profileUrl: row[11] || undefined,
        imageUrl: row[12] || undefined,
      };

      if (profile.username) {
        profiles.push(profile);
      }
    });

    return profiles;
  } catch (error: any) {
    // If sheet doesn't exist or can't be read, return empty array
    if (error.code === 400 || error.message?.includes('Unable to parse range')) {
      return [];
    }
    throw error;
  }
}

async function saveProfilesToGoogleSheets(profiles: InstagramProfile[]): Promise<void> {
  let sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEET_ID;
  if (sheetId) {
    sheetId = sheetId.replace(/^GOOGLE_SHEET_ID\s*=\s*/i, '');
    sheetId = sheetId.replace(/[\r\n]+/g, '');
    sheetId = sheetId.trim();
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

  if (!sheetId || !clientEmail || !privateKey) {
    console.log('Google Sheets not configured, skipping save');
    return;
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

  try {
    // Check if InstagramProfiles sheet exists, create if not
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetExists = spreadsheet.data.sheets?.some(sheet => sheet.properties?.title === 'InstagramProfiles');

    if (!sheetExists) {
      console.log('Creating InstagramProfiles sheet...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'InstagramProfiles',
              },
            },
          }],
        },
      });
    }

    // Clear existing data (keep header row)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'InstagramProfiles!A2:Z10000',
    });

    // Prepare header row
    const headers = ['id', 'username', 'fullName', 'bio', 'location', 'age', 'profession', 'followersCount', 'followingCount', 'postsCount', 'isVerified', 'profileUrl', 'imageUrl'];
    
    // Prepare data rows
    const rows = profiles.map(profile => [
      profile.id || '',
      profile.username || '',
      profile.fullName || '',
      profile.bio || '',
      profile.location || '',
      profile.age?.toString() || '',
      profile.profession || '',
      profile.followersCount?.toString() || '',
      profile.followingCount?.toString() || '',
      profile.postsCount?.toString() || '',
      profile.isVerified ? 'true' : 'false',
      profile.profileUrl || '',
      profile.imageUrl || '',
    ]);

    // Write header and data
    console.log(`Saving ${rows.length} profiles to Google Sheets...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'InstagramProfiles!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`✅ Successfully saved ${profiles.length} profiles to Google Sheets`);
  } catch (error: any) {
    console.error('Error saving to Google Sheets:', error.message);
    // Don't throw - allow the function to continue even if save fails
  }
}

async function fetchProfilesFromPhantombuster(): Promise<InstagramProfile[]> {
  const phantombusterApiKey = process.env.PHANTOMBUSTER_API_KEY;
  const followerCollectorPhantomId = process.env.PHANTOMBUSTER_FOLLOWER_COLLECTOR_ID;

  if (!phantombusterApiKey || !followerCollectorPhantomId) {
    return [];
  }

  try {
    const phantombusterResponse = await fetch(
      `https://api.phantombuster.com/api/v2/agents/fetch-output?id=${followerCollectorPhantomId}`,
      {
        headers: {
          'X-Phantombuster-Key': phantombusterApiKey,
        },
      }
    );

    if (!phantombusterResponse.ok) {
      const errorText = await phantombusterResponse.text();
      console.error('Phantombuster API error:', phantombusterResponse.status, errorText);
      return [];
    }

    const phantombusterData = await phantombusterResponse.json();
    console.log('Phantombuster response structure:', {
      hasOutput: !!phantombusterData.output,
      outputType: typeof phantombusterData.output,
      outputIsArray: Array.isArray(phantombusterData.output),
      topLevelKeys: Object.keys(phantombusterData),
      outputKeys: phantombusterData.output && typeof phantombusterData.output === 'object' ? Object.keys(phantombusterData.output) : 'N/A',
    });
    
    let phantombusterProfiles: any[] = [];

    // Handle different response formats from Phantombuster
    // Phantombuster can return data in various formats:
    // 1. Direct array: { output: [...] }
    // 2. Nested: { output: { output: [...] } }
    // 3. CSV string: { output: "csv,string..." }
    // 4. CSV URL: { output: { csvUrl: "..." } }
    
    let outputData = phantombusterData.output;
    
    // Check for nested output structure
    if (outputData && typeof outputData === 'object' && !Array.isArray(outputData) && outputData.output) {
      outputData = outputData.output;
      console.log('Found nested output structure');
    }
    
    if (outputData) {
      if (Array.isArray(outputData)) {
        phantombusterProfiles = outputData;
        console.log(`✅ Found ${phantombusterProfiles.length} profiles in array format`);
      } else if (typeof outputData === 'string') {
        // Check if the string contains a CSV URL (Phantombuster saves to S3)
        const csvUrlMatch = outputData.match(/https:\/\/phantombuster\.s3\.amazonaws\.com\/[^\s\)]+\.csv/);
        if (csvUrlMatch) {
          const csvUrl = csvUrlMatch[0];
          console.log('Found CSV URL in output string, fetching:', csvUrl);
          try {
            const csvResponse = await fetch(csvUrl);
            if (csvResponse.ok) {
              const csvText = await csvResponse.text();
              const lines = csvText.split('\n').filter((line: string) => line.trim());
              if (lines.length > 1) {
                // Parse CSV header - handle quoted fields
                const parseCSVLine = (line: string): string[] => {
                  const result: string[] = [];
                  let current = '';
                  let inQuotes = false;
                  for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                      inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                      result.push(current.trim());
                      current = '';
                    } else {
                      current += char;
                    }
                  }
                  result.push(current.trim());
                  return result;
                };
                
                const headers = parseCSVLine(lines[0]);
                phantombusterProfiles = lines.slice(1)
                  .filter(line => line.trim()) // Skip empty lines
                  .map((line: string) => {
                    const values = parseCSVLine(line);
                    const profile: any = {};
                    headers.forEach((header: string, index: number) => {
                      profile[header] = values[index]?.replace(/^"|"$/g, '') || ''; // Remove quotes
                    });
                    return profile;
                  })
                  .filter(profile => Object.keys(profile).some(key => profile[key])); // Filter out empty profiles
                console.log(`✅ Found ${phantombusterProfiles.length} profiles from CSV URL in output string`);
              }
            } else {
              console.error('Failed to fetch CSV from URL:', csvResponse.status);
            }
          } catch (error) {
            console.error('Error fetching CSV from URL:', error);
          }
        } else {
          // Check for JSON URL as fallback
          const jsonUrlMatch = outputData.match(/https:\/\/phantombuster\.s3\.amazonaws\.com\/[^\s\)]+\.json/);
          if (jsonUrlMatch && phantombusterProfiles.length === 0) {
            const jsonUrl = jsonUrlMatch[0];
            console.log('Found JSON URL in output string, fetching:', jsonUrl);
            try {
              const jsonResponse = await fetch(jsonUrl);
              if (jsonResponse.ok) {
                const jsonData = await jsonResponse.json();
                if (Array.isArray(jsonData)) {
                  phantombusterProfiles = jsonData;
                  console.log(`✅ Found ${phantombusterProfiles.length} profiles from JSON URL in output string`);
                } else if (jsonData && typeof jsonData === 'object') {
                  // Try to find array in JSON object
                  for (const key of Object.keys(jsonData)) {
                    if (Array.isArray(jsonData[key])) {
                      phantombusterProfiles = jsonData[key];
                      console.log(`✅ Found ${phantombusterProfiles.length} profiles from JSON object.${key}`);
                      break;
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching JSON from URL:', error);
            }
          }
          
          // If still no profiles, try to parse as direct CSV string
          if (phantombusterProfiles.length === 0 && outputData.includes(',')) {
            const lines = outputData.split('\n').filter((line: string) => line.trim());
            if (lines.length > 1) {
              const headers = lines[0].split(',').map((h: string) => h.trim());
              phantombusterProfiles = lines.slice(1).map((line: string) => {
                const values = line.split(',');
                const profile: any = {};
                headers.forEach((header: string, index: number) => {
                  profile[header] = values[index]?.trim() || '';
                });
                return profile;
              });
              console.log(`✅ Found ${phantombusterProfiles.length} profiles in CSV string format`);
            }
          }
        }
      } else if (outputData.csvUrl) {
        // Fetch CSV from URL
        console.log('Fetching CSV from URL:', outputData.csvUrl);
        const csvResponse = await fetch(outputData.csvUrl);
        if (csvResponse.ok) {
          const csvText = await csvResponse.text();
          const lines = csvText.split('\n').filter((line: string) => line.trim());
          if (lines.length > 1) {
            const headers = lines[0].split(',').map((h: string) => h.trim());
            phantombusterProfiles = lines.slice(1).map((line: string) => {
              const values = line.split(',');
              const profile: any = {};
              headers.forEach((header: string, index: number) => {
                profile[header] = values[index]?.trim() || '';
              });
              return profile;
            });
            console.log(`✅ Found ${phantombusterProfiles.length} profiles from CSV URL`);
          }
        }
      } else if (typeof outputData === 'object') {
        // Try to find array data in the object
        for (const key of Object.keys(outputData)) {
          if (Array.isArray(outputData[key])) {
            phantombusterProfiles = outputData[key];
            console.log(`✅ Found ${phantombusterProfiles.length} profiles in object.${key}`);
            break;
          }
        }
      }
    }

    if (phantombusterProfiles.length === 0) {
      console.log('⚠️ No profiles found in Phantombuster response. Response structure:', JSON.stringify(phantombusterData, null, 2).substring(0, 500));
      return [];
    }

    // Convert Phantombuster format to our format
    const profiles: InstagramProfile[] = [];
    
    // Log first profile to see structure
    if (phantombusterProfiles.length > 0) {
      console.log('Sample Phantombuster profile structure:', JSON.stringify(phantombusterProfiles[0], null, 2));
      console.log('All profile keys:', phantombusterProfiles[0] ? Object.keys(phantombusterProfiles[0]) : 'No profiles');
    }
    
    phantombusterProfiles.forEach((profile: any, index: number) => {
      // Try multiple ways to extract username
      let username = '';
      
      // Try different column names that Phantombuster might use
      const possibleUsernameFields = [
        'username', 'handle', 'Profile URL', 'profileUrl', 'url', 
        'Instagram Handle', 'instagram_handle', 'user', 'User'
      ];
      
      for (const field of possibleUsernameFields) {
        const value = profile[field];
        if (value) {
          // Extract username from URL or handle
          if (typeof value === 'string') {
            if (value.includes('instagram.com/')) {
              username = value.replace('https://www.instagram.com/', '').replace('https://instagram.com/', '').replace('/', '').replace('@', '');
            } else {
              username = value.replace('@', '').trim();
            }
            if (username) break;
          }
        }
      }
      
      // If still no username, try to find any field that looks like a username
      if (!username) {
        for (const key of Object.keys(profile)) {
          const value = String(profile[key] || '');
          if (value.includes('instagram.com/') || value.match(/^@?[a-zA-Z0-9._]+$/)) {
            if (value.includes('instagram.com/')) {
              username = value.replace('https://www.instagram.com/', '').replace('https://instagram.com/', '').replace('/', '').replace('@', '');
            } else {
              username = value.replace('@', '').trim();
            }
            if (username) break;
          }
        }
      }
      
      if (!username) {
        console.log(`Skipping profile ${index} - no username found. Profile data:`, profile);
        return;
      }

      // Estimate age from bio if available
      let age: number | undefined;
      const bio = (profile.bio || profile.description || '').toLowerCase();
      const ageMatch = bio.match(/\b(\d{2})\b/);
      if (ageMatch) {
        const potentialAge = parseInt(ageMatch[1]);
        if (potentialAge >= 18 && potentialAge <= 100) {
          age = potentialAge;
        }
      }

      // Extract profession from bio
      let profession: string | undefined;
      const professionKeywords = ['lawyer', 'doctor', 'engineer', 'teacher', 'consultant', 'manager', 'director', 'analyst', 'designer', 'developer', 'therapist', 'nurse', 'dentist', 'accountant', 'architect'];
      for (const keyword of professionKeywords) {
        if (bio.includes(keyword)) {
          profession = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }

      // Extract image URL - try multiple field names
      const imageUrl = profile.imgUrl || profile.imageUrl || profile['Image URL'] || profile.profilePictureUrl || profile['Profile Picture URL'] || profile.avatarUrl || profile.avatar || undefined;
      
      // Log first profile to debug image URL extraction
      if (index === 0) {
        console.log('Sample profile keys:', Object.keys(profile));
        console.log('Image URL found:', imageUrl);
        console.log('imgUrl field:', profile.imgUrl);
        console.log('imageUrl field:', profile.imageUrl);
      }

      profiles.push({
        id: `ig_pb_${index}`,
        username: username.startsWith('@') ? username : `@${username}`,
        fullName: profile.fullName || profile.name || profile['Full Name'] || undefined,
        bio: profile.bio || profile.description || profile.Bio || undefined,
        location: profile.location || profile.Location || undefined,
        age: age,
        profession: profession,
        followersCount: profile.followersCount || profile['Followers Count'] || profile.followers ? parseInt(String(profile.followersCount || profile['Followers Count'] || profile.followers).replace(/,/g, '')) : undefined,
        followingCount: profile.followingCount || profile['Following Count'] || profile.following ? parseInt(String(profile.followingCount || profile['Following Count'] || profile.following).replace(/,/g, '')) : undefined,
        postsCount: profile.postsCount || profile['Posts Count'] || profile.posts ? parseInt(String(profile.postsCount || profile['Posts Count'] || profile.posts).replace(/,/g, '')) : undefined,
        isVerified: profile.isVerified || profile.verified || profile.Verified === 'true' || false,
        profileUrl: `https://www.instagram.com/${username}`,
        imageUrl: imageUrl,
      });
    });

    console.log(`✅ Converted ${profiles.length} profiles from ${phantombusterProfiles.length} Phantombuster profiles`);
    return profiles;
  } catch (error) {
    console.error('Error fetching from Phantombuster:', error);
    return [];
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let profiles: InstagramProfile[] = [];
    let source = 'unknown';

    // First, try to read from Google Sheets
    try {
      profiles = await readProfilesFromGoogleSheets();
      if (profiles.length > 0) {
        source = 'google_sheets';
        console.log(`Loaded ${profiles.length} profiles from Google Sheets`);
      }
    } catch (error: any) {
      console.log('Could not read from Google Sheets:', error.message);
    }

    // If Google Sheets is empty or failed, try Phantombuster as fallback
    if (profiles.length === 0) {
      console.log('Google Sheets empty or unavailable, trying Phantombuster...');
      profiles = await fetchProfilesFromPhantombuster();
      if (profiles.length > 0) {
        source = 'phantombuster';
        console.log(`✅ Loaded ${profiles.length} profiles from Phantombuster`);
        // Save to Google Sheets so we don't need to request from Phantombuster next time
        console.log('Saving profiles to Google Sheets for future use...');
        await saveProfilesToGoogleSheets(profiles);
      } else {
        console.log('⚠️ Phantombuster returned 0 profiles. Check if phantom has run and has output.');
      }
    }

    // Always return 200 with data (even if empty)
    return res.status(200).json({
      profiles: profiles,
      total: profiles.length,
      source: source,
      message: profiles.length === 0 
        ? 'No preview profiles available yet. Our database contains 10,000+ profiles.'
        : undefined,
    });
  } catch (error: any) {
    console.error('Error fetching Instagram profiles:', error);
    // Never return 500 - always return data (even if empty)
    return res.status(200).json({
      profiles: [],
      total: 0,
      source: 'error',
      message: 'No profiles available at this time. Please try refreshing later.',
    });
  }
}

