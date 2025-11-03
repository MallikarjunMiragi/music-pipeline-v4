"""
Database Models for Music Trend Pipeline
This defines the structure of our database tables
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Track(Base):
    """Stores information about each song"""
    __tablename__ = 'tracks'
    
    # Primary key - unique identifier for each track
    id = Column(String(50), primary_key=True)
    
    # Basic track information
    name = Column(String(500), nullable=False)
    album = Column(String(500))
    year = Column(Integer)
    language = Column(String(50))
    duration = Column(Integer)  # in seconds
    
    # URLs and media
    image_url = Column(Text)
    perma_url = Column(Text)
    
    # Artist information (we'll store primary artist here)
    primary_artist_id = Column(String(50))
    primary_artist_name = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to metrics
    metrics = relationship("TrackMetrics", back_populates="track")
    
    # Create index for faster searches
    __table_args__ = (
        Index('idx_track_language', 'language'),
        Index('idx_track_year', 'year'),
    )


class TrackMetrics(Base):
    """Stores play counts and engagement metrics"""
    __tablename__ = 'track_metrics'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    track_id = Column(String(50), ForeignKey('tracks.id'), nullable=False)
    
    # Metrics from API
    play_count = Column(Integer, default=0)
    trending_score = Column(Float, default=0.0)
    
    # Calculated metrics
    daily_plays = Column(Integer, default=0)
    weekly_plays = Column(Integer, default=0)
    
    # Timestamp for this snapshot
    snapshot_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationship back to track
    track = relationship("Track", back_populates="metrics")
    
    __table_args__ = (
        Index('idx_metrics_date', 'snapshot_date'),
        Index('idx_metrics_track_date', 'track_id', 'snapshot_date'),
    )


class Artist(Base):
    """Stores artist information"""
    __tablename__ = 'artists'
    
    id = Column(String(50), primary_key=True)
    name = Column(String(500), nullable=False)
    image_url = Column(Text)
    perma_url = Column(Text)
    
    # Artist stats
    total_tracks = Column(Integer, default=0)
    total_albums = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MLPrediction(Base):
    """Stores ML model predictions"""
    __tablename__ = 'ml_predictions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    track_id = Column(String(50), ForeignKey('tracks.id'), nullable=False)
    
    # Prediction types
    predicted_popularity = Column(Float)
    trend_direction = Column(String(20))  # 'rising', 'stable', 'declining'
    trend_confidence = Column(Float)
    
    # Model metadata
    model_version = Column(String(50))
    prediction_date = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_prediction_track', 'track_id'),
        Index('idx_prediction_date', 'prediction_date'),
    )
