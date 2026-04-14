import React from 'react';
import { Link, useLocation } from 'wouter';
import { authService } from '../services/auth';

const Navbar = () => {
  const [, setLocation] = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setLocation('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="navbar-logo">
              Annotate
            </Link>
          </div>
          <div className="navbar-menu">
            {isAuthenticated ? (
              <>
                <Link
                  to="/projects"
                  className="navbar-link"
                >
                  Projects
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar-link"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
