const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes - COMMENT OUT TO TEST
const userRoutes = require('./routes/users');
const songRoutes = require('./routes/songs');
const artistRoutes = require('./routes/artists');
const albumRoutes = require('./routes/albums');
const recommendationRoutes = require('./routes/recommendations');

// Use routes - COMMENT OUT TO TEST
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Music Streaming API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});