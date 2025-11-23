const db = require('../config/db');

// Get personalized recommendations for a user
const getRecommendationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 5;
    
    // Check if user exists and has listening history
    const [userCheck] = await db.query(
      'SELECT COUNT(*) as history_count FROM Listening_History WHERE user_id = ?',
      [userId]
    );
    
    if (userCheck[0].history_count === 0) {
      return res.json({
        message: 'No listening history found. Returning popular songs.',
        recommendations: await getPopularSongsForNewUser(limit)
      });
    }
    
    // Get user's listened songs
    const [listenedSongs] = await db.query(
      'SELECT DISTINCT song_id FROM Listening_History WHERE user_id = ?',
      [userId]
    );
    
    const listenedSongIds = listenedSongs.map(s => s.song_id);
    
    // Strategy 1: Songs from artists they've listened to (but haven't heard)
    const artistBasedRecs = await getArtistBasedRecommendations(userId, listenedSongIds);
    
    // Strategy 2: Songs with similar audio features
    const featureBasedRecs = await getFeatureBasedRecommendations(userId, listenedSongIds);
    
    // Strategy 3: Songs from albums they've partially explored
    const albumBasedRecs = await getAlbumBasedRecommendations(userId, listenedSongIds);
    
    // Combine and deduplicate recommendations
    const allRecs = [
      ...artistBasedRecs,
      ...featureBasedRecs,
      ...albumBasedRecs
    ];
    
    // Remove duplicates and limit
    const uniqueRecs = Array.from(
      new Map(allRecs.map(rec => [rec.song_id, rec])).values()
    ).slice(0, limit);
    
    res.json({
      user_id: userId,
      recommendations: uniqueRecs,
      strategy_breakdown: {
        artist_based: artistBasedRecs.length,
        feature_based: featureBasedRecs.length,
        album_based: albumBasedRecs.length,
        total_unique: uniqueRecs.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: Get songs from artists user has listened to
async function getArtistBasedRecommendations(userId, excludeSongIds) {
  const excludeList = excludeSongIds.length > 0 ? excludeSongIds.join(',') : '0';
  
  const [songs] = await db.query(`
    SELECT DISTINCT
      s.song_id,
      s.track_name,
      s.duration,
      s.popularity,
      s.genre,
      a.album_name,
      GROUP_CONCAT(DISTINCT ar.artist_name SEPARATOR ', ') as artists,
      'artist_similarity' as recommendation_reason
    FROM Song s
    JOIN SongArtist sa ON s.song_id = sa.song_id
    JOIN Artist ar ON sa.artist_id = ar.artist_id
    LEFT JOIN Album a ON s.album_id = a.album_id
    WHERE sa.artist_id IN (
      SELECT DISTINCT sa2.artist_id
      FROM Listening_History lh
      JOIN SongArtist sa2 ON lh.song_id = sa2.song_id
      WHERE lh.user_id = ?
    )
    AND s.song_id NOT IN (${excludeList})
    GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, a.album_name
    ORDER BY s.popularity DESC
    LIMIT 3
  `, [userId]);
  
  return songs;
}

// Helper: Get songs with similar audio features
async function getFeatureBasedRecommendations(userId, excludeSongIds) {
  const excludeList = excludeSongIds.length > 0 ? excludeSongIds.join(',') : '0';
  
  // Get user's average audio preferences
  const [userPrefs] = await db.query(`
    SELECT 
      AVG(af.energy) as avg_energy,
      AVG(af.danceability) as avg_danceability,
      AVG(af.valence) as avg_valence,
      AVG(af.tempo) as avg_tempo
    FROM Listening_History lh
    JOIN Audio_Features af ON lh.song_id = af.song_id
    WHERE lh.user_id = ?
  `, [userId]);
  
  if (!userPrefs[0].avg_energy) {
    return [];
  }
  
  const prefs = userPrefs[0];
  
  // Find songs with similar features
  const [songs] = await db.query(`
    SELECT 
      s.song_id,
      s.track_name,
      s.duration,
      s.popularity,
      s.genre,
      a.album_name,
      GROUP_CONCAT(DISTINCT ar.artist_name SEPARATOR ', ') as artists,
      'audio_feature_match' as recommendation_reason,
      (
        ABS(af.energy - ?) + 
        ABS(af.danceability - ?) + 
        ABS(af.valence - ?) +
        ABS(af.tempo - ?) / 100
      ) as feature_distance
    FROM Song s
    JOIN Audio_Features af ON s.song_id = af.song_id
    LEFT JOIN Album a ON s.album_id = a.album_id
    LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
    LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
    WHERE s.song_id NOT IN (${excludeList})
    GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, 
             a.album_name, af.energy, af.danceability, af.valence, af.tempo
    ORDER BY feature_distance ASC
    LIMIT 3
  `, [prefs.avg_energy, prefs.avg_danceability, prefs.avg_valence, prefs.avg_tempo]);
  
  return songs;
}

// Helper: Get songs from albums user has partially explored
async function getAlbumBasedRecommendations(userId, excludeSongIds) {
  const excludeList = excludeSongIds.length > 0 ? excludeSongIds.join(',') : '0';
  
  const [songs] = await db.query(`
    SELECT DISTINCT
      s.song_id,
      s.track_name,
      s.duration,
      s.popularity,
      s.genre,
      a.album_name,
      GROUP_CONCAT(DISTINCT ar.artist_name SEPARATOR ', ') as artists,
      'album_exploration' as recommendation_reason
    FROM Song s
    JOIN Album a ON s.album_id = a.album_id
    LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
    LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
    WHERE s.album_id IN (
      SELECT DISTINCT s2.album_id
      FROM Listening_History lh
      JOIN Song s2 ON lh.song_id = s2.song_id
      WHERE lh.user_id = ? AND s2.album_id IS NOT NULL
    )
    AND s.song_id NOT IN (${excludeList})
    GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, a.album_name
    ORDER BY s.popularity DESC
    LIMIT 3
  `, [userId]);
  
  return songs;
}

// Helper: Get popular songs for new users
async function getPopularSongsForNewUser(limit) {
  const [songs] = await db.query(`
    SELECT 
      s.song_id,
      s.track_name,
      s.duration,
      s.popularity,
      s.genre,
      a.album_name,
      GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists,
      'popular_recommendation' as recommendation_reason
    FROM Song s
    LEFT JOIN Album a ON s.album_id = a.album_id
    LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
    LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
    GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, a.album_name
    ORDER BY s.popularity DESC
    LIMIT ?
  `, [limit]);
  
  return songs;
}

// Get similar songs based on a specific song
const getSimilarSongs = async (req, res) => {
  try {
    const { songId } = req.params;
    const limit = req.query.limit || 5;
    
    // Get target song's audio features
    const [targetSong] = await db.query(`
      SELECT af.* 
      FROM Audio_Features af
      WHERE af.song_id = ?
    `, [songId]);
    
    if (targetSong.length === 0) {
      return res.status(404).json({ error: 'Song not found or has no audio features' });
    }
    
    const target = targetSong[0];
    
    // Find similar songs
    const [similarSongs] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists,
        (
          ABS(af.energy - ?) + 
          ABS(af.danceability - ?) + 
          ABS(af.valence - ?) +
          ABS(af.tempo - ?) / 100 +
          ABS(af.acousticness - ?)
        ) as similarity_score
      FROM Song s
      JOIN Audio_Features af ON s.song_id = af.song_id
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE s.song_id != ?
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre,
               a.album_name, af.energy, af.danceability, af.valence, af.tempo, af.acousticness
      ORDER BY similarity_score ASC
      LIMIT ?
    `, [
      target.energy, target.danceability, target.valence, 
      target.tempo, target.acousticness, songId, limit
    ]);
    
    res.json(similarSongs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trending songs (most played recently)
const getTrendingSongs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const daysBack = parseInt(req.query.days) || 7;
    
    const [trendingSongs] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        GROUP_CONCAT(DISTINCT ar.artist_name SEPARATOR ', ') as artists,
        COUNT(lh.history_id) as recent_play_count
      FROM Song s
      JOIN Listening_History lh ON s.song_id = lh.song_id
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE lh.played_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, a.album_name
      ORDER BY recent_play_count DESC, s.popularity DESC
      LIMIT ?
    `, [daysBack, limit]);
    
    res.json(trendingSongs);
  } catch (error) {
    console.error('Trending songs error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRecommendationsForUser,
  getSimilarSongs,
  getTrendingSongs
};