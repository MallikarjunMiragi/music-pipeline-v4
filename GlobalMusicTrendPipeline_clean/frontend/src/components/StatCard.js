import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend = 'up',
  trendValue = '+0%',  // Default value to prevent undefined
  color = 'accent-cyan',
  delay = 0
}) => {
  // Ensure trendValue is a string and safe to split
  const safeTrendValue = trendValue || '+0%';
  const isPositive = safeTrendValue.startsWith('+');
  
  const colorClasses = {
    'accent-cyan': 'from-accent-cyan to-blue-400',
    'accent-violet': 'from-accent-violet to-purple-400',
    'accent-neon': 'from-green-400 to-emerald-400',
    'accent-orange': 'from-orange-400 to-red-400'
  };

  const gradientClass = colorClasses[color] || colorClasses['accent-cyan'];

  return (
    <motion.div
      className="bg-surface border border-dark-100 rounded-2xl p-6 hover:border-accent-cyan/30 transition-all duration-300 group"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -2,
        boxShadow: "0 10px 25px rgba(0, 212, 255, 0.1)"
      }}
    >
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradientClass} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{safeTrendValue}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        
        <div className="space-y-1">
          <motion.div
            className="text-2xl font-bold text-white group-hover:text-accent-cyan transition-colors duration-300"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
          >
            {value}
          </motion.div>
          
          <p className="text-gray-500 text-xs">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className={`mt-4 h-1 bg-gradient-to-r ${gradientClass} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.4, duration: 0.5 }}
      />
    </motion.div>
  );
};

export default StatCard;
