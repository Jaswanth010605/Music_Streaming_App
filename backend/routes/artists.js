const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');

// Get all artists
router.get('/', artistController.getAllArtists);

// Get artist by ID
router.get('/:id', artistController.getArtistById);

// Get all songs by artist
router.get('/:id/songs', artistController.getArtistSongs);

// Get artist's audio feature patterns
router.get('/:id/audio-patterns', artistController.getArtistAudioPatterns);

// Get similar artists
router.get('/:id/similar', artistController.getSimilarArtists);

// Get top artists by play count
router.get('/trending/top', artistController.getTopArtists);

module.exports = router;