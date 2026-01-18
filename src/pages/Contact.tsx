export default function Contact() {
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="text-6xl md:text-7xl mb-4">💕</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you!
            </p>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-2 border-yellow-100">
            <div className="space-y-8">
              {/* Email Section */}
              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
                  <span>📧</span> Email
                </h3>
                <a
                  href="mailto:yourpersonalaimatchmaker@gmail.com"
                  className="text-lg text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  yourpersonalaimatchmaker@gmail.com
                </a>
              </div>

              {/* Response Time Section */}
              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
                  <span>⏱️</span> Response Time
                </h3>
                <p className="text-lg text-gray-700">
                  We typically respond within 24-48 hours.
                </p>
              </div>

              {/* Social Media Section */}
              <div className="bg-pink-50 rounded-lg p-6 border-l-4 border-pink-500">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <span>📱</span> Connect With Us
                </h3>
                <div className="flex items-center gap-4">
                  <a
                    href="https://instagram.com/matchmakerto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span>📸</span>
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              We're here to help you find your match. Reach out anytime! 💕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
