import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white mt-auto border-t-2 border-gray-600">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>💕</span> Toronto Jewish Matchmaker
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                BETA
              </span>
            </h3>
            <p className="text-gray-300 mb-3">
              Matching with love, optimized by technology. No swiping, just results.
            </p>
            <p className="text-gray-400 text-sm mb-2">
              Built by Aria (Software Engineer) • Beta testing in Toronto's Jewish Community
            </p>
            <p className="text-gray-400 text-sm">
              Limited beta - Join the first 100 users
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/ai-activity" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  AI Activity
                </Link>
              </li>
              <li>
                <Link to="/see-community" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all">
                  See Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com/matchmakerto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"
                >
                  <span>📸</span> Instagram
                </a>
              </li>
              <li>
                <a href="mailto:yourpersonalaimatchmaker@gmail.com" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                  <span>📧</span> yourpersonalaimatchmaker@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-600 text-center">
          <p className="text-gray-300 mb-4">&copy; {new Date().getFullYear()} Toronto Jewish Matchmaker. All rights reserved.</p>
          <div className="space-x-4 text-sm">
            <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-500">•</span>
            <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-gray-300 text-sm mt-4">
            💕 Matching with love, optimized by technology • No swiping, just results ✨
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Built for Toronto's Jewish community • Thoughtful matchmaking for marriage-minded individuals
          </p>
        </div>
      </div>
    </footer>
  );
}
