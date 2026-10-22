import React, { useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );
    }
    if (linksRef.current) {
      gsap.fromTo(
        linksRef.current.children,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav ref={navRef} className="navbar navbar-expand-lg glass-nav sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2.5 fw-bold fs-4 text-primary" to="/">
          <div className="d-flex align-items-center justify-content-center text-white nav-brand-icon">
            <i className="bi bi-recycle fs-5"></i>
          </div>
          <span style={{ letterSpacing: '-0.02em', color: 'var(--primary-color)' }}>EduCycle</span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul ref={linksRef} className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <NavLink className="nav-link px-3 py-2 fw-semibold" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3 py-2 fw-semibold" to="/resources">Resources</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3 py-2 fw-semibold" to="/skills">Skills</NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-2 fw-semibold" to="/dashboard">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-2 fw-semibold" to="/messages">Messages</NavLink>
                </li>
                {user && user.role === 'ADMIN' && (
                  <li className="nav-item">
                    <NavLink className="nav-link px-3 py-2 fw-semibold text-danger" to="/admin">
                      <i className="bi bi-shield-lock me-1"></i>Admin
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn nav-user-pill dropdown-toggle d-flex align-items-center gap-2 px-3 py-2 border-0"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-5"></i>
                  <span className="fw-bold">{user ? user.firstName || user.name || user.email : 'User'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item rounded-3 py-2 fw-medium" to="/profile">
                      <i className="bi bi-person text-primary me-2"></i>My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item rounded-3 py-2 fw-medium" to="/dashboard">
                      <i className="bi bi-speedometer2 text-primary me-2"></i>Dashboard
                    </Link>
                  </li>
                  {user && user.role === 'ADMIN' && (
                    <li>
                      <Link className="dropdown-item rounded-3 py-2 fw-bold text-danger" to="/admin">
                        <i className="bi bi-shield-lock-fill me-2"></i>Admin Panel
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider opacity-10" /></li>
                  <li>
                    <button className="dropdown-item rounded-3 py-2 fw-medium text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary px-3">Login</Link>
                <Link to="/register" className="btn btn-primary px-3">Register</Link>
                <Link to="/admin" className="btn btn-outline-secondary px-2.5 py-1.5 text-nowrap" title="Admin Portal Login">
                  <i className="bi bi-shield-lock me-1"></i>Admin
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
