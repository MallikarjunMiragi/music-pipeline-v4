import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Settings, User, Menu } from 'lucide-react';

const Header = ({ activeSection, isMobile, onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.header
      className="bg-surface border-b border-dark-100 px-6 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Title and mobile menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-dark-100 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
          )}
          
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-accent-cyan to-accent-violet bg-clip-text text-transparent">
              Global Music Trends Analysis
            </h1>
            <p className="text-sm text-gray-400">Real-time insights from Indian music market</p>
          </div>
        </div>

        {/* Right side - Search and actions */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search artists, songs, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-dark-100/50 border border-accent-cyan/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all duration-200 w-80"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {[Bell, Settings, User].map((Icon, index) => (
              <motion.button
                key={index}
                className="relative p-3 rounded-xl hover:bg-dark-100/50 transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                
                {/* Notification badge for Bell */}
                {index === 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
