import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Brush,
  Legend
} from 'recharts';
import { TrendingUp, Activity, Zap, BarChart3, Eye } from 'lucide-react';

const LineChart = ({ 
  data, 
  title = "Popularity Trends", 
  subtitle = "Track performance over time",
  height = 400,
  showBrush = false,
  showArea = true 
}) => {
  const [animatedData, setAnimatedData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [activePoint, setActivePoint] = useState(null);

  // Animate data points
  useEffect(() => {
    if (!data || data.length === 0) return;

    setIsVisible(true);
    
    // Animate line drawing
    let currentData = [];
    data.forEach((item, index) => {
      setTimeout(() => {
        currentData = [...currentData, item];
        setAnimatedData([...currentData]);
      }, index * 100);
    });

    return () => {
      setAnimatedData([]);
      setIsVisible(false);
    };
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          className="bg-dark-100 border border-accent-cyan/20 rounded-xl p-4 shadow-lg backdrop-blur-sm min-w-64"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-semibold">Track {label}</p>
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              <span>{data.growth || '+0%'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Song:</span>
              <span className="text-accent-cyan font-medium text-sm max-w-32 truncate">
                {data.track_name || 'Unknown'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Artist:</span>
              <span className="text-purple-400 text-sm max-w-32 truncate">
                {data.artist || 'Unknown'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Popularity:</span>
              <span className="text-green-400 font-bold">{data.popularity || 0}</span>
            </div>
            
            {data.streams && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Streams:</span>
                <span className="text-orange-400 font-medium">{data.streams}M</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Activity className="w-3 h-3" />
              <span>Real-time data point</span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom dot component
  const CustomDot = (props) => {
    const { cx, cy, payload, index } = props;
    
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#00D4FF"
        stroke="#ffffff"
        strokeWidth={2}
        className="cursor-pointer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.5, r: 6 }}
        onClick={() => setActivePoint(payload)}
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
              <BarChart3 className="w-5 h-5 mr-2 text-accent-cyan" />
              {title}
            </h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No trend data available</p>
            <p className="text-gray-500 text-sm mt-1">Waiting for real-time updates...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate trend statistics
  const avgPopularity = data.reduce((sum, item) => sum + (item.popularity || 0), 0) / data.length;
  const maxPopularity = Math.max(...data.map(item => item.popularity || 0));
  const trendDirection = data.length > 1 ? 
    (data[data.length - 1].popularity > data[0].popularity ? 'up' : 'down') : 'neutral';

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
            <BarChart3 className="w-5 h-5 mr-2 text-accent-cyan" />
            {title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-accent-cyan font-bold text-lg">{avgPopularity.toFixed(1)}</div>
            <div className="text-xs text-gray-400">Avg Score</div>
          </div>
          <div className={`flex items-center space-x-1 text-sm ${
            trendDirection === 'up' ? 'text-green-400' : 
            trendDirection === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trendDirection === 'down' ? 'rotate-180' : ''}`} />
            <span>{trendDirection === 'up' ? 'Rising' : trendDirection === 'down' ? 'Falling' : 'Stable'}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div
        className="mb-4 grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-accent-cyan/10 to-transparent">
          <div className="text-accent-cyan font-bold text-lg">{maxPopularity}</div>
          <div className="text-xs text-gray-400">Peak Score</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
          <div className="text-purple-400 font-bold text-lg">{data.length}</div>
          <div className="text-xs text-gray-400">Data Points</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent">
          <div className="text-green-400 font-bold text-lg">
            {data.filter(d => (d.popularity || 0) > avgPopularity).length}
          </div>
          <div className="text-xs text-gray-400">Above Average</div>
        </div>
      </motion.div>

      {/* Chart */}
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {showArea ? (
            <AreaChart
              data={animatedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorPopularity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line for average */}
              <ReferenceLine 
                y={avgPopularity} 
                stroke="#6B7280" 
                strokeDasharray="5 5" 
                opacity={0.5}
                label={{ value: "Average", position: "insideTopRight", fill: "#6B7280" }}
              />
              
              <Area
                type="monotone"
                dataKey="popularity"
                stroke="#00D4FF"
                strokeWidth={3}
                fill="url(#colorPopularity)"
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: '#00D4FF', strokeWidth: 2, fill: '#ffffff' }}
              />
              
              {data[0]?.streams && (
                <Area
                  type="monotone"
                  dataKey="streams"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#colorStreams)"
                  strokeDasharray="5 5"
                />
              )}
              
              {showBrush && (
                <Brush 
                  dataKey="name" 
                  height={30} 
                  stroke="#00D4FF"
                  fill="#1F2937"
                />
              )}
            </AreaChart>
          ) : (
            <RechartsLineChart
              data={animatedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                type="monotone"
                dataKey="popularity"
                stroke="#00D4FF"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: '#00D4FF', strokeWidth: 2, fill: '#ffffff' }}
              />
            </RechartsLineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer with insights */}
      <motion.div
        className="mt-4 pt-4 border-t border-dark-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Live updates</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </motion.div>

      {/* Live indicator */}
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

export default LineChart;
