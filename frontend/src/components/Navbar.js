import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const linksRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    const navCollapse = document.getElementById('navbarNav');
    if (navCollapse && navCollapse.classList.contains('show')) {
      const bsCollapse = window.bootstrap?.Collapse?.getInstance(navCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      } else {
        navCollapse.classList.remove('show');
      }
    }
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate('/login');
  };

  return (
    <nav ref={navRef} className="navbar navbar-expand-lg glass-nav sticky-top py-2.5 py-lg-3">
      <div className="container">
        <Link 
          className="navbar-brand d-flex align-items-center gap-2.5 fw-bold fs-4 text-primary" 
          to="/"
          onClick={closeMobileMenu}
        >
          <div className="d-flex align-items-center justify-content-center text-white nav-brand-icon">
            <i className="bi bi-recycle fs-5"></i>
          </div>
          <span style={{ letterSpacing: '-0.02em', color: 'var(--primary-color)' }}>EduCycle</span>
        </Link>

        {/* Mobile Toggler Button with enhanced touch feedback */}
        <button
          className={`navbar-toggler custom-nav-toggler border-0 p-2 ${mobileMenuOpen ? 'open' : ''}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul ref={linksRef} className="navbar-nav me-auto mb-3 mb-lg-0 ms-lg-4 gap-1">
            <li className="nav-item">
              <NavLink className="nav-link px-3 py-2 fw-semibold" to="/" onClick={closeMobileMenu}>
                <i className="bi bi-house-door me-2 d-lg-none text-primary"></i>Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3 py-2 fw-semibold" to="/resources" onClick={closeMobileMenu}>
                <i className="bi bi-box-seam me-2 d-lg-none text-primary"></i>Resources
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3 py-2 fw-semibold" to="/skills" onClick={closeMobileMenu}>
                <i className="bi bi-mortarboard me-2 d-lg-none text-primary"></i>Skills
              </NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-2 fw-semibold" to="/dashboard" onClick={closeMobileMenu}>
                    <i className="bi bi-speedometer2 me-2 d-lg-none text-primary"></i>Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-2 fw-semibold" to="/messages" onClick={closeMobileMenu}>
                    <i className="bi bi-chat-dots me-2 d-lg-none text-primary"></i>Messages
                  </NavLink>
                </li>
                {user && user.role === 'ADMIN' && (
                  <li className="nav-item">
                    <NavLink className="nav-link px-3 py-2 fw-semibold text-danger" to="/admin" onClick={closeMobileMenu}>
                      <i className="bi bi-shield-lock me-1"></i>Admin Panel
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Action buttons with responsive mobile alignment */}
          <div className="nav-actions-container d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 gap-lg-3 pt-3 pt-lg-0 border-top border-lg-0 border-subtle">
            {isAuthenticated ? (
              <div className="dropdown w-100 w-lg-auto">
                <button
                  className="btn nav-user-pill dropdown-toggle d-flex align-items-center justify-content-between justify-content-lg-start gap-2 px-3 py-2 border-0 w-100"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-circle fs-5"></i>
                    <span className="fw-bold">{user ? user.firstName || user.name || user.email : 'User'}</span>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg w-100 w-lg-auto" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item rounded-3 py-2 fw-medium" to="/profile" onClick={closeMobileMenu}>
                      <i className="bi bi-person text-primary me-2"></i>My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item rounded-3 py-2 fw-medium" to="/dashboard" onClick={closeMobileMenu}>
                      <i className="bi bi-speedometer2 text-primary me-2"></i>Dashboard
                    </Link>
                  </li>
                  {user && user.role === 'ADMIN' && (
                    <li>
                      <Link className="dropdown-item rounded-3 py-2 fw-bold text-danger" to="/admin" onClick={closeMobileMenu}>
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
              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-lg-center gap-2">
                <Link to="/login" className="btn btn-outline-primary px-3 py-2 text-center" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary px-3 py-2 text-center" onClick={closeMobileMenu}>
                  Register
                </Link>
                <Link to="/admin" className="btn btn-outline-secondary px-3 py-2 text-nowrap text-center" title="Admin Portal Login" onClick={closeMobileMenu}>
                  <i className="bi bi-shield-lock me-1"></i>Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
