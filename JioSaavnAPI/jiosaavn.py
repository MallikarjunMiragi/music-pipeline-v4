import requests
import json
import re
import time
from traceback import print_exc
from urllib.parse import quote

# Enhanced session with timeouts and retries
session = requests.Session()
session.timeout = (5, 30)  # (connection, read) timeouts

# JioSaavn API endpoints (fallback if endpoints.py missing)
try:
    import endpoints
    SEARCH_URL = endpoints.search_base_url
    SONG_DETAILS_URL = endpoints.song_details_base_url
    ALBUM_DETAILS_URL = endpoints.album_details_base_url
    PLAYLIST_DETAILS_URL = endpoints.playlist_details_base_url
    LYRICS_URL = endpoints.lyrics_base_url
except (ImportError, AttributeError):
    # Fallback URLs
    BASE_URL = "https://www.jiosaavn.com/api.php"
    SEARCH_URL = f"{BASE_URL}?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query="
    SONG_DETAILS_URL = f"{BASE_URL}?__call=song.getDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&pids="
    ALBUM_DETAILS_URL = f"{BASE_URL}?__call=content.getAlbumDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&albumid="
    PLAYLIST_DETAILS_URL = f"{BASE_URL}?__call=playlist.getDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&listid="
    LYRICS_URL = f"{BASE_URL}?__call=lyrics.getLyrics&_format=json&_marker=0%3F_marker%3D0&lyrics_id="

def safe_request(url, max_retries=3, delay=1):
    """Make a safe HTTP request with retries and error handling"""
    for attempt in range(max_retries):
        try:
            response = session.get(url, timeout=(5, 30))
            response.raise_for_status()
            return response
        except requests.exceptions.Timeout:
            print(f"⏰ Timeout on attempt {attempt + 1}")
            if attempt < max_retries - 1:
                time.sleep(delay * (attempt + 1))
                continue
            raise Exception("Request timeout after retries")
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(delay * (attempt + 1))
                continue
            raise Exception(f"Request failed: {str(e)}")
    return None

def clean_json_response(response_text):
    """Clean and parse JSON response from JioSaavn API"""
    try:
        # Handle unicode escape sequences
        cleaned_text = response_text.encode('utf-8').decode('unicode_escape')
        
        # Fix common JSON issues in JioSaavn responses
        pattern = r'\(From "([^"]+)"\)'
        cleaned_text = re.sub(pattern, r"(From '\1')", cleaned_text)
        
        # Parse JSON
        return json.loads(cleaned_text)
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        print(f"❌ JSON parsing error: {e}")
        return None

def search_for_song(query, lyrics=False, songdata=True):
    """Search for songs with enhanced error handling and validation"""
    if not query or not query.strip():
        return {"status": False, "error": "Query cannot be empty"}
    
    # Handle JioSaavn URL queries
    if query.startswith('http') and 'saavn.com' in query:
        song_id = get_song_id(query)
        if song_id:
            return get_song(song_id, lyrics)
        else:
            return {"status": False, "error": "Invalid JioSaavn URL"}
    
    try:
        # URL encode the query
        encoded_query = quote(query.strip())
        search_url = SEARCH_URL + encoded_query
        
        print(f"🔍 Searching for: {query}")
        response = safe_request(search_url)
        
        if not response:
            return {"status": False, "error": "Search request failed"}
        
        # Parse response
        data = clean_json_response(response.text)
        if not data:
            return {"status": False, "error": "Invalid response format"}
        
        # Extract song data
        songs_data = data.get('songs', {}).get('data', [])
        if not songs_data:
            return {"status": True, "songs": [], "message": "No songs found"}
        
        # Return raw data if songdata=False
        if not songdata:
            return songs_data
        
        # Get detailed song information
        detailed_songs = []
        for song in songs_data[:10]:  # Limit to first 10 for performance
            song_id = song.get('id')
            if song_id:
                detailed_song = get_song(song_id, lyrics)
                if detailed_song:
                    detailed_songs.append(detailed_song)
                time.sleep(0.1)  # Rate limiting
        
        return detailed_songs
        
    except Exception as e:
        print_exc()
        return {"status": False, "error": f"Search failed: {str(e)}"}

