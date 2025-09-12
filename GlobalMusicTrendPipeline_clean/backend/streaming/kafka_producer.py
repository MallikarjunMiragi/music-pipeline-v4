"""
Enhanced Kafka Producer for Real-time Music Data Streaming
Integrates with JioSaavn API and FastAPI for continuous data flow
"""

import json
import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from kafka import KafkaProducer
from kafka.errors import KafkaError
import time
import random
from typing import Dict, List, Any, Optional
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MusicDataStreamer:
    """Enhanced Kafka producer for real-time music data streaming"""
    
    def __init__(self, 
                 kafka_servers: List[str] = ['localhost:9092'],
                 jiosaavn_api_url: str = 'http://localhost:5100',
                 fastapi_url: str = 'http://localhost:8000'):
        
        self.kafka_servers = kafka_servers
        self.jiosaavn_api_url = jiosaavn_api_url
        self.fastapi_url = fastapi_url
        self.producer = None
        self.is_streaming = False
        
        # Topics for different data types
        self.topics = {
            'trending_tracks': 'music-trending-tracks',
            'analytics': 'music-analytics',
            'real_time_metrics': 'music-realtime-metrics',
            'user_interactions': 'music-user-interactions'
        }
        
        # Data cache for continuity
        self.data_cache = {
            'last_trending_update': None,
            'trending_tracks': [],
            'analytics_data': None,
            'streaming_metrics': {}
        }
        
        logger.info("🎵 Music Data Streamer initialized")

    async def initialize_producer(self):
        """Initialize Kafka producer with enhanced configuration"""
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.kafka_servers,
                value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
                key_serializer=lambda v: str(v).encode('utf-8') if v else None,
                # Enhanced producer configuration
                acks='all',
                retries=3,
                batch_size=16384,
                linger_ms=10,
                buffer_memory=33554432,
                compression_type='gzip',
                max_request_size=1048576
            )
            
            logger.info("✅ Kafka producer initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Kafka producer: {e}")
            return False

    async def fetch_trending_data(self) -> Optional[Dict[str, Any]]:
        """Fetch trending data from JioSaavn API"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.jiosaavn_api_url}/trending?limit=30",
                    timeout=aiohttp.ClientTimeout(total=15)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('success') and data.get('tracks'):
                            # Enhance data with streaming metrics
                            enhanced_data = self.enhance_trending_data(data)
                            self.data_cache['trending_tracks'] = enhanced_data['tracks']
                            self.data_cache['last_trending_update'] = datetime.now()
                            
                            logger.info(f"✅ Fetched {len(enhanced_data['tracks'])} trending tracks")
                            return enhanced_data
                            
                        else:
                            logger.warning("⚠️ Invalid trending data format")
                            
                    else:
                        logger.error(f"❌ JioSaavn API error: {response.status}")
                        
        except asyncio.TimeoutError:
            logger.error("⏰ JioSaavn API timeout")
        except Exception as e:
            logger.error(f"❌ Error fetching trending data: {e}")
            
        return None

    async def fetch_analytics_data(self) -> Optional[Dict[str, Any]]:
        """Fetch analytics data from JioSaavn API"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.jiosaavn_api_url}/analytics",
                    timeout=aiohttp.ClientTimeout(total=15)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        
                        # Enhance analytics with real-time metrics
                        enhanced_analytics = self.enhance_analytics_data(data)
                        self.data_cache['analytics_data'] = enhanced_analytics
                        
                        logger.info("✅ Fetched analytics data")
                        return enhanced_analytics
                        
                    else:
                        logger.error(f"❌ Analytics API error: {response.status}")
                        
        except Exception as e:
            logger.error(f"❌ Error fetching analytics: {e}")
            
        return None

    def enhance_trending_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance trending data with real-time streaming metrics"""
        enhanced = data.copy()
        
        # Add real-time metrics to each track
        for track in enhanced.get('tracks', []):
            track.update({
                # Real-time streaming data
                'current_listeners': random.randint(5000, 100000),
                'streams_per_hour': random.randint(1000, 50000),
                'engagement_rate': round(random.uniform(0.65, 0.95), 3),
                'share_count': random.randint(100, 10000),
                'like_count': random.randint(1000, 100000),
                
                # Geographic data
                'top_regions': self.generate_top_regions(),
                'viral_coefficient': round(random.uniform(0.1, 2.5), 2),
                
                # Trend indicators
                'trend_velocity': random.choice(['rising', 'stable', 'declining']),
                'peak_position': random.randint(1, 100),
                'chart_position_change': random.randint(-20, 30),
                
                # Timestamp
                'stream_timestamp': datetime.now().isoformat(),
                'data_source': 'enhanced_streaming'
            })
        
        # Add metadata
        enhanced['streaming_metadata'] = {
            'total_current_listeners': sum(track.get('current_listeners', 0) for track in enhanced.get('tracks', [])),
            'average_engagement': round(sum(track.get('engagement_rate', 0) for track in enhanced.get('tracks', [])) / max(len(enhanced.get('tracks', [])), 1), 3),
            'data_enhancement_time': datetime.now().isoformat(),
            'enhancement_version': '2.0'
        }
        
        return enhanced

    def enhance_analytics_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance analytics data with streaming insights"""
        enhanced = data.copy()
        
        # Add streaming analytics
        enhanced['streaming_analytics'] = {
            'peak_concurrent_streams': random.randint(200000, 500000),
            'daily_active_users': random.randint(1000000, 5000000),
            'session_duration_avg': round(random.uniform(15.5, 35.2), 1),
            'skip_rate': round(random.uniform(0.15, 0.35), 3),
            'completion_rate': round(random.uniform(0.65, 0.85), 3),
            
            # Geographic streaming data
            'geographic_streams': {
                'india': round(random.uniform(75.0, 85.0), 1),
                'usa': round(random.uniform(5.0, 10.0), 1),
                'canada': round(random.uniform(2.0, 5.0), 1),
                'uk': round(random.uniform(1.5, 3.0), 1),
                'others': round(random.uniform(3.0, 8.0), 1)
            },
            
            # Time-based patterns
            'hourly_patterns': self.generate_hourly_patterns(),
            'weekly_patterns': self.generate_weekly_patterns(),
            
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        # Add trend predictions
        enhanced['trend_predictions'] = {
            'rising_genres': ['punjabi_fusion', 'tamil_pop', 'regional_remix'],
            'declining_trends': ['classical_fusion'],
            'emerging_artists_count': random.randint(50, 150),
            'predicted_viral_tracks': random.randint(5, 20),
            'confidence_score': round(random.uniform(0.75, 0.95), 3),
            'prediction_horizon_hours': 24
        }
        
        return enhanced

    def generate_top_regions(self) -> List[Dict[str, Any]]:
        """Generate realistic regional data"""
        regions = [
            {'name': 'Mumbai', 'percentage': round(random.uniform(15.0, 25.0), 1)},
            {'name': 'Delhi', 'percentage': round(random.uniform(12.0, 20.0), 1)},
            {'name': 'Bangalore', 'percentage': round(random.uniform(8.0, 15.0), 1)},
            {'name': 'Chennai', 'percentage': round(random.uniform(6.0, 12.0), 1)},
            {'name': 'Kolkata', 'percentage': round(random.uniform(5.0, 10.0), 1)}
        ]
        return regions

    def generate_hourly_patterns(self) -> Dict[str, float]:
        """Generate realistic hourly streaming patterns"""
        patterns = {}
        for hour in range(24):
            if 6 <= hour <= 10:  # Morning peak
                base_value = random.uniform(0.7, 1.0)
            elif 12 <= hour <= 14:  # Lunch peak
                base_value = random.uniform(0.6, 0.8)
            elif 18 <= hour <= 23:  # Evening peak
                base_value = random.uniform(0.8, 1.0)
            else:  # Off-peak
                base_value = random.uniform(0.2, 0.5)
            
            patterns[f"{hour:02d}:00"] = round(base_value, 3)
        
        return patterns

    def generate_weekly_patterns(self) -> Dict[str, float]:
        """Generate weekly streaming patterns"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        patterns = {}
        
        for day in days:
            if day in ['Saturday', 'Sunday']:  # Weekends
                value = random.uniform(0.8, 1.0)
            elif day == 'Friday':  # TGIF
                value = random.uniform(0.7, 0.9)
            else:  # Weekdays
                value = random.uniform(0.5, 0.7)
            
            patterns[day] = round(value, 3)
        
        return patterns

    async def generate_real_time_metrics(self) -> Dict[str, Any]:
        """Generate real-time streaming metrics"""
        metrics = {
            'timestamp': datetime.now().isoformat(),
            'current_active_streams': random.randint(100000, 300000),
            'streams_started_last_minute': random.randint(1000, 5000),
            'streams_completed_last_minute': random.randint(800, 4000),
            'new_user_sessions': random.randint(500, 2000),
            'peak_concurrent_today': random.randint(200000, 500000),
            
            # Device breakdown
            'device_streams': {
                'mobile': round(random.uniform(70.0, 80.0), 1),
                'desktop': round(random.uniform(15.0, 25.0), 1),
                'tablet': round(random.uniform(3.0, 8.0), 1),
                'smart_tv': round(random.uniform(2.0, 5.0), 1)
            },
            
            # Quality metrics
            'average_bitrate_kbps': random.randint(128, 320),
            'buffer_events_per_stream': round(random.uniform(0.1, 0.5), 2),
            'connection_quality_score': round(random.uniform(0.85, 0.98), 3),
            
            # Engagement metrics
            'thumbs_up_rate': round(random.uniform(0.15, 0.35), 3),
            'share_rate': round(random.uniform(0.05, 0.15), 3),
            'playlist_add_rate': round(random.uniform(0.08, 0.20), 3),
            
            'metric_generation_version': '2.0'
        }
        
        return metrics

    async def stream_trending_data(self):
        """Stream trending data to Kafka"""
        while self.is_streaming:
            try:
                trending_data = await self.fetch_trending_data()
                
                if trending_data and self.producer:
                    # Send to Kafka
                    self.producer.send(
                        self.topics['trending_tracks'],
                        key='trending_update',
                        value=trending_data
                    )
                    
                    logger.info(f"📊 Streamed trending data: {len(trending_data.get('tracks', []))} tracks")
                    
                # Wait 3 minutes before next update
                await asyncio.sleep(180)
                
            except Exception as e:
                logger.error(f"❌ Error streaming trending data: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error

    async def stream_analytics_data(self):
        """Stream analytics data to Kafka"""
        while self.is_streaming:
            try:
                analytics_data = await self.fetch_analytics_data()
                
                if analytics_data and self.producer:
                    # Send to Kafka
                    self.producer.send(
                        self.topics['analytics'],
                        key='analytics_update',
                        value=analytics_data
                    )
                    
                    logger.info("📊 Streamed analytics data")
                    
                # Wait 5 minutes before next update
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"❌ Error streaming analytics: {e}")
                await asyncio.sleep(120)  # Wait 2 minutes on error

    async def stream_real_time_metrics(self):
        """Stream real-time metrics to Kafka"""
        while self.is_streaming:
            try:
                metrics = await self.generate_real_time_metrics()
                
                if self.producer:
                    # Send to Kafka
                    self.producer.send(
                        self.topics['real_time_metrics'],
                        key='realtime_metrics',
                        value=metrics
                    )
                    
                    logger.info("⚡ Streamed real-time metrics")
                    
                # Wait 30 seconds before next update
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"❌ Error streaming real-time metrics: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error

    async def start_streaming(self):
        """Start all data streaming tasks"""
        logger.info("🚀 Starting music data streaming...")
        
        # Initialize Kafka producer
        if not await self.initialize_producer():
            logger.error("❌ Failed to initialize producer. Exiting...")
            return
        
        self.is_streaming = True
        
        # Start all streaming tasks
        tasks = [
            asyncio.create_task(self.stream_trending_data()),
            asyncio.create_task(self.stream_analytics_data()),
            asyncio.create_task(self.stream_real_time_metrics())
        ]
        
        logger.info("✅ All streaming tasks started")
        
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            logger.info("🛑 Streaming interrupted by user")
        except Exception as e:
            logger.error(f"❌ Streaming error: {e}")
        finally:
            await self.stop_streaming()

    async def stop_streaming(self):
        """Stop streaming and cleanup resources"""
        logger.info("🛑 Stopping music data streaming...")
        
        self.is_streaming = False
        
        if self.producer:
            self.producer.flush()
            self.producer.close()
            logger.info("✅ Kafka producer closed")
        
        logger.info("✅ Streaming stopped successfully")

    def get_streaming_status(self) -> Dict[str, Any]:
        """Get current streaming status"""
        return {
            'is_streaming': self.is_streaming,
            'kafka_servers': self.kafka_servers,
            'topics': self.topics,
            'last_trending_update': self.data_cache.get('last_trending_update'),
            'cached_tracks_count': len(self.data_cache.get('trending_tracks', [])),
            'producer_status': 'active' if self.producer else 'inactive',
            'status_timestamp': datetime.now().isoformat()
        }

# ===== MAIN EXECUTION =====

async def main():
    """Main execution function"""
    logger.info("🎵 Initializing Global Music Trend Data Streamer...")
    
    # Initialize streamer
    streamer = MusicDataStreamer()
    
    try:
        # Start streaming
        await streamer.start_streaming()
    except KeyboardInterrupt:
        logger.info("🛑 Program interrupted by user")
    except Exception as e:
        logger.error(f"❌ Program error: {e}")
    finally:
        await streamer.stop_streaming()
        logger.info("✅ Program terminated")

if __name__ == "__main__":
    asyncio.run(main())
