import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import AnimatedPage from '../components/AnimatedPage';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [suspensionDetails, setSuspensionDetails] = useState(null);

  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.94, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [suspensionDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuspensionDetails(null);
    try {
      await login(formData.email, formData.password);
      showSuccess("Login successful! Welcome back.");
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      const isSuspended = 
        data?.suspended === true || 
        data?.error === 'ACCOUNT_SUSPENDED' ||
        (data?.message && data.message.toLowerCase().includes('suspended'));

      if (isSuspended) {
        let reason = data?.reason;
        let suspendedUntil = data?.suspendedUntil;
        if (!reason && data?.message && data.message.includes('Reason:')) {
          reason = data.message.split('Reason:')[1].trim();
        }
        setSuspensionDetails({
          message: data?.message || "Your account has been temporarily suspended by an administrator.",
          reason: reason || "Violation of academic guidelines or unreturned resource",
          suspendedUntil: suspendedUntil || null,
          email: formData.email
        });
      } else {
        showError(data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div ref={cardRef} className="glass-card overflow-hidden border-0 shadow-lg p-0">
            {suspensionDetails ? (
              <div>
                {/* Suspension Banner Header */}
                <div 
                  className="text-white text-center p-4 p-md-5" 
                  style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                >
                  <div 
                    className="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow mb-3"
                    style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                  >
                    <i className="bi bi-shield-slash-fill fs-1 text-white"></i>
                  </div>
                  <h3 className="fw-extrabold mb-1" style={{ letterSpacing: '-0.02em' }}>Account Suspended</h3>
                  <p className="small mb-0 opacity-90">Temporary restriction on account access</p>
                </div>

                {/* Suspension Details Body */}
                <div className="card-body p-4 p-md-5">
                  <div className="alert alert-danger border-0 d-flex align-items-start gap-3 p-3 rounded-3 mb-4" style={{ backgroundColor: '#fef2f2' }}>
                    <i className="bi bi-exclamation-triangle-fill fs-4 text-danger flex-shrink-0 mt-0.5"></i>
                    <div>
                      <h6 className="fw-bold text-danger mb-1">Access Blocked by Campus Admin</h6>
                      <p className="small text-danger-emphasis mb-0">
                        The account for <strong>{suspensionDetails.email}</strong> is temporarily restricted.
                      </p>
                    </div>
                  </div>

                  {/* Suspension Reason Box */}
                  <div className="p-3 rounded-3 mb-3 border" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                    <label className="text-uppercase fw-bold text-muted small d-block mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                      <i className="bi bi-chat-left-dots-fill me-1 text-warning"></i>Reason Stated by Admin
                    </label>
                    <div className="fw-semibold text-dark">
                      "{suspensionDetails.reason}"
                    </div>
                  </div>

                  {/* Duration / Lift Date */}
                  <div className="p-3 rounded-3 mb-4 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <label className="text-uppercase fw-bold text-muted small d-block mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                      <i className="bi bi-clock-history me-1 text-primary"></i>Suspension Duration
                    </label>
                    <div className="fw-bold text-dark">
                      {suspensionDetails.suspendedUntil ? (
                        <>
                          Restricted until:{' '}
                          <span className="text-primary d-block mt-0.5">
                            {new Date(suspensionDetails.suspendedUntil).toLocaleDateString(undefined, { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}{' '}
                            at{' '}
                            {new Date(suspensionDetails.suspendedUntil).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </>
                      ) : (
                        <span className="text-secondary">Indefinite (Pending manual reactivation by Admin)</span>
                      )}
                    </div>
                  </div>

                  <p className="small text-muted mb-4 text-center">
                    If you believe this is an error or have resolved this issue, please contact your college administrator.
                  </p>

                  <div className="d-flex flex-column gap-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary w-100 py-2.5 fw-semibold"
                      onClick={() => {
                        setSuspensionDetails(null);
                        setFormData({ email: '', password: '' });
                      }}
                    >
                      <i className="bi bi-arrow-left me-1"></i>Sign In with Another Account
                    </button>
                    <a 
                      href="mailto:admin@educycle.college.edu" 
                      className="btn btn-primary w-100 py-2.5 fw-bold"
                    >
                      <i className="bi bi-envelope me-1"></i>Contact Admin Support
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-white text-center p-4 p-md-5" style={{ background: 'var(--primary-gradient)' }}>
                  <div 
                    className="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm mb-3"
                    style={{ width: '56px', height: '56px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                  >
                    <i className="bi bi-recycle fs-2"></i>
                  </div>
                  <h3 className="fw-extrabold mb-1" style={{ letterSpacing: '-0.02em' }}>Welcome Back</h3>
                  <p className="small mb-0 opacity-80">Sign in to access your EduCycle account</p>
                </div>

                <div className="card-body p-4 p-md-5">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Campus Email</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="student@college.edu"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark">Password</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-lock"></i></span>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          placeholder="••••••••"
                          required
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>

                  <hr className="my-4 opacity-10" />

                  <div className="text-center small text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary fw-bold text-decoration-none">
                      Register Here
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Login;
