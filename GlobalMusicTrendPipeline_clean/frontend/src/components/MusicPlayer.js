import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  X, 
  Heart, 
  Repeat,
  Shuffle,
  ExternalLink,
  Download,
  Share,
  MoreHorizontal
} from 'lucide-react';

const MusicPlayer = ({
  track,
  isPlaying,
  onTogglePlayPause,
  onClose,
  onNext,
  onPrevious,
  volume = 0.7,
  onVolumeChange,
  playlist = []
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Format time helper
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      if (onNext) {
        onNext();
      } else {
        onTogglePlayPause();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    // Set audio source
    const audioUrl = track.preview_url || track.media_preview_url || track.media_url;
    if (audioUrl && audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.volume = isMuted ? 0 : volume;
    }

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track, volume, isMuted, onNext, onTogglePlayPause]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !isLoading) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, isLoading]);

  // Handle progress click
  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    
    if (!audio || !progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      if (onVolumeChange) onVolumeChange(newVolume);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      setIsMuted(!isMuted);
      audio.volume = !isMuted ? 0 : volume;
    }
  };

  if (!track) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Expanded player overlay */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>

        <div className="bg-gradient-to-r from-surface via-dark-100 to-surface border-t border-accent-cyan/20 shadow-lg backdrop-blur-sm">
          {/* Progress bar */}
          <div className="relative h-1 bg-gray-700 cursor-pointer" onClick={handleProgressClick} ref={progressRef}>
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-cyan to-purple-500"
              style={{ width: `${progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.1 }}
            />
            
            {/* Progress handle */}
            <motion.div
              className="absolute top-1/2 w-3 h-3 bg-white rounded-full transform -translate-y-1/2 shadow-lg"
              style={{ left: `${progressPercentage}%` }}
              whileHover={{ scale: 1.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
            />
          </div>

          {/* Main player */}
          <div className="flex items-center justify-between p-4">
            {/* Track info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <motion.div
                className="relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <img
                  src={track.image_url || 'https://via.placeholder.com/60x60/1a1a1a/666666?text=Music'}
                  alt={track.track_name}
                  className="w-14 h-14 rounded-lg object-cover shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/60x60/1a1a1a/666666?text=Music';
                  }}
                />
                
                {/* Playing animation */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 border-2 border-accent-cyan rounded-lg"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h4
                  className="font-semibold text-white text-sm truncate hover:text-accent-cyan transition-colors cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                  whileHover={{ x: 2 }}
                >
                  {track.track_name || 'Unknown Track'}
                </motion.h4>
                
                <p className="text-gray-400 text-xs truncate">
                  {(track.artist || track.primary_artists || 'Unknown Artist').split(',')[0]}
                </p>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  
                  {track.language && (
                    <span className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded-full uppercase">
                      {track.language}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Previous */}
              {onPrevious && (
                <motion.button
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  onClick={onPrevious}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>
              )}

              {/* Play/Pause */}
              <motion.button
                className="w-12 h-12 bg-accent-cyan text-black rounded-full flex items-center justify-center hover:bg-accent-cyan/80 transition-colors"
                onClick={onTogglePlayPause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </motion.button>

              {/* Next */}
              {onNext && (
                <motion.button
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  onClick={onNext}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Like */}
              <motion.button
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'text-red-400 bg-red-400/20' : 'text-gray-400 hover:text-red-400'
                }`}
                onClick={() => setIsLiked(!isLiked)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>

              {/* Volume */}
              <div 
                className="relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <motion.button
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  onClick={toggleMute}
                  whileHover={{ scale: 1.1 }}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>

                {/* Volume slider */}
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      className="absolute bottom-full right-0 mb-2 p-2 bg-dark-100 border border-gray-600 rounded-lg shadow-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* More actions */}
              <motion.button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>

              {/* Close */}
              <motion.button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} preload="metadata" />
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;
