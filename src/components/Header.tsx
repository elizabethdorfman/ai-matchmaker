import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            💕 Toronto Jewish Matchmaker
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow hover:shadow-lg ${
                isActive('/')
                  ? 'text-gray-900 font-semibold border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 bg-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow hover:shadow-lg ${
                isActive('/about')
                  ? 'text-gray-900 font-semibold border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 bg-white'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow hover:shadow-lg ${
                isActive('/contact')
                  ? 'text-gray-900 font-semibold border-b-2 border-pink-600 bg-pink-50'
                  : 'text-gray-700 hover:text-pink-600 bg-white'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/signup"
              className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-blue-100 transition-colors"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <Link
              to="/"
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all shadow hover:shadow-md ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 bg-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all shadow hover:shadow-md ${
                isActive('/about')
                  ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600'
                  : 'text-gray-700 hover:bg-gray-50 bg-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all shadow hover:shadow-md ${
                isActive('/contact')
                  ? 'bg-pink-50 text-pink-700 border-l-4 border-pink-600'
                  : 'text-gray-700 hover:bg-gray-50 bg-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/signup"
              className="block px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg text-base font-semibold shadow-md hover:shadow-xl transition-all text-center mt-2 transform hover:scale-105"
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
