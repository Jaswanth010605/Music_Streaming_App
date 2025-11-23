const db = require('../config/db');

// Get all songs with basic info
const getAllSongs = async (req, res) => {
  try {
    const [songs] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists
      FROM Song s
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, a.album_name
      ORDER BY s.popularity DESC
    `);
    
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get song by ID with full details including audio features
const getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [songs] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        s.spotify_track_id,
        a.album_id,
        a.album_name,
        a.release_date,
        af.energy,
        af.danceability,
        af.tempo,
        af.speechiness,
        af.acousticness,
        af.instrumentalness,
        af.liveness,
        af.valence,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists,
        GROUP_CONCAT(ar.artist_id) as artist_ids
      FROM Song s
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN Audio_Features af ON s.song_id = af.song_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE s.song_id = ?
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre,
               s.spotify_track_id, a.album_id, a.album_name, a.release_date,
               af.energy, af.danceability, af.tempo, af.speechiness,
               af.acousticness, af.instrumentalness, af.liveness, af.valence
    `, [id]);
    
    if (songs.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    res.json(songs[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter songs by audio features
const filterSongsByFeatures = async (req, res) => {
  try {
    const {
      genre,
      energy_min = 0, energy_max = 1,
      danceability_min = 0, danceability_max = 1,
      tempo_min = 0, tempo_max = 300,
      acousticness_min = 0, acousticness_max = 1,
      valence_min = 0, valence_max = 1
    } = req.body;
    
    let query = `
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        af.energy,
        af.danceability,
        af.tempo,
        af.acousticness,
        af.valence,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists
      FROM Song s
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN Audio_Features af ON s.song_id = af.song_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE af.energy BETWEEN ? AND ?
        AND af.danceability BETWEEN ? AND ?
        AND af.tempo BETWEEN ? AND ?
        AND af.acousticness BETWEEN ? AND ?
        AND af.valence BETWEEN ? AND ?
    `;
    
    const params = [
      energy_min, energy_max,
      danceability_min, danceability_max,
      tempo_min, tempo_max,
      acousticness_min, acousticness_max,
      valence_min, valence_max
    ];
    
    if (genre) {
      query += ` AND s.genre = ?`;
      params.push(genre);
    }
    
    query += ` 
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre,
               a.album_name, af.energy, af.danceability, af.tempo,
               af.acousticness, af.valence
      ORDER BY s.popularity DESC
    `;
    
    const [songs] = await db.query(query, params);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get songs by genre
const getSongsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    
    const [songs] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists
      FROM Song s
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE s.genre = ?
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, a.album_name
      ORDER BY s.popularity DESC
    `, [genre]);
    
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get most popular songs
const getPopularSongs = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    
    const [songs] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') as artists
      FROM Song s
      LEFT JOIN Album a ON s.album_id = a.album_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre, a.album_name
      ORDER BY s.popularity DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  filterSongsByFeatures,
  getSongsByGenre,
  getPopularSongs
};