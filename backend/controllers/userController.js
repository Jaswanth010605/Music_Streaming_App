const db = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT user_id, username, email FROM User');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query(
      'SELECT user_id, username, email FROM User WHERE user_id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's listening history with song details
const getUserListeningHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [history] = await db.query(`
      SELECT 
        lh.history_id,
        lh.played_at,
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists
      FROM Listening_History lh
      JOIN Song s ON lh.song_id = s.song_id
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE lh.user_id = ?
      GROUP BY lh.history_id, lh.played_at, s.song_id, s.track_name, 
               s.duration, s.popularity, s.genre, a.album_name
      ORDER BY lh.played_at DESC
    `, [id]);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's top artists
const getUserTopArtists = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [topArtists] = await db.query(`
      SELECT 
        ar.artist_id,
        ar.artist_name,
        COUNT(lh.history_id) as play_count
      FROM Listening_History lh
      JOIN Song s ON lh.song_id = s.song_id
      JOIN SongArtist sa ON s.song_id = sa.song_id
      JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE lh.user_id = ?
      GROUP BY ar.artist_id, ar.artist_name
      ORDER BY play_count DESC
      LIMIT 10
    `, [id]);
    
    res.json(topArtists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's listening statistics
const getUserStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Total listening time
    const [totalTime] = await db.query(`
      SELECT SUM(s.duration) as total_seconds
      FROM Listening_History lh
      JOIN Song s ON lh.song_id = s.song_id
      WHERE lh.user_id = ?
    `, [id]);
    
    // Total songs played
    const [totalSongs] = await db.query(`
      SELECT COUNT(*) as total_plays
      FROM Listening_History
      WHERE user_id = ?
    `, [id]);
    
    // Favorite genre
    const [favoriteGenre] = await db.query(`
      SELECT s.genre, COUNT(*) as play_count
      FROM Listening_History lh
      JOIN Song s ON lh.song_id = s.song_id
      WHERE lh.user_id = ? AND s.genre IS NOT NULL
      GROUP BY s.genre
      ORDER BY play_count DESC
      LIMIT 1
    `, [id]);
    
    // Most played song
    const [mostPlayed] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        COUNT(*) as play_count,
        GROUP_CONCAT(DISTINCT ar.artist_name SEPARATOR ', ') as artists
      FROM Listening_History lh
      JOIN Song s ON lh.song_id = s.song_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE lh.user_id = ?
      GROUP BY s.song_id, s.track_name
      ORDER BY play_count DESC
      LIMIT 1
    `, [id]);
    
    res.json({
      total_listening_time_seconds: totalTime[0].total_seconds || 0,
      total_plays: totalSongs[0].total_plays || 0,
      favorite_genre: favoriteGenre[0] || null,
      most_played_song: mostPlayed[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserListeningHistory,
  getUserTopArtists,
  getUserStatistics
};