def get_song(song_id, lyrics=False):
    """Get detailed song information"""
    if not song_id:
        return None
    
    try:
        url = SONG_DETAILS_URL + str(song_id)
        response = safe_request(url)
        
        if not response:
            return None
        
        # Parse response
        data = clean_json_response(response.text)
        if not data or song_id not in data:
            return None
        
        # Import helper for formatting
        try:
            import helper
            return helper.format_song(data[song_id], lyrics)
        except ImportError:
            # Return raw data if helper not available
            song_data = data[song_id]
            song_data['song_id'] = song_id
            return song_data
            
    except Exception as e:
        print(f"❌ Error getting song {song_id}: {e}")
        return None

def get_song_id(url):
    """Extract song ID from JioSaavn URL"""
    if not url or 'saavn.com' not in url:
        return None
    
    try:
        response = safe_request(url)
        if not response:
            return None
        
        # Try different patterns to extract song ID
        patterns = [
            r'"pid":"([^"]+)"',
            r'"song":{"type":"[^"]+","image":"[^"]+","id":"([^"]+)"',
            r'"id":"([^"]+)"'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, response.text)
            if matches:
                return matches[0]
        
        return None
        
    except Exception as e:
        print(f"❌ Error extracting song ID from URL: {e}")
        return None

def get_album(album_id, lyrics=False):
    """Get album details and songs"""
    if not album_id:
        return None
    
    try:
        url = ALBUM_DETAILS_URL + str(album_id)
        response = safe_request(url)
        
        if not response:
            return None
        
        data = clean_json_response(response.text)
        if not data:
            return None
        
        try:
            import helper
            return helper.format_album(data, lyrics)
        except ImportError:
            return data
            
    except Exception as e:
        print(f"❌ Error getting album {album_id}: {e}")
        return None

def get_album_id(url):
    """Extract album ID from JioSaavn URL"""
    if not url or 'saavn.com' not in url:
        return None
    
    try:
        response = safe_request(url)
        if not response:
            return None
        
        patterns = [
            r'"album_id":"([^"]+)"',
            r'"page_id","([^"]+)"'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, response.text)
            if matches:
                return matches[0]
        
        return None
        
    except Exception as e:
        print(f"❌ Error extracting album ID: {e}")
        return None

def get_playlist(playlist_id, lyrics=False):
    """Get playlist details and songs"""
    if not playlist_id:
        return None
    
    try:
        url = PLAYLIST_DETAILS_URL + str(playlist_id)
        response = safe_request(url)
        
        if not response:
            return None
        
        data = clean_json_response(response.text)
        if not data:
            return None
        
        try:
            import helper
            return helper.format_playlist(data, lyrics)
        except ImportError:
            return data
            
    except Exception as e:
        print(f"❌ Error getting playlist {playlist_id}: {e}")
        return None

def get_playlist_id(url):
    """Extract playlist ID from JioSaavn URL"""
    if not url or 'saavn.com' not in url:
        return None
    
    try:
        response = safe_request(url)
        if not response:
            return None
        
        patterns = [
            r'"type":"playlist","id":"([^"]+)"',
            r'"page_id","([^"]+)"'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, response.text)
            if matches:
                return matches[0]
        
        return None
        
    except Exception as e:
        print(f"❌ Error extracting playlist ID: {e}")
        return None

def get_lyrics(song_id):
    """Get song lyrics"""
    if not song_id:
        return ""
    
    try:
        url = LYRICS_URL + str(song_id)
        response = safe_request(url)
        
        if not response:
            return ""
        
        data = clean_json_response(response.text)
        if not data:
            return ""
        
        return data.get('lyrics', '')
        
    except Exception as e:
        print(f"❌ Error getting lyrics for {song_id}: {e}")
        return ""

# Test function
def test_jiosaavn_api():
    """Test the JioSaavn API functions"""
    print("🧪 Testing JioSaavn API...")
    
    # Test search
    results = search_for_song("arijit singh", songdata=False)
    if isinstance(results, list) and len(results) > 0:
        print(f"✅ Search test passed - found {len(results)} results")
    else:
        print("❌ Search test failed")
    
    return results

if __name__ == "__main__":
    test_jiosaavn_api()
