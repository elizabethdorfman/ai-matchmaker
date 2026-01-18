import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

interface ActivityItem {
  id: string;
  username: string;
  platform: 'instagram';
  timestamp: string;
  status: 'sent' | 'opened' | 'responded' | 'signed_up' | 'no_response';
  matchedMember: string;
  message: string;
  matchCriteria: {
    age: string;
    profession: string;
  };
}

interface ActivityStats {
  totalMessages: number;
  responseRate: number;
  signUpRate: number;
  activeMembers: number;
  recent24h: number;
  recentWeek: number;
}

interface ActivityResponse {
  activities: ActivityItem[];
  stats: ActivityStats;
  source: 'phantombuster' | 'mock';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PHANTOMBUSTER_API_KEY;
    const phantomId = process.env.PHANTOMBUSTER_INSTAGRAM_PHANTOM_ID;

    // Check if Phantombuster is configured
    if (!apiKey || !phantomId) {
      // Return mock data if Phantombuster is not set up yet
      console.log('Phantombuster not configured - returning mock data');
      const mockResponse: ActivityResponse = {
        activities: [
          {
            id: '1',
            username: '@sarah_toronto',
            platform: 'instagram',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'responded',
            matchedMember: 'Member A',
            message: 'This is matchmaker Aria. We have a member of the toronto jewish community that wanted to know if you\'re single?',
            matchCriteria: { age: '28-32', profession: 'Lawyer' },
          },
          {
            id: '2',
            username: '@david_jewish',
            platform: 'instagram',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            status: 'opened',
            matchedMember: 'Member B',
            message: 'Hi David! This is Aria! We are building out a free Jewish matchmaker for the Toronto community and our AI flagged your profile. We have a member who our AI thinks you\'d love!',
            matchCriteria: { age: '26-30', profession: 'Doctor' },
          },
          {
            id: '3',
            username: '@rachel_toronto',
            platform: 'instagram',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            status: 'signed_up',
            matchedMember: 'Member C',
            message: 'Hi Rachel! This is Elizabeth! We are building out a free Jewish matchmaker for the Toronto community and our AI flagged your profile. We have a member who our AI thinks you\'d love!',
            matchCriteria: { age: '29-33', profession: 'Engineer' },
          },
        ],
        stats: {
          totalMessages: 47,
          responseRate: 34.0,
          signUpRate: 12.8,
          activeMembers: 8,
          recent24h: 12,
          recentWeek: 35,
        },
        source: 'mock',
      };
      return res.status(200).json(mockResponse);
    }

    // Fetch from Phantombuster API
    try {
      const response = await fetch(
        `https://api.phantombuster.com/api/v2/agents/fetch-output?id=${phantomId}`,
        {
          headers: {
            'X-Phantombuster-Key': apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Phantombuster API error: ${response.status}`);
      }

      const phantombusterData = await response.json();
      
      // Parse Phantombuster output
      // The exact structure depends on how your phantom outputs data
      // This is a placeholder - you'll need to adjust based on actual Phantombuster output format
      const activities: ActivityItem[] = [];
      
      // Example parsing (adjust based on actual Phantombuster output):
      // If Phantombuster returns CSV/JSON with columns: username, timestamp, status, message, etc.
      if (Array.isArray(phantombusterData)) {
        phantombusterData.forEach((item: any, index: number) => {
          activities.push({
            id: item.id || `activity_${index}`,
            username: item.username || item.handle || `@user_${index}`,
            platform: 'instagram',
            timestamp: item.timestamp || item.date || new Date().toISOString(),
            status: mapStatus(item.status || 'sent'),
            matchedMember: item.matchedMember || `Member ${String.fromCharCode(65 + (index % 26))}`,
            message: item.message || item.text || '',
            matchCriteria: {
              age: item.ageRange || '25-35',
              profession: item.profession || 'Professional',
            },
          });
        });
      }

      // Calculate stats
      const totalMessages = activities.length;
      const responded = activities.filter(a => a.status === 'responded' || a.status === 'signed_up').length;
      const signedUp = activities.filter(a => a.status === 'signed_up').length;
      const now = Date.now();
      const recent24h = activities.filter(a => {
        const time = new Date(a.timestamp).getTime();
        return (now - time) < 24 * 60 * 60 * 1000;
      }).length;
      const recentWeek = activities.filter(a => {
        const time = new Date(a.timestamp).getTime();
        return (now - time) < 7 * 24 * 60 * 60 * 1000;
      }).length;

      const stats: ActivityStats = {
        totalMessages,
        responseRate: totalMessages > 0 ? (responded / totalMessages) * 100 : 0,
        signUpRate: totalMessages > 0 ? (signedUp / totalMessages) * 100 : 0,
        activeMembers: new Set(activities.map(a => a.matchedMember)).size,
        recent24h,
        recentWeek,
      };

      const result: ActivityResponse = {
        activities: activities.slice(0, 50), // Limit to most recent 50
        stats,
        source: 'phantombuster',
      };

      return res.status(200).json(result);
    } catch (apiError: any) {
      console.error('Phantombuster API error:', apiError);
      // Return mock data if API fails
      const mockResponse: ActivityResponse = {
        activities: [],
        stats: {
          totalMessages: 0,
          responseRate: 0,
          signUpRate: 0,
          activeMembers: 0,
          recent24h: 0,
          recentWeek: 0,
        },
        source: 'mock',
      };
      return res.status(200).json(mockResponse);
    }
  } catch (error: any) {
    console.error('AI Activity API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch AI activity',
      message: error.message 
    });
  }
}

function mapStatus(status: string): ActivityItem['status'] {
  const normalized = status.toLowerCase();
  if (normalized.includes('responded') || normalized.includes('response')) return 'responded';
  if (normalized.includes('signed') || normalized.includes('signup')) return 'signed_up';
  if (normalized.includes('opened') || normalized.includes('read')) return 'opened';
  if (normalized.includes('no response') || normalized.includes('no_response')) return 'no_response';
  return 'sent';
}

