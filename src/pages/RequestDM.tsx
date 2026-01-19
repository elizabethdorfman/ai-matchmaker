import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

interface DMRequestFormData {
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  notes: string;
}

export default function RequestDM() {
  const [profiles, setProfiles] = useState<InstagramProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'database' | 'username'>('database');
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<InstagramProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<DMRequestFormData>({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [automationEnabled] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/instagram-profiles');
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        setProfiles(data.profiles || []);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const defaultMessage = "This is matchmaker Aria. We have a member of the toronto jewish community that wanted to know if you're single?";

  const handleRequestDM = (profile: InstagramProfile) => {
    setSelectedProfile(profile);
    setShowModal(true);
    setSubmitStatus('idle');
    setFormData({
      requesterName: '',
      requesterEmail: '',
      requesterPhone: '',
      notes: '',
    });
    setCustomMessage(defaultMessage);
  };

  const handleUsernameSearch = () => {
    if (!usernameInput.trim()) return;
    
    // Clean username (remove @ and whitespace)
    const cleanUsername = usernameInput.trim().replace('@', '').replace(/\s+/g, '');
    
    // Create a profile object from the username
    const profile: InstagramProfile = {
      id: `username-${cleanUsername}`,
      username: cleanUsername,
      fullName: cleanUsername,
      profileUrl: `https://www.instagram.com/${cleanUsername}`,
    };
    
    handleRequestDM(profile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfile) return;

    // Validate form
    if (!formData.requesterName || !formData.requesterEmail) {
      setSubmitStatus('error');
      setSubmitMessage('Please fill in your name and email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.requesterEmail)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/sheets/request-dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterName: formData.requesterName,
          requesterEmail: formData.requesterEmail,
          requesterPhone: formData.requesterPhone,
          targetUsername: selectedProfile.username,
          targetFullName: selectedProfile.fullName,
          targetInstagramUrl: selectedProfile.profileUrl || `https://www.instagram.com/${selectedProfile.username.replace('@', '')}`,
          targetProfileId: selectedProfile.id,
          notes: formData.notes,
          automationEnabled: automationEnabled,
          messageTemplate: customMessage || defaultMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitStatus('success');
      setSubmitMessage(data.message || 'Your anonymous request has been submitted! We\'ll message you if they sign up, confirm they\'re single, and we see there\'s a match.');
      
      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setShowModal(false);
        setSubmitStatus('idle');
        setFormData({
          requesterName: '',
          requesterEmail: '',
          requesterPhone: '',
          notes: '',
        });
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting DM request:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl md:text-7xl mb-4">💌</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Anonymously Message Your Crush
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
            Interested in someone? We'll anonymously message them on Instagram asking if they're single. 
            If they sign up and confirm they're single, and we see there's a match, we'll message you!
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto mb-6">
            <p className="text-sm text-gray-700">
              <strong>📱 How It Works:</strong> Your request is completely anonymous. The matchmaker will personally send them a message asking if they're single. 
              If there's a match, we'll reach out to you - they'll never know who requested the message!
            </p>
          </div>
        </div>

        {/* Search Mode Toggle */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-100">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setSearchMode('database')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  searchMode === 'database'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Search Database
              </button>
              <button
                onClick={() => setSearchMode('username')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  searchMode === 'username'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔍 Search by Instagram Username
              </button>
            </div>
          </div>
        </div>

        {/* Search - Database Mode */}
        {searchMode === 'database' && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Profiles in Database
              </label>
              <input
                type="text"
                placeholder="Search by username, name, bio, profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-4 text-sm text-gray-600">
                {profiles.length > 0 ? (
                  <>Showing {filteredProfiles.length} of {profiles.length} profiles</>
                ) : (
                  <>Loading profiles...</>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search - Username Mode */}
        {searchMode === 'username' && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Instagram Username
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500">
                    <span className="px-3 text-gray-500">@</span>
                    <input
                      type="text"
                      placeholder="username (without @)"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUsernameSearch();
                        }
                      }}
                      className="flex-1 px-4 py-2 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter any Instagram username to anonymously message them. You don't need to find them in our database first.
                  </p>
                </div>
                <button
                  onClick={handleUsernameSearch}
                  disabled={!usernameInput.trim()}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-2 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Message Your Crush
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profiles Grid - Only show in database mode */}
        {searchMode === 'database' && (
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-200">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Profiles Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProfiles.slice(0, 20).map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:shadow-xl transition-shadow relative"
                  >
                    {/* Profile Image */}
                    <div className="absolute top-2 right-2 w-12 h-12 rounded overflow-hidden border-2 border-gray-200 shadow-sm">
                      {profile.imageUrl ? (
                        <img
                          src={`/api/image-proxy?url=${encodeURIComponent(profile.imageUrl)}`}
                          alt={profile.fullName || profile.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <div className="text-xs">👤</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Profile Header */}
                    <div className="flex items-start justify-between mb-4 pr-14">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {profile.fullName || profile.username}
                        </h3>
                        {profile.username && (
                          <a
                            href={`https://www.instagram.com/${profile.username.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {profile.username}
                          </a>
                        )}
                      </div>
                      {profile.isVerified && (
                        <span className="text-blue-500 text-xl" title="Verified">✓</span>
                      )}
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {profile.bio}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 text-sm mb-4">
                      {profile.location && (
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📍</span>
                          {profile.location}
                        </div>
                      )}
                      {profile.age && (
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">🎂</span>
                          Age: {profile.age}
                        </div>
                      )}
                      {profile.profession && (
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">💼</span>
                          {profile.profession}
                        </div>
                      )}
                    </div>

                    {/* Request DM Button */}
                    <button
                      onClick={() => handleRequestDM(profile)}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-4"
                    >
                      💌 Anonymously Message Your Crush
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Show More Indicator */}
              {filteredProfiles.length > 20 && (
                <div className="mt-8 text-center">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      Showing 20 of {filteredProfiles.length} profiles
                    </p>
                    <p className="text-sm text-gray-600">
                      Use the search above to find specific profiles
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        )}

        {/* Username Mode Info */}
        {searchMode === 'username' && !showModal && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-8 border-2 border-purple-200 text-center">
              <div className="text-5xl mb-4">💌</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Anonymously Message Any Instagram User
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Enter an Instagram username above to anonymously message them. 
                You'll see a preview of the message that will be sent, and then submit your request.
              </p>
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Example:</strong> Enter "johndoe" to anonymously message @johndoe on Instagram
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">Want to See More Profiles?</h3>
            <p className="text-xl mb-8 opacity-90">
              Browse our full community database
            </p>
            <Link
              to="/see-community"
              className="inline-block bg-white text-purple-600 px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Browse Community
            </Link>
          </div>
        </div>
      </div>

      {/* Request DM Modal */}
      {showModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Make an Anonymous Request
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSubmitStatus('idle');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>How it works:</strong> We'll send an anonymous message to {selectedProfile.fullName || selectedProfile.username} asking if they're single. 
                </p>
                <p className="text-sm text-gray-700">
                  <strong>What happens next:</strong> If they sign up and confirm they're single, and we see there's a match, <strong>we'll message you</strong> to let you know!
                </p>
                <p className="text-xs text-gray-600 italic mt-2">
                  Your request is anonymous - they won't know who requested the DM.
                </p>
              </div>

              {/* Message Editor - Customizable */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>💬</span>
                    <span>Message That Will Be Sent</span>
                  </h3>
                  <span className="text-xs bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-semibold">
                    EDITABLE
                  </span>
                </div>
                <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customize the message (optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none resize-y min-h-[100px] text-gray-700 leading-relaxed"
                    placeholder={defaultMessage}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This is the message that will be sent to {selectedProfile.fullName || selectedProfile.username}. You can edit it or use the default.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs text-gray-600">
                    <strong>📱 Delivery Method:</strong> {automationEnabled 
                      ? 'Automated via Phantombuster (if configured)' 
                      : 'Manual - Matchmaker will send personally'}
                  </p>
                </div>
              </div>


              {/* Form */}
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Request Submitted!</h3>
                  <p className="text-gray-700">{submitMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Why we need this:</strong> We need your name and email so we know who to match them with and to follow up with you. 
                      We'll message you when (and if) they sign up, confirm they're single, and we see there's a match.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.requesterName}
                      onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none text-gray-700"
                      placeholder="Enter your name"
                    />
                    <p className="text-xs text-gray-500 mt-1">So we know who to match them with</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.requesterEmail}
                      onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none text-gray-700"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll message you if there's a match</p>
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{submitMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSubmitStatus('idle');
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Make Anonymous Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

