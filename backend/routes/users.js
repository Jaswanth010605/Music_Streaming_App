const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Get user's listening history
router.get('/:id/history', userController.getUserListeningHistory);

// Get user's top artists
router.get('/:id/top-artists', userController.getUserTopArtists);

// Get user's listening statistics
router.get('/:id/statistics', userController.getUserStatistics);

module.exports = router;