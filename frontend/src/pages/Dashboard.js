import React, { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { resourceService } from '../services/resourceService';
import { skillService } from '../services/skillService';
import { useNotification } from '../context/NotificationContext';
import ResourceCard from '../components/ResourceCard';
import SkillCard from '../components/SkillCard';

const Dashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('overview');
  const [myResources, setMyResources] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userId = user?.userId || user?.id;
      const [resData, skillData, incData, outData] = await Promise.all([
        resourceService.getAll({ userId }),
        skillService.getAll({ userId }),
        requestService.getMyIncomingRequests(userId),
        requestService.getMySentRequests(userId),
      ]);

      setMyResources(resData.content || resData || []);
      setMySkills(skillData.content || skillData || []);
      setIncomingRequests(incData || []);
      setOutgoingRequests(outData || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRequestStatusUpdate = async (id, type, status) => {
    try {
      if (type === 'resource') {
        await requestService.updateResourceRequestStatus(id, status);
      } else {
        await requestService.updateSkillRequestStatus(id, status);
      }
      showSuccess(`Request ${status.toLowerCase()} successfully!`);
      fetchDashboardData();
    } catch (err) {
      showError("Failed to update status.");
    }
  };

  return (
    <AnimatedPage className="container py-5">
      {/* Header Banner */}
      <div className="glass-card p-3 p-md-5 mb-4 mb-md-5 d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-4">
        <div className="d-flex align-items-center gap-3 gap-md-4">
          <div 
            className="avatar-circle text-white display-6 fw-bold rounded-circle d-flex align-items-center justify-content-center shadow flex-shrink-0"
            style={{ width: '64px', height: '64px', background: 'var(--primary-gradient)' }}
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <span className="badge-pill-accent mb-2">
              <i className="bi bi-shield-check me-1"></i> Verified Student
            </span>
            <h3 className="fw-extrabold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>
              Hello, {user?.firstName || user?.name || 'Student'}!
            </h3>
            <p className="text-muted small mb-0">
              <i className="bi bi-building me-1 text-primary"></i>{user?.college || 'Campus Member'} • {user?.department || 'Department'}
            </p>
          </div>
        </div>

        <div className="dashboard-header-stats d-flex gap-2 gap-md-3">
          <div className="stat-item text-center px-3 px-md-4 py-2.5 py-md-3 rounded-4 shadow-sm" style={{ background: 'var(--primary-light)', border: '1px solid rgba(5, 79, 163, 0.12)' }}>
            <span className="d-block fw-extrabold fs-4 text-primary">{myResources.length}</span>
            <small className="text-primary fw-semibold">Resources</small>
          </div>
          <div className="stat-item text-center px-3 px-md-4 py-2.5 py-md-3 rounded-4 shadow-sm" style={{ background: 'var(--primary-light)', border: '1px solid rgba(5, 79, 163, 0.12)' }}>
            <span className="d-block fw-extrabold fs-4 text-primary">{mySkills.length}</span>
            <small className="text-primary fw-semibold">Skills</small>
          </div>
          <div className="stat-item text-center px-3 px-md-4 py-2.5 py-md-3 rounded-4 shadow-sm" style={{ background: 'var(--primary-light)', border: '1px solid rgba(5, 79, 163, 0.12)' }}>
            <span className="d-block fw-extrabold fs-4 text-primary">{incomingRequests.length}</span>
            <small className="text-primary fw-semibold">Requests</small>
          </div>
        </div>
      </div>

      {/* Nav Tabs (Smooth swipe on mobile phones) */}
      <ul className="nav nav-pills mb-4 gap-2 border-bottom border-subtle pb-3 scrollable-pills-bar">
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <i className="bi bi-speedometer2 me-2"></i>Overview
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
            <i className="bi bi-box-seam me-2"></i>My Resources ({myResources.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
            <i className="bi bi-mortarboard me-2"></i>My Skills ({mySkills.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            <i className="bi bi-inbox me-2"></i>Requests ({incomingRequests.length + outgoingRequests.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="glass-card h-100 p-0 overflow-hidden">
                  <div className="p-4 border-bottom border-subtle d-flex justify-content-between align-items-center bg-white bg-opacity-50">
                    <span className="fw-bold text-dark fs-6"><i className="bi bi-arrow-down-left-circle me-2 text-primary"></i>Incoming Requests ({incomingRequests.length})</span>
                    <button className="btn btn-sm btn-outline-primary fw-bold px-3" onClick={() => setActiveTab('requests')}>View All</button>
                  </div>
                  <div className="p-4">
                    {incomingRequests.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {incomingRequests.slice(0, 3).map((req, idx) => (
                          <div key={idx} className="p-3 rounded-4 bg-white border border-subtle d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-bold text-dark">{req.requesterName || 'Student Peer'}</div>
                              <small className="text-muted">{req.itemTitle || req.message}</small>
                            </div>
                            <span className={`badge ${req.status === 'ACCEPTED' ? 'bg-success text-white' : 'bg-primary text-primary'}`}>
                              {req.status || 'PENDING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted py-4 small">No pending incoming requests.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="glass-card h-100 p-0 overflow-hidden">
                  <div className="p-4 border-bottom border-subtle d-flex justify-content-between align-items-center bg-white bg-opacity-50">
                    <span className="fw-bold text-dark fs-6"><i className="bi bi-arrow-up-right-circle me-2 text-primary"></i>Sent Requests ({outgoingRequests.length})</span>
                    <button className="btn btn-sm btn-outline-primary fw-bold px-3" onClick={() => setActiveTab('requests')}>View All</button>
                  </div>
                  <div className="p-4">
                    {outgoingRequests.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {outgoingRequests.slice(0, 3).map((req, idx) => (
                          <div key={idx} className="p-3 rounded-4 bg-white border border-subtle d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-bold text-dark">{req.itemTitle || 'Requested Item'}</div>
                              <small className="text-muted">Owner: {req.ownerName || 'Campus Member'}</small>
                            </div>
                            <span className={`badge ${req.status === 'ACCEPTED' ? 'bg-success text-white' : 'bg-secondary'}`}>
                              {req.status || 'PENDING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted py-4 small">No outgoing requests sent yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="row g-3 g-md-4">
              {myResources.length > 0 ? (
                myResources.map((item) => (
                  <div className="col-lg-3 col-md-6" key={item.id || item.resourceId}>
                    <ResourceCard resource={item} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5 glass-card">
                  <p className="text-muted fw-medium">You haven't posted any resources yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="row g-3 g-md-4">
              {mySkills.length > 0 ? (
                mySkills.map((skill) => (
                  <div className="col-lg-3 col-md-6" key={skill.id || skill.skillId}>
                    <SkillCard skill={skill} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5 glass-card">
                  <p className="text-muted fw-medium">You haven't offered any skills yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="row g-4">
              <div className="col-md-6">
                <h5 className="fw-bold text-dark mb-3">Incoming Exchange Requests</h5>
                {incomingRequests.length > 0 ? (
                  incomingRequests.map((req, idx) => (
                    <div key={idx} className="glass-card p-4 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0 text-dark">{req.requesterName || 'Student Peer'}</h6>
                        <span className={`badge ${req.status === 'ACCEPTED' ? 'bg-success text-white' : 'bg-primary'}`}>
                          {req.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-muted small mb-3">{req.message}</p>
                      {req.status !== 'ACCEPTED' && req.status !== 'REJECTED' && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary px-3 fw-bold"
                            onClick={() => handleRequestStatusUpdate(req.id, req.type || 'resource', 'ACCEPTED')}
                          >
                            Accept Request
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger px-3 fw-bold"
                            onClick={() => handleRequestStatusUpdate(req.id, req.type || 'resource', 'REJECTED')}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-4 text-muted small">No incoming requests.</div>
                )}
              </div>

              <div className="col-md-6">
                <h5 className="fw-bold text-dark mb-3">Your Sent Requests</h5>
                {outgoingRequests.length > 0 ? (
                  outgoingRequests.map((req, idx) => (
                    <div key={idx} className="glass-card p-4 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0 text-dark">{req.itemTitle || 'Requested Resource'}</h6>
                        <span className={`badge ${req.status === 'ACCEPTED' ? 'bg-success text-white' : 'bg-secondary'}`}>
                          {req.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-muted small mb-0">Note: {req.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-4 text-muted small">No sent requests.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatedPage>
  );
};

export default Dashboard;
