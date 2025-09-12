import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Globe, 
  Music, 
  TrendingUp, 
  Users, 
  Zap, 
  ChevronRight,
  Activity
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Real-time dashboard overview'
    },
    {
      id: 'Regional Trends',
      label: 'Regional Trends',
      icon: Globe,
      description: 'Music trends by Indian regions'
    },
    {
      id: 'Genre Popularity',
      label: 'Genre Popularity',
      icon: Music,
      description: 'Popular music genres analysis'
    },
    {
      id: 'Streaming Analytics',
      label: 'Streaming Analytics',
      icon: Activity,
      description: 'Real-time streaming metrics'
    },
    {
      id: 'Artist Insights',
      label: 'Artist Insights',
      icon: Users,
      description: 'Top artists and performance'
    },
    {
      id: 'Predictions',
      label: 'Predictions',
      icon: Zap,
      description: 'AI-powered trend predictions'
    }
  ];

  return (
    <motion.div
      className={`fixed left-0 top-0 h-full bg-surface border-r border-dark-100 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-accent-cyan to-accent-violet bg-clip-text text-transparent">
                Music Analytics
              </h2>
              <p className="text-xs text-gray-400 mt-1">Global Trends Dashboard</p>
            </motion.div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
          >
            <ChevronRight 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isCollapsed ? 'rotate-0' : 'rotate-180'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
              }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-accent-cyan to-accent-violet rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <IconComponent 
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-cyan' : ''}`} 
              />

              {/* Label and Description */}
              {!isCollapsed && (
                <motion.div
                  className="ml-3 text-left flex-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </motion.div>
              )}

              {/* Hover tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-dark-100 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}

              {/* Trend indicator */}
              {(item.id === 'overview' || item.id === 'Streaming Analytics') && (
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full ml-auto"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer - Live Status */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-100">
        {!isCollapsed && (
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-xs text-gray-400">Live Data</span>
            </div>
            <div className="text-xs text-gray-500">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
