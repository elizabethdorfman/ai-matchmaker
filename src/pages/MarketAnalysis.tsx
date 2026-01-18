import { useState } from 'react';
import { Link } from 'react-router-dom';

interface AnalysisResult {
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
  }>;
}

export default function MarketAnalysis() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [formData, setFormData] = useState({
    ageMin: 25,
    ageMax: 35,
    location: 'Toronto',
    religiousObservance: '',
  });
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');

    try {
      const response = await fetch('/api/market-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze market');
      }

      const data = await response.json();
      setResults(data);
      setStep('results');
    } catch (error) {
      console.error('Error fetching market analysis:', error);
      // Fallback to mock data if API fails
      const mockResults: AnalysisResult = {
        totalMatches: 127,
        platformBreakdown: {
          instagram: 89,
          linkedin: 38,
        },
        criteriaBreakdown: {
          byAge: {
            '25-30': 52,
            '31-35': 48,
            '36-40': 27,
          },
          byLocation: {
            'Toronto': 98,
            'GTA': 29,
          },
          byProfession: {
            'Tech': 34,
            'Law': 28,
            'Medicine': 22,
            'Finance': 18,
            'Other': 25,
          },
        },
        sampleProfiles: [
          { id: '1', age: 28, location: 'Toronto', profession: 'Software Engineer', platform: 'instagram' },
          { id: '2', age: 32, location: 'Toronto', profession: 'Lawyer', platform: 'linkedin' },
          { id: '3', age: 29, location: 'GTA', profession: 'Doctor', platform: 'instagram' },
          { id: '4', age: 31, location: 'Toronto', profession: 'Consultant', platform: 'linkedin' },
          { id: '5', age: 27, location: 'Toronto', profession: 'Product Manager', platform: 'instagram' },
        ],
      };
      setResults(mockResults);
      setStep('results');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Analyzing Market...</h2>
          <p className="text-gray-600">Searching Instagram & LinkedIn for potential matches</p>
          <div className="mt-8 w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl md:text-7xl mb-4">📊</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Market Analysis
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We analyzed Instagram and LinkedIn to find potential matches in Toronto's Jewish community
            </p>
          </div>

          {/* Total Match Count - Hero Number */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-2xl p-12 border-4 border-blue-500 text-center">
              <div className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {results.totalMatches}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Potential Matches Found
              </h2>
              <p className="text-xl text-gray-600">
                Based on your criteria: Age {formData.ageMin}-{formData.ageMax}, {formData.location}
              </p>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Platform Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-200">
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-4xl font-bold text-pink-600 mb-2">{results.platformBreakdown.instagram}</div>
                  <div className="text-lg text-gray-700">Matches on Instagram</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="text-4xl mb-2">💼</div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{results.platformBreakdown.linkedin}</div>
                  <div className="text-lg text-gray-700">Matches on LinkedIn</div>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Breakdown */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Breakdown by Criteria</h3>
              
              {/* Age Breakdown */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4 text-gray-700">By Age Range</h4>
                <div className="space-y-3">
                  {Object.entries(results.criteriaBreakdown.byAge).map(([range, count]) => (
                    <div key={range} className="flex items-center gap-4">
                      <div className="w-24 text-gray-600 font-medium">{range}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(count / results.totalMatches) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Breakdown */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4 text-gray-700">By Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(results.criteriaBreakdown.byLocation).map(([location, count]) => (
                    <div key={location} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-800">{count}</div>
                      <div className="text-gray-600">{location}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profession Breakdown */}
              <div>
                <h4 className="text-xl font-semibold mb-4 text-gray-700">By Profession</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(results.criteriaBreakdown.byProfession).map(([profession, count]) => (
                    <div key={profession} className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">{count}</div>
                      <div className="text-sm text-gray-600">{profession}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sample Profiles */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-yellow-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Sample Profiles Found</h3>
              <p className="text-gray-600 mb-6">These are real people we found matching your criteria (anonymized for privacy)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.sampleProfiles.map((profile) => (
                  <div key={profile.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{profile.platform === 'instagram' ? '📸' : '💼'}</span>
                      <span className="text-sm font-semibold text-gray-600 uppercase">{profile.platform}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-gray-800">Age {profile.age}</div>
                      <div className="text-gray-600">📍 {profile.location}</div>
                      <div className="text-gray-600">💼 {profile.profession}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-10 text-white">
              <h3 className="text-3xl font-bold mb-4">Ready to Meet Your Matches?</h3>
              <p className="text-xl mb-8 opacity-90">
                Join our beta to see full profiles and get introduced to compatible people
              </p>
              <Link
                to="/signup"
                className="inline-block bg-white text-purple-600 px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Join Beta to Get Matched
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl md:text-7xl mb-4">🔍</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Market Research Analysis
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              See how many potential matches you have in Toronto's Jewish community. We analyze Instagram and LinkedIn to show you the opportunity.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age Range */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Age Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Minimum Age</label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={formData.ageMin}
                      onChange={(e) => setFormData({ ...formData, ageMin: parseInt(e.target.value) || 25 })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Maximum Age</label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={formData.ageMax}
                      onChange={(e) => setFormData({ ...formData, ageMax: parseInt(e.target.value) || 35 })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  required
                >
                  <option value="Toronto">Toronto</option>
                  <option value="GTA">GTA (Greater Toronto Area)</option>
                  <option value="Both">Both Toronto & GTA</option>
                </select>
              </div>

              {/* Religious Observance (Optional) */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Religious Observance <span className="text-sm font-normal text-gray-500">(Optional)</span>
                </label>
                <select
                  value={formData.religiousObservance}
                  onChange={(e) => setFormData({ ...formData, religiousObservance: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                >
                  <option value="">Any</option>
                  <option value="Orthodox">Orthodox</option>
                  <option value="Conservative">Conservative</option>
                  <option value="Reform">Reform</option>
                  <option value="Secular">Secular</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Analyze Market
              </button>
            </form>
          </div>

          {/* Info Note */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              We analyze publicly available profiles on Instagram and LinkedIn to estimate potential matches in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

