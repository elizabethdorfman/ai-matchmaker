import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <Link to="/" className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl font-bold text-gray-800 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
            <span className="text-xl md:text-2xl">💕</span>
            <span className="hidden sm:inline truncate">Toronto Jewish Matchmaker</span>
            <span className="sm:hidden truncate">TJM</span>
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-bold flex-shrink-0">
              BETA
            </span>
          </Link>

          {/* Desktop Navigation - Show from lg (1024px) instead of md (768px) for better iPad experience */}
          <div className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            <Link
              to="/"
              className={`px-3 md:px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-3 md:px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/about')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-3 md:px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/contact')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/see-community"
              className={`px-3 md:px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/see-community') || isActive('/community')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              See Community
            </Link>
            <Link
              to="/signup"
              className="ml-2 md:ml-4 px-4 md:px-6 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile/Tablet Menu Button - Show on screens smaller than lg (1024px) */}
          <button
            className="lg:hidden p-2 rounded text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet Navigation - Show on screens smaller than lg (1024px) */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 space-y-1 bg-white rounded p-2 border-t border-gray-200">
            <Link
              to="/"
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/see-community"
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/see-community') || isActive('/community')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              See Community
            </Link>
            <Link
              to="/signup"
              className="block px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
