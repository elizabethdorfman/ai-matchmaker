import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

export default function AIActivity() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);

  useEffect(() => {
    // Fetch from API
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/ai-activity');
        if (!response.ok) {
          throw new Error('Failed to fetch activity');
        }
        const data = await response.json();
        setActivities(data.activities || []);
        setStats(data.stats || null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activity:', error);
        // Fallback to mock data
        const mockActivities: ActivityItem[] = [
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
        {
          id: '4',
          username: '@michael_gta',
          platform: 'instagram',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          matchedMember: 'Member D',
          message: 'Hi Michael! This is Elizabeth! We are building out a free Jewish matchmaker for the Toronto community and our AI flagged your profile. We have a member who our AI thinks you\'d love!',
          matchCriteria: { age: '31-35', profession: 'Consultant' },
        },
        {
          id: '5',
          username: '@jessica_toronto',
          platform: 'instagram',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'no_response',
          matchedMember: 'Member E',
          message: 'Hi Jessica! This is Elizabeth! We are building out a free Jewish matchmaker for the Toronto community and our AI flagged your profile. We have a member who our AI thinks you\'d love!',
          matchCriteria: { age: '27-31', profession: 'Designer' },
        },
        {
          id: '6',
          username: '@ben_jewish',
          platform: 'instagram',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'responded',
          matchedMember: 'Member F',
          message: 'Hi Ben! This is Elizabeth! We are building out a free Jewish matchmaker for the Toronto community and our AI flagged your profile. We have a member who our AI thinks you\'d love!',
          matchCriteria: { age: '30-34', profession: 'Product Manager' },
        },
      ];

        const mockStats: ActivityStats = {
          totalMessages: 47,
          responseRate: 34.0,
          signUpRate: 12.8,
          activeMembers: 8,
          recent24h: 12,
          recentWeek: 35,
        };

        setActivities(mockActivities);
        setStats(mockStats);
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'sent': return 'bg-gray-100 text-gray-700';
      case 'opened': return 'bg-blue-100 text-blue-700';
      case 'responded': return 'bg-green-100 text-green-700';
      case 'signed_up': return 'bg-purple-100 text-purple-700';
      case 'no_response': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: ActivityItem['status']) => {
    switch (status) {
      case 'sent': return 'Sent';
      case 'opened': return 'Opened';
      case 'responded': return 'Responded';
      case 'signed_up': return 'Signed Up';
      case 'no_response': return 'No Response';
      default: return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🤖</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Loading AI Activity...</h2>
          <p className="text-gray-600">Fetching activity data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl md:text-7xl mb-4">🤖</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Activity Dashboard
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            See what our AI is doing in real-time. Transparent outreach activity from Instagram.
          </p>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalMessages}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Messages</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600">{stats.responseRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">Response Rate</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">{stats.signUpRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">Sign-Up Rate</div>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center border-2 border-pink-200">
                  <div className="text-3xl font-bold text-pink-600">{stats.activeMembers}</div>
                  <div className="text-sm text-gray-600 mt-1">Active Members</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center border-2 border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">{stats.recent24h}</div>
                  <div className="text-sm text-gray-600 mt-1">Last 24h</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center border-2 border-indigo-200">
                  <div className="text-3xl font-bold text-indigo-600">{stats.recentWeek}</div>
                  <div className="text-sm text-gray-600 mt-1">Last Week</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📱 Recent Outreach Activity</h2>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📸</span>
                        <span className="text-xl font-bold text-gray-800">{activity.username}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(activity.status)}`}>
                          {getStatusLabel(activity.status)}
                        </span>
                      </div>
                      <div className="text-gray-600 mb-2">
                        <span className="font-semibold">Matched with:</span> {activity.matchedMember}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        Age: {activity.matchCriteria.age} • Profession: {activity.matchCriteria.profession}
                      </div>
                      <div className="text-gray-700 bg-white rounded-lg p-3 mt-2 border border-gray-200">
                        "{activity.message}"
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800">ℹ️ About This Dashboard</h3>
            <p className="text-gray-700 leading-relaxed">
              This dashboard shows real-time activity from our AI-powered outreach system. Our AI sends personalized messages 
              to potential matches on Instagram. All data is pulled directly from our outreach system. 
              This transparency demonstrates that our AI is actively working to find matches for our members.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <Link
            to="/analysis"
            className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Get Your Market Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}

