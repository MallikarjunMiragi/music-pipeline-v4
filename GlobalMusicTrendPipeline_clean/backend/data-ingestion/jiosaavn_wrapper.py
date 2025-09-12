"""
JioSaavn API Wrapper for Global Music Trend Pipeline
Author: CS3238 Data Engineering Project
"""

import requests
import pandas as pd
from datetime import datetime
from typing import List, Dict, Optional
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JioSaavnMusicConnector:
    def __init__(self, base_url: str = "http://127.0.0.1:5100"):
        """Initialize JioSaavn API wrapper"""
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'GlobalMusicTrendPipeline/1.0'
        })
        logger.info("✅ JioSaavn Music Connector initialized")
    
    def search_trending_songs(self, query: str = "trending hindi songs 2025", limit: int = 50) -> List[Dict]:
        """Search for trending songs"""
        try:
            params = {"query": query, "lyrics": "false"}
            url = f"{self.base_url}/result/"
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            songs = response.json()
            if isinstance(songs, list):
                return songs[:limit]
            return songs.get('data', [])[:limit]
            
        except Exception as e:
            logger.error(f"❌ Error searching songs: {e}")
            return []
    
    def get_song_details(self, song_url: str) -> Dict:
        """Get detailed song information"""
        try:
            params = {"query": song_url, "lyrics": "false"}
            url = f"{self.base_url}/song/"
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"❌ Error getting song details: {e}")
            return {}
    
    def parse_song_data(self, song_json: Dict) -> Dict:
        """Normalize song data for pipeline"""
        try:
            # Extract artist names from artistMap
            artists = []
            artist_map = song_json.get("artistMap", {})
            if artist_map:
                artists = [name for name in artist_map.keys() if name.strip()]
            
            # Fallback to primary_artists if artistMap is empty
            if not artists and song_json.get("primary_artists"):
                artists = [artist.strip() for artist in song_json.get("primary_artists", "").split(",")]
            
            return {
                "track_id": song_json.get("id", ""),
                "track_name": song_json.get("song", "Unknown Track"),
                "artist": ", ".join(artists) if artists else "Unknown Artist",
                "album": song_json.get("album", "Unknown Album"),
                "popularity": self.calculate_popularity_score(song_json),
                "duration_ms": int(song_json.get("duration", 0)) * 1000,
                "explicit": bool(song_json.get("explicit_content", 0)),
                "preview_url": song_json.get("media_preview_url", ""),
                "spotify_url": song_json.get("perma_url", ""),
                "image_url": song_json.get("image", ""),
                "release_date": song_json.get("release_date", song_json.get("year", "")),
                "language": song_json.get("language", "hindi"),
                "label": song_json.get("label", ""),
                "play_count": song_json.get("play_count", 0),
                "genre": self.determine_genre(song_json),
                "data_source": "jiosaavn_api",
                "fetched_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error parsing song data: {e}")
            return {}
    
    def calculate_popularity_score(self, song_json: Dict) -> int:
        """Calculate popularity score from JioSaavn data"""
        play_count = song_json.get("play_count", 0)
        year = song_json.get("year", "2020")
        
        # Base score from play count (normalize to 0-100)
        if play_count > 1000000:  # 1M+ plays
            base_score = 90
        elif play_count > 500000:  # 500K+ plays
            base_score = 80
        elif play_count > 100000:  # 100K+ plays
            base_score = 70
        elif play_count > 50000:   # 50K+ plays
            base_score = 60
        elif play_count > 10000:   # 10K+ plays
            base_score = 50
        else:
            base_score = 30
        
        # Boost for recent releases
        try:
            year_int = int(str(year)[:4])
            if year_int >= 2025:
                base_score += 10
            elif year_int >= 2024:
                base_score += 5
        except (ValueError, TypeError):
            pass
        
        return min(base_score, 100)
    
    def determine_genre(self, song_json: Dict) -> str:
        """Determine genre from song metadata"""
        language = song_json.get("language", "").lower()
        title = song_json.get("song", "").lower()
        album = song_json.get("album", "").lower()
        
        # Check for specific genre indicators
        if "remix" in title or "mix" in title:
            return "remix"
        elif "trending" in title or "trending" in album:
            return "trending"
        elif language == "hindi":
            return "bollywood"
        elif language in ["tamil", "telugu", "malayalam", "kannada"]:
            return "south_indian"
        elif language == "punjabi":
            return "punjabi"
        else:
            return "regional"
    
    def get_comprehensive_trending_data(self, limit: int = 50) -> pd.DataFrame:
        """Get comprehensive trending music data"""
        logger.info(f"🔍 Fetching {limit} trending Indian songs...")
        
        # Multiple search queries for diverse content
        search_queries = [
            "trending hindi songs 2025",
            "latest bollywood hits",
            "viral hindi songs",
            "arijit singh new songs",
            "shreya ghoshal latest"
        ]
        
        all_tracks = []
        tracks_per_query = max(1, limit // len(search_queries))
        
        for query in search_queries:
            try:
                logger.info(f"🔍 Searching: {query}")
                songs = self.search_trending_songs(query, limit=tracks_per_query)
                
                for song in songs:
                    parsed_song = self.parse_song_data(song)
                    if parsed_song and parsed_song.get("track_id"):
                        all_tracks.append(parsed_song)
                
                time.sleep(0.5)  # Rate limiting
                
            except Exception as e:
                logger.warning(f"⚠️ Query '{query}' failed: {e}")
                continue
        
        if all_tracks:
            df = pd.DataFrame(all_tracks)
            
            # Remove duplicates and sort by popularity
            df = df.drop_duplicates(subset=['track_id']).reset_index(drop=True)
            df = df.sort_values('popularity', ascending=False)
            
            logger.info(f"✅ Retrieved {len(df)} unique trending tracks")
            return df
        else:
            logger.warning("⚠️ No tracks retrieved")
            return pd.DataFrame()
    
    def test_connection(self) -> bool:
        """Test API connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                logger.info("✅ JioSaavn API connection successful")
                return True
            else:
                logger.error(f"❌ API returned status {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ API connection failed: {e}")
            return False

# Test the wrapper
def main():
    connector = JioSaavnMusicConnector()
    
    if connector.test_connection():
        trending_data = connector.get_comprehensive_trending_data(limit=25)
        
        if not trending_data.empty:
            print(f"\n🎉 SUCCESS! Retrieved {len(trending_data)} trending tracks")
            print(f"🎵 Top 5 trending songs:")
            
            for i in range(min(5, len(trending_data))):
                track = trending_data.iloc[i]
                print(f"  {i+1}. '{track['track_name']}' by {track['artist']}")
                print(f"      Popularity: {track['popularity']}, Plays: {track['play_count']:,}")
            
            print(f"\n📊 Language distribution: {trending_data['language'].value_counts().to_dict()}")
            print(f"🎭 Genre distribution: {trending_data['genre'].value_counts().to_dict()}")
        else:
            print("❌ No data retrieved")
    else:
        print("❌ API connection failed")

if __name__ == "__main__":
    main()
