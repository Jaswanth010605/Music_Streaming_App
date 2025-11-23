import { Music2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import './SongCard.css';

const SongCard = ({ song, showReason = false }) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="song-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="song-icon">
        <Music2 size={40} />
      </div>
      
      <div className="song-info">
        <h4 className="song-title">{song.track_name}</h4>
        <p className="song-artist">{song.artists || 'Unknown Artist'}</p>
        {song.album_name && <p className="song-album">{song.album_name}</p>}
        
        <div className="song-meta">
          {song.genre && <span className="badge">{song.genre}</span>}
          <span className="song-duration">
            <Clock size={14} />
            {formatDuration(song.duration)}
          </span>
          {song.popularity !== undefined && (
            <span className="song-popularity">
              ⭐ {song.popularity}
            </span>
          )}
        </div>
        
        {showReason && song.recommendation_reason && (
          <p className="recommendation-reason">
            {song.recommendation_reason.replace(/_/g, ' ')}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default SongCard;