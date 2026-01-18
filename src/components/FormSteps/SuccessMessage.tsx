import { useState, useEffect } from 'react';

export default function SuccessMessage() {
  const [docUrl, setDocUrl] = useState<string | null>(null);

  useEffect(() => {
    // Try to get userId from localStorage
    const storedUserId = localStorage.getItem('lastSignupUserId');
    if (storedUserId) {
      setDocUrl(`${window.location.origin}/date-me-doc/${storedUserId}`);
    }
  }, []);

  const copyDocLink = () => {
    if (docUrl) {
      navigator.clipboard.writeText(docUrl).then(() => {
        alert('Date Me Doc link copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-16 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center border-2 border-yellow-200">
        <div className="text-7xl mb-6 animate-bounce">💕</div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Our Community!
        </h2>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Your profile has been successfully submitted. We'll use our AI to find compatible matches for you in the community. 
          <span className="block mt-3 text-pink-600 font-semibold">We match with love. We source with AI. ✨</span>
        </p>
        
        {docUrl && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-700 mb-3 font-medium">📄 Your Date Me Doc is ready!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
              >
                View Your Date Me Doc
              </a>
              <button
                onClick={copyDocLink}
                className="inline-block bg-white border-2 border-blue-500 text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 text-sm"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

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

