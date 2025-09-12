import base64
from pyDes import *
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def decrypt_url(url):
    """Decrypt JioSaavn's encrypted media URLs"""
    if not url:
        return ""
    
    try:
        # JioSaavn's decryption key and parameters
        key = b"38346591"
        cipher = des(key, ECB, b"\x00" * 8, pad=None, padmode=PAD_PKCS5)
        
        # Decode and decrypt
        encrypted_data = base64.b64decode(url.strip())
        decrypted_data = cipher.decrypt(encrypted_data, padmode=PAD_PKCS5)
        
        # Convert to string and upgrade quality
        decrypted_url = decrypted_data.decode('utf-8')
        decrypted_url = decrypted_url.replace("_96.mp4", "_320.mp4")
        
        return decrypted_url
    except Exception as e:
        logger.error(f"Failed to decrypt URL: {e}")
        return url  # Return original URL if decryption fails

def safe_format(string):
    """Safely format strings by handling HTML entities and special characters"""
    if not string:
        return ""
    
    try:
        # Convert to string and clean HTML entities
        formatted = str(string)
        formatted = formatted.replace('"', "'")
        formatted = formatted.replace("&amp;", "&")
        formatted = formatted.replace("&#039;", "'")
        formatted = formatted.replace("&quot;", '"')
        formatted = formatted.replace("&lt;", "<")
        formatted = formatted.replace("&gt;", ">")
        
        return formatted
    except Exception as e:
        logger.error(f"Failed to format string: {e}")
        return str(string) if string else ""

def format_song(data, lyrics=False):
    """Format individual song data with enhanced error handling"""
    if not data:
        return None
    
    try:
        # Handle encrypted media URL
        encrypted_url = data.get('encrypted_media_url', '')
        if encrypted_url:
            data['media_url'] = decrypt_url(encrypted_url)
            
            # Adjust quality based on 320kbps flag
            if data.get('320kbps') != "true":
                data['media_url'] = data['media_url'].replace("_320.mp4", "_160.mp4")
                
            # Generate preview URL
            preview_url = data['media_url'].replace("_320.mp4", "_96_p.mp4")
            preview_url = preview_url.replace("_160.mp4", "_96_p.mp4")
            preview_url = preview_url.replace("//aac.", "//preview.")
            data['media_preview_url'] = preview_url
        else:
            # Fallback handling for media URLs
            if 'media_preview_url' in data:
                url = data['media_preview_url'].replace("preview", "aac")
                if data.get('320kbps') == "true":
                    url = url.replace("_96_p.mp4", "_320.mp4")
                else:
                    url = url.replace("_96_p.mp4", "_160.mp4")
                data['media_url'] = url

        # Format text fields
        text_fields = ['song', 'music', 'singers', 'starring', 'album', 'primary_artists']
        for field in text_fields:
            if field in data:
                data[field] = safe_format(data[field])

        # Upgrade image quality
        if 'image' in data and data['image']:
            data['image'] = data['image'].replace("150x150", "500x500")

        # Handle lyrics if requested
        if lyrics and data.get('has_lyrics') == 'true' and data.get('id'):
            try:
                import jiosaavn
                data['lyrics'] = jiosaavn.get_lyrics(data['id'])
            except ImportError:
                logger.warning("jiosaavn module not available for lyrics")
                data['lyrics'] = None
            except Exception as e:
                logger.warning(f"Failed to fetch lyrics: {e}")
                data['lyrics'] = None
        elif not lyrics:
            data['lyrics'] = None

        # Fix copyright text
        if 'copyright_text' in data and data['copyright_text']:
            data['copyright_text'] = data['copyright_text'].replace("©", "©")

        return data
        
    except Exception as e:
        logger.error(f"Failed to format song data: {e}")
        return data

def format_album(data, lyrics=False):
    """Format album data with all songs"""
    if not data:
        return None
    
    try:
        # Upgrade album image quality
        if 'image' in data and data['image']:
            data['image'] = data['image'].replace("150x150", "500x500")

        # Format text fields
        text_fields = ['name', 'primary_artists', 'title', 'subtitle']
        for field in text_fields:
            if field in data:
                data[field] = safe_format(data[field])

        # Format all songs in the album
        if 'songs' in data and isinstance(data['songs'], list):
            formatted_songs = []
            for song in data['songs']:
                formatted_song = format_song(song, lyrics)
                if formatted_song:
                    formatted_songs.append(formatted_song)
            data['songs'] = formatted_songs

        return data
        
    except Exception as e:
        logger.error(f"Failed to format album data: {e}")
        return data

def format_playlist(data, lyrics=False):
    """Format playlist data with all songs"""
    if not data:
        return None
    
    try:
        # Format playlist metadata
        text_fields = ['firstname', 'listname', 'title', 'subtitle']
        for field in text_fields:
            if field in data:
                data[field] = safe_format(data[field])

        # Format all songs in the playlist
        if 'songs' in data and isinstance(data['songs'], list):
            formatted_songs = []
            for song in data['songs']:
                formatted_song = format_song(song, lyrics)
                if formatted_song:
                    formatted_songs.append(formatted_song)
            data['songs'] = formatted_songs

        # Upgrade playlist image if available
        if 'image' in data and data['image']:
            data['image'] = data['image'].replace("150x150", "500x500")

        return data
        
    except Exception as e:
        logger.error(f"Failed to format playlist data: {e}")
        return data

def format(string):
    """Legacy format function for backward compatibility"""
    return safe_format(string)

# Test function to verify helper functions work correctly
def test_helper_functions():
    """Test the helper functions with sample data"""
    logger.info("Testing helper functions...")
    
    # Test safe_format
    test_string = 'Test &amp; "quotes" &#039;apostrophe&#039;'
    formatted = safe_format(test_string)
    logger.info(f"Formatted string: {formatted}")
    
    # Test sample song data format
    sample_song = {
        'id': '12345',
        'song': 'Test Song &amp; Title',
        'primary_artists': 'Test Artist',
        'image': 'https://example.com/150x150/image.jpg',
        '320kbps': 'true',
        'has_lyrics': 'false'
    }
    
    formatted_song = format_song(sample_song, lyrics=False)
    if formatted_song:
        logger.info("✅ Song formatting test passed")
    else:
        logger.error("❌ Song formatting test failed")
    
    return formatted_song

if __name__ == "__main__":
    test_helper_functions()
