import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="mobile-bottom-nav d-lg-none" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
          end
        >
          <div className="mobile-nav-icon-wrap">
            <i className="bi bi-house-door-fill"></i>
          </div>
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/resources"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <div className="mobile-nav-icon-wrap">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <span>Resources</span>
        </NavLink>

        <NavLink
          to="/skills"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <div className="mobile-nav-icon-wrap">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <span>Skills</span>
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="mobile-nav-icon-wrap">
                <i className="bi bi-chat-dots-fill"></i>
              </div>
              <span>Messages</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="mobile-nav-icon-wrap">
                <i className="bi bi-person-circle"></i>
              </div>
              <span>{user?.role === 'ADMIN' ? 'Admin/Dash' : 'Dashboard'}</span>
            </NavLink>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <div className="mobile-nav-icon-wrap">
              <i className="bi bi-box-arrow-in-right"></i>
            </div>
            <span>Sign In</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
