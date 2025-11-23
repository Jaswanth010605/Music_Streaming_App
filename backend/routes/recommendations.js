const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Get recommendations for a user
router.get('/user/:userId', recommendationController.getRecommendationsForUser);

// Get similar songs based on song ID
router.get('/similar-songs/:songId', recommendationController.getSimilarSongs);

// Get trending songs (most played recently)
router.get('/trending', recommendationController.getTrendingSongs);

module.exports = router;