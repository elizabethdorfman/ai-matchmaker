import { google } from 'googleapis';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

/**
 * Market Analysis API
 * 
 * This endpoint searches for real people on Instagram and LinkedIn using Phantombuster.
 * 
 * Setup Required:
 * 1. Get Phantombuster API key from https://phantombuster.com
 * 2. Create Instagram Hashtag Search Export phantom in Phantombuster
 * 3. Create LinkedIn Search phantom in Phantombuster
 * 4. Add to .env.local:
 *    - PHANTOMBUSTER_API_KEY=your_api_key
 *    - PHANTOMBUSTER_INSTAGRAM_PHANTOM_ID=your_instagram_phantom_id
 *    - PHANTOMBUSTER_LINKEDIN_PHANTOM_ID=your_linkedin_phantom_id
 * 
 * If Phantombuster is not configured, falls back to database + estimated data.
 */

interface MarketAnalysisRequest {
  ageMin: number;
  ageMax: number;
  location: string;
  religiousObservance?: string;
}

interface MarketAnalysisResponse {
  totalMatches: number;
  platformBreakdown: {
    instagram: number;
    linkedin: number;
  };
  criteriaBreakdown: {
    byAge: { [key: string]: number };
    byLocation: { [key: string]: number };
    byProfession: { [key: string]: number };
  };
  sampleProfiles: Array<{
    id: string;
    age: number;
    location: string;
    profession: string;
    platform: 'instagram' | 'linkedin';
    username?: string;
    bio?: string;
  }>;
  source: 'database' | 'phantombuster' | 'estimated';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ageMin, ageMax, location, religiousObservance }: MarketAnalysisRequest = req.body;

    if (!ageMin || !ageMax || !location) {
      return res.status(400).json({ error: 'Missing required fields: ageMin, ageMax, location' });
    }

    // Get data from Google Sheets (existing database)
    const sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEET_ID;
    if (!sheetId) {
      return res.status(500).json({ error: 'Google Sheet ID not configured' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read user data from Users sheet (existing signups)
    const usersRange = 'Users!A2:Z1000';
    const usersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: usersRange,
    });

    // Read Instagram profiles from Phantombuster (if you have a separate sheet)
    // Create a sheet called "InstagramProfiles" with Phantombuster data
    const instagramProfilesSheetId = process.env.INSTAGRAM_PROFILES_SHEET_ID || sheetId; // Use same sheet or separate
    const instagramRange = 'InstagramProfiles!A2:Z10000'; // Adjust based on your data
    let instagramRows: any[][] = [];
    
    try {
      const instagramResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: instagramProfilesSheetId,
        range: instagramRange,
      });
      instagramRows = instagramResponse.data.values || [];
    } catch (error) {
      console.log('No Instagram profiles sheet found, using database only');
    }

    const rows = usersResponse.data.values || [];
    
    // Filter and analyze data
    const matches: any[] = [];
    const byAge: { [key: string]: number } = {};
    const byLocation: { [key: string]: number } = {};
    const byProfession: { [key: string]: number } = {};

    // Parse user rows (existing signups)
    // Assuming: 0=userId, 1=signupDate, 2=name, 3=dateOfBirth, 4=height, 5=email, 6=phone, 7=location, 8=religiousObservance, 9=education, 10=university, 11=role, 12=company, 13=industry
    rows.forEach((row, index) => {
      if (!row[2] || !row[3]) return; // Skip if no name or date of birth

      try {
        // Calculate age from date of birth
        const dob = new Date(row[3]);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

        // Check if matches criteria
        if (actualAge < ageMin || actualAge > ageMax) return;
        
        const userLocation = row[7] || '';
        if (location !== 'Both' && !userLocation.toLowerCase().includes(location.toLowerCase())) {
          return;
        }

        if (religiousObservance && row[8] && row[8] !== religiousObservance) {
          return;
        }

        // It's a match!
        matches.push({
          id: row[0] || `user_${index}`,
          age: actualAge,
          location: userLocation,
          profession: row[11] || row[13] || 'Professional', // role or industry
          industry: row[13] || '',
        });

        // Count by age range
        const ageRange = `${Math.floor(actualAge / 5) * 5}-${Math.floor(actualAge / 5) * 5 + 4}`;
        byAge[ageRange] = (byAge[ageRange] || 0) + 1;

        // Count by location
        const loc = userLocation.includes('Toronto') ? 'Toronto' : 'GTA';
        byLocation[loc] = (byLocation[loc] || 0) + 1;

        // Count by profession/industry
        const prof = row[13] || row[11] || 'Other';
        byProfession[prof] = (byProfession[prof] || 0) + 1;
      } catch (error) {
        // Skip invalid rows
        console.error(`Error processing row ${index}:`, error);
      }
    });

    const databaseMatches = matches.length;

    // Process Instagram profiles from Phantombuster data
    // Option 1: From Google Sheets (if you exported there)
    // Option 2: Directly from Phantombuster API (no download needed!)
    const instagramProfilesFromSheet: any[] = [];
    
    // Try to fetch directly from Phantombuster API first (free, no download needed)
    const phantombusterApiKey = process.env.PHANTOMBUSTER_API_KEY;
    const followerCollectorPhantomId = process.env.PHANTOMBUSTER_FOLLOWER_COLLECTOR_ID;
    
    if (phantombusterApiKey && followerCollectorPhantomId) {
      try {
        // Fetch results directly from Phantombuster API
        const phantombusterResponse = await fetch(
          `https://api.phantombuster.com/api/v2/agents/fetch-output?id=${followerCollectorPhantomId}`,
          {
            headers: {
              'X-Phantombuster-Key': phantombusterApiKey,
            },
          }
        );

        if (phantombusterResponse.ok) {
          const phantombusterData = await phantombusterResponse.json();
          // Phantombuster returns data in output.output or output.csv
          let phantombusterProfiles: any[] = [];
          
          if (phantombusterData.output) {
            // If it's an array, use it directly
            if (Array.isArray(phantombusterData.output)) {
              phantombusterProfiles = phantombusterData.output;
            } 
            // If it's a CSV string, parse it
            else if (typeof phantombusterData.output === 'string' && phantombusterData.output.includes(',')) {
              const lines = phantombusterData.output.split('\n');
              const headers = lines[0].split(',');
              phantombusterProfiles = lines.slice(1).map((line: string) => {
                const values = line.split(',');
                const profile: any = {};
                headers.forEach((header: string, index: number) => {
                  profile[header.trim()] = values[index]?.trim() || '';
                });
                return profile;
              });
            }
          }

          // Process Phantombuster profiles
          phantombusterProfiles.forEach((profile: any, index: number) => {
            const username = profile.username || profile.handle || profile['Profile URL'] || '';
            if (!username) return;

            const fullName = profile.fullName || profile.name || '';
            const bio = (profile.bio || profile.description || '').toLowerCase();
            const locationText = (profile.location || '').toLowerCase();
            
            // Filter for Jewish/Toronto indicators
            const jewishIndicators = [
              'jewish', 'jew', 'judaism', 'synagogue', 'shabbat', 'kosher',
              'torah', 'hebrew', 'israel', 'jcc', 'ujafederation', 'chabad',
              'hillel', 'jewish professional', 'cyp', 'young jewish'
            ];
            const torontoIndicators = ['toronto', 'gta', '6ix', 'yonge', 'downtown toronto', 'ontario'];
            
            const hasJewish = jewishIndicators.some(indicator => 
              bio.includes(indicator) || username.toLowerCase().includes(indicator) || fullName.toLowerCase().includes(indicator)
            );
            const hasToronto = torontoIndicators.some(indicator =>
              bio.includes(indicator) || locationText.includes(indicator) || username.toLowerCase().includes(indicator)
            );

            // Only include if has Jewish indicators
            if (hasJewish) {
              const estimatedAge = estimateAgeFromProfile({ bio, fullName });
              
              // Filter by age range
              if (estimatedAge >= ageMin && estimatedAge <= ageMax) {
                const profession = extractProfession({ bio, fullName }) || 'Professional';
                const profileLocation = extractLocation({ location: locationText, bio }) || location;
                
                instagramProfilesFromSheet.push({
                  id: `ig_pb_${index}`,
                  age: estimatedAge,
                  location: profileLocation,
                  profession: profession,
                  platform: 'instagram' as const,
                  username: username.startsWith('@') ? username : `@${username}`,
                  bio: profile.bio || profile.description || '',
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching from Phantombuster API:', error);
        // Fall back to Google Sheets if API fails
      }
    }
    
    // Fallback: Process from Google Sheets if API didn't work
    if (instagramProfilesFromSheet.length === 0 && instagramRows.length > 0) {
      // Phantombuster Following Collector typically outputs:
      // Column 0: username, Column 1: fullName, Column 2: bio, Column 3: followersCount, etc.
      // Adjust these indices based on your actual Phantombuster output
      instagramRows.forEach((row, index) => {
        if (!row[0]) return; // Skip if no username
        
        const username = row[0] || '';
        const fullName = row[1] || '';
        const bio = (row[2] || '').toLowerCase();
        const locationText = (row[3] || row[4] || '').toLowerCase(); // Location might be in different column
        
        // Filter for Jewish/Toronto indicators
        const jewishIndicators = [
          'jewish', 'jew', 'judaism', 'synagogue', 'shabbat', 'kosher',
          'torah', 'hebrew', 'israel', 'jcc', 'ujafederation', 'chabad',
          'hillel', 'jewish professional', 'cyp', 'young jewish'
        ];
        const torontoIndicators = ['toronto', 'gta', '6ix', 'yonge', 'downtown toronto', 'ontario'];
        
        const hasJewish = jewishIndicators.some(indicator => 
          bio.includes(indicator) || username.toLowerCase().includes(indicator) || fullName.toLowerCase().includes(indicator)
        );
        const hasToronto = torontoIndicators.some(indicator =>
          bio.includes(indicator) || locationText.includes(indicator) || username.toLowerCase().includes(indicator)
        );

        // Only include if has Jewish indicators (Toronto is optional for now, you can make it required)
        if (hasJewish) {
          const estimatedAge = estimateAgeFromProfile({ bio, fullName });
          
          // Filter by age range
          if (estimatedAge >= ageMin && estimatedAge <= ageMax) {
            const profession = extractProfession({ bio, fullName }) || 'Professional';
            const profileLocation = extractLocation({ location: locationText, bio }) || location;
            
            instagramProfilesFromSheet.push({
              id: `ig_${index}`,
              age: estimatedAge,
              location: profileLocation,
              profession: profession,
              platform: 'instagram' as const,
              username: username.startsWith('@') ? username : `@${username}`,
              bio: row[2] || '',
            });
          }
        }
      });
    }

    // Search Instagram and LinkedIn using Phantombuster API (if configured)
    let instagramProfiles: any[] = [];
    let linkedinProfiles: any[] = [];
    let phantombusterSource = false;

    const phantombusterApiKey = process.env.PHANTOMBUSTER_API_KEY;
    const instagramPhantomId = process.env.PHANTOMBUSTER_INSTAGRAM_PHANTOM_ID;
    const linkedinPhantomId = process.env.PHANTOMBUSTER_LINKEDIN_PHANTOM_ID;

    // Search Instagram if configured
    if (phantombusterApiKey && instagramPhantomId) {
      try {
        // Launch Instagram hashtag search phantom
        const instagramHashtags = [
          '#torontojewish',
          '#jewishtoronto',
          '#torontojewishcommunity',
          '#jewishdating',
          '#torontojewishlife',
        ].join(',');

        // Launch the phantom with search criteria
        const launchResponse = await fetch(
          `https://api.phantombuster.com/api/v2/agents/launch`,
          {
            method: 'POST',
            headers: {
              'X-Phantombuster-Key': phantombusterApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: instagramPhantomId,
              argument: {
                hashtags: instagramHashtags,
                location: location === 'Both' ? 'Toronto' : location,
                numberOfPostsPerHashtag: 50, // Limit to avoid rate limits
              },
            }),
          }
        );

        if (launchResponse.ok) {
          // Wait a bit for the phantom to run, then fetch results
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Fetch output from the phantom
          const outputResponse = await fetch(
            `https://api.phantombuster.com/api/v2/agents/fetch-output?id=${instagramPhantomId}`,
            {
              headers: {
                'X-Phantombuster-Key': phantombusterApiKey,
              },
            }
          );

          if (outputResponse.ok) {
            const outputData = await outputResponse.json();
            // Parse Instagram results (format depends on phantom output)
            if (outputData.output && Array.isArray(outputData.output)) {
              instagramProfiles = outputData.output
                .filter((profile: any) => {
                  // Filter for Jewish/Toronto indicators
                  const bio = (profile.bio || profile.description || '').toLowerCase();
                  const username = (profile.username || profile.handle || '').toLowerCase();
                  const locationText = (profile.location || '').toLowerCase();
                  
                  const jewishIndicators = [
                    'jewish', 'jew', 'judaism', 'synagogue', 'shabbat', 'kosher',
                    'torah', 'hebrew', 'israel', 'jcc', 'ujafederation'
                  ];
                  const torontoIndicators = ['toronto', 'gta', '6ix', 'yonge', 'downtown toronto'];
                  
                  const hasJewish = jewishIndicators.some(indicator => 
                    bio.includes(indicator) || username.includes(indicator)
                  );
                  const hasToronto = torontoIndicators.some(indicator =>
                    bio.includes(indicator) || locationText.includes(indicator) || username.includes(indicator)
                  );

                  return hasJewish && hasToronto;
                })
                .slice(0, 100); // Limit results
              phantombusterSource = true;
            }
          }
        }
      } catch (error) {
        console.error('Instagram Phantombuster search error:', error);
        // Continue with database/estimated data if Phantombuster fails
      }
    }

    // Search LinkedIn if configured
    if (phantombusterApiKey && linkedinPhantomId) {
      try {
        // Launch LinkedIn search phantom
        const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=Jewish%20Toronto&origin=GLOBAL_SEARCH_HEADER`;
        
        const launchResponse = await fetch(
          `https://api.phantombuster.com/api/v2/agents/launch`,
          {
            method: 'POST',
            headers: {
              'X-Phantombuster-Key': phantombusterApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: linkedinPhantomId,
              argument: {
                searchUrl: linkedinSearchUrl,
                numberOfProfiles: 50,
              },
            }),
          }
        );

        if (launchResponse.ok) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const outputResponse = await fetch(
            `https://api.phantombuster.com/api/v2/agents/fetch-output?id=${linkedinPhantomId}`,
            {
              headers: {
                'X-Phantombuster-Key': phantombusterApiKey,
              },
            }
          );

          if (outputResponse.ok) {
            const outputData = await outputResponse.json();
            if (outputData.output && Array.isArray(outputData.output)) {
              linkedinProfiles = outputData.output
                .filter((profile: any) => {
                  const headline = (profile.headline || profile.title || '').toLowerCase();
                  const location = (profile.location || '').toLowerCase();
                  const summary = (profile.summary || '').toLowerCase();
                  
                  const hasToronto = location.includes('toronto') || location.includes('gta');
                  const hasJewish = headline.includes('jewish') || summary.includes('jewish') ||
                    headline.includes('synagogue') || summary.includes('synagogue');
                  
                  return hasToronto && hasJewish;
                })
                .slice(0, 50);
              phantombusterSource = true;
            }
          }
        }
      } catch (error) {
        console.error('LinkedIn Phantombuster search error:', error);
      }
    }

    // Combine and analyze all profiles
    const allProfiles = [
      ...matches.map(m => ({ ...m, platform: 'database' as const })),
      ...instagramProfilesFromSheet, // Profiles from Google Sheets (Phantombuster data)
      ...instagramProfiles.map((p, idx) => ({
        id: `ig_api_${idx}`,
        age: estimateAgeFromProfile(p), // Estimate age from profile data
        location: extractLocation(p) || location,
        profession: extractProfession(p) || 'Professional',
        platform: 'instagram' as const,
        username: p.username || p.handle,
        bio: p.bio || p.description,
      })),
      ...linkedinProfiles.map((p, idx) => ({
        id: `li_${idx}`,
        age: estimateAgeFromProfile(p),
        location: extractLocation(p) || location,
        profession: p.headline || p.title || 'Professional',
        platform: 'linkedin' as const,
        username: p.profileUrl,
        bio: p.summary,
      })),
    ];
    
    // Mark source as phantombuster if we have Instagram data
    if (instagramProfilesFromSheet.length > 0 || instagramProfiles.length > 0) {
      phantombusterSource = true;
    }

    // Filter by age range
    const ageFilteredProfiles = allProfiles.filter(p => {
      if (p.platform === 'database') return true; // Database profiles already filtered
      return p.age >= ageMin && p.age <= ageMax;
    });

    // Count by platform
    const instagramCount = ageFilteredProfiles.filter(p => p.platform === 'instagram').length;
    const linkedinCount = ageFilteredProfiles.filter(p => p.platform === 'linkedin').length;
    const totalMatches = ageFilteredProfiles.length;

    // Recalculate breakdowns with all profiles
    const finalByAge: { [key: string]: number } = {};
    const finalByLocation: { [key: string]: number } = {};
    const finalByProfession: { [key: string]: number } = {};

    ageFilteredProfiles.forEach(profile => {
      const ageRange = `${Math.floor(profile.age / 5) * 5}-${Math.floor(profile.age / 5) * 5 + 4}`;
      finalByAge[ageRange] = (finalByAge[ageRange] || 0) + 1;

      const loc = profile.location.includes('Toronto') ? 'Toronto' : 'GTA';
      finalByLocation[loc] = (finalByLocation[loc] || 0) + 1;

      const prof = profile.profession || 'Other';
      finalByProfession[prof] = (finalByProfession[prof] || 0) + 1;
    });

    // Create sample profiles (mix of database and social media)
    const sampleProfiles = ageFilteredProfiles
      .filter(p => p.platform !== 'database') // Prefer social media profiles for samples
      .slice(0, 5)
      .map(profile => ({
        id: profile.id,
        age: profile.age,
        location: profile.location,
        profession: profile.profession,
        platform: profile.platform,
        username: 'username' in profile ? profile.username : undefined,
        bio: 'bio' in profile ? profile.bio : undefined,
      }));

    // If we don't have enough samples, add from database
    if (sampleProfiles.length < 5) {
      const dbSamples = matches.slice(0, 5 - sampleProfiles.length).map((match, idx) => ({
        id: match.id,
        age: match.age,
        location: match.location,
        profession: match.profession,
        platform: (idx % 2 === 0 ? 'instagram' : 'linkedin') as const,
      }));
      sampleProfiles.push(...dbSamples);
    }

    const result: MarketAnalysisResponse = {
      totalMatches,
      platformBreakdown: {
        instagram: instagramCount,
        linkedin: linkedinCount,
      },
      criteriaBreakdown: {
        byAge: finalByAge,
        byLocation: finalByLocation,
        byProfession: finalByProfession,
      },
      sampleProfiles: sampleProfiles.slice(0, 5),
      source: phantombusterSource ? 'phantombuster' : (databaseMatches > 0 ? 'database' : 'estimated'),
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Market analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze market',
      message: error.message 
    });
  }
}

// Helper functions to extract data from social media profiles
function estimateAgeFromProfile(profile: any): number {
  // Try to extract age from bio/description
  const text = (profile.bio || profile.description || profile.headline || '').toLowerCase();
  const ageMatch = text.match(/\b(\d{2})\b/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 18 && age <= 100) return age;
  }
  
  // Estimate from profile indicators (graduation year, etc.)
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    const currentYear = new Date().getFullYear();
    const estimatedAge = currentYear - year;
    if (estimatedAge >= 18 && estimatedAge <= 100) return estimatedAge;
  }
  
  // Default to middle of common age range
  return 30;
}

function extractLocation(profile: any): string | null {
  const location = profile.location || profile.city || '';
  if (location.toLowerCase().includes('toronto')) return 'Toronto';
  if (location.toLowerCase().includes('gta') || location.toLowerCase().includes('greater toronto')) return 'GTA';
  return null;
}

function extractProfession(profile: any): string | null {
  return profile.profession || profile.title || profile.headline || profile.role || null;
}

