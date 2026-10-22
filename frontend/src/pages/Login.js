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
              <div className="card-body p-4 p-md-5 text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', color: '#dc2626' }}
                >
                  <i className="bi bi-slash-circle fs-3"></i>
                </div>
                
                <h4 className="fw-bold text-dark mb-1">Account Suspended</h4>
                <p className="text-muted small mb-4">{suspensionDetails.email}</p>

                <div className="text-start p-3 rounded-3 mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="mb-2.5">
                    <span className="text-muted small d-block mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                      REASON
                    </span>
                    <span className="fw-semibold text-dark small d-block">
                      "{suspensionDetails.reason}"
                    </span>
                  </div>

                  <div className="pt-2 border-top">
                    <span className="text-muted small d-block mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                      RESTRICTED UNTIL
                    </span>
                    <span className="fw-semibold text-dark small">
                      {suspensionDetails.suspendedUntil ? (
                        new Date(suspensionDetails.suspendedUntil).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        'Indefinite (Awaiting admin review)'
                      )}
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm"
                  onClick={() => {
                    setSuspensionDetails(null);
                    setFormData({ email: '', password: '' });
                  }}
                >
                  Back to Sign In
                </button>

                <div className="mt-3 text-center">
                  <a 
                    href="mailto:admin@educycle.college.edu" 
                    className="text-muted small text-decoration-none"
                  >
                    Need help? <span className="text-primary fw-semibold">Contact Admin Support</span>
                  </a>
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
