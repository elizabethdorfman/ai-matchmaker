import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-4">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                BETA
              </span>
            </div>
            <div className="text-7xl md:text-8xl mb-6">💕</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Matching with love, optimized by technology
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-600 max-w-3xl mx-auto">
              No swiping, just results. Built for Toronto's Jewish community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/see-community"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Discover Users in Our Community
              </Link>
              <Link
                to="/request-dm"
                className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Anonymously Message Your Crush
              </Link>
              <Link
                to="/analysis"
                className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Get Your Market Analysis
              </Link>
              <Link
                to="/roi"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Calculate Your Dating ROI
              </Link>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="py-8">
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* AI Sourcing Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                We Source With AI
              </h2>
              <p className="text-lg text-gray-700 mt-4 max-w-2xl mx-auto">
                <strong className="text-blue-600">We analyze Instagram & LinkedIn to show you potential matches:</strong> Our AI searches social media to find compatible people in Toronto's Jewish community. See how many matches you have before you sign up.
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
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Search Social Media</h3>
                      <p className="text-gray-600">
                        Our AI analyzes your profile and searches social media for people who match your criteria: location, age range, professional background, interests, values, and community connection.
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
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="py-8">
          <div className="w-full h-px bg-gray-300"></div>
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
        <div className="py-8">
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Why Trust Us Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Trust Us
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Built with integrity, transparency, and genuine care for our community
              </p>
            </div>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Real Person Behind the Service</h3>
                  <p className="text-gray-600">
                    Built by Aria, a software engineer and active member of Toronto's Jewish community who understands your experience.
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">🏘️</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Community-Focused</h3>
                  <p className="text-gray-600">
                    Dedicated exclusively to serving Toronto's Jewish community with respect for tradition and innovation.
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">💚</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Free Service</h3>
                  <p className="text-gray-600">
                    No financial pressure. Our service is free because we believe everyone deserves to find their match.
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Privacy-First</h3>
                  <p className="text-gray-600">
                    Your information is protected. We're transparent about data use and respect your privacy. <a href="/privacy" className="text-blue-600 hover:underline">Learn more</a>
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-100 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Human + AI Oversight</h3>
                  <p className="text-gray-600">
                    Technology enhances our matching, but every match is reviewed with human care and judgment.
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ethical & Transparent</h3>
                  <p className="text-gray-600">
                    We're honest about what we can do. No overpromising, just genuine commitment to finding you compatible matches.
                  </p>
                </div>
              </div>
              <div className="text-center mt-8">
                <a
                  href="/about"
                  className="inline-block text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Learn more about Aria and our story →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="py-8">
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Social Proof Section (Placeholder) */}
        <section className="py-16 md:py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                What People Are Saying
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Join our growing community of singles finding meaningful connections
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💕</div>
                  <p className="text-lg text-gray-600 mb-6">
                    We're just getting started! As our community grows, we'll share success stories and testimonials here.
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Be one of our first success stories! <a href="/signup" className="text-blue-600 hover:underline">Let us find your match</a> and help us build this community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="py-8">
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Free for Community Section */}
        <section className="py-16 md:py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-green-100">
                <div className="text-5xl mb-4">💚</div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                  Free for the Community
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our matchmaking service is completely free, supported by community donations. We believe everyone deserves to find their perfect match, regardless of financial circumstances. If you'd like to support our mission, donations help us continue providing this service to the Toronto Jewish community.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
