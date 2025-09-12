import json
from kafka import KafkaConsumer
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MusicStreamConsumer:
    def __init__(self, kafka_bootstrap_servers=['localhost:9092']):
        self.consumer = KafkaConsumer(
            'indian_music_trends',
            bootstrap_servers=kafka_bootstrap_servers,
            auto_offset_reset='latest',
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        logger.info("✅ Kafka Consumer initialized for Indian music trends")

    def process_streaming_data(self):
        """Process real-time music streaming data"""
        logger.info("🎵 Starting real-time music trend processing...")
        
        for message in self.consumer:
            try:
                data = message.value
                track = data['track']
                timestamp = data['timestamp']
                
                # Process the streaming music data
                logger.info(f"📊 Processing: {track['track_name']} by {track['artist']}")
                logger.info(f"🔥 Popularity: {track['popularity']}, Plays: {track['play_count']:,}")
                
                # Here you can:
                # 1. Update database with real-time data
                # 2. Trigger alerts for trending changes  
                # 3. Send WebSocket updates to frontend
                # 4. Run ML predictions on new data
                
                self.detect_trending_changes(track)
                
            except Exception as e:
                logger.error(f"❌ Error processing message: {e}")

    def detect_trending_changes(self, track):
        """Detect and alert on trending music changes"""
        if track['popularity'] > 95:
            logger.info(f"🚨 TRENDING ALERT: {track['track_name']} is going viral!")
        
        if track['genre'] == 'bollywood' and track['language'] == 'hindi':
            logger.info(f"🎬 Bollywood hit detected: {track['track_name']}")

if __name__ == '__main__':
    consumer = MusicStreamConsumer()
    consumer.process_streaming_data()
