'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaHome, FaBookOpen, FaCalendarAlt, FaCalculator, FaBars, FaTimes } from 'react-icons/fa';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { href: '/', icon: FaHome, label: 'Home' },
    { href: '/course-planner', icon: FaBookOpen, label: 'Course Planner' },
    { href: '/routine-generator', icon: FaCalendarAlt, label: 'Routine Generator' },
    { href: '/cgpa-calculator', icon: FaCalculator, label: 'CGPA Calculator' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50 shadow-2xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-sm">EWU</span>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:via-purple-200 group-hover:to-emerald-200 transition-all duration-300">
                Student's Guide
              </span>
              <div className="text-xs text-gray-400 -mt-1">East West University</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 group hover:bg-gray-700/50"
              >
                {/* Icon with color-coded glow */}
                <div className="relative">
                  <item.icon className={`w-4 h-4 group-hover:scale-110 transition-all duration-300 ${
                    index === 0 ? 'group-hover:text-blue-400' :
                    index === 1 ? 'group-hover:text-purple-400' :
                    index === 2 ? 'group-hover:text-emerald-400' :
                    'group-hover:text-pink-400'
                  }`} />
                  {/* Icon glow */}
                  <div className={`absolute inset-0 w-4 h-4 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-300 ${
                    index === 0 ? 'text-blue-400' :
                    index === 1 ? 'text-purple-400' :
                    index === 2 ? 'text-emerald-400' :
                    'text-pink-400'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-medium">{item.label}</span>
                
                {/* Underline effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                  index === 0 ? 'bg-blue-400' :
                  index === 1 ? 'bg-purple-400' :
                  index === 2 ? 'bg-emerald-400' :
                  'bg-pink-400'
                }`}></div>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="relative text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl p-3 hover:bg-gray-700/50 transition-all duration-300 group"
            >
              <div className={`transform transition-all duration-300 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </div>
              {/* Button glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-3 pt-3 pb-4 space-y-2 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-md border-t border-gray-700/50">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center space-x-4 text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {/* Icon with color coding */}
                  <div className="relative">
                    <item.icon className={`w-5 h-5 transition-all duration-300 ${
                      index === 0 ? 'group-hover:text-blue-400' :
                      index === 1 ? 'group-hover:text-purple-400' :
                      index === 2 ? 'group-hover:text-emerald-400' :
                      'group-hover:text-pink-400'
                    }`} />
                    {/* Mobile icon glow */}
                    <div className={`absolute inset-0 w-5 h-5 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-300 ${
                      index === 0 ? 'text-blue-400' :
                      index === 1 ? 'text-purple-400' :
                      index === 2 ? 'text-emerald-400' :
                      'text-pink-400'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <span>{item.label}</span>
                  
                  {/* Side accent line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${
                    index === 0 ? 'bg-blue-400' :
                    index === 1 ? 'bg-purple-400' :
                    index === 2 ? 'bg-emerald-400' :
                    'bg-pink-400'
                  }`}></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
