import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const getUserHistory = (id) => api.get(`/users/${id}/history`);
export const getUserTopArtists = (id) => api.get(`/users/${id}/top-artists`);
export const getUserStatistics = (id) => api.get(`/users/${id}/statistics`);

// Songs
export const getAllSongs = () => api.get('/songs');
export const getSongById = (id) => api.get(`/songs/${id}`);
export const filterSongs = (filters) => api.post('/songs/filter', filters);
export const getSongsByGenre = (genre) => api.get(`/songs/genre/${genre}`);
export const getPopularSongs = (limit = 10) => api.get(`/songs/popular/top?limit=${limit}`);

// Artists
export const getAllArtists = () => api.get('/artists');
export const getArtistById = (id) => api.get(`/artists/${id}`);
export const getArtistSongs = (id) => api.get(`/artists/${id}/songs`);
export const getArtistAudioPatterns = (id) => api.get(`/artists/${id}/audio-patterns`);
export const getSimilarArtists = (id) => api.get(`/artists/${id}/similar`);
export const getTopArtists = (limit = 10) => api.get(`/artists/trending/top?limit=${limit}`);

// Albums
export const getAllAlbums = () => api.get('/albums');
export const getAlbumById = (id) => api.get(`/albums/${id}`);
export const getAlbumTracks = (id) => api.get(`/albums/${id}/tracks`);
export const getAlbumAudioFeatures = (id) => api.get(`/albums/${id}/audio-features`);
export const getSimilarAlbums = (id) => api.get(`/albums/${id}/similar`);

// Recommendations
export const getUserRecommendations = (userId, limit = 5) => 
  api.get(`/recommendations/user/${userId}?limit=${limit}`);
export const getSimilarSongs = (songId, limit = 5) => 
  api.get(`/recommendations/similar-songs/${songId}?limit=${limit}`);
export const getTrendingSongs = (limit = 10, days = 7) => 
  api.get(`/recommendations/trending?limit=${limit}&days=${days}`);

export default api;