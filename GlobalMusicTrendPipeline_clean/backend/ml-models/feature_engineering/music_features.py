"""
Advanced Feature Engineering for Music Trend Prediction
Extracts sophisticated features for ML models
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MusicFeatureEngineer:
    """Advanced feature engineering for music trend prediction"""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.vectorizers = {}
        self.feature_importance = {}
        
        logger.info("🔧 MusicFeatureEngineer initialized")

    def engineer_all_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply all feature engineering steps"""
        logger.info(f"🚀 Engineering features for {len(df)} tracks")
        
        if df.empty:
            return df
        
        # Make a copy to avoid modifying original
        engineered_df = df.copy()
        
        # Apply feature engineering steps
        engineered_df = self._engineer_temporal_cycles(engineered_df)
        engineered_df = self._engineer_artist_network_features(engineered_df)
        engineered_df = self._engineer_content_similarity(engineered_df)
        engineered_df = self._engineer_popularity_dynamics(engineered_df)
        engineered_df = self._engineer_linguistic_features(engineered_df)
        engineered_df = self._engineer_market_features(engineered_df)
        engineered_df = self._create_interaction_features(engineered_df)
        engineered_df = self._calculate_composite_scores(engineered_df)
        
        logger.info(f"✅ Feature engineering complete: {len(engineered_df.columns)} total features")
        return engineered_df

    def _engineer_temporal_cycles(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer cyclical temporal features"""
        logger.info("⏰ Engineering temporal cycle features")
        
        # Cyclical encoding for time features
        df['hour_sin'] = np.sin(2 * np.pi * df.get('hour_of_day', 12) / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df.get('hour_of_day', 12) / 24)
        
        df['day_sin'] = np.sin(2 * np.pi * df.get('day_of_week', 0) / 7)
        df['day_cos'] = np.cos(2 * np.pi * df.get('day_of_week', 0) / 7)
        
        df['month_sin'] = np.sin(2 * np.pi * df.get('month', 6) / 12)
        df['month_cos'] = np.cos(2 * np.pi * df.get('month', 6) / 12)
        
        # Time-based listening patterns
        df['is_festival_season'] = df.get('month', 6).isin([10, 11, 12, 1, 3, 4])  # Indian festivals
        df['is_summer'] = df.get('month', 6).isin([4, 5, 6])
        df['is_monsoon'] = df.get('month', 6).isin([7, 8, 9])
        
        return df

    def _engineer_artist_network_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer artist collaboration and network features"""
        logger.info("👥 Engineering artist network features")
        
        # Artist frequency in current dataset
        artist_counts = df['primary_artist'].value_counts() if 'primary_artist' in df.columns else {}
        df['artist_frequency_current'] = df.get('primary_artist', 'Unknown').map(artist_counts).fillna(0)
        
        # Artist diversity score
        df['artist_diversity'] = df.get('artist_count', 1).apply(
            lambda x: min(x * 0.2, 1.0)  # Cap at 1.0, boost for collaborations
        )
        
        # Collaboration intensity
        df['collaboration_score'] = (
            df.get('artist_count', 1) * 0.3 + 
            df.get('has_feat', False).astype(int) * 0.7
        )
        
        return df

    def _engineer_content_similarity(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer content-based similarity features"""
        logger.info("📝 Engineering content similarity features")
        
        # Track name text features
        if 'track_name' in df.columns:
            # Common words in track names
            all_names = ' '.join(df['track_name'].astype(str))
            common_words = self._extract_common_words(all_names)
            
            for word in common_words[:10]:  # Top 10 common words
                df[f'has_word_{word}'] = df['track_name'].str.contains(word, case=False, na=False)
        
        # Genre clustering
        df['is_mainstream_genre'] = df.get('genre', 'unknown').isin(['bollywood', 'punjabi', 'trending'])
        df['is_regional_genre'] = df.get('genre', 'unknown').isin(['south_indian', 'regional'])
        
        return df

    def _engineer_popularity_dynamics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer dynamic popularity features"""
        logger.info("📈 Engineering popularity dynamics")
        
        # Popularity momentum indicators
        df['popularity_z_score'] = self._calculate_z_score(df.get('popularity', 0))
        df['play_count_z_score'] = self._calculate_z_score(df.get('play_count', 0))
        
        # Relative popularity (compared to position in list)
        if len(df) > 1:
            df['relative_popularity'] = df.get('popularity', 0) / (df.index + 1)
            df['popularity_rank'] = df['popularity'].rank(ascending=False)
            df['popularity_percentile_rank'] = df['popularity_rank'] / len(df) * 100
        else:
            df['relative_popularity'] = df.get('popularity', 0)
            df['popularity_rank'] = 1
            df['popularity_percentile_rank'] = 100
        
        # Engagement velocity (simulated based on features)
        df['engagement_velocity'] = (
            df.get('popularity', 0) * 0.4 +
            np.log1p(df.get('play_count', 0)) * 10 * 0.3 +
            df.get('viral_potential', 0) * 0.3
        )
        
        return df

    def _engineer_linguistic_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer language and linguistic features"""
        logger.info("🗣️ Engineering linguistic features")
        
        # Language family grouping
        indo_aryan = ['hindi', 'punjabi', 'bengali', 'marathi', 'gujarati', 'urdu']
        dravidian = ['tamil', 'telugu', 'malayalam', 'kannada']
        
        df['is_indo_aryan'] = df.get('language', 'unknown').isin(indo_aryan)
        df['is_dravidian'] = df.get('language', 'unknown').isin(dravidian)
        df['is_english'] = df.get('language', 'unknown') == 'english'
        
        # Market size indicators
        major_languages = ['hindi', 'punjabi', 'tamil', 'telugu']
        df['is_major_language'] = df.get('language', 'unknown').isin(major_languages)
        
        # Regional diversity score
        language_weights = {
            'hindi': 0.45, 'punjabi': 0.20, 'tamil': 0.15, 'telugu': 0.12,
            'malayalam': 0.08, 'kannada': 0.06, 'bengali': 0.05, 'marathi': 0.04
        }
        df['language_market_weight'] = df.get('language', 'unknown').map(language_weights).fillna(0.01)
        
        return df

    def _engineer_market_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer market and business features"""
        logger.info("💼 Engineering market features")
        
        # Market penetration potential
        df['market_penetration_score'] = (
            df.get('language_market_weight', 0.01) * 40 +
            df.get('regional_appeal', 0) * 0.3 +
            df.get('is_mainstream_genre', False).astype(int) * 30
        )
        
        # Commercial viability
        df['commercial_viability'] = (
            df.get('popularity', 0) * 0.25 +
            df.get('market_penetration_score', 0) * 0.25 +
            df.get('engagement_score', 0) * 0.25 +
            df.get('viral_potential', 0) * 0.25
        )
        
        # Cross-cultural appeal
        df['cross_cultural_appeal'] = (
            df.get('has_english', False).astype(int) * 20 +
            df.get('is_remix', False).astype(int) * 15 +
            df.get('collaboration_score', 0) * 30 +
            (df.get('artist_count', 1) > 1).astype(int) * 35
        )
        
        return df

    def _create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between different dimensions"""
        logger.info("🔗 Creating interaction features")
        
        # Popularity × Time interactions
        df['popularity_time_interaction'] = (
            df.get('popularity', 0) * df.get('is_prime_time', False).astype(int)
        )
        
        # Language × Genre interactions
        df['hindi_bollywood'] = (
            (df.get('language', '') == 'hindi') & 
            (df.get('genre', '') == 'bollywood')
        ).astype(int)
        
        df['punjabi_trend'] = (
            (df.get('language', '') == 'punjabi') & 
            (df.get('genre', '') == 'trending')
        ).astype(int)
        
        # Artist × Content interactions
        df['multi_artist_remix'] = (
            (df.get('artist_count', 1) > 1) & 
            df.get('is_remix', False)
        ).astype(int)
        
        # Market × Temporal interactions
        df['festival_mainstream'] = (
            df.get('is_festival_season', False) & 
            df.get('is_mainstream_genre', False)
        ).astype(int)
        
        return df

    def _calculate_composite_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate final composite scores for predictions"""
        logger.info("🎯 Calculating composite scores")
        
        # Trend Prediction Score (main target feature)
        df['trend_prediction_score'] = (
            df.get('popularity', 0) * 0.20 +
            df.get('viral_potential', 0) * 0.18 +
            df.get('engagement_velocity', 0) * 0.15 +
            df.get('market_penetration_score', 0) * 0.12 +
            df.get('commercial_viability', 0) * 0.10 +
            df.get('cross_cultural_appeal', 0) * 0.10 +
            df.get('artist_frequency_current', 0) * 0.08 +
            df.get('collaboration_score', 0) * 0.07
        )
        
        # Viral Potential Score (refined)
        df['viral_score_refined'] = (
            df.get('trend_prediction_score', 0) * 0.4 +
            df.get('popularity_z_score', 0) * 20 * 0.3 +
            df.get('engagement_velocity', 0) * 0.3
        )
        
        # Longevity Score (how long it might stay trending)
        df['longevity_score'] = (
            df.get('commercial_viability', 0) * 0.35 +
            df.get('artist_frequency_current', 0) * 5 * 0.25 +
            df.get('market_penetration_score', 0) * 0.25 +
            df.get('is_mainstream_genre', False).astype(int) * 15 * 0.15
        )
        
        return df

    def _calculate_z_score(self, series: pd.Series) -> pd.Series:
        """Calculate z-score with handling for constant series"""
        if series.std() == 0:
            return pd.Series(np.zeros(len(series)), index=series.index)
        return (series - series.mean()) / series.std()

    def _extract_common_words(self, text: str, min_length: int = 3) -> List[str]:
        """Extract most common words from text"""
        words = re.findall(r'\b\w+\b', text.lower())
        words = [w for w in words if len(w) >= min_length]
        
        from collections import Counter
        word_counts = Counter(words)
        return [word for word, count in word_counts.most_common(20)]

    def prepare_features_for_ml(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """Prepare features for ML model training"""
        logger.info("🎯 Preparing features for ML models")
        
        if df.empty:
            return df, []
        
        # Define feature columns for ML
        numerical_features = [
            'popularity', 'play_count_log', 'viral_potential', 'engagement_score',
            'trend_prediction_score', 'viral_score_refined', 'longevity_score',
            'market_penetration_score', 'commercial_viability', 'cross_cultural_appeal',
            'artist_count', 'collaboration_score', 'engagement_velocity',
            'hour_sin', 'hour_cos', 'day_sin', 'day_cos', 'month_sin', 'month_cos',
            'language_market_weight', 'artist_diversity', 'relative_popularity'
        ]
        
        categorical_features = [
            'language_encoded', 'genre_encoded', 'popularity_category',
            'trend_direction', 'is_mainstream_genre', 'is_regional_genre',
            'is_major_language', 'is_weekend', 'is_prime_time', 'is_festival_season'
        ]
        
        boolean_features = [
            'has_feat', 'is_remix', 'has_numbers', 'has_english', 'is_title_case',
            'is_indo_aryan', 'is_dravidian', 'hindi_bollywood', 'punjabi_trend',
            'multi_artist_remix', 'festival_mainstream'
        ]
        
        # Select available features
        available_features = []
        for feature_list in [numerical_features, categorical_features, boolean_features]:
            available_features.extend([f for f in feature_list if f in df.columns])
        
        # Create feature matrix
        feature_df = df[available_features].copy()
        
        # Handle missing values
        for col in feature_df.columns:
            if feature_df[col].dtype in ['object', 'category']:
                feature_df[col] = feature_df[col].fillna('unknown')
            else:
                feature_df[col] = feature_df[col].fillna(0)
        
        logger.info(f"✅ Prepared {len(available_features)} features for ML")
        return feature_df, available_features

    def get_feature_importance_report(self, df: pd.DataFrame) -> Dict:
        """Generate feature importance report"""
        if df.empty:
            return {}
        
        numerical_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        
        report = {
            'total_features': len(df.columns),
            'numerical_features': len(numerical_cols),
            'categorical_features': len(categorical_cols),
            'key_features': {
                'trend_indicators': ['trend_prediction_score', 'viral_score_refined', 'longevity_score'],
                'popularity_metrics': ['popularity', 'engagement_score', 'viral_potential'],
                'market_features': ['market_penetration_score', 'commercial_viability', 'cross_cultural_appeal'],
                'temporal_features': ['hour_sin', 'hour_cos', 'day_sin', 'day_cos'],
                'content_features': ['language_encoded', 'genre_encoded', 'artist_count']
            },
            'feature_stats': {}
        }
        
        # Add basic statistics for key numerical features
        key_numerical = ['trend_prediction_score', 'viral_score_refined', 'popularity', 'engagement_score']
        for feature in key_numerical:
            if feature in df.columns:
                report['feature_stats'][feature] = {
                    'mean': df[feature].mean(),
                    'std': df[feature].std(),
                    'min': df[feature].min(),
                    'max': df[feature].max()
                }
        
        return report


# Example usage
if __name__ == "__main__":
    # This would typically be run after data processing
    engineer = MusicFeatureEngineer()
    
    # Sample data for testing
    sample_df = pd.DataFrame({
        'track_name': ['Kesariya', 'Excuses', 'Vibe'],
        'primary_artist': ['Arijit Singh', 'AP Dhillon', 'Divine'],
        'popularity': [95, 88, 82],
        'play_count': [5000000, 3000000, 2500000],
        'language': ['hindi', 'punjabi', 'hindi'],
        'genre': ['bollywood', 'punjabi', 'trending'],
        'artist_count': [1, 2, 1],
        'has_feat': [False, True, False],
        'is_remix': [False, False, True],
        'hour_of_day': [20, 19, 21],
        'day_of_week': [5, 6, 0],  # Saturday, Sunday, Monday
        'month': [10, 11, 12]
    })
    
    # Engineer features
    engineered_df = engineer.engineer_all_features(sample_df)
    
    # Prepare for ML
    ml_features, feature_names = engineer.prepare_features_for_ml(engineered_df)
    
    print("✅ Feature Engineering Test Complete!")
    print(f"Original features: {len(sample_df.columns)}")
    print(f"Engineered features: {len(engineered_df.columns)}")
    print(f"ML-ready features: {len(feature_names)}")
    
    # Feature importance report
    report = engineer.get_feature_importance_report(engineered_df)
    print(f"\n📊 Feature Report:")
    print(f"Total features: {report['total_features']}")
    print(f"Numerical: {report['numerical_features']}")
    print(f"Categorical: {report['categorical_features']}")
