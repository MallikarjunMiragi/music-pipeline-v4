import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Heart, 
  Download, 
  Clock, 
  Headphones, 
  Music,
  TrendingUp,
  Users,
  Volume2,
  ExternalLink,
  Star,
  MoreHorizontal
} from 'lucide-react';

const SongGrid = ({ 
  tracks, 
  onPlayTrack, 
  currentlyPlaying, 
  isPlaying,
  title = "Trending Tracks",
  subtitle = "Click any track to preview",
  columns = 4,
  showStats = true 
}) => {
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Handle image loading
  const handleImageLoad = (trackId) => {
    setLoadedImages(prev => new Set([...prev, trackId]));
  };

  // Toggle like functionality
  const toggleLike = (trackId) => {
    setLikedTracks(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(trackId)) {
        newLikes.delete(trackId);
      } else {
        newLikes.add(trackId);
      }
      return newLikes;
    });
  };

  // Format duration
  const formatDuration = (ms) => {
    if (!ms) return '3:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format play count
  const formatPlayCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  if (!tracks || tracks.length === 0) {
    return (
      <motion.div
        className="bg-surface border border-dark-100 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <Music className="w-6 h-6 mr-2 text-accent-cyan" />
              {title}
            </h3>
            <p className="text-gray-400 mt-1">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Music className="w-10 h-10 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-400 mb-2">No tracks available</h4>
            <p className="text-gray-500">Waiting for real-time music data...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-surface border border-dark-100 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Music className="w-6 h-6 mr-2 text-accent-cyan" />
            {title}
          </h3>
          <p className="text-gray-400 mt-1">{subtitle}</p>
        </div>
        
        {showStats && (
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-accent-cyan font-bold text-lg">{tracks.length}</div>
              <div className="text-xs text-gray-400">Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold text-lg">
                {new Set(tracks.map(t => (t.artist || '').split(',')[0].trim())).size}
              </div>
              <div className="text-xs text-gray-400">Artists</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">
                {Math.round(tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / tracks.length)}
              </div>
              <div className="text-xs text-gray-400">Avg Score</div>
            </div>
          </div>
        )}
      </div>

      {/* Track Grid */}
      <div className={`grid gap-4 ${
        columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
        columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1'
      }`}>
        <AnimatePresence>
          {tracks.map((track, index) => {
            const isCurrentlyPlaying = currentlyPlaying?.track_id === track.track_id;
            const isHovered = hoveredTrack === track.track_id;
            const isLiked = likedTracks.has(track.track_id);
            const imageLoaded = loadedImages.has(track.track_id);

            return (
              <motion.div
                key={track.track_id || `track-${index}`}
                className="group relative bg-dark-100/30 rounded-xl overflow-hidden hover:bg-dark-100/50 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0, 212, 255, 0.1)"
                }}
                onMouseEnter={() => setHoveredTrack(track.track_id)}
                onMouseLeave={() => setHoveredTrack(null)}
              >
                {/* Track Image */}
                <div className="relative aspect-square overflow-hidden">
                  <motion.img
                    src={track.image_url || 'https://via.placeholder.com/300x300/1a1a1a/666666?text=Music'}
                    alt={track.track_name || 'Track'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onLoad={() => handleImageLoad(track.track_id)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300/1a1a1a/666666?text=Music';
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Loading placeholder */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-dark-100 flex items-center justify-center">
                      <Music className="w-12 h-12 text-gray-500" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <motion.div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                  >
                    <motion.button
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isCurrentlyPlaying && isPlaying
                          ? 'bg-accent-cyan text-black'
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-accent-cyan hover:text-black'
                      }`}
                      onClick={() => onPlayTrack(track)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isCurrentlyPlaying && isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Status badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {track.is_trending && (
                      <motion.div
                        className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-medium text-white flex items-center space-x-1"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Trending</span>
                      </motion.div>
                    )}
                    
                    {track.popularity > 90 && (
                      <motion.div
                        className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-medium text-white flex items-center space-x-1"
                        initial={{ scale: 0, rotate: 10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                      >
                        <Star className="w-3 h-3" />
                        <span>Hot</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <motion.div
                    className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.track_id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                        isLiked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/20 text-white hover:bg-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-accent-cyan hover:text-black transition-all duration-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </motion.div>

                  {/* Currently playing indicator */}
                  {isCurrentlyPlaying && (
                    <motion.div
                      className="absolute bottom-2 left-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <div className="flex items-center space-x-1 px-2 py-1 bg-accent-cyan text-black rounded-full text-xs font-medium">
                        <Volume2 className="w-3 h-3" />
                        <span>Playing</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Track Info */}
                <div className="p-4">
                  <motion.h4
                    className="font-semibold text-white text-sm mb-1 line-clamp-2 group-hover:text-accent-cyan transition-colors"
                    title={track.track_name}
                  >
                    {track.track_name || 'Unknown Track'}
                  </motion.h4>
                  
                  <p 
                    className="text-gray-400 text-xs mb-2 line-clamp-1"
                    title={track.artist}
                  >
                    {(track.artist || 'Unknown Artist').split(',')[0].trim()}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Headphones className="w-3 h-3" />
                      <span>{formatPlayCount(track.play_count)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(track.duration_ms)}</span>
                    </div>
                  </div>

                  {/* Popularity bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Popularity</span>
                      <span className="text-xs font-medium text-accent-cyan">
                        {track.popularity || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-accent-cyan to-purple-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((track.popularity || 0), 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.05 + 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Genre badge */}
                  {track.genre && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.7 }}
                    >
                      <span className="inline-block px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full capitalize">
                        {track.genre.replace('_', ' ')}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Hover effects */}
                <motion.div
                  className="absolute inset-0 border-2 border-accent-cyan rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  animate={{
                    opacity: isCurrentlyPlaying ? 1 : (isHovered ? 0.5 : 0)
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        className="mt-6 pt-4 border-t border-dark-100 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Multi-artist collection</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>Real-time updates</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          {tracks.length} tracks • Updated: {new Date().toLocaleTimeString()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SongGrid;
