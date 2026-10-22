import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto py-5" style={{ background: '#031b38', color: '#cbd5e1' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="d-flex align-items-center justify-content-center text-white rounded-circle"
                style={{ width: '36px', height: '36px', background: 'var(--primary-gradient)' }}
              >
                <i className="bi bi-recycle fs-5"></i>
              </div>
              <span className="fw-bold fs-4 text-white" style={{ letterSpacing: '-0.02em' }}>EduCycle</span>
            </div>
            <p className="small text-white-50 pe-lg-5" style={{ lineHeight: '1.7' }}>
              A collaborative student community platform designed for campus resource sharing and peer-to-peer skill exchange. Reduce educational waste, lower costs, and empower learning together.
            </p>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3" style={{ letterSpacing: '0.03em' }}>Quick Navigation</h6>
            <ul className="list-unstyled small d-flex flex-column gap-1">
              <li><Link to="/" className="text-white-50 text-decoration-none hover-white d-inline-block py-1">Home</Link></li>
              <li><Link to="/resources" className="text-white-50 text-decoration-none hover-white d-inline-block py-1">Academic Resources</Link></li>
              <li><Link to="/skills" className="text-white-50 text-decoration-none hover-white d-inline-block py-1">Peer Skills</Link></li>
              <li><Link to="/dashboard" className="text-white-50 text-decoration-none hover-white d-inline-block py-1">Dashboard</Link></li>
              <li><Link to="/admin" className="text-white-50 text-decoration-none hover-white d-inline-block py-1"><i className="bi bi-shield-lock me-1"></i>Admin Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold text-white mb-3" style={{ letterSpacing: '0.03em' }}>Exchange Categories</h6>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-white bg-opacity-10 text-white-50 border border-white border-opacity-10 py-2 px-3">Textbooks & Notes</span>
              <span className="badge bg-white bg-opacity-10 text-white-50 border border-white border-opacity-10 py-2 px-3">Lab Kits & Electronics</span>
              <span className="badge bg-white bg-opacity-10 text-white-50 border border-white border-opacity-10 py-2 px-3">Programming</span>
              <span className="badge bg-white bg-opacity-10 text-white-50 border border-white border-opacity-10 py-2 px-3">Languages & Design</span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-white opacity-10" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-white-50">
          <p className="mb-0">&copy; {new Date().getFullYear()} EduCycle Platform. Built for modern peer learning.</p>
          <div className="d-flex gap-3 mt-2 mt-sm-0">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
