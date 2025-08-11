import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            File Manager
          </Link>
          <ul className="navbar-nav">
            <li>
              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/upload" 
                className={location.pathname === '/upload' ? 'active' : ''}
              >
                Upload
              </Link>
            </li>
            <li>
              <Link 
                to="/search" 
                className={location.pathname === '/search' ? 'active' : ''}
              >
                Search
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={location.pathname === '/profile' ? 'active' : ''}
              >
                Profile
              </Link>
            </li>
            <li>
              <button 
                onClick={onLogout} 
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '8px 16px' }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
