import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 text-center">
            <div className="text-7xl md:text-8xl mb-6">💕</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Matching with love, optimized by technology
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-600 max-w-3xl mx-auto">
              No swiping, no endless scrolling. We use AI to find compatible matches in the Toronto Jewish community and connect you directly.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="flex justify-center py-12">
          <div className="w-32 h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full shadow-lg"></div>
        </div>

        {/* AI Sourcing Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                We Source With AI
              </h2>
              <p className="text-sm text-gray-500 italic">
                Our unique value proposition
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-8 md:p-10">
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500 text-white font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Search Instagram</h3>
                      <p className="text-gray-600">
                        Our AI analyzes your profile and searches Instagram for people who match your criteria: location, age range, professional background, interests, values, and community connection.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500 text-white font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Personalized Outreach</h3>
                      <p className="text-gray-600">
                        We reach out to potential matches directly on social media, letting them know we've found someone we think they'd be a great match for. We invite them to join our community and see if there's compatibility.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pink-500 text-white font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Add to Database</h3>
                      <p className="text-gray-600">
                        If they're interested, they complete our sign-up form and join our database. This gives us their full profile and preferences.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-500 text-white font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Verify Compatibility</h3>
                      <p className="text-gray-600">
                        Our AI analyzes both profiles in detail and confirms if they're truly compatible based on values, interests, goals, religious observance, lifestyle, and all the factors that matter for a lasting relationship.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-500 text-white font-bold">
                        5
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Present the Match (Traditional Style)</h3>
                      <p className="text-gray-600">
                        Like traditional matchmaking, we present the match to both parties. You receive their profile summary, photos, and compatibility highlights. You decide if you're interested.
                      </p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white font-bold">
                        6
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Mutual Interest = Connection</h3>
                      <p className="text-gray-600">
                        If both of you say yes, we share contact information and you connect directly. If either person declines, we respect that and keep looking. No pressure, just genuine compatibility.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-700 text-center">
                    <strong className="text-blue-600">Traditional matchmaking, modern technology:</strong> We combine the personal touch of traditional matchmaking with AI-powered sourcing that actively finds compatible people in the community. No swiping, no algorithms—just thoughtful introductions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="flex justify-center py-12">
          <div className="w-32 h-2 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full shadow-lg"></div>
        </div>

        {/* Value Proposition Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                What Makes Us Different
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-yellow-100 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-5xl mb-4">🚫</div>
                <h3 className="text-xl font-bold text-gray-800">No Swiping</h3>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-800">Community-Focused</h3>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-5xl mb-4">💍</div>
                <h3 className="text-xl font-bold text-gray-800">Marriage-Focused</h3>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-pink-100 hover:shadow-xl transition-all hover:scale-105">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-800">AI-Powered Sourcing</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="flex justify-center py-12">
          <div className="w-32 h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full shadow-lg"></div>
        </div>

        {/* How It Works Section */}
        <section className="py-16 md:py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                How It Works
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-8 md:p-10">
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500 text-white font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Tell Us About You</h3>
                      <p className="text-gray-600">
                        Share your values, interests, and what you're looking for
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pink-500 text-white font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">We Source Matches</h3>
                      <p className="text-gray-600">
                        Our AI finds compatible people in the community
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500 text-white font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">We Present the Match</h3>
                      <p className="text-gray-600">
                        We send you their profile. You decide if you're interested
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-500 text-white font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Mutual Interest = Connection</h3>
                      <p className="text-gray-600">
                        If you both say yes, we share contact info and you connect directly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-yellow-100">
              <div className="text-6xl mb-6">💕</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ready for a Real Match?
              </h2>
              <Link
                to="/signup"
                className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Let Us Find You Love
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
