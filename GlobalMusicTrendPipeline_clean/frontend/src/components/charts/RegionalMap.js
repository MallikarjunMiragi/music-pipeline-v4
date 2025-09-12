import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, Users, Globe, Music, Headphones } from 'lucide-react';

const RegionalMap = ({ title = "Regional Music Popularity", subtitle = "Indian music trends by region" }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);

  const indianRegions = [
    { 
      name: 'North India', 
      popularity: 92, 
      listeners: '125M', 
      growth: '+18%', 
      color: 'accent-cyan',
      bgColor: 'bg-accent-cyan/20',
      borderColor: 'border-accent-cyan/30',
      glowColor: 'shadow-accent-cyan/20',
      languages: ['Hindi', 'Punjabi', 'Urdu'],
      topGenre: 'Bollywood',
      topArtists: ['Arijit Singh', 'Shreya Ghoshal', 'Rahat Fateh Ali Khan'],
      avgAge: 28,
      peakHours: '8-11 PM',
      weeklyStreams: '450M',
      description: 'Dominated by Bollywood and Punjabi music with massive urban engagement.'
    },
    { 
      name: 'South India', 
      popularity: 89, 
      listeners: '98M', 
      growth: '+22%', 
      color: 'accent-violet',
      bgColor: 'bg-accent-violet/20',
      borderColor: 'border-accent-violet/30',
      glowColor: 'shadow-accent-violet/20',
      languages: ['Tamil', 'Telugu', 'Malayalam', 'Kannada'],
      topGenre: 'Regional Cinema',
      topArtists: ['A.R. Rahman', 'Anirudh', 'Devi Sri Prasad'],
      avgAge: 32,
      peakHours: '7-10 PM',
      weeklyStreams: '380M',
      description: 'Strong regional cinema music culture with diverse linguistic preferences.'
    },
    { 
      name: 'West India', 
      popularity: 85, 
      listeners: '87M', 
      growth: '+15%', 
      color: 'accent-neon',
      bgColor: 'bg-accent-neon/20',
      borderColor: 'border-accent-neon/30',
      glowColor: 'shadow-accent-neon/20',
      languages: ['Hindi', 'Marathi', 'Gujarati'],
      topGenre: 'Commercial Pop',
      topArtists: ['Shankar-Ehsaan-Loy', 'Vishal-Shekhar', 'Ajay-Atul'],
      avgAge: 29,
      peakHours: '9 PM-12 AM',
      weeklyStreams: '320M',
      description: 'Commercial hub with preference for contemporary and fusion music.'
    },
    { 
      name: 'East India', 
      popularity: 78, 
      listeners: '45M', 
      growth: '+12%', 
      color: 'accent-purple',
      bgColor: 'bg-accent-purple/20',
      borderColor: 'border-accent-purple/30',
      glowColor: 'shadow-accent-purple/20',
      languages: ['Bengali', 'Hindi', 'Assamese'],
      topGenre: 'Traditional Folk',
      topArtists: ['Rabindranath Tagore', 'Hemanta Mukherjee', 'Shreya Ghoshal'],
      avgAge: 35,
      peakHours: '6-9 PM',
      weeklyStreams: '180M',
      description: 'Rich cultural heritage with strong preference for classical and folk music.'
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      'accent-cyan': 'text-accent-cyan',
      'accent-violet': 'text-accent-violet', 
      'accent-neon': 'text-accent-neon',
      'accent-purple': 'text-accent-purple'
    };
    return colorMap[color] || 'text-accent-cyan';
  };

  const RegionCard = ({ region, index }) => (
    <motion.div
      className={`${region.bgColor} ${region.borderColor} border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${region.glowColor} hover:shadow-lg`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setSelectedRegion(selectedRegion?.name === region.name ? null : region)}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <MapPin className={getColorClasses(region.color)} size={20} />
          <h4 className="text-lg font-semibold text-white">{region.name}</h4>
        </div>
        
        <div className="text-center">
          <div className={`w-12 h-12 ${region.bgColor} ${region.borderColor} border-2 rounded-full flex items-center justify-center`}>
            <span className={`text-lg font-bold ${getColorClasses(region.color)}`}>
              {region.popularity}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">Score</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div className="flex items-center space-x-2">
          <Users size={14} className="text-gray-400" />
          <span className="text-gray-300">
            <span className="font-medium text-white">{region.listeners}</span> listeners
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <TrendingUp size={14} className={getColorClasses(region.color)} />
          <span className="text-gray-300">
            Growth: <span className={`font-medium ${getColorClasses(region.color)}`}>{region.growth}</span>
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div>
          <span className="font-medium text-gray-300">Top Genre:</span> {region.topGenre}
        </div>
        <div>
          <span className="font-medium text-gray-300">Languages:</span> {region.languages.join(', ')}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Market Share</span>
          <span>{region.popularity}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div 
            className={`h-2 rounded-full bg-gradient-to-r ${
              region.color === 'accent-cyan' ? 'from-accent-cyan to-accent-cyan/70' :
              region.color === 'accent-violet' ? 'from-accent-violet to-accent-violet/70' :
              region.color === 'accent-neon' ? 'from-accent-neon to-accent-neon/70' :
              'from-accent-purple to-accent-purple/70'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${region.popularity}%` }}
            transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="bg-dark-100/50 rounded-xl p-6 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-all duration-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1 flex items-center">
          <Globe className="mr-2" />
          🗺️ {title}
        </h3>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indianRegions.map((region, index) => (
          <RegionCard key={region.name} region={region} index={index} />
        ))}
      </div>

      {/* Detailed Region Modal */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRegion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${selectedRegion.bgColor} ${selectedRegion.borderColor} border rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <MapPin className={getColorClasses(selectedRegion.color)} size={24} />
                  <span className="ml-2">{selectedRegion.name}</span>
                </h3>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-6">{selectedRegion.description}</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-dark-200/50 rounded-lg">
                    <div className={`text-2xl font-bold ${getColorClasses(selectedRegion.color)}`}>
                      {selectedRegion.listeners}
                    </div>
                    <div className="text-xs text-gray-400">Active Listeners</div>
                  </div>
                  <div className="text-center p-3 bg-dark-200/50 rounded-lg">
                    <div className={`text-2xl font-bold ${getColorClasses(selectedRegion.color)}`}>
                      {selectedRegion.weeklyStreams}
                    </div>
                    <div className="text-xs text-gray-400">Weekly Streams</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Headphones className={getColorClasses(selectedRegion.color)} size={18} />
                    <div>
                      <div className="text-white font-medium">Peak Listening Hours</div>
                      <div className="text-gray-400 text-sm">{selectedRegion.peakHours}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className={getColorClasses(selectedRegion.color)} size={18} />
                    <div>
                      <div className="text-white font-medium">Average User Age</div>
                      <div className="text-gray-400 text-sm">{selectedRegion.avgAge} years</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Music className={getColorClasses(selectedRegion.color)} size={18} />
                    <div>
                      <div className="text-white font-medium">Top Artists</div>
                      <div className="text-gray-400 text-sm">{selectedRegion.topArtists.join(', ')}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <div className="text-white font-medium mb-2">Language Distribution</div>
                  <div className="space-y-2">
                    {selectedRegion.languages.map((lang, idx) => (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{lang}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${
                                selectedRegion.color === 'accent-cyan' ? 'from-accent-cyan to-accent-cyan/70' :
                                selectedRegion.color === 'accent-violet' ? 'from-accent-violet to-accent-violet/70' :
                                selectedRegion.color === 'accent-neon' ? 'from-accent-neon to-accent-neon/70' :
                                'from-accent-purple to-accent-purple/70'
                              }`}
                              style={{ width: `${100 - idx * 25}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{100 - idx * 25}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-6 text-xs text-gray-500 text-center border-t border-gray-700 pt-4">
        🇮🇳 Indian music market analysis • Data from 28 states and 8 union territories • Click regions for details
      </div>
    </motion.div>
  );
};

export default RegionalMap;
