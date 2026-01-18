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
            <div className="text-6xl md:text-7xl mb-4">💕</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Matching with love, optimized by technology. Built for Toronto's Jewish community.
            </p>
          </div>

          {/* Our Story */}
          <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-yellow-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Story
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              Built by a young professional who's tried every dating app. After swiping through countless profiles, 
              we realized what was missing: the perfect blend of human care and technological precision.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              That's why we created a matchmaking service that combines thoughtful compatibility matching with AI optimization. 
              No swiping, just meaningful connections for Toronto's Jewish community.
            </p>
          </section>

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

          {/* The Team */}
          <section className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-pink-100">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              The Team
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're a team of professionals who understand the challenges of modern dating and are committed 
              to making the process more meaningful and effective for our community.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
