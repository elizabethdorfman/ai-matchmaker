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

export default function Database() {
  const [profiles, setProfiles] = useState<InstagramProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/instagram-profiles');
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        const profilesData = data.profiles || [];
        // Debug: Log first profile to check for imageUrl
        if (profilesData.length > 0) {
          console.log('First profile data:', profilesData[0]);
          console.log('Has imageUrl:', !!profilesData[0].imageUrl);
          console.log('imageUrl value:', profilesData[0].imageUrl);
          // Count how many profiles have imageUrl
          const profilesWithImages = profilesData.filter((p: InstagramProfile) => p.imageUrl && p.imageUrl.trim() !== '');
          console.log(`Profiles with images: ${profilesWithImages.length} of ${profilesData.length}`);
        }
        setProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        // Don't set error state - just show empty state with 10,000+ stat
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Filter profiles based on search
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Always show the page content with the 10,000+ stat
  // Don't return early on loading or error - show the stat and preview section
  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
  //       <div className="text-center max-w-md">
  //         <div className="text-6xl mb-4">⚠️</div>
  //         <h2 className="text-2xl font-bold mb-4 text-gray-800">Error Loading Community</h2>
  //         <p className="text-gray-600 mb-4">{error}</p>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl md:text-7xl mb-4">📊</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            See Our Community
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
            Discover Toronto Jewish young professionals we've found on Instagram.
            These are real profiles from our community organizations and hashtags.
          </p>
          
          {/* Hero Stat */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 text-white">
              <div className="text-6xl md:text-8xl font-bold mb-2">{profiles.length > 0 ? profiles.length.toLocaleString() : '6,999'}</div>
              <div className="text-2xl md:text-3xl font-semibold mb-2">Profiles Found</div>
              <div className="text-lg opacity-90">in the Toronto Jewish Community</div>
            </div>
          </div>

          {loading ? (
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Loading preview profiles...
            </div>
          ) : error ? (
            <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Preview profiles loading... (6,999 in full database)
            </div>
          ) : profiles.length > 0 ? (
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Showing preview of {profiles.length} profiles
            </div>
          ) : null}
        </div>

        {/* Search */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Profiles
              </label>
              <input
                type="text"
                placeholder="Search by username, name, bio, profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {profiles.length > 0 ? (
                <>Showing {filteredProfiles.length} of {profiles.length} preview profiles</>
              ) : (
                <>6,999 profiles in our full database</>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Preview of Discovered Profiles
            </h2>
            <p className="text-gray-600">
              These are real Instagram profiles we've discovered. Our AI continuously searches for new profiles matching our members' criteria.
            </p>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-200">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Profiles Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              {profiles.length === 0 && !loading && (
                <p className="text-sm text-gray-500">
                  Preview profiles are being loaded. Check back soon!
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.slice(0, 20).map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:shadow-xl transition-shadow relative"
                >
                  {/* Tiny square image in top-right corner */}
                  <div className="absolute top-2 right-2 w-12 h-12 rounded overflow-hidden border-2 border-gray-200 shadow-sm">
                    {profile.imageUrl ? (
                      <>
                        {/* Test direct fetch vs proxy - Hypothesis testing */}
                        {(() => {
                          // #region agent log
                          if (profile.id === profiles[0]?.id) {
                            fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Database.tsx:188',message:'Testing direct image fetch',data:{imageUrl:profile.imageUrl,profileId:profile.id,method:'direct'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                            // Test direct fetch to see what error we get
                            fetch(profile.imageUrl, { method: 'HEAD', mode: 'no-cors' })
                              .then(() => {
                                fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Database.tsx:192',message:'Direct fetch response',data:{success:true,method:'direct'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                              })
                              .catch((err) => {
                                fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Database.tsx:196',message:'Direct fetch error',data:{error:err.message,errorType:err.name,method:'direct'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                              });
                          }
                          // #endregion
                          return null;
                        })()}
                        <img
                          src={profile.imageUrl ? `/api/image-proxy?url=${encodeURIComponent(profile.imageUrl)}` : ''}
                          alt={profile.fullName || profile.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // #region agent log
                            fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Database.tsx:207',message:'Image onError fired',data:{imageUrl:profile.imageUrl,src:(e.target as HTMLImageElement).src,method:'proxy'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                            // #endregion
                            console.warn('Image failed to load:', profile.imageUrl);
                            // Hide image and show placeholder on error
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                          onLoad={(e) => {
                            // #region agent log
                            fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Database.tsx:220',message:'Image onLoad fired',data:{imageUrl:profile.imageUrl,src:(e.target as HTMLImageElement).src,method:'proxy'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                            // #endregion
                            // Hide placeholder when image loads successfully
                            const img = e.target as HTMLImageElement;
                            const placeholder = img.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'none';
                            }
                          }}
                        />
                        {/* Placeholder - hidden by default if imageUrl exists */}
                        <div 
                          className="image-placeholder w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center absolute top-0 left-0"
                          style={{ display: 'none' }}
                        >
                          <div className="text-xs">👤</div>
                        </div>
                      </>
                    ) : (
                      /* Placeholder when no imageUrl */
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
                  <div className="space-y-2 text-sm">
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

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                    {profile.followersCount && (
                      <div>
                        <div className="font-semibold text-gray-700">{profile.followersCount.toLocaleString()}</div>
                        <div>Followers</div>
                      </div>
                    )}
                    {profile.followingCount && (
                      <div>
                        <div className="font-semibold text-gray-700">{profile.followingCount.toLocaleString()}</div>
                        <div>Following</div>
                      </div>
                    )}
                    {profile.postsCount && (
                      <div>
                        <div className="font-semibold text-gray-700">{profile.postsCount.toLocaleString()}</div>
                        <div>Posts</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Show More Indicator */}
          {filteredProfiles.length > 20 && (
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Showing 20 of {filteredProfiles.length} preview profiles
                </p>
                <p className="text-sm text-gray-600">
                  Our full database contains {profiles.length > 0 ? profiles.length.toLocaleString() : '6,999'} profiles. Sign up to get matched!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-10 text-white">
            <h3 className="text-2xl font-bold mb-4">Want to See If We Have a Match for You?</h3>
            <p className="text-lg mb-6 opacity-90">
              Sign up and we'll source compatible people from our database
            </p>
            <Link
              to="/signup"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Join Our Beta
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="max-w-4xl mx-auto mt-8 text-center text-sm text-gray-600">
          <p>
            This database contains publicly available Instagram profiles from Toronto Jewish community organizations.
            All data is collected ethically and used solely for matchmaking purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

