const db = require('../config/db');

// Get all albums (with pagination + crash protection)
const getAllAlbums = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    // Extend group_concat length to avoid truncation or crash
    await db.query(`SET SESSION group_concat_max_len = 100000;`);

    // Get total albums count (for pagination)
    const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM Album`);
    const totalAlbums = countResult[0]?.total || 0;

    // Fetch limited albums
    const [albums] = await db.query(`
      SELECT 
        a.album_id,
        a.album_name,
        a.release_date,
        (
          SELECT COUNT(*) 
          FROM Song s 
          WHERE s.album_id = a.album_id
        ) AS track_count,
        (
          SELECT GROUP_CONCAT(DISTINCT ar.artist_name ORDER BY ar.artist_name SEPARATOR ', ')
          FROM Artist ar
          JOIN SongArtist sa ON ar.artist_id = sa.artist_id
          JOIN Song s2 ON s2.song_id = sa.song_id
          WHERE s2.album_id = a.album_id
        ) AS artists
      FROM Album a
      ORDER BY a.release_date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      total_albums: totalAlbums,
      limit,
      offset,
      returned: albums.length,
      albums
    });

  } catch (error) {
    console.error('❌ Get all albums error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

// Get album by ID
const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const [albums] = await db.query(`
      SELECT 
        a.album_id,
        a.album_name,
        a.release_date,
        COUNT(DISTINCT s.song_id) AS track_count,
        SUM(s.duration) AS total_duration,
        AVG(s.popularity) AS avg_popularity,
        GROUP_CONCAT(DISTINCT ar.artist_name SEPARATOR ', ') AS artists
      FROM Album a
      LEFT JOIN Song s ON a.album_id = s.album_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE a.album_id = ?
      GROUP BY a.album_id, a.album_name, a.release_date
    `, [id]);

    if (albums.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }

    res.json(albums[0]);
  } catch (error) {
    console.error('❌ Get album by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get album tracks
const getAlbumTracks = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await db.query(`
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        GROUP_CONCAT(ar.artist_name SEPARATOR ', ') AS artists
      FROM Song s
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE s.album_id = ?
      GROUP BY s.song_id, s.track_name, s.duration, s.popularity, s.genre
      ORDER BY s.song_id
    `, [id]);

    res.json(tracks);
  } catch (error) {
    console.error('❌ Get album tracks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get album audio features
const getAlbumAudioFeatures = async (req, res) => {
  try {
    const { id } = req.params;

    const [features] = await db.query(`
      SELECT 
        AVG(af.energy) AS avg_energy,
        AVG(af.danceability) AS avg_danceability,
        AVG(af.tempo) AS avg_tempo,
        AVG(af.speechiness) AS avg_speechiness,
        AVG(af.acousticness) AS avg_acousticness,
        AVG(af.instrumentalness) AS avg_instrumentalness,
        AVG(af.liveness) AS avg_liveness,
        AVG(af.valence) AS avg_valence,
        MIN(af.energy) AS min_energy,
        MAX(af.energy) AS max_energy,
        MIN(af.tempo) AS min_tempo,
        MAX(af.tempo) AS max_tempo
      FROM Audio_Features af
      JOIN Song s ON af.song_id = s.song_id
      WHERE s.album_id = ?
    `, [id]);

    res.json(features[0]);
  } catch (error) {
    console.error('❌ Get album audio features error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get similar albums
const getSimilarAlbums = async (req, res) => {
  try {
    const { id } = req.params;

    const [targetFeatures] = await db.query(`
      SELECT 
        AVG(af.energy) AS avg_energy,
        AVG(af.danceability) AS avg_danceability,
        AVG(af.valence) AS avg_valence
      FROM Audio_Features af
      JOIN Song s ON af.song_id = s.song_id
      WHERE s.album_id = ?
    `, [id]);

    if (targetFeatures.length === 0) {
      return res.json([]);
    }

    const target = targetFeatures[0];

    const [similarAlbums] = await db.query(`
      SELECT 
        a.album_id,
        a.album_name,
        a.release_date,
        AVG(af.energy) AS avg_energy,
        AVG(af.danceability) AS avg_danceability,
        AVG(af.valence) AS avg_valence,
        ABS(AVG(af.energy) - ?) + 
        ABS(AVG(af.danceability) - ?) + 
        ABS(AVG(af.valence) - ?) AS similarity_score,
        GROUP_CONCAT(DISTINCT ar.artist_name SEPARATOR ', ') AS artists
      FROM Album a
      JOIN Song s ON a.album_id = s.album_id
      JOIN Audio_Features af ON s.song_id = af.song_id
      LEFT JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Artist ar ON sa.artist_id = ar.artist_id
      WHERE a.album_id != ?
      GROUP BY a.album_id, a.album_name, a.release_date
      ORDER BY similarity_score ASC
      LIMIT 5
    `, [target.avg_energy, target.avg_danceability, target.avg_valence, id]);

    res.json(similarAlbums);
  } catch (error) {
    console.error('❌ Get similar albums error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllAlbums,
  getAlbumById,
  getAlbumTracks,
  getAlbumAudioFeatures,
  getSimilarAlbums
};
