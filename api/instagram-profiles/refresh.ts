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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Phantombuster credentials
    const phantombusterApiKey = process.env.PHANTOMBUSTER_API_KEY;
    const followerCollectorPhantomId = process.env.PHANTOMBUSTER_FOLLOWER_COLLECTOR_ID;

    if (!phantombusterApiKey || !followerCollectorPhantomId) {
      return res.status(400).json({ 
        error: 'Phantombuster API not configured',
      });
    }

    // Get Google Sheets credentials
    let sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEET_ID;
    if (sheetId) {
      sheetId = sheetId.replace(/^GOOGLE_SHEET_ID\s*=\s*/i, '');
      sheetId = sheetId.replace(/[\r\n]+/g, '');
      sheetId = sheetId.trim();
    }

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

    if (!sheetId || !clientEmail || !privateKey) {
      return res.status(400).json({ 
        error: 'Google Sheets not configured',
      });
    }

    // Step 1: Fetch agent metadata to get S3 folder info (per Phantombuster API docs)
    console.log('Fetching agent metadata from Phantombuster...');
    const agentResponse = await fetch(
      `https://api.phantombuster.com/api/v2/agents/fetch?id=${followerCollectorPhantomId}`,
      {
        headers: {
          'X-Phantombuster-Key': phantombusterApiKey,
        },
      }
    );

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Phantombuster API error:', agentResponse.status, errorText);
      return res.status(500).json({
        error: 'Failed to fetch agent metadata from Phantombuster API',
        message: errorText,
      });
    }

    const agentData = await agentResponse.json();
    const orgS3Folder = agentData.orgS3Folder;
    const s3Folder = agentData.s3Folder;
    
    // Step 2: Construct CSV URL using S3 folder info (per Phantombuster API docs)
    let csvUrl: string | null = null;
    
    if (orgS3Folder && s3Folder) {
      // Construct CSV URL as documented: https://phantombuster.s3.amazonaws.com/{orgS3Folder}/{s3Folder}/result.csv
      csvUrl = `https://phantombuster.s3.amazonaws.com/${orgS3Folder}/${s3Folder}/result.csv`;
      console.log('✅ Constructed CSV URL from agent metadata:', csvUrl);
    } else {
      // Fallback: Try to get CSV URL from output (for backwards compatibility)
      console.log('⚠️ No S3 folder info found, trying to fetch from output...');
      const outputResponse = await fetch(
        `https://api.phantombuster.com/api/v2/agents/fetch-output?id=${followerCollectorPhantomId}`,
        {
          headers: {
            'X-Phantombuster-Key': phantombusterApiKey,
          },
        }
      );
      
      if (outputResponse.ok) {
        const outputData = await outputResponse.json();
        const output = outputData.output;
        
        if (typeof output === 'string') {
          const csvUrlMatch = output.match(/https:\/\/phantombuster\.s3\.amazonaws\.com\/[^\s\)]+\.csv/);
          if (csvUrlMatch) {
            csvUrl = csvUrlMatch[0];
            console.log('✅ Found CSV URL in output string:', csvUrl);
          }
        } else if (output && typeof output === 'object' && output.csvUrl) {
          csvUrl = output.csvUrl;
          console.log('✅ Found CSV URL in output object:', csvUrl);
        }
      }
    }

    if (!csvUrl) {
      console.log('⚠️ No CSV URL found. Agent may need to run first.');
      return res.status(404).json({
        error: 'No CSV URL found. The phantom may need to run first to generate results.',
        agentData: {
          hasOrgS3Folder: !!orgS3Folder,
          hasS3Folder: !!s3Folder,
        },
      });
    }

    // Step 3: Fetch and parse CSV
    console.log('Fetching CSV from URL...');
    const csvResponse = await fetch(csvUrl);
    
    if (!csvResponse.ok) {
      return res.status(500).json({
        error: 'Failed to fetch CSV from URL',
        status: csvResponse.status,
      });
    }

    const csvText = await csvResponse.text();
    const lines = csvText.split('\n').filter((line: string) => line.trim());
    
    if (lines.length < 2) {
      return res.status(400).json({
        error: 'CSV file is empty or invalid',
      });
    }

    // Parse CSV - handle quoted fields
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
    console.log('CSV headers:', headers);
    
    // Parse all rows (up to 7000 as requested)
    const maxRows = 7000;
    const rawProfiles = lines.slice(1)
      .filter(line => line.trim()) // Skip empty lines
      .slice(0, maxRows) // Limit to 7000 rows
      .map((line: string) => {
        const values = parseCSVLine(line);
        const profile: any = {};
        headers.forEach((header: string, index: number) => {
          profile[header] = values[index]?.replace(/^"|"$/g, '') || ''; // Remove quotes
        });
        return profile;
      })
      .filter(profile => Object.keys(profile).some(key => profile[key])); // Filter out empty profiles

    console.log(`✅ Parsed ${rawProfiles.length} profiles from CSV`);

    // Step 4: Convert to our format
    const profiles: InstagramProfile[] = [];
    
    rawProfiles.forEach((profile: any, index: number) => {
      // Extract username
      let username = '';
      const possibleUsernameFields = [
        'username', 'handle', 'Profile URL', 'profileUrl', 'url', 
        'Instagram Handle', 'instagram_handle', 'user', 'User'
      ];
      
      for (const field of possibleUsernameFields) {
        const value = profile[field];
        if (value) {
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
        return; // Skip profiles without username
      }

      // Extract image URL
      const imageUrl = profile.imgUrl || profile.imageUrl || profile['Image URL'] || profile.profilePictureUrl || profile['Profile Picture URL'] || profile.avatarUrl || profile.avatar || undefined;

      // Estimate age from bio
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

    console.log(`✅ Converted ${profiles.length} profiles from ${rawProfiles.length} CSV rows`);

    // Step 5: Save to Google Sheets
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

    // Clear existing data
    console.log('Clearing existing data...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'InstagramProfiles!A2:Z100000',
    });

    // Prepare header row
    const headersRow = ['id', 'username', 'fullName', 'bio', 'location', 'age', 'profession', 'followersCount', 'followingCount', 'postsCount', 'isVerified', 'profileUrl', 'imageUrl'];
    
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
    console.log(`Writing ${rows.length} profiles to Google Sheets...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'InstagramProfiles!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headersRow, ...rows],
      },
    });

    console.log(`✅ Successfully saved ${profiles.length} profiles to Google Sheets`);

    return res.status(200).json({
      success: true,
      message: `Successfully refreshed ${profiles.length} profiles from Phantombuster`,
      profilesCount: profiles.length,
      csvRows: rawProfiles.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error refreshing profiles:', error);
    return res.status(500).json({
      error: 'Failed to refresh profiles',
      message: error.message,
    });
  }
}

