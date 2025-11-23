const db = require('../config/db');

// ✅ Get all artists (with pagination)
// ✅ Get all artists with at least 2 songs
const getAllArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Count total artists with at least 2 songs
    const [countRows] = await db.query(
      `
      SELECT COUNT(DISTINCT ar.artist_id) AS total
      FROM Artist ar
      JOIN SongArtist sa ON ar.artist_id = sa.artist_id
      GROUP BY ar.artist_id
      HAVING COUNT(sa.song_id) >= 2
    `
    );
    const totalArtists = countRows.length;

    // Fetch paginated artists with at least 2 songs
    const [artists] = await db.query(
      `
      SELECT 
        ar.artist_id,
        ar.artist_name,
        COUNT(sa.song_id) AS song_count
      FROM Artist ar
      JOIN SongArtist sa ON ar.artist_id = sa.artist_id
      GROUP BY ar.artist_id, ar.artist_name
      HAVING COUNT(sa.song_id) >= 2
      ORDER BY RAND() -- randomize
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    res.json({
      total_artists: totalArtists,
      limit,
      offset,
      returned: artists.length,
      artists,
    });
  } catch (error) {
    console.error('Get all artists error:', error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get artist by ID with extra stats
const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const [artists] = await db.query(
      `
      SELECT 
        artist_id,
        artist_name,
        created_at
      FROM Artist
      WHERE artist_id = ?
    `,
      [id]
    );

    if (artists.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Get song count
    const [[songCount]] = await db.query(
      `
      SELECT COUNT(*) AS song_count
      FROM SongArtist
      WHERE artist_id = ?
    `,
      [id]
    );

    // Get album count
    const [[albumCount]] = await db.query(
      `
      SELECT COUNT(DISTINCT s.album_id) AS album_count
      FROM SongArtist sa
      JOIN Song s ON sa.song_id = s.song_id
      WHERE sa.artist_id = ? AND s.album_id IS NOT NULL
    `,
      [id]
    );

    // Get average popularity
    const [[avgPop]] = await db.query(
      `
      SELECT AVG(s.popularity) AS avg_popularity
      FROM SongArtist sa
      JOIN Song s ON sa.song_id = s.song_id
      WHERE sa.artist_id = ?
    `,
      [id]
    );

    res.json({
      ...artists[0],
      song_count: songCount.song_count,
      album_count: albumCount.album_count,
      avg_popularity: avgPop.avg_popularity,
    });
  } catch (error) {
    console.error('Get artist by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all songs by artist
const getArtistSongs = async (req, res) => {
  try {
    const { id } = req.params;

    const [songs] = await db.query(
      `
      SELECT 
        s.song_id,
        s.track_name,
        s.duration,
        s.popularity,
        s.genre,
        a.album_name,
        a.release_date
      FROM Song s
      JOIN SongArtist sa ON s.song_id = sa.song_id
      LEFT JOIN Album a ON s.album_id = a.album_id
      WHERE sa.artist_id = ?
      ORDER BY s.popularity DESC
    `,
      [id]
    );

    res.json(songs);
  } catch (error) {
    console.error('Get artist songs error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get artist's average audio feature profile
const getArtistAudioPatterns = async (req, res) => {
  try {
    const { id } = req.params;

    const [patterns] = await db.query(
      `
      SELECT 
        AVG(af.energy) AS avg_energy,
        AVG(af.danceability) AS avg_danceability,
        AVG(af.tempo) AS avg_tempo,
        AVG(af.speechiness) AS avg_speechiness,
        AVG(af.acousticness) AS avg_acousticness,
        AVG(af.instrumentalness) AS avg_instrumentalness,
        AVG(af.liveness) AS avg_liveness,
        AVG(af.valence) AS avg_valence
      FROM Audio_Features af
      JOIN SongArtist sa ON af.song_id = sa.song_id
      WHERE sa.artist_id = ?
    `,
      [id]
    );

    res.json(patterns[0] || {});
  } catch (error) {
    console.error('Get artist audio patterns error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get similar artists based on audio features
const getSimilarArtists = async (req, res) => {
  try {
    const { id } = req.params;

    // Get target artist's feature averages
    const [targetPatterns] = await db.query(
      `
      SELECT 
        AVG(af.energy) AS avg_energy,
        AVG(af.danceability) AS avg_danceability,
        AVG(af.valence) AS avg_valence
      FROM Audio_Features af
      JOIN SongArtist sa ON af.song_id = sa.song_id
      WHERE sa.artist_id = ?
    `,
      [id]
    );

    if (!targetPatterns[0] || targetPatterns[0].avg_energy == null) {
      return res.json([]);
    }

    const target = targetPatterns[0];

    // Find similar artists
    const [similarArtists] = await db.query(
      `
      SELECT 
        ar.artist_id,
        ar.artist_name,
        AVG(af.energy) AS avg_energy,
        AVG(af.danceability) AS avg_danceability,
        AVG(af.valence) AS avg_valence,
        ABS(AVG(af.energy) - ?) + 
        ABS(AVG(af.danceability) - ?) + 
        ABS(AVG(af.valence) - ?) AS similarity_score
      FROM Artist ar
      JOIN SongArtist sa ON ar.artist_id = sa.artist_id
      JOIN Audio_Features af ON sa.song_id = af.song_id
      WHERE ar.artist_id != ?
      GROUP BY ar.artist_id, ar.artist_name
      HAVING COUNT(af.song_id) > 0
      ORDER BY similarity_score ASC
      LIMIT 5
    `,
      [target.avg_energy, target.avg_danceability, target.avg_valence, id]
    );

    res.json(similarArtists);
  } catch (error) {
    console.error('Get similar artists error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get top artists by play count
const getTopArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [topArtists] = await db.query(
      `
      SELECT 
        ar.artist_id,
        ar.artist_name,
        COUNT(lh.history_id) AS play_count,
        COUNT(DISTINCT lh.user_id) AS unique_listeners
      FROM Artist ar
      JOIN SongArtist sa ON ar.artist_id = sa.artist_id
      JOIN Listening_History lh ON sa.song_id = lh.song_id
      GROUP BY ar.artist_id, ar.artist_name
      ORDER BY play_count DESC
      LIMIT ?
    `,
      [limit]
    );

    res.json(topArtists);
  } catch (error) {
    console.error('Get top artists error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllArtists,
  getArtistById,
  getArtistSongs,
  getArtistAudioPatterns,
  getSimilarArtists,
  getTopArtists,
};
