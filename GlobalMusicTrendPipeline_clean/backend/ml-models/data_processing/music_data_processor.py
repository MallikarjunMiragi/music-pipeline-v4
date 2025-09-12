"""
Enhanced Music Data Processor for ML Pipeline
Processes JioSaavn data for machine learning models
"""

import pandas as pd
import numpy as np
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MusicDataProcessor:
    """Advanced music data processor for ML pipeline"""
    
    def __init__(self, data_dir: str = "../../data"):
        self.data_dir = Path(data_dir)
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        
        # Create directories
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize feature mappings
        self.language_mapping = self._create_language_mapping()
        self.genre_mapping = self._create_genre_mapping()
        
        logger.info("🎵 MusicDataProcessor initialized")

    def process_trending_data(self, raw_data: Dict) -> pd.DataFrame:
        """Process raw trending data from JioSaavn API"""
        try:
            tracks = raw_data.get('tracks', [])
            if not tracks:
                logger.warning("No tracks found in raw data")
                return pd.DataFrame()
            
            logger.info(f"📊 Processing {len(tracks)} tracks")
            
            # Convert to DataFrame
            df = pd.DataFrame(tracks)
            
            # Clean and enhance data
            df = self._clean_basic_fields(df)
            df = self._extract_artist_features(df)
            df = self._extract_temporal_features(df)
            df = self._extract_popularity_features(df)
            df = self._extract_content_features(df)
            df = self._calculate_trend_indicators(df)
            
            # Add metadata
            df['processed_at'] = datetime.now()
            df['data_source'] = 'jiosaavn_trending'
            
            logger.info(f"✅ Processed {len(df)} tracks with {len(df.columns)} features")
            return df
            
        except Exception as e:
            logger.error(f"❌ Error processing trending data: {e}")
            return pd.DataFrame()

    def _clean_basic_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize basic fields"""
        logger.info("🧹 Cleaning basic fields")
        
        # Standardize track names
        df['track_name'] = df.get('song', df.get('track_name', 'Unknown'))
        df['track_name'] = df['track_name'].fillna('Unknown')
        
        # Standardize artist names
        df['artist_name'] = df.get('primary_artists', df.get('artist', 'Unknown'))
        df['artist_name'] = df['artist_name'].fillna('Unknown')
        
        # Clean popularity scores
        df['popularity'] = pd.to_numeric(df.get('popularity', 0), errors='coerce').fillna(0)
        df['popularity'] = df['popularity'].clip(0, 100)
        
        # Clean play counts
        df['play_count'] = pd.to_numeric(df.get('play_count', 0), errors='coerce').fillna(0)
        
        # Standardize language
        df['language'] = df.get('language', 'unknown').fillna('unknown').str.lower()
        
        # Standardize genre
        df['genre'] = df.get('genre_category', df.get('genre', 'unknown')).fillna('unknown').str.lower()
        
        return df

    def _extract_artist_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract artist-related features"""
        logger.info("👨‍🎤 Extracting artist features")
        
        # Count number of artists per track
        df['artist_count'] = df['artist_name'].apply(self._count_artists)
        
        # Extract primary artist
        df['primary_artist'] = df['artist_name'].apply(self._extract_primary_artist)
        
        # Artist name length (popularity indicator)
        df['artist_name_length'] = df['primary_artist'].str.len()
        
        # Check if artist name contains common indicators
        df['has_feat'] = df['artist_name'].str.contains('feat|ft\.|featuring', case=False, na=False)
        df['is_remix'] = df['track_name'].str.contains('remix|mix|version', case=False, na=False)
        
        return df

    def _extract_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract time-based features"""
        logger.info("⏰ Extracting temporal features")
        
        now = datetime.now()
        
        # Current time features
        df['hour_of_day'] = now.hour
        df['day_of_week'] = now.weekday()  # 0=Monday, 6=Sunday
        df['month'] = now.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6])
        
        # Time-based popularity indicators
        df['is_prime_time'] = df['hour_of_day'].between(18, 23)  # 6 PM - 11 PM
        df['is_morning_rush'] = df['hour_of_day'].between(7, 10)  # 7 AM - 10 AM
        
        return df

    def _extract_popularity_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract popularity and engagement features"""
        logger.info("🔥 Extracting popularity features")
        
        # Popularity percentiles
        df['popularity_percentile'] = df['popularity'].rank(pct=True) * 100
        
        # Play count features
        df['play_count_log'] = np.log1p(df['play_count'])
        df['play_count_percentile'] = df['play_count'].rank(pct=True) * 100
        
        # Popularity categories
        df['popularity_category'] = pd.cut(
            df['popularity'], 
            bins=[0, 50, 70, 85, 100], 
            labels=['Low', 'Medium', 'High', 'Viral']
        )
        
        # Engagement score (composite metric)
        df['engagement_score'] = (
            df['popularity'] * 0.4 + 
            df['play_count_percentile'] * 0.3 + 
            df['popularity_percentile'] * 0.3
        )
        
        return df

    def _extract_content_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract content-based features"""
        logger.info("📝 Extracting content features")
        
        # Track name features
        df['track_name_length'] = df['track_name'].str.len()
        df['track_name_word_count'] = df['track_name'].str.split().str.len()
        
        # Language encoding
        df['language_encoded'] = df['language'].map(self.language_mapping).fillna(0)
        
        # Genre encoding
        df['genre_encoded'] = df['genre'].map(self.genre_mapping).fillna(0)
        
        # Content indicators
        df['has_numbers'] = df['track_name'].str.contains(r'\d', na=False)
        df['has_english'] = df['track_name'].str.contains(r'[a-zA-Z]', na=False)
        df['is_title_case'] = df['track_name'].str.istitle()
        
        return df

    def _calculate_trend_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate trend prediction indicators"""
        logger.info("📈 Calculating trend indicators")
        
        # Viral potential score
        df['viral_potential'] = (
            df['engagement_score'] * 0.3 +
            df['popularity'] * 0.25 +
            (100 - df.index) * 0.2 +  # Position in trending list
            df['artist_count'].apply(lambda x: min(x * 10, 50)) * 0.15 +  # Collaboration boost
            df['is_remix'].astype(int) * 20 * 0.1  # Remix popularity
        )
        
        # Regional appeal score
        regional_weights = {
            'hindi': 0.4, 'punjabi': 0.25, 'tamil': 0.15, 'telugu': 0.12, 
            'malayalam': 0.08, 'kannada': 0.06, 'bengali': 0.05, 'marathi': 0.04
        }
        df['regional_appeal'] = df['language'].map(regional_weights).fillna(0.02) * 100
        
        # Trend momentum (based on position and features)
        df['trend_momentum'] = (
            (100 - df.index) * 0.4 +  # Higher for top positions
            df['viral_potential'] * 0.3 +
            df['regional_appeal'] * 0.3
        )
        
        # Predict trend direction
        df['trend_direction'] = df['trend_momentum'].apply(
            lambda x: 'Rising' if x > 70 else 'Stable' if x > 40 else 'Declining'
        )
        
        return df

    def _count_artists(self, artist_string: str) -> int:
        """Count number of artists in artist string"""
        if pd.isna(artist_string):
            return 1
        return len([a.strip() for a in str(artist_string).split(',') if a.strip()])

    def _extract_primary_artist(self, artist_string: str) -> str:
        """Extract primary artist name"""
        if pd.isna(artist_string):
            return 'Unknown'
        return str(artist_string).split(',')[0].strip()

    def _create_language_mapping(self) -> Dict[str, int]:
        """Create language to numeric mapping"""
        return {
            'hindi': 1, 'punjabi': 2, 'tamil': 3, 'telugu': 4, 'malayalam': 5,
            'kannada': 6, 'bengali': 7, 'marathi': 8, 'gujarati': 9, 'urdu': 10,
            'english': 11, 'unknown': 0
        }

    def _create_genre_mapping(self) -> Dict[str, int]:
        """Create genre to numeric mapping"""
        return {
            'bollywood': 1, 'punjabi': 2, 'south_indian': 3, 'trending': 4,
            'remix': 5, 'regional': 6, 'classical': 7, 'devotional': 8,
            'pop': 9, 'rock': 10, 'unknown': 0
        }

    def save_processed_data(self, df: pd.DataFrame, filename: str) -> str:
        """Save processed data to file"""
        try:
            filepath = self.processed_dir / f"{filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df.to_csv(filepath, index=False)
            logger.info(f"💾 Saved processed data to {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"❌ Error saving data: {e}")
            return ""

    def get_feature_summary(self, df: pd.DataFrame) -> Dict:
        """Get summary of extracted features"""
        if df.empty:
            return {}
        
        summary = {
            'total_tracks': len(df),
            'total_features': len(df.columns),
            'avg_popularity': df['popularity'].mean(),
            'top_language': df['language'].mode().iloc[0] if not df['language'].mode().empty else 'unknown',
            'top_genre': df['genre'].mode().iloc[0] if not df['genre'].mode().empty else 'unknown',
            'avg_viral_potential': df.get('viral_potential', pd.Series([0])).mean(),
            'rising_tracks': len(df[df.get('trend_direction') == 'Rising']),
            'processing_timestamp': datetime.now().isoformat()
        }
        
        return summary


# Example usage and testing
if __name__ == "__main__":
    processor = MusicDataProcessor()
    
    # Example data structure (simulating JioSaavn API response)
    sample_data = {
        "tracks": [
            {
                "song": "Kesariya",
                "primary_artists": "Arijit Singh",
                "popularity": 95,
                "play_count": 5000000,
                "language": "hindi",
                "genre_category": "bollywood"
            },
            {
                "song": "Excuses",
                "primary_artists": "AP Dhillon, Gurinder Gill",
                "popularity": 88,
                "play_count": 3000000, 
                "language": "punjabi",
                "genre_category": "punjabi"
            }
        ]
    }
    
    # Process the data
    processed_df = processor.process_trending_data(sample_data)
    
    if not processed_df.empty:
        print("✅ Sample Processing Results:")
        print(f"Tracks processed: {len(processed_df)}")
        print(f"Features extracted: {len(processed_df.columns)}")
        print("\nFeature Summary:")
        summary = processor.get_feature_summary(processed_df)
        for key, value in summary.items():
            print(f"  {key}: {value}")
        
        # Save sample data
        saved_path = processor.save_processed_data(processed_df, "sample_trending")
        print(f"\n💾 Sample data saved to: {saved_path}")
