import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaUser, FaSignOutAlt, FaPlus, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>JOVAC Blog</h1>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>

          <div className="nav-links">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/category/Technology" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Technology
            </Link>
            <Link to="/category/Lifestyle" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Lifestyle
            </Link>
            <Link to="/category/Travel" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Travel
            </Link>
          </div>

          <div className="auth-section">
            {isAuthenticated ? (
              <>
                <Link to="/create-post" className="create-post-btn" onClick={() => setIsMenuOpen(false)}>
                  <FaPlus /> New Post
                </Link>
                <div className="user-menu">
                  <div className="user-info">
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      className="user-avatar"
                    />
                    <span className="username">{user.username}</span>
                  </div>
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      <FaUser /> Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 