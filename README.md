# 🎵 Music Streaming App

A full-stack music streaming analytics application with React frontend and Node.js/Express backend.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **MySQL Workbench** (optional, for database management)

Verify installations:
```bash
node --version
npm --version
mysql --version
```

---

## 🚀 Quick Start Guide

### Step 1: Clone the Repository (if applicable)

```bash
cd music-streaming-app
```

---

### Step 2: Database Setup

#### 2.1 Start MySQL Server

Make sure your MySQL server is running:

**macOS:**
```bash
brew services start mysql
# OR
mysql.server start
```

**Windows:**
Start MySQL from Services or run:
```bash
net start MySQL
```

**Linux:**
```bash
sudo systemctl start mysql
# OR
sudo service mysql start
```

#### 2.2 Create Database

Login to MySQL:
```bash
mysql -u root -p
```

Create the database:
```sql
CREATE DATABASE IF NOT EXISTS music_streaming_db;
EXIT;
```

#### 2.3 Import Database Schema

Navigate to the backend directory and import the SQL dump:
```bash
cd backend
mysql -u root -p music_streaming_db < DBMS_mini_p.sql
```

**✅ Verify Import:**
```bash
mysql -u root -p -e "USE music_streaming_db; SHOW TABLES;"
```

You should see tables like `User`, `Song`, `Artist`, `Album`, etc.

---

### Step 3: Backend Setup

#### 3.1 Navigate to Backend Directory

```bash
cd backend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Configure Environment Variables

**⚠️ IMPORTANT: Create a `.env` file in the `backend/` directory**

Create the file:
```bash
touch .env
```

**Edit `.env` file with your MySQL credentials:**

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=music_streaming_db
DB_PORT=3306
```

**🔴 CRITICAL POINTS:**
- **Replace `YOUR_MYSQL_PASSWORD_HERE`** with your actual MySQL root password
- **Double-check `PORT=5000`** - This must match the frontend API configuration
- If your MySQL uses a different port, update `DB_PORT`
- If you're using a different database user, update `DB_USER`

#### 3.4 Test Database Connection

Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on port 5000
```

If you see an error, check:
- MySQL is running
- Database credentials in `.env` are correct
- Database `music_streaming_db` exists

**Keep this terminal open!**

---

### Step 4: Frontend Setup

#### 4.1 Open a New Terminal

Open a **new terminal window/tab** (keep backend running).

#### 4.2 Navigate to Frontend Directory

```bash
cd music-streaming-app/frontend
```

#### 4.3 Install Dependencies

```bash
npm install
```

#### 4.4 Configure API Endpoint

**⚠️ IMPORTANT: Check the API port configuration!**

Open `frontend/src/services/api.js` and verify the API base URL:

```javascript
const API_BASE_URL = 'http://localhost:5002/api';
```

**🔴 PORT MISMATCH ALERT:**
- Frontend expects backend on port **5002**
- Backend default is port **5000**

**You have two options:**

**Option A: Update Frontend (Recommended)**
Change `frontend/src/services/api.js` line 3:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

**Option B: Change Backend Port**
Update `backend/.env`:
```env
PORT=5002
```
Then restart the backend server.

#### 4.5 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Default frontend port is 5173** (Vite default)

---

### Step 5: Access the Application

- **Frontend:** Open [http://localhost:5173](http://localhost:5173) in your browser
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📝 Important Points to Remember

### 🔐 Database Configuration

1. **MySQL Password:**
   - Update `backend/.env` with your actual MySQL password
   - Never commit `.env` file to version control
   - If you change your MySQL password, update `.env` immediately

2. **Database Name:**
   - Default: `music_streaming_db`
   - Ensure it matches in `.env` and SQL import command

### 🔌 Port Configuration

1. **Backend Port:**
   - Default: `5000`
   - Configured in `backend/.env` as `PORT=5000`
   - If port is busy, change to available port (e.g., `5001`, `5002`)

2. **Frontend Port:**
   - Default: `5173` (Vite)
   - Can be changed in `frontend/vite.config.js` if needed

3. **API Port Matching:**
   - Frontend `api.js` must match backend port
   - Check `frontend/src/services/api.js` line 3
   - Common mistake: Port mismatch causes connection errors

### 🔄 Running the Application

1. **Always start backend first:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Then start frontend in separate terminal:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Stop servers:**
   - Press `Ctrl + C` in each terminal
   - Or close terminal windows

### 🐛 Common Issues

1. **Database Connection Failed:**
   - Check MySQL is running: `mysql --version`
   - Verify credentials in `backend/.env`
   - Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`
   - Check MySQL user has proper permissions

