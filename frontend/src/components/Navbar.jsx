import { NavLink } from 'react-router-dom';
import { Music, User, Compass, Mic2, Disc, TrendingUp } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Music size={32} />
          <span className="gradient-text">MusicInsight</span>
        </div>
        
        <div className="navbar-links">
          <NavLink to="/" className="nav-link">
            <User size={20} />
            <span>User History</span>
          </NavLink>
          
          <NavLink to="/discovery" className="nav-link">
            <Compass size={20} />
            <span>Discovery</span>
          </NavLink>

          <NavLink to="/artists" className="nav-link">
            <Mic2 size={20} />
            <span>Artists</span>
          </NavLink>
          
          <NavLink to="/albums" className="nav-link">
            <Disc size={20} />
            <span>Albums</span>
          </NavLink>
          
          
          <NavLink to="/trending" className="nav-link">
            <TrendingUp size={20} />
            <span>Trending</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;