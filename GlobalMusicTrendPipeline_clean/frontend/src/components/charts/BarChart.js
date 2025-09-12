import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { TrendingUp, Music, Users, Activity } from 'lucide-react';

const BarChart = ({ 
  data, 
  title = "Genre Distribution", 
  subtitle = "Live streaming data from JioSaavn",
  height = 400,
  showAnimation = true 
}) => {
  const [animatedData, setAnimatedData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Animate data entry
  useEffect(() => {
    if (!data || data.length === 0) return;

    setIsVisible(true);
    
    if (showAnimation) {
      // Animate bars appearing one by one
      data.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedData(prev => [...prev, item]);
        }, index * 150);
      });
    } else {
      setAnimatedData(data);
    }

    return () => {
      setAnimatedData([]);
      setIsVisible(false);
    };
  }, [data, showAnimation]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          className="bg-dark-100 border border-accent-cyan/20 rounded-xl p-4 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="text-white font-semibold">{label}</p>
          </div>
          <div className="space-y-1">
            <p className="text-accent-cyan">
              <span className="font-medium">Tracks:</span> {data.value}
            </p>
            <p className="text-gray-300">
              <span className="font-medium">Percentage:</span> {data.percentage}% of total
            </p>
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              <span>Trending genre</span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom bar shape with animation
  const AnimatedBar = (props) => {
    const { fill, x, y, width, height } = props;
    
    return (
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        initial={{ height: 0, y: y + height }}
        animate={{ height: height, y: y }}
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 100 
        }}
        className="drop-shadow-lg"
      />
    );
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
              <Music className="w-5 h-5 mr-2 text-accent-cyan" />
              {title}
            </h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Music className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No genre data available</p>
            <p className="text-gray-500 text-sm mt-1">Waiting for real-time updates...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate stats for header
  const totalTracks = data.reduce((sum, item) => sum + item.value, 0);
  const topGenre = data[0];
  const genreGrowth = "+12%"; // Could be calculated from historical data

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
            <Music className="w-5 h-5 mr-2 text-accent-cyan" />
            {title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-accent-cyan font-bold text-lg">{totalTracks}</div>
            <div className="text-xs text-gray-400">Total Tracks</div>
          </div>
          <div className="flex items-center space-x-1 text-green-400 text-sm">
            <TrendingUp className="w-3 h-3" />
            <span>{genreGrowth}</span>
          </div>
        </div>
      </div>

      {/* Top Genre Highlight */}
      {topGenre && (
        <motion.div
          className="mb-4 p-3 rounded-lg bg-gradient-to-r from-accent-cyan/10 to-purple-500/10 border border-accent-cyan/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-accent-cyan/20">
                <Activity className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <div className="text-white font-medium">Top Genre: {topGenre.name}</div>
                <div className="text-gray-400 text-sm">{topGenre.value} tracks • {topGenre.percentage}% share</div>
              </div>
            </div>
            <div className="text-accent-cyan font-bold text-xl">#1</div>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={showAnimation ? animatedData : data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              shape={showAnimation ? <AnimatedBar /> : undefined}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || '#00D4FF'}
                />
              ))}
              
              {/* Value labels on bars */}
              <LabelList
                dataKey="value"
                position="top"
                className="fill-white text-sm font-medium"
                offset={5}
              />
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <motion.div
        className="mt-4 pt-4 border-t border-dark-100 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{data.length} genres</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Live data</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </motion.div>

      {/* Live update indicator */}
      <motion.div
        className="absolute top-4 right-4 flex items-center space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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

export default BarChart;
