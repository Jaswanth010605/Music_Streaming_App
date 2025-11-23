const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// Get all songs
router.get('/', songController.getAllSongs);

// Get song by ID with full details
router.get('/:id', songController.getSongById);

// Get songs by audio features filter
router.post('/filter', songController.filterSongsByFeatures);

// Get songs by genre
router.get('/genre/:genre', songController.getSongsByGenre);

// Get most popular songs
router.get('/popular/top', songController.getPopularSongs);

module.exports = router;