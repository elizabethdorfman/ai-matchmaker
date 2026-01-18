import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Decorative hearts in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl opacity-10">💙</div>
        <div className="absolute top-32 right-20 text-5xl opacity-10">💛</div>
        <div className="absolute bottom-20 left-1/4 text-6xl opacity-10">💕</div>
        <div className="absolute bottom-10 right-1/3 text-4xl opacity-10">✨</div>
        <div className="absolute top-1/2 right-10 text-5xl opacity-10">💜</div>
        <div className="absolute top-1/3 left-1/4 text-5xl opacity-10">❤️</div>
        <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-10">💖</div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="mb-4">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                BETA TESTING
              </span>
            </div>
            <div className="text-6xl md:text-7xl mb-4">🤖</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Currently beta testing in Toronto's Jewish community.
            </p>
          </div>

          {/* How We Match */}
          <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How We Match
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              Our AI-powered matching system analyzes compatibility across multiple dimensions:
            </p>
            <ul className="list-disc list-inside space-y-3 text-lg text-gray-700 mb-6 ml-4">
              <li>Religious observance compatibility</li>
              <li>Values and beliefs alignment</li>
              <li>Lifestyle preferences</li>
              <li>Education and career goals</li>
              <li>Age and life stage compatibility</li>
              <li>Geographic proximity</li>
              <li>Shared interests and hobbies</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              But we don't stop at the algorithm. Every match is reviewed with a human touch, ensuring quality 
              and compatibility that technology alone can't guarantee.
            </p>
          </section>

          {/* Our Mission */}
          <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-purple-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              We're dedicated to serving Toronto's Jewish community by helping marriage-minded individuals 
              find their bashert through thoughtful, technology-enhanced matchmaking.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our approach combines tradition with innovation, respecting Jewish values while leveraging 
              modern technology to create meaningful connections.
            </p>
          </section>

          {/* Meet Aria */}
          <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-pink-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Meet Aria
            </h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Hi, I'm Aria. I'm a <strong>software engineer</strong> and an active member of Toronto's Jewish community. 
                After trying every dating app out there, I realized what was missing: the perfect blend of human 
                care and technological precision.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I built this matchmaker because I understand the frustration of modern dating. I've been where you are—swiping 
                through endless profiles, going on dates that don't go anywhere, wondering if there's a better way. That's 
                why I created something different: a matchmaker that combines thoughtful compatibility matching with AI 
                optimization, built specifically for our community.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>My technical background:</strong> As a software engineer, I have the expertise to build sophisticated 
                AI matching algorithms and market research tools. I understand data, APIs, and how to leverage technology to 
                solve real problems.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>My community connection:</strong> As an active member of Toronto's Jewish community, I understand what 
                matters in Jewish matchmaking—values, tradition, and genuine compatibility.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>My personal experience:</strong> Having tried every dating app myself, I know what works and what doesn't. 
                That's why I'm building the matchmaker I wish existed.
              </p>
            </div>
          </section>

          {/* Beta Testing Section */}
          <section className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-200">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🧪 Beta Testing
            </h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                We're currently in <strong>beta testing</strong> - building and refining our AI-powered matchmaking system. 
                This means you're getting early access to cutting-edge technology that's actively being improved based on real feedback.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>What makes our beta special:</strong> We're using real market research to show you potential matches 
                before you even sign up. Our AI analyzes Instagram and LinkedIn to find compatible people in Toronto's Jewish 
                community. You can see exactly what our AI is doing in our <Link to="/ai-activity" className="text-blue-600 hover:underline font-semibold">Activity Dashboard</Link>.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>Limited beta:</strong> We're accepting the first 100 users to help us refine the system. Join now to 
                be part of building something better than existing dating apps.
              </p>
            </div>
          </section>

          {/* Our Story */}
          <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-yellow-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Our Story
            </h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                After swiping through every dating app, I realized what was missing—the perfect algorithm that combines 
                human love and care with technological optimization. That's how Toronto Jewish Matchmaker was born.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Unlike traditional dating apps that prioritize volume over quality, or traditional matchmakers who can't 
                scale, we've built a service that uses <strong>AI-powered market research</strong> to find compatible people 
                proactively while maintaining the human touch that makes matchmaking meaningful.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We're not just another dating app. We're a matchmaker built with the perfect blend of human care and AI 
                precision. We've been where you are, and we're building the matchmaker we wish existed.
              </p>
            </div>
          </section>

          {/* Why Trust Us */}
          <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-green-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Why Trust Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Real Person Behind the Service</h3>
                <p className="text-gray-700">
                  Built by Aria, a real person in your community who understands your experience and is committed to your success.
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Community-Focused</h3>
                <p className="text-gray-700">
                  Dedicated to serving Toronto's Jewish community with respect for tradition and innovation.
                </p>
              </div>
              <div className="bg-pink-50 rounded-lg p-6 border-l-4 border-pink-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Free Service</h3>
                <p className="text-gray-700">
                  No financial pressure. Our service is free because we believe everyone deserves to find their match.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Privacy-First</h3>
                <p className="text-gray-700">
                  Your information is protected. We're transparent about how we use data and respect your privacy.
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Human + AI Oversight</h3>
                <p className="text-gray-700">
                  Technology enhances our matching, but every match is reviewed with human care and judgment.
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-6 border-l-4 border-indigo-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Ethical & Transparent</h3>
                <p className="text-gray-700">
                  We're honest about what we can and can't do. No overpromising, just genuine commitment to finding you compatible matches.
                </p>
              </div>
            </div>
          </section>

          {/* Questions Section */}
          <section className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Have questions about how we work, our matching process, or anything else? I'd love to hear from you!
            </p>
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
              <p className="text-gray-700 mb-2">
                <strong>Contact Aria:</strong>
              </p>
              <a
                href="mailto:yourpersonalaimatchmaker@gmail.com"
                className="text-lg text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                yourpersonalaimatchmaker@gmail.com
              </a>
              <p className="text-gray-600 text-sm mt-2">
                I typically respond within 24-48 hours.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
