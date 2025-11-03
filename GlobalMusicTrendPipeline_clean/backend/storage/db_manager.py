"""
Database Manager - Handles all database operations
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
import logging
from typing import Optional, List, Dict
import os

from .schemas import Base, Track, TrackMetrics, Artist, MLPrediction

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages database connections and operations"""
    
    def __init__(self, db_url: str = None):
        """
        Initialize database connection
        
        Args:
            db_url: Database connection string
                   Format: postgresql://username:password@localhost:5432/database_name
        """
        if db_url is None:
            # Default connection string (you'll change this later)
            db_url = os.getenv(
                'DATABASE_URL',
                'postgresql://musicuser:musicpass@localhost:5432/musicdb'
            )
        
        self.engine = create_engine(
            db_url,
            poolclass=QueuePool,
            pool_size=5,
            max_overflow=10,
            echo=False  # Set to True to see SQL queries
        )
        
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
        
        logger.info("✅ Database Manager initialized")
    
    def create_tables(self):
        """Create all tables in the database"""
        Base.metadata.create_all(bind=self.engine)
        logger.info("✅ All database tables created")
    
    def drop_tables(self):
        """Drop all tables (use carefully!)"""
        Base.metadata.drop_all(bind=self.engine)
        logger.warning("⚠️ All database tables dropped")
    
    @contextmanager
    def get_session(self):
        """
        Get a database session
        Usage:
            with db_manager.get_session() as session:
                # do database operations
                session.add(track)
                session.commit()
        """
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            session.close()
    
    def insert_track(self, track_data: Dict) -> bool:
        """
        Insert or update a track in the database
        
        Args:
            track_data: Dictionary containing track information
        
        Returns:
            True if successful, False otherwise
        """
        try:
            with self.get_session() as session:
                # Check if track already exists
                existing_track = session.query(Track).filter(
                    Track.id == track_data.get('id')
                ).first()
                
                if existing_track:
                    # Update existing track
                    for key, value in track_data.items():
                        if hasattr(existing_track, key):
                            setattr(existing_track, key, value)
                    logger.info(f"Updated track: {track_data.get('name')}")
                else:
                    # Insert new track
                    track = Track(**track_data)
                    session.add(track)
                    logger.info(f"Inserted track: {track_data.get('name')}")
                
                return True
        except Exception as e:
            logger.error(f"Error inserting track: {e}")
            return False
    
    def insert_track_metrics(self, metrics_data: Dict) -> bool:
        """Insert track metrics"""
        try:
            with self.get_session() as session:
                metrics = TrackMetrics(**metrics_data)
                session.add(metrics)
                return True
        except Exception as e:
            logger.error(f"Error inserting metrics: {e}")
            return False
    
    def get_all_tracks(self, limit: int = 100) -> List[Dict]:
        """Get all tracks from database"""
        try:
            with self.get_session() as session:
                tracks = session.query(Track).limit(limit).all()
                return [
                    {
                        'id': t.id,
                        'name': t.name,
                        'album': t.album,
                        'language': t.language,
                        'primary_artist_name': t.primary_artist_name,
                        'image_url': t.image_url
                    }
                    for t in tracks
                ]
        except Exception as e:
            logger.error(f"Error getting tracks: {e}")
            return []
    
    def get_track_by_id(self, track_id: str) -> Optional[Dict]:
        """Get a specific track by ID"""
        try:
            with self.get_session() as session:
                track = session.query(Track).filter(Track.id == track_id).first()
                if track:
                    return {
                        'id': track.id,
                        'name': track.name,
                        'album': track.album,
                        'language': track.language,
                        'year': track.year,
                        'primary_artist_name': track.primary_artist_name
                    }
                return None
        except Exception as e:
            logger.error(f"Error getting track: {e}")
            return None


# Create a global instance (singleton pattern)
db_manager = None

def get_db_manager() -> DatabaseManager:
    """Get the global database manager instance"""
    global db_manager
    if db_manager is None:
        db_manager = DatabaseManager()
    return db_manager