2. **Port Already in Use:**
   - Find process: `lsof -ti:5000` (macOS/Linux) or `netstat -ano | findstr :5000` (Windows)
   - Kill process: `lsof -ti:5000 | xargs kill` (macOS/Linux)
   - Or change port in `.env`

3. **CORS Errors:**
   - Ensure backend is running
   - Check API URL in `frontend/src/services/api.js`
   - Verify port numbers match

4. **Module Not Found:**
   - Run `npm install` in both `backend/` and `frontend/` directories
   - Delete `node_modules` and `package-lock.json`, then `npm install`

5. **Frontend Can't Connect to Backend:**
   - Verify backend is running and shows "✅ Database connected"
   - Test backend: `curl http://localhost:5000/api/health`
   - Check API port in `frontend/src/services/api.js` matches backend port
   - Ensure no firewall blocking connections

---

## 📁 Project Structure

```
music-streaming-app/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection configuration
│   ├── controllers/           # Request handlers
│   ├── routes/                # API routes
│   ├── server.js              # Main backend entry point
│   ├── package.json
│   ├── .env                   # ⚠️ Create this file with your credentials
│   └── DBMS_mini_p.sql        # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/
│   │   │   └── api.js         # ⚠️ Check API port here
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md                  # This file
```

---

## 🛠️ Available Scripts

### Backend Scripts

```bash
cd backend

npm start          # Start production server
npm run dev        # Start development server (with auto-reload)
```

### Frontend Scripts

```bash
cd frontend

npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🔍 Verification Steps

After setup, verify everything works:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","message":"Music Streaming API is running"}`

2. **Test Database Connection:**
   - Check backend console for: `✅ Database connected successfully`

3. **Frontend Connection:**
   - Open browser to `http://localhost:5173`
   - Check browser console (F12) for errors
   - Try navigating to different pages

4. **Test API Endpoints:**
   ```bash
   # Get all users
   curl http://localhost:5000/api/users
   
   # Get all songs
   curl http://localhost:5000/api/songs
   ```

---

## 📚 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/history` - Get user's listening history
- `GET /api/users/:id/top-artists` - Get user's top artists
- `GET /api/users/:id/statistics` - Get user's listening statistics

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song details
- `POST /api/songs/filter` - Filter songs by audio features
- `GET /api/songs/genre/:genre` - Get songs by genre
- `GET /api/songs/popular/top?limit=10` - Get popular songs

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist details
- `GET /api/artists/:id/songs` - Get artist's songs

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album details
- `GET /api/albums/:id/tracks` - Get album tracks

### Recommendations
- `GET /api/recommendations/user/:userId?limit=5` - Get user recommendations
- `GET /api/recommendations/trending?limit=10&days=7` - Get trending songs

See `backend/README.MD` for detailed API documentation.

---

## 🛡️ Security Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Change default passwords** - Use strong MySQL passwords
3. **Production setup** - Update CORS settings and use environment-specific configs

---

## 🆘 Need Help?

1. Check the **Common Issues** section above
2. Verify all prerequisites are installed
3. Ensure MySQL is running and accessible
4. Check terminal output for error messages
5. Verify port numbers match between frontend and backend

---

## 📄 License

ISC

---

**Happy Coding! 🎉**

