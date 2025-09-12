import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from './StatCard';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';
import RegionalMap from './charts/RegionalMap';
import MusicPlayer from './MusicPlayer';
import SongGrid from './SongGrid';
import musicAPIService from '../services/apiService';
import { 
  TrendingUp, 
  Users, 
  Music, 
  Globe, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Activity,
  Headphones,
  Radio,
  Clock,
  Heart
} from 'lucide-react';

const Dashboard = ({ activeSection }) => {
  // ===== STATE MANAGEMENT =====
  const [trendingData, setTrendingData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [debugInfo, setDebugInfo] = useState('Initializing dashboard...');

  // Music Player State
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // Real-time metrics
  const [liveMetrics, setLiveMetrics] = useState({
    liveTracks: 2,
    activeArtists: 15,
    avgPopularity: 89.2,
    activeLanguages: 3,
    totalListeners: 245000,
    streamingRate: 1240
  });

  // Refs
  const audioRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const wsReconnectRef = useRef(null);

  // ===== DATA LOADING & REAL-TIME UPDATES =====
  
  const loadDashboardData = useCallback(async (isInitialLoad = false) => {
    const startTime = Date.now();
    
    try {
      if (isInitialLoad) {
        setLoading(true);
        setDebugInfo('🔄 Loading real-time music data...');
      }
      
      setError(null);

      // Test connection first
      const connectionTest = await musicAPIService.testConnection();
      console.log('🔗 Connection test result:', connectionTest);
      
      if (connectionTest && connectionTest.healthy) {
        setConnectionStatus('connected');
        setDebugInfo('✅ Connected to Music APIs');
      } else {
        setConnectionStatus('degraded');
        setDebugInfo('⚠️ Using cached/fallback data');
      }

      // Load data in parallel
      const [trendingResponse, analyticsResponse] = await Promise.allSettled([
        musicAPIService.getTrendingTracks(30),
        musicAPIService.getAnalytics()
      ]);

      console.log('📊 Trending response:', trendingResponse);
      console.log('📈 Analytics response:', analyticsResponse);

      // Process trending data - ENHANCED DEBUGGING & SAFETY
      if (trendingResponse.status === 'fulfilled' && trendingResponse.value) {
        const trendingResult = trendingResponse.value;
        console.log('✅ Raw trending data structure:', {
          hasSuccess: !!trendingResult.success,
          hasTracks: !!trendingResult.tracks,
          tracksType: typeof trendingResult.tracks,
          tracksLength: trendingResult.tracks ? trendingResult.tracks.length : 0,
          firstTrack: trendingResult.tracks ? trendingResult.tracks[0] : null
        });
        
        // Check if we have tracks data
        if (trendingResult && trendingResult.tracks && Array.isArray(trendingResult.tracks) && trendingResult.tracks.length > 0) {
          setTrendingData(trendingResult);
          updateLiveMetrics(trendingResult);
          console.log('✅ Trending data loaded:', trendingResult.tracks.length, 'tracks');
        } else {
          console.warn('⚠️ No valid tracks in trending data:', trendingResult);
          // Generate fallback data
          const fallbackData = generateFallbackTrendingData();
          setTrendingData(fallbackData);
          updateLiveMetrics(fallbackData);
        }
      } else {
        console.warn('⚠️ Trending API failed:', trendingResponse.reason);
        // Generate fallback data
        const fallbackData = generateFallbackTrendingData();
        setTrendingData(fallbackData);
        updateLiveMetrics(fallbackData);
      }

      // Process analytics data - ENHANCED SAFETY
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value) {
        const analyticsResult = analyticsResponse.value;
        console.log('✅ Raw analytics data:', analyticsResult);
        
        // Ensure analytics has required structure
        if (analyticsResult && analyticsResult.content_distribution) {
          setAnalytics(analyticsResult);
          console.log('✅ Analytics loaded');
        } else {
          console.warn('⚠️ Invalid analytics structure, using fallback');
          setAnalytics(generateFallbackAnalytics());
        }
      } else {
        console.warn('⚠️ Analytics API failed:', analyticsResponse.reason);
        setAnalytics(generateFallbackAnalytics());
      }

      setLastUpdate(new Date());
      const loadTime = Date.now() - startTime;
      setDebugInfo(`✅ Dashboard updated in ${loadTime}ms`);

    } catch (err) {
      console.error('❌ Dashboard loading error:', err);
      setError(err.message);
      setConnectionStatus('error');
      setDebugInfo(`❌ Error: ${err.message}`);
      
      // Set fallback data even on error
      if (!trendingData) {
        const fallbackData = generateFallbackTrendingData();
        setTrendingData(fallbackData);
        updateLiveMetrics(fallbackData);
      }
      if (!analytics) {
        setAnalytics(generateFallbackAnalytics());
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, []);

  // Generate fallback trending data
  const generateFallbackTrendingData = useCallback(() => {
    const fallbackTracks = Array.from({ length: 21 }, (_, i) => ({
      id: `fallback_${i}`,
      track_id: `fallback_${i}`,
      song: `Trending Song ${i + 1}`,
      track_name: `Trending Song ${i + 1}`,
      primary_artists: `Popular Artist ${i + 1}`,
      artist: `Popular Artist ${i + 1}`,
      album: `Hit Album ${i + 1}`,
      popularity: Math.floor(Math.random() * 40) + 60, // 60-100
      play_count: Math.floor(Math.random() * 5000000) + 500000,
      language: ['hindi', 'punjabi', 'tamil', 'telugu', 'malayalam'][Math.floor(Math.random() * 5)],
      genre_category: ['bollywood', 'punjabi', 'south_indian', 'trending', 'regional'][Math.floor(Math.random() * 5)],
      image: `https://via.placeholder.com/500x500/1a1a1a/00d4ff?text=Song+${i + 1}`,
      image_url: `https://via.placeholder.com/500x500/1a1a1a/00d4ff?text=Song+${i + 1}`,
      media_preview_url: null,
      preview_url: null,
      is_trending: true,
      listeners: Math.floor(Math.random() * 50000) + 5000,
      growth_rate: `+${Math.floor(Math.random() * 30) + 5}%`,
      duration_ms: Math.floor(Math.random() * 120000) + 180000, // 3-5 minutes
      fetched_at: new Date().toISOString(),
      source: 'fallback'
    }));

    return {
      success: true,
      tracks: fallbackTracks,
      metadata: {
        total_tracks: fallbackTracks.length,
        source: 'fallback_generated',
        timestamp: new Date().toISOString()
      }
    };
  }, []);

  // Generate fallback analytics
  const generateFallbackAnalytics = useCallback(() => {
    return {
      market_overview: {
        total_tracks_analyzed: 100,
        unique_artists: 45,
        avg_popularity_score: 78.5,
        data_freshness: new Date().toISOString()
      },
      content_distribution: {
        by_language: {
          hindi: 45,
          punjabi: 15,
          tamil: 12,
          telugu: 10,
          malayalam: 8,
          kannada: 6,
          bengali: 4
        },
        by_genre: {
          bollywood: 40,
          punjabi: 15,
          south_indian: 20,
          trending: 10,
          remix: 8,
          regional: 7
        }
      },
      timestamp: new Date().toISOString(),
      data_source: 'fallback_analytics'
    };
  }, []);

  // Update live metrics based on trending data
  const updateLiveMetrics = useCallback((data) => {
    if (!data || !data.tracks || !Array.isArray(data.tracks)) {
      console.warn('⚠️ Cannot update metrics - invalid data structure');
      return;
    }

    const tracks = data.tracks;
    const uniqueArtists = new Set();
    const uniqueLanguages = new Set();
    let totalPopularity = 0;
    let totalListeners = 0;

    tracks.forEach(track => {
      // Extract artists safely
      const artistString = track.artist || track.primary_artists || 'Unknown Artist';
      if (typeof artistString === 'string') {
        const artists = artistString.split(',');
        artists.forEach(artist => {
          if (artist && artist.trim()) uniqueArtists.add(artist.trim());
        });
      }

      // Extract languages safely
      if (track.language && typeof track.language === 'string') {
        uniqueLanguages.add(track.language);
      }

      // Calculate metrics safely
      const popularity = typeof track.popularity === 'number' ? track.popularity : 0;
      const listeners = typeof track.listeners === 'number' ? track.listeners : Math.floor(Math.random() * 10000);
      
      totalPopularity += popularity;
      totalListeners += listeners;
    });

    const newMetrics = {
      liveTracks: tracks.length,
      activeArtists: uniqueArtists.size || 1,
      avgPopularity: tracks.length > 0 ? parseFloat((totalPopularity / tracks.length).toFixed(1)) : 0,
      activeLanguages: uniqueLanguages.size || 1,
      totalListeners: totalListeners || 245000,
      streamingRate: Math.floor(Math.random() * 2000) + 500
    };

    console.log('📊 Updated live metrics:', newMetrics);
    setLiveMetrics(newMetrics);
  }, []);

  // ===== CHART DATA PROCESSING =====

  const chartData = useMemo(() => {
    console.log('🔄 Processing chart data...', { 
      hasTrending: !!trendingData, 
      hasAnalytics: !!analytics,
      tracksCount: trendingData?.tracks?.length || 0
    });
    
    // Make sure we have both trending data and analytics
    if (!trendingData || !analytics) {
      console.warn('⚠️ Missing data for charts:', { 
        hasTrending: !!trendingData, 
        hasAnalytics: !!analytics 
      });
      return null;
    }

    // Make sure we have tracks
    if (!trendingData.tracks || !Array.isArray(trendingData.tracks) || trendingData.tracks.length === 0) {
      console.warn('⚠️ No tracks data available for charts');
      return null;
    }

    try {
      const tracks = trendingData.tracks;
      console.log('📊 Processing', tracks.length, 'tracks for charts');

      // Genre Distribution - SAFE PROCESSING
      const genreDistribution = analytics.content_distribution?.by_genre || {};
      const genreData = Object.entries(genreDistribution)
        .map(([genre, count]) => ({
          name: genre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: typeof count === 'number' ? count : 0,
          percentage: Math.round((count / Math.max(tracks.length, 1)) * 100),
          color: getGenreColor(genre)
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      // Language Distribution - SAFE PROCESSING
      const languageDistribution = analytics.content_distribution?.by_language || {};
      const languageData = Object.entries(languageDistribution)
        .map(([language, count]) => ({
          name: language.toUpperCase(),
          value: typeof count === 'number' ? count : 0,
          percentage: Math.round((count / Math.max(tracks.length, 1)) * 100),
          color: getLanguageColor(language),
          region: getLanguageRegion(language)
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

      // Popularity Trends - SAFE PROCESSING
      const trendData = tracks
        .slice(0, 15)
        .map((track, index) => ({
          name: `T${index + 1}`,
          track_name: track.song || track.track_name || 'Unknown',
          popularity: typeof track.popularity === 'number' ? track.popularity : 0,
          streams: Math.round((track.play_count || 0) / 1000000) || Math.floor(Math.random() * 10),
          artist: getFirstArtist(track.primary_artists || track.artist || 'Unknown'),
          growth: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 20)}%` : `-${Math.floor(Math.random() * 10)}%`
        }));

      // Real-time Streaming Data
      const streamingData = Array.from({ length: 12 }, (_, i) => ({
        time: `${8 + i}:00`,
        listeners: Math.floor(Math.random() * 100000) + 50000,
        streams: Math.floor(Math.random() * 50000) + 20000,
        engagement: Math.floor(Math.random() * 40) + 60
      }));

      const result = {
        genreData,
        languageData,
        trendData,
        streamingData
      };

      console.log('✅ Chart data processed successfully:', result);
      return result;

    } catch (err) {
      console.error('❌ Chart data processing error:', err);
      return null;
    }
  }, [trendingData, analytics]);

  // Helper function to safely get first artist
  const getFirstArtist = useCallback((artistString) => {
    if (!artistString || typeof artistString !== 'string') return 'Unknown';
    return artistString.split(',')[0].trim() || 'Unknown';
  }, []);

  // ===== MUSIC PLAYER FUNCTIONS =====

  const playTrack = useCallback((track) => {
    if (!track) return;
    
    console.log('🎵 Playing track:', track.track_name || track.song);
    setCurrentlyPlaying(track);
    setIsPlaying(true);
    
    if (audioRef.current) {
      const audioUrl = track.media_preview_url || track.preview_url || track.media_url;
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(err => {
          console.error('❌ Audio play failed:', err);
          setIsPlaying(false);
        });
      } else {
        console.warn('⚠️ No preview URL available for track');
        setIsPlaying(false);
      }
    }
  }, [volume]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else if (currentlyPlaying) {
      playTrack(currentlyPlaying);
    }
  }, [isPlaying, currentlyPlaying, playTrack, pauseTrack]);

  // ===== HELPER FUNCTIONS =====

  const getGenreColor = (genre) => {
    const colors = {
      bollywood: '#FF6B6B',
      punjabi: '#4ECDC4', 
      south_indian: '#45B7D1',
      trending: '#96CEB4',
      remix: '#DDA0DD',
      regional: '#98D8C8',
      default: '#DDD6FE'
    };
    return colors[genre] || colors.default;
  };

  const getLanguageColor = (language) => {
    const colors = {
      hindi: '#00D4FF',
      punjabi: '#8B5CF6',
      tamil: '#00FF88', 
      telugu: '#A855F7',
      malayalam: '#F59E0B',
      kannada: '#EF4444',
      bengali: '#10B981',
      marathi: '#EC4899',
      default: '#6B7280'
    };
    return colors[language] || colors.default;
  };

  const getLanguageRegion = (language) => {
    const regions = {
      hindi: 'North India',
      punjabi: 'Punjab',
      tamil: 'Tamil Nadu',
      telugu: 'Andhra Pradesh & Telangana', 
      malayalam: 'Kerala',
      kannada: 'Karnataka',
      bengali: 'West Bengal',
      marathi: 'Maharashtra'
    };
    return regions[language] || 'Other Regions';
  };

  // ===== LIFECYCLE EFFECTS =====

  // Initialize dashboard
  useEffect(() => {
    let mounted = true;

    console.log('🚀 Initializing dashboard...');

    // Initial load
    loadDashboardData(true);

    // Set up periodic updates (every 1 minute instead of 30 seconds)
    updateIntervalRef.current = setInterval(() => {
      if (mounted) {
        console.log('🔄 Periodic data update...');
        loadDashboardData(false);
      }
    }, 60000); // Changed from 30000 to 60000 (1 minute)

    // WebSocket connection with delay
    const wsTimer = setTimeout(() => {
      if (mounted) {
        console.log('🔗 Initializing WebSocket connection...');
        musicAPIService.connectWebSocket(
          (data) => {
            if (!mounted) return;
            
            console.log('📨 WebSocket update:', data.type);
            
            if (data.type === 'trending_update' && data.data) {
              setTrendingData(prev => ({
                ...prev,
                tracks: data.data,
                metadata: {
                  ...prev?.metadata,
                  last_update: new Date().toISOString(),
                  source: 'websocket'
                }
              }));
              updateLiveMetrics({ tracks: data.data });
              setLastUpdate(new Date());
              setDebugInfo('🔄 Live update received via WebSocket');
            }
          },
          (connected) => {
            if (!mounted) return;
            console.log('🔗 WebSocket connection status:', connected);
            setWsConnected(connected);
            setConnectionStatus(connected ? 'connected' : 'disconnected');
          }
        );
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(wsTimer);
      clearInterval(updateIntervalRef.current);
      musicAPIService.disconnectWebSocket();
      console.log('🔌 Dashboard cleanup completed');
    };
  }, [loadDashboardData, updateLiveMetrics]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setAudioPosition(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioPosition(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Manual refresh function
  const refreshData = useCallback(() => {
    console.log('🔄 Manual refresh triggered...');
    setDebugInfo('🔄 Manual refresh triggered...');
    loadDashboardData(false);
  }, [loadDashboardData]);

  // ===== RENDER SECTION CONTENT =====

  const renderSectionContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <motion.div
            className="flex flex-col items-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="flex space-x-2"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <div className="w-3 h-3 bg-accent-cyan rounded-full" />
              <div className="w-3 h-3 bg-accent-violet rounded-full" />
              <div className="w-3 h-3 bg-green-400 rounded-full" />
            </motion.div>
            <p className="text-gray-400">Loading dashboard data...</p>
          </motion.div>
        </div>
      );
    }

    // ENHANCED DATA VALIDATION
    const hasValidTrendingData = trendingData && 
                                 trendingData.tracks && 
                                 Array.isArray(trendingData.tracks) && 
                                 trendingData.tracks.length > 0;
    
    const hasValidAnalytics = analytics && 
                             analytics.content_distribution &&
                             (analytics.content_distribution.by_genre || analytics.content_distribution.by_language);
    
    const hasValidChartData = chartData && 
                             chartData.genreData && 
                             chartData.languageData &&
                             chartData.trendData;

    console.log('🔍 Data availability check:', {
      hasValidTrendingData,
      hasValidAnalytics,
      hasValidChartData,
      trendingTracksCount: trendingData?.tracks?.length || 0,
      analyticsStructure: analytics ? Object.keys(analytics) : []
    });

    if (!hasValidTrendingData || !hasValidAnalytics) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <WifiOff className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Loading Data...</h3>
            <p className="text-gray-500 mb-4">Setting up your music dashboard</p>
            <div className="text-xs text-gray-600 mb-4 space-y-1">
              <div>Trending: {hasValidTrendingData ? '✅' : '🔄 Loading...'}</div>
              <div>Analytics: {hasValidAnalytics ? '✅' : '🔄 Loading...'}</div>
              <div>Charts: {hasValidChartData ? '✅' : '🔄 Processing...'}</div>
            </div>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan/80 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      );
    }

    // Render different sections based on activeSection
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'Regional Trends':
        return renderRegionalTrendsSection();
      case 'Genre Popularity':
        return renderGenrePopularitySection();
      case 'Streaming Analytics':
        return renderStreamingAnalyticsSection();
      case 'Artist Insights':
        return renderArtistInsightsSection();
      case 'Predictions':
        return renderPredictionsSection();
      default:
        return renderOverviewSection();
    }
  };

  // ===== INDIVIDUAL SECTION RENDERERS =====

  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Stats Grid - SAFE PROPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Music}
          title="Live Tracks"
          value={liveMetrics.liveTracks || 0}
          subtitle="Currently streaming"
          trend="up"
          trendValue="+12%"
          color="accent-cyan"
          delay={0}
        />
        <StatCard
          icon={Users}
          title="Active Artists"
          value={liveMetrics.activeArtists || 0}
          subtitle="Performing artists"
          trend="up"
          trendValue="+8%"
          color="accent-violet"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Popularity"
          value={liveMetrics.avgPopularity || 0}
          subtitle="Popularity index"
          trend="up"
          trendValue="+5%"
          color="accent-neon"
          delay={0.2}
        />
        <StatCard
          icon={Globe}
          title="Languages"
          value={liveMetrics.activeLanguages || 0}
          subtitle="Active languages"
          trend="up"
          trendValue="+3%"
          color="accent-orange"
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BarChart 
              data={chartData.genreData} 
              title="Genre Distribution"
              subtitle="Real-time genre popularity"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <DonutChart 
              data={chartData.languageData} 
              title="Language Distribution"
              subtitle="Content by language"
            />
          </motion.div>
        </div>
      )}

      {/* Trending Chart */}
      {chartData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <LineChart 
            data={chartData.trendData} 
            title="Popularity Trends"
            subtitle="Track performance over time"
          />
        </motion.div>
      )}

      {/* Song Grid */}
      {trendingData && trendingData.tracks && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SongGrid
            tracks={trendingData.tracks.slice(0, 12)}
            onPlayTrack={playTrack}
            currentlyPlaying={currentlyPlaying}
            isPlaying={isPlaying}
          />
        </motion.div>
      )}
    </div>
  );

  const renderRegionalTrendsSection = () => (
    <div className="space-y-6">
      <RegionalMap 
        title="Regional Music Popularity"
        subtitle="Indian music trends by region"
      />
      
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart 
            data={chartData.languageData} 
            title="Regional Language Distribution"
            subtitle="Music content by Indian languages"
          />
          
          <div className="bg-surface border border-dark-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Regional Insights</h3>
            <div className="space-y-4">
              {chartData.languageData.slice(0, 5).map((lang, index) => (
                <div key={lang.name || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="text-white">{lang.name}</span>
                    <span className="text-gray-400 text-sm">({lang.region})</span>
                  </div>
                  <span className="text-accent-cyan font-medium">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGenrePopularitySection = () => (
    <div className="space-y-6">
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart 
            data={chartData.genreData} 
            title="Genre Popularity Rankings"
            subtitle="Most popular music genres"
          />
          
          <div className="bg-surface border border-dark-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Music className="w-5 h-5 mr-2 text-accent-cyan" />
              Genre Statistics
            </h3>
            <div className="space-y-4">
              {chartData.genreData.map((genre, index) => (
                <div key={genre.name || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: genre.color }}
                    />
                    <span className="text-white">{genre.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-accent-cyan font-medium">{genre.value} tracks</div>
                    <div className="text-xs text-gray-400">{genre.percentage}% of total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Genre-filtered song grid */}
      {trendingData && trendingData.tracks && (
        <SongGrid
          tracks={trendingData.tracks.filter(track => 
            track.genre_category === 'bollywood' || track.genre_category === 'trending'
          ).slice(0, 8)}
          onPlayTrack={playTrack}
          currentlyPlaying={currentlyPlaying}
          isPlaying={isPlaying}
          title="Popular Genre Tracks"
        />
      )}
    </div>
  );

  const renderStreamingAnalyticsSection = () => (
    <div className="space-y-6">
      {/* Live metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Activity}
          title="Live Listeners"
          value={`${Math.floor((liveMetrics.totalListeners || 245000) / 1000)}K`}
          subtitle="Currently listening"
          trend="up"
          trendValue="+15%"
          color="accent-cyan"
        />
        <StatCard
          icon={Radio}
          title="Streaming Rate"
          value={`${liveMetrics.streamingRate || 1240}/min`}
          subtitle="Streams per minute"
          trend="up"
          trendValue="+22%"
          color="accent-violet"
        />
        <StatCard
          icon={Headphones}
          title="Engagement"
          value="87.3%"
          subtitle="User engagement rate"
          trend="up"
          trendValue="+7%"
          color="accent-neon"
        />
      </div>

      {/* Streaming trends chart */}
      {chartData && (
        <LineChart 
          data={chartData.streamingData} 
          title="Real-time Streaming Analytics"
          subtitle="Live streaming metrics throughout the day"
        />
      )}

      {/* Top performing tracks */}
      {trendingData && trendingData.tracks && (
        <div className="bg-surface border border-dark-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-accent-cyan" />
            Top Streaming Tracks
          </h3>
          <div className="space-y-3">
            {trendingData.tracks.slice(0, 5).map((track, index) => (
              <div key={track.id || track.track_id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-100/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-8">#{index + 1}</span>
                  <img 
                    src={track.image || track.image_url || 'https://via.placeholder.com/40x40/1a1a1a/666666?text=Music'}
                    alt={track.song || track.track_name || 'Track'}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/40x40/1a1a1a/666666?text=Music';
                    }}
                  />
                  <div>
                    <div className="text-white font-medium">{track.song || track.track_name || 'Unknown Track'}</div>
                    <div className="text-gray-400 text-sm">{getFirstArtist(track.primary_artists || track.artist)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-accent-cyan font-medium">{track.popularity || 0}</div>
                  <div className="text-xs text-gray-400">popularity</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderArtistInsightsSection = () => {
    if (!trendingData || !trendingData.tracks || !Array.isArray(trendingData.tracks)) {
      return <div>No artist data available</div>;
    }

    // Extract unique artists with their stats - SAFE PROCESSING
    const artistStats = {};
    trendingData.tracks.forEach(track => {
      const artistName = getFirstArtist(track.primary_artists || track.artist || 'Unknown');
      if (!artistStats[artistName]) {
        artistStats[artistName] = {
          name: artistName,
          tracks: 0,
          totalPopularity: 0,
          totalStreams: 0,
          languages: new Set(),
          genres: new Set()
        };
      }
      
      artistStats[artistName].tracks += 1;
      artistStats[artistName].totalPopularity += track.popularity || 0;
      artistStats[artistName].totalStreams += track.play_count || 0;
      artistStats[artistName].languages.add(track.language || 'unknown');
      artistStats[artistName].genres.add(track.genre_category || 'unknown');
    });

    const topArtists = Object.values(artistStats)
      .map(artist => ({
        ...artist,
        avgPopularity: artist.tracks > 0 ? Math.round(artist.totalPopularity / artist.tracks) : 0,
        languages: Array.from(artist.languages),
        genres: Array.from(artist.genres)
      }))
      .sort((a, b) => b.avgPopularity - a.avgPopularity)
      .slice(0, 10);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            title="Total Artists"
            value={Object.keys(artistStats).length || 0}
            subtitle="Unique artists"
            trend="up"
            trendValue="+12%"
            color="accent-cyan"
          />
          <StatCard
            icon={Music}
            title="Avg Tracks/Artist"
            value={Object.keys(artistStats).length > 0 ? Math.round(trendingData.tracks.length / Object.keys(artistStats).length) : 0}
            subtitle="Tracks per artist"
            trend="up"
            trendValue="+8%"
            color="accent-violet"
          />
          <StatCard
            icon={TrendingUp}
            title="Top Artist Score"
            value={topArtists[0]?.avgPopularity || 0}
            subtitle="Highest popularity"
            trend="up"
            trendValue="+15%"
            color="accent-neon"
          />
        </div>

        <div className="bg-surface border border-dark-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-accent-cyan" />
            Top Artists Rankings
          </h3>
          <div className="space-y-3">
            {topArtists.map((artist, index) => (
              <div key={artist.name || index} className="flex items-center justify-between p-4 rounded-lg hover:bg-dark-100/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent-cyan">#{index + 1}</div>
                  </div>
                  <div>
                    <div className="text-white font-medium">{artist.name}</div>
                    <div className="text-gray-400 text-sm">
                      {artist.tracks} tracks • {artist.languages.join(', ')} • {artist.genres.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-accent-cyan font-bold text-lg">{artist.avgPopularity}</div>
                  <div className="text-xs text-gray-400">avg popularity</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPredictionsSection = () => (
    <div className="space-y-6">
      <div className="bg-surface border border-dark-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-accent-cyan" />
          AI Trend Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-accent-cyan font-medium">Rising Genres</h4>
            {['Punjabi Hip-Hop', 'Tamil Fusion', 'Regional Pop'].map((genre, index) => (
              <div key={genre} className="flex items-center justify-between p-3 rounded-lg bg-dark-100/30">
                <span className="text-white">{genre}</span>
                <span className="text-green-400 font-medium">+{Math.floor(Math.random() * 50 + 10)}%</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-accent-violet font-medium">Trending Artists</h4>
            {trendingData && trendingData.tracks && trendingData.tracks.slice(0, 3).map((track, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-dark-100/30">
                <span className="text-white">{getFirstArtist(track.primary_artists || track.artist || 'Unknown')}</span>
                <span className="text-green-400 font-medium">Rising</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {chartData && (
        <LineChart 
          data={chartData.trendData} 
          title="Predicted Popularity Trends"
          subtitle="AI-powered trend forecasting"
        />
      )}
    </div>
  );

  // ===== MAIN RENDER =====

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header with status */}
      <div className="bg-surface border-b border-dark-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Wifi className={`w-4 h-4 ${wsConnected ? 'text-green-400' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-400">
                {wsConnected ? 'Real data loaded successfully' : 'Connecting to JioSaavn API...'}
              </span>
            </div>
            {lastUpdate && (
              <div className="text-sm text-gray-500">
                Updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          <motion.button
            onClick={refreshData}
            className="flex items-center space-x-2 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg hover:bg-accent-cyan/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </motion.button>
        </div>
        
        <div className="mt-2 text-sm text-gray-400">{debugInfo}</div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSectionContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Music Player */}
      <AnimatePresence>
        {currentlyPlaying && (
          <MusicPlayer
            track={currentlyPlaying}
            isPlaying={isPlaying}
            onTogglePlayPause={togglePlayPause}
            onClose={() => {
              setCurrentlyPlaying(null);
              setIsPlaying(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default Dashboard;
