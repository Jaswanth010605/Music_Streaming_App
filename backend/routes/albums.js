const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');

// Get all albums
router.get('/', albumController.getAllAlbums);

// Get album by ID
router.get('/:id', albumController.getAlbumById);

// Get all tracks in an album
router.get('/:id/tracks', albumController.getAlbumTracks);

// Get album's audio feature summary
router.get('/:id/audio-features', albumController.getAlbumAudioFeatures);

// Get similar albums
router.get('/:id/similar', albumController.getSimilarAlbums);

module.exports = router;