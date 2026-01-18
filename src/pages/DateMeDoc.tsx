import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSheetData } from '../lib/googleSheets';

export default function DateMeDoc() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userData = await getSheetData(userId!);
      if (!userData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      // Calculate age from date of birth
      const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return null;
        const birthDate = new Date(dateOfBirth);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const age = calculateAge(userData['Date of Birth'] || userData.dateOfBirth);
      
      // Try multiple possible column name variations
      const headshotUrl = userData['Headshot Photo URL'] || 
                          userData['HeadshotPhotoUrl'] || 
                          userData.headshotPhotoUrl || 
                          userData['Headshot URL'] ||
                          '';
      
      const fullBodyUrl = userData['Full Body Photo URL'] || 
                          userData['FullBodyPhotoUrl'] || 
                          userData.fullBodyPhotoUrl || 
                          userData['Full Body URL'] ||
                          '';
      
      setProfile({
        name: userData.Name || userData.name || 'User',
        age,
        height: userData.Height || userData.height || '',
        location: userData.Location || userData.location || '',
        religiousObservance: userData['Religious Observance'] || userData.religiousObservance || '',
        education: userData.Education || userData.education || '',
        university: userData.University || userData.university || '',
        role: userData.Role || userData.role || '',
        company: userData.Company || userData.company || '',
        industry: userData.Industry || userData.industry || '',
        interests: userData.Interests || userData.interests || '',
        values: userData.Values || userData.values || '',
        agePreferenceMin: userData['Age Preference Min'] || userData.agePreferenceMin || '',
        agePreferenceMax: userData['Age Preference Max'] || userData.agePreferenceMax || '',
        otherPreferences: userData['Other Preferences'] || userData.otherPreferences || '',
        instagramHandle: userData['Instagram Handle'] || userData.instagramHandle || '',
        linkedInUrl: userData['LinkedIn URL'] || userData.linkedInUrl || '',
        headshotUrl,
        fullBodyUrl,
        videoUrl: userData['Video URL'] || userData.videoUrl || '',
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleRequestMatch = () => {
    navigate(`/signup?requestMatch=${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">💕</div>
          <p className="text-xl text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The profile you\'re looking for doesn\'t exist.'}</p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Buttons - Fixed Top */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between">
        <a
          href="/"
          className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600"
        >
          <span>🏠</span>
          <span>Home</span>
        </a>
        <button
          onClick={copyLink}
          className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600"
        >
          <span>🔗</span>
          <span>Share</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8 border-2 border-yellow-100">
            <div className="text-center">
              {/* Circular Headshot */}
              {profile.headshotUrl ? (
                <div className="flex justify-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-36 h-36 md:w-48 md:h-48 rounded-full p-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                        <img
                          src={profile.headshotUrl}
                          alt={`${profile.name} headshot`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center text-6xl md:text-7xl">
                    💕
                  </div>
                </div>
              )}
              <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {profile.name}'s Date Me Doc
              </h1>
              <p className="text-lg text-gray-600 mb-8">A thoughtful profile for meaningful connections</p>
            </div>

            {/* Full Body Photo */}
            {profile.fullBodyUrl && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={profile.fullBodyUrl}
                  alt={`${profile.name} full body`}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}

            {/* Video */}
            {profile.videoUrl && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <video
                  src={profile.videoUrl}
                  controls
                  className="w-full h-auto"
                  poster={profile.headshotUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-blue-100">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📋</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Basic Information
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.age && (
                <div>
                  <span className="text-gray-600 font-medium">Age:</span>
                  <span className="ml-2 text-gray-800 font-semibold">{profile.age}</span>
                </div>
              )}
              {profile.height && (
                <div>
                  <span className="text-gray-600 font-medium">Height:</span>
                  <span className="ml-2 text-gray-800 font-semibold">{profile.height}</span>
                </div>
              )}
              {profile.location && (
                <div>
                  <span className="text-gray-600 font-medium">Location:</span>
                  <span className="ml-2 text-gray-800 font-semibold">{profile.location}</span>
                </div>
              )}
              {profile.religiousObservance && (
                <div>
                  <span className="text-gray-600 font-medium">Religious Observance:</span>
                  <span className="ml-2 text-gray-800 font-semibold">{profile.religiousObservance}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Background */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-purple-100">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>💼</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Professional Background
              </span>
            </h2>
            <div className="space-y-3">
              {profile.education && (
                <div>
                  <span className="text-gray-600 font-medium">Education:</span>
                  <span className="ml-2 text-gray-800 font-semibold">
                    {profile.education}
                    {profile.university && ` (${profile.university})`}
                  </span>
                </div>
              )}
              {profile.role && (
                <div>
                  <span className="text-gray-600 font-medium">Role:</span>
                  <span className="ml-2 text-gray-800 font-semibold">{profile.role}</span>
                </div>
              )}
              {profile.company && (
                <div>
                  <span className="text-gray-600 font-medium">Company:</span>
                  <span className="ml-2 text-gray-800 font-semibold">{profile.company}</span>
                </div>
              )}
              {profile.industry && (
                <div>
                  <span className="text-gray-600 font-medium">Industry:</span>
                  <span className="ml-2 text-gray-800 font-semibold">{profile.industry}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          {profile.interests && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-pink-100">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span>🎯</span>
                <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  Interests & Hobbies
                </span>
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {profile.interests}
              </p>
            </div>
          )}

          {/* Values */}
          {profile.values && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-yellow-100">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span>💝</span>
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Values & Beliefs
                </span>
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {profile.values}
              </p>
            </div>
          )}

          {/* What I'm Looking For - Only show if there are other preferences */}
          {profile.otherPreferences && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-green-100">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span>💕</span>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  What I'm Looking For
                </span>
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {profile.otherPreferences}
              </p>
            </div>
          )}

          {/* Social Links */}
          {(profile.instagramHandle || profile.linkedInUrl) && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-indigo-100">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span>🔗</span>
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Connect With Me
                </span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {profile.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span>📷</span>
                    <span>Instagram</span>
                  </a>
                )}
                {profile.linkedInUrl && (
                  <a
                    href={profile.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span>💼</span>
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* CTA Section with Request a Match Button */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 md:p-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Interested in Connecting?</h2>
            <p className="text-lg mb-6 opacity-90">
              Request to match with {profile.name} or join our community to get matched with other amazing people!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRequestMatch}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Request a Match
              </button>
              <a
                href="/signup"
                className="inline-block bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
              >
                Join Our Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

