# Music Streaming Backend API

Modern REST API for music streaming analytics and recommendations.

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

Edit the `.env` file with your MySQL credentials:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=music_streaming_db
DB_PORT=3306
```

### 3. Import Database

Make sure your MySQL database is running and import the SQL dump:

```bash
mysql -u root -p music_streaming_db < DBMS_mini_p.sql
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/history` - Get user's listening history
- `GET /api/users/:id/top-artists` - Get user's top artists
- `GET /api/users/:id/statistics` - Get user's listening statistics

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song with audio features
- `POST /api/songs/filter` - Filter songs by audio features
- `GET /api/songs/genre/:genre` - Get songs by genre
- `GET /api/songs/popular/top?limit=10` - Get most popular songs

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist details
- `GET /api/artists/:id/songs` - Get artist's songs
- `GET /api/artists/:id/audio-patterns` - Get artist's audio patterns
- `GET /api/artists/:id/similar` - Get similar artists
- `GET /api/artists/trending/top?limit=10` - Get top artists

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album details
- `GET /api/albums/:id/tracks` - Get album tracks
- `GET /api/albums/:id/audio-features` - Get album's audio features
- `GET /api/albums/:id/similar` - Get similar albums

### Recommendations
- `GET /api/recommendations/user/:userId?limit=5` - Get personalized recommendations
- `GET /api/recommendations/similar-songs/:songId?limit=5` - Get similar songs
- `GET /api/recommendations/trending?limit=10&days=7` - Get trending songs

## 🎯 Example Requests

### Filter Songs by Audio Features
```bash
POST http://localhost:5000/api/songs/filter
Content-Type: application/json

{
  "genre": "Pop",
  "energy_min": 0.6,
  "energy_max": 0.9,
  "danceability_min": 0.5,
  "danceability_max": 1.0,
  "tempo_min": 100,
  "tempo_max": 140
}
```

### Get User Recommendations
```bash
GET http://localhost:5000/api/recommendations/user/3?limit=5
```

### Test Health
```bash
GET http://localhost:5000/api/health
```

## 🛠️ Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **CORS** - Cross-origin support
- **dotenv** - Environment variables

## 📁 Project Structure

```
backend/
├── server.js              # Main application entry
├── .env                   # Environment configuration
├── package.json           # Dependencies
├── config/
│   └── db.js             # Database connection
├── routes/
│   ├── users.js          # User routes
│   ├── songs.js          # Song routes
│   ├── artists.js        # Artist routes
│   ├── albums.js         # Album routes
│   └── recommendations.js # Recommendation routes
└── controllers/
    ├── userController.js
    ├── songController.js
    ├── artistController.js
    ├── albumController.js
    └── recommendationController.js
```

## ✨ Features

- **Personalized Recommendations** - Combines artist similarity, audio features, and album exploration
- **Advanced Filtering** - Filter songs by multiple audio features
- **Similarity Detection** - Find similar songs, artists, and albums
- **Statistics & Analytics** - User listening patterns and trends
- **Trending Content** - Most played songs within time periods

## 🔧 Troubleshooting

**Database Connection Issues:**
- Verify MySQL is running: `mysql --version`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

**Port Already in Use:**
- Change PORT in `.env` file
- Or kill process: `lsof -ti:5000 | xargs kill`

**CORS Errors:**
- CORS is enabled for all origins in development
- Adjust in `server.js` for production

## 📝 Notes

- All responses are in JSON format
- Error responses include descriptive messages
- Database queries use prepared statements for security
- Connection pooling is enabled for performance