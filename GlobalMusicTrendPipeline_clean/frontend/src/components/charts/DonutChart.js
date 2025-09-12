import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Globe, MapPin, TrendingUp, Users, Volume2 } from 'lucide-react';

const DonutChart = ({ 
  data, 
  title = "Language Distribution", 
  subtitle = "Track distribution by language",
  height = 400 
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [animatedData, setAnimatedData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Enhanced color palette for Indian languages
  const COLORS = [
    '#00D4FF', // Hindi - Cyan
    '#8B5CF6', // Punjabi - Purple
    '#00FF88', // Tamil - Green
    '#A855F7', // Telugu - Violet
    '#F59E0B', // Malayalam - Orange
    '#EF4444', // Kannada - Red
    '#10B981', // Bengali - Teal
    '#EC4899', // Marathi - Pink
    '#06B6D4', // Gujarati - Sky
    '#84CC16', // Assamese - Lime
    '#F97316', // Odia - Orange
    '#E11D48'  // Others - Rose
  ];

  // Animate data loading
  useEffect(() => {
    if (!data || data.length === 0) return;

    setIsVisible(true);
    
    // Animate segments appearing
    let currentData = [];
    data.forEach((item, index) => {
      setTimeout(() => {
        currentData = [...currentData, { ...item, color: COLORS[index % COLORS.length] }];
        setAnimatedData([...currentData]);
      }, index * 200);
    });

    return () => {
      setAnimatedData([]);
      setIsVisible(false);
    };
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          className="bg-dark-100 border border-accent-cyan/20 rounded-xl p-4 shadow-lg backdrop-blur-sm min-w-48"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="text-white font-semibold text-lg">{data.name}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tracks:</span>
              <span className="text-accent-cyan font-bold">{data.value}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Percentage:</span>
              <span className="text-green-400 font-medium">{data.percentage}%</span>
            </div>
            
            {data.region && (
              <div className="flex items-center space-x-1 text-purple-400 text-sm pt-2 border-t border-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{data.region}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1 text-orange-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              <span>Trending in region</span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom label component
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
    if (percent < 0.05) return null; // Don't show labels for very small segments
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  // Handle segment hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  if (!data || data.length === 0) {
    return (
      <motion.div
        className="bg-surface border border-dark-100 rounded-2xl p-6 h-96"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Globe className="w-5 h-5 mr-2 text-accent-cyan" />
              {title}
            </h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Globe className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No language data available</p>
            <p className="text-gray-500 text-sm mt-1">Waiting for real-time updates...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const totalTracks = data.reduce((sum, item) => sum + item.value, 0);
  const topLanguage = data[0];

  return (
    <motion.div
      className="bg-surface border border-dark-100 rounded-2xl p-6 hover:border-accent-cyan/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Globe className="w-5 h-5 mr-2 text-accent-cyan" />
            {title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        
        <div className="text-right">
          <div className="text-accent-cyan font-bold text-lg">{data.length}</div>
          <div className="text-xs text-gray-400">Languages</div>
        </div>
      </div>

      {/* Top Language Highlight */}
      {topLanguage && (
        <motion.div
          className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-accent-cyan/10 border border-purple-500/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Volume2 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium">Most Popular: {topLanguage.name}</div>
                <div className="text-gray-400 text-sm">
                  {topLanguage.value} tracks • {topLanguage.region}
                </div>
              </div>
            </div>
            <div className="text-purple-400 font-bold text-xl">{topLanguage.percentage}%</div>
          </div>
        </motion.div>
      )}

      {/* Chart Container */}
      <div className="relative" style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={<CustomLabel />}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={1200}
            >
              {animatedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]}
                  stroke={activeIndex === index ? "#ffffff" : "transparent"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                    transform: activeIndex === index ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Stats */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="text-center bg-surface/80 backdrop-blur-sm rounded-full p-4">
            <div className="text-2xl font-bold text-white">{totalTracks}</div>
            <div className="text-sm text-gray-400">Total Tracks</div>
            <div className="text-xs text-accent-cyan mt-1">Multi-lingual</div>
          </div>
        </motion.div>
      </div>

      {/* Language Stats Grid */}
      <motion.div
        className="mt-6 grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {data.slice(0, 4).map((lang, index) => (
          <motion.div
            key={lang.name}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-100/50 transition-colors cursor-pointer"
            whileHover={{ x: 2 }}
            onClick={() => setActiveIndex(index)}
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color || COLORS[index] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {lang.name}
              </div>
              <div className="text-gray-400 text-xs">
                {lang.value} tracks
              </div>
            </div>
            <div className="text-accent-cyan text-sm font-medium">
              {lang.percentage}%
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="mt-4 pt-4 border-t border-dark-100 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>Pan-India</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Regional diversity</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </motion.div>

      {/* Live indicator */}
      <motion.div
        className="absolute top-4 right-4 flex items-center space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <span className="text-xs text-green-400">LIVE</span>
      </motion.div>
    </motion.div>
  );
};

export default DonutChart;
