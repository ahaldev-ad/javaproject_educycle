import React, { useState, useEffect, useCallback } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/miscServices';
import { formatTeachingMethod } from '../components/SkillCard';
import { useNotification } from '../context/NotificationContext';

const AdminPanel = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    pendingResources: 0,
    approvedResources: 0,
    totalSkills: 0,
    pendingSkills: 0,
    approvedSkills: 0,
  });

  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Filters
  const [resourceFilter, setResourceFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [skillFilter, setSkillFilter] = useState('ALL');       // ALL, PENDING, APPROVED, REJECTED
  const [searchTerm, setSearchTerm] = useState('');

  // Temporary Suspension Modal State
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState(null);
  const [suspendDurationDays, setSuspendDurationDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState('Violation of academic community guidelines');
  const [suspending, setSuspending] = useState(false);

  const isAdminLoggedIn = isAuthenticated && user?.role === 'ADMIN';

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        adminService.getStatistics(),
        adminService.getUsers(),
        adminService.getResources(),
        adminService.getSkills(),
      ]);

      const [stRes, usrsRes, resRes, sklRes] = results;

      if (stRes.status === 'fulfilled' && stRes.value) {
        setStats(stRes.value);
      }
      if (usrsRes.status === 'fulfilled' && usrsRes.value) {
        setUsers(usrsRes.value);
      }
      if (resRes.status === 'fulfilled' && resRes.value) {
        setResources(resRes.value);
      }
      if (sklRes.status === 'fulfilled' && sklRes.value) {
        setSkills(sklRes.value);
      }

      // Check if all rejected
      const allRejected = results.every(r => r.status === 'rejected');
      if (allRejected) {
        const firstError = results[0].reason;
        if (firstError?.response?.status === 503 || firstError?.message?.includes('Network Error')) {
          showError("Backend server is waking up from hibernation (Render free tier). Please wait ~30-45 seconds and click Refresh.");
        } else {
          showError("Failed to load admin data. Please verify your connection.");
        }
      }
    } catch (err) {
      console.error("Admin data error:", err);
      showError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn, fetchAdminData]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await login(adminEmail, adminPassword);
      showSuccess("Admin authentication successful!");
    } catch (err) {
      showError(err.response?.data?.message || "Invalid Admin Credentials!");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleQuickFill = () => {
    setAdminEmail('admin@educycle.edu');
    setAdminPassword('admin123');
  };

  // Resource Moderation Actions
  const handleApproveResource = async (id) => {
    try {
      await adminService.approveResource(id);
      showSuccess("Resource approved! It is now live in the student portal.");
      fetchAdminData();
    } catch (err) {
      showError("Failed to approve resource.");
    }
  };

  const handleRejectResource = async (id) => {
    try {
      await adminService.rejectResource(id);
      showSuccess("Resource rejected and hidden from public portal.");
      fetchAdminData();
    } catch (err) {
      showError("Failed to reject resource.");
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this resource?")) return;
    try {
      await adminService.deleteResource(id);
      showSuccess("Resource deleted permanently.");
      fetchAdminData();
    } catch (err) {
      showError("Failed to delete resource.");
    }
  };

  // Skill Moderation Actions
  const handleApproveSkill = async (id) => {
    try {
      await adminService.approveSkill(id);
      showSuccess("Skill approved! It is now live in the peer skill directory.");
      fetchAdminData();
    } catch (err) {
      showError("Failed to approve skill.");
    }
  };

  const handleRejectSkill = async (id) => {
    try {
      await adminService.rejectSkill(id);
      showSuccess("Skill rejected and hidden from directory.");
      fetchAdminData();
    } catch (err) {
      showError("Failed to reject skill.");
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this skill?")) return;
    try {
      await adminService.deleteSkill(id);
      showSuccess("Skill deleted permanently.");
      fetchAdminData();
    } catch (err) {
      showError("Failed to delete skill.");
    }
  };

  // User Actions (Suspension & Management)
  const openSuspendModal = (targetUser) => {
    setSelectedUserForSuspend(targetUser);
    setSuspendDurationDays(7);
    setSuspendReason('Violation of academic community guidelines');
    setSuspendModalOpen(true);
  };

  const closeSuspendModal = () => {
    setSuspendModalOpen(false);
    setSelectedUserForSuspend(null);
    setSuspending(false);
  };

  const handleConfirmSuspend = async () => {
    if (!selectedUserForSuspend) return;
    const userId = selectedUserForSuspend.userId || selectedUserForSuspend.id;
    setSuspending(true);
    try {
      const days = parseInt(suspendDurationDays, 10);
      await adminService.suspendUser(userId, {
        days: days > 0 ? days : null,
        reason: suspendReason.trim()
      });
      showSuccess(`User ${selectedUserForSuspend.firstName || ''} suspended ${days > 0 ? `for ${days} day(s)` : 'indefinitely'}.`);
      closeSuspendModal();
      fetchAdminData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to suspend user.");
    } finally {
      setSuspending(false);
    }
  };

  const handleUnsuspendUser = async (userId, userName) => {
    if (!window.confirm(`Reactivate user account for ${userName || `#${userId}`}?`)) return;
    try {
      await adminService.unsuspendUser(userId);
      showSuccess(`User ${userName || ''} suspension lifted. Account is now active.`);
      fetchAdminData();
    } catch (err) {
      showError("Failed to reactivate user.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete user ${userName || `#${userId}`}? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(userId);
      showSuccess("User permanently deleted.");
      fetchAdminData();
    } catch (err) {
      showError("Failed to delete user.");
    }
  };

  // Render Status Badge Helper
  const renderStatusBadge = (item) => {
    const status = item.approvalStatus || (item.approved ? 'APPROVED' : 'PENDING');
    if (status === 'APPROVED' || item.approved === true) {
      return (
        <span
          className="badge badge-status-approved px-2.5 py-1.5 fw-bold d-inline-flex align-items-center"
          style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
        >
          <i className="bi bi-check-circle-fill me-1" style={{ color: '#15803d' }}></i>Approved
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span
          className="badge badge-status-rejected px-2.5 py-1.5 fw-bold d-inline-flex align-items-center"
          style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
        >
          <i className="bi bi-x-circle-fill me-1" style={{ color: '#b91c1c' }}></i>Rejected
        </span>
      );
    }
    return (
      <span
        className="badge badge-status-pending px-2.5 py-1.5 fw-bold d-inline-flex align-items-center"
        style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}
      >
        <i className="bi bi-hourglass-split me-1" style={{ color: '#92400e' }}></i>Pending Approval
      </span>
    );
  };

  // Filtered resources and skills
  const filteredResources = resources.filter((r) => {
    const status = r.approvalStatus || (r.approved ? 'APPROVED' : 'PENDING');
    const matchesFilter =
      resourceFilter === 'ALL' ||
      (resourceFilter === 'PENDING' && (status === 'PENDING' || !r.approved)) ||
      (resourceFilter === 'APPROVED' && (status === 'APPROVED' || r.approved === true)) ||
      (resourceFilter === 'REJECTED' && status === 'REJECTED');
    const matchesSearch =
      searchTerm === '' ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredSkills = skills.filter((s) => {
    const status = s.approvalStatus || (s.approved ? 'APPROVED' : 'PENDING');
    const matchesFilter =
      skillFilter === 'ALL' ||
      (skillFilter === 'PENDING' && (status === 'PENDING' || !s.approved)) ||
      (skillFilter === 'APPROVED' && (status === 'APPROVED' || s.approved === true)) ||
      (skillFilter === 'REJECTED' && status === 'REJECTED');
    const matchesSearch =
      searchTerm === '' ||
      s.skillName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate live pending counts
  const pendingResCount = resources.filter(
    (r) => (r.approvalStatus || (r.approved ? 'APPROVED' : 'PENDING')) === 'PENDING' && !r.approved
  ).length;

  const pendingSkillCount = skills.filter(
    (s) => (s.approvalStatus || (s.approved ? 'APPROVED' : 'PENDING')) === 'PENDING' && !s.approved
  ).length;

  // 1. ADMIN LOGIN VIEW (if not authenticated as ADMIN)
  if (!isAdminLoggedIn) {
    return (
      <AnimatedPage className="container py-5 my-md-4">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="glass-card overflow-hidden border-0 shadow-lg p-0">
              <div className="text-white p-4 p-md-5 text-center" style={{ background: 'var(--primary-gradient)' }}>
                <div
                  className="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm mb-3"
                  style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <i className="bi bi-shield-lock-fill fs-1"></i>
                </div>
                <h3 className="fw-extrabold mb-1" style={{ letterSpacing: '-0.02em' }}>Admin Portal</h3>
                <p className="small mb-0 opacity-80">Restricted Management Console for EduCycle Platform Administrators</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {isAuthenticated && user?.role !== 'ADMIN' && (
                  <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-2 mb-4 py-2.5">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0 fs-5"></i>
                    <small>
                      You are logged in as a regular user (<code>{user.email}</code>). Please sign in with an Administrator account.
                    </small>
                  </div>
                )}

                <form onSubmit={handleAdminLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">Admin Email</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="admin@educycle.edu"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">Admin Password</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-key"></i></span>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-3 mb-4 rounded-3 border bg-light small d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted d-block">Demo Admin Account:</span>
                      <code>admin@educycle.edu / admin123</code>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary fw-bold"
                      onClick={handleQuickFill}
                    >
                      Auto-fill
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm" disabled={loggingIn}>
                    {loggingIn ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>Sign In to Admin Console
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // 2. AUTHENTICATED ADMIN CONSOLE
  return (
    <AnimatedPage className="container py-5">
      {/* Header Banner */}
      <div
        className="glass-card p-4 p-md-5 mb-4 text-white d-flex align-items-center justify-content-between flex-column flex-md-row gap-3 shadow-lg"
        style={{ background: 'var(--primary-gradient)' }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-white text-primary px-3 py-1.5 fw-bold shadow-sm">
              <i className="bi bi-shield-fill-check me-1"></i>ADMINISTRATOR
            </span>
            {(pendingResCount > 0 || pendingSkillCount > 0) && (
              <span className="badge bg-warning text-dark px-3 py-1.5 fw-bold shadow-sm animate-pulse">
                <i className="bi bi-bell-fill me-1"></i>{pendingResCount + pendingSkillCount} Pending Moderation
              </span>
            )}
          </div>
          <h2 className="fw-extrabold mb-1" style={{ letterSpacing: '-0.02em' }}>EduCycle Admin Moderation Panel</h2>
          <p className="small mb-0 opacity-80">Approve academic resources & skills before they appear in the public portal</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-light btn-sm fw-bold px-3 py-2 text-primary" onClick={fetchAdminData}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
          <button className="btn btn-outline-light btn-sm fw-bold px-3 py-2" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1"></i>Logout Admin
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="d-flex flex-wrap gap-2 border-bottom border-subtle pb-3 mb-4 justify-content-between align-items-center">
        <ul className="nav nav-pills gap-2 mb-0">
          <li className="nav-item">
            <button
              className={`nav-link fw-bold px-3 py-2 rounded-3 ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-graph-up me-2"></i>Overview
            </button>
          </li>
          <li className="nav-item position-relative">
            <button
              className={`nav-link fw-bold px-3 py-2 rounded-3 ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <i className="bi bi-book me-2"></i>Resource Approval
              {pendingResCount > 0 && (
                <span className="badge bg-warning text-dark ms-2 rounded-pill">{pendingResCount}</span>
              )}
            </button>
          </li>
          <li className="nav-item position-relative">
            <button
              className={`nav-link fw-bold px-3 py-2 rounded-3 ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <i className="bi bi-mortarboard me-2"></i>Skill Approval
              {pendingSkillCount > 0 && (
                <span className="badge bg-warning text-dark ms-2 rounded-pill">{pendingSkillCount}</span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-bold px-3 py-2 rounded-3 ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people me-2"></i>Users ({users.length})
            </button>
          </li>
        </ul>

        {(activeTab === 'resources' || activeTab === 'skills') && (
          <div className="input-group" style={{ maxWidth: '280px' }}>
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading moderation console...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div>
              {/* Alert if moderation needed */}
              {(pendingResCount > 0 || pendingSkillCount > 0) && (
                <div className="alert alert-warning border-0 shadow-sm p-4 mb-4 rounded-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center text-warning-emphasis bg-warning bg-opacity-25 rounded-circle flex-shrink-0"
                      style={{ width: '48px', height: '48px' }}
                    >
                      <i className="bi bi-exclamation-octagon-fill fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1 text-dark">Action Required: Submissions Awaiting Approval</h5>
                      <p className="small text-muted mb-0">
                        {pendingResCount} resource(s) and {pendingSkillCount} skill(s) submitted by students are waiting for admin verification before appearing in the portal.
                      </p>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {pendingResCount > 0 && (
                      <button
                        className="btn btn-warning btn-sm fw-bold px-3"
                        onClick={() => {
                          setResourceFilter('PENDING');
                          setActiveTab('resources');
                        }}
                      >
                        Review Resources ({pendingResCount})
                      </button>
                    )}
                    {pendingSkillCount > 0 && (
                      <button
                        className="btn btn-outline-warning text-dark btn-sm fw-bold px-3"
                        onClick={() => {
                          setSkillFilter('PENDING');
                          setActiveTab('skills');
                        }}
                      >
                        Review Skills ({pendingSkillCount})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="glass-card p-4 text-center h-100">
                    <div
                      className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-3"
                      style={{ width: '56px', height: '56px', background: 'var(--primary-light)' }}
                    >
                      <i className="bi bi-people-fill fs-3"></i>
                    </div>
                    <h2 className="fw-extrabold text-dark mb-1">{stats?.totalUsers || users.length}</h2>
                    <span className="text-muted fw-semibold small">Registered Campus Users</span>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="glass-card p-4 text-center h-100">
                    <div
                      className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-3"
                      style={{ width: '56px', height: '56px', background: 'var(--primary-light)' }}
                    >
                      <i className="bi bi-box-seam-fill fs-3"></i>
                    </div>
                    <h2 className="fw-extrabold text-dark mb-1">{resources.length}</h2>
                    <span className="text-muted fw-semibold small d-block mb-2">Total Resources Posted</span>
                    <div className="d-flex justify-content-center gap-2">
                      <span
                        className="badge badge-status-pending px-2.5 py-1.5 fw-bold"
                        style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}
                      >
                        <i className="bi bi-hourglass-split me-1"></i>{pendingResCount} Pending
                      </span>
                      <span
                        className="badge badge-status-approved px-2.5 py-1.5 fw-bold"
                        style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                      >
                        <i className="bi bi-check-circle-fill me-1"></i>{resources.filter(r => r.approved).length} Approved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="glass-card p-4 text-center h-100">
                    <div
                      className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-3"
                      style={{ width: '56px', height: '56px', background: 'var(--primary-light)' }}
                    >
                      <i className="bi bi-mortarboard-fill fs-3"></i>
                    </div>
                    <h2 className="fw-extrabold text-dark mb-1">{skills.length}</h2>
                    <span className="text-muted fw-semibold small d-block mb-2">Total Peer Skills Offered</span>
                    <div className="d-flex justify-content-center gap-2">
                      <span
                        className="badge badge-status-pending px-2.5 py-1.5 fw-bold"
                        style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}
                      >
                        <i className="bi bi-hourglass-split me-1"></i>{pendingSkillCount} Pending
                      </span>
                      <span
                        className="badge badge-status-approved px-2.5 py-1.5 fw-bold"
                        style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                      >
                        <i className="bi bi-check-circle-fill me-1"></i>{skills.filter(s => s.approved).length} Approved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="glass-card p-4">
                <h5 className="fw-bold text-dark mb-3">Moderation Shortcuts</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div
                      className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between cursor-pointer hover-shadow"
                      onClick={() => {
                        setResourceFilter('PENDING');
                        setActiveTab('resources');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">
                          <i className="bi bi-hourglass-split text-warning me-2"></i>Pending Resources Approval
                        </h6>
                        <small className="text-muted">{pendingResCount} items awaiting verification</small>
                      </div>
                      <i className="bi bi-chevron-right text-primary fs-5"></i>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between cursor-pointer hover-shadow"
                      onClick={() => {
                        setSkillFilter('PENDING');
                        setActiveTab('skills');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">
                          <i className="bi bi-hourglass-split text-warning me-2"></i>Pending Skills Approval
                        </h6>
                        <small className="text-muted">{pendingSkillCount} items awaiting verification</small>
                      </div>
                      <i className="bi bi-chevron-right text-primary fs-5"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESOURCE MODERATION */}
          {activeTab === 'resources' && (
            <div>
              {/* Filter Pills */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <button
                  className={`btn btn-sm ${resourceFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold px-3`}
                  onClick={() => setResourceFilter('ALL')}
                >
                  All ({resources.length})
                </button>
                <button
                  className={`btn btn-sm ${resourceFilter === 'PENDING' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'} fw-bold px-3`}
                  onClick={() => setResourceFilter('PENDING')}
                >
                  <i className="bi bi-hourglass-split me-1"></i>Pending Approval ({pendingResCount})
                </button>
                <button
                  className={`btn btn-sm ${resourceFilter === 'APPROVED' ? 'btn-success' : 'btn-outline-success'} fw-bold px-3`}
                  onClick={() => setResourceFilter('APPROVED')}
                >
                  <i className="bi bi-check-circle me-1"></i>Approved ({resources.filter(r => r.approved).length})
                </button>
                <button
                  className={`btn btn-sm ${resourceFilter === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'} fw-bold px-3`}
                  onClick={() => setResourceFilter('REJECTED')}
                >
                  <i className="bi bi-x-circle me-1"></i>Rejected ({resources.filter(r => (r.approvalStatus || '') === 'REJECTED').length})
                </button>
              </div>

              {/* Table */}
              <div className="glass-card overflow-hidden p-0 shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: '60px' }}>ID</th>
                        <th style={{ minWidth: '220px' }}>Resource Info</th>
                        <th style={{ minWidth: '120px' }}>Category & Type</th>
                        <th style={{ minWidth: '160px' }}>Posted By</th>
                        <th style={{ minWidth: '140px' }}>Approval Status</th>
                        <th style={{ minWidth: '200px' }} className="text-end pe-3">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResources.length > 0 ? (
                        filteredResources.map((res) => {
                          const resId = res.resourceId || res.id;
                          const isApproved = res.approved === true || res.approvalStatus === 'APPROVED';
                          const isRejected = res.approvalStatus === 'REJECTED';

                          return (
                            <tr key={resId}>
                              <td className="fw-bold text-primary">#{resId}</td>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  {res.imageUrl && (
                                    <img
                                      src={res.imageUrl}
                                      alt=""
                                      className="rounded-3 object-fit-cover shadow-sm flex-shrink-0"
                                      style={{ width: '48px', height: '48px' }}
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  )}
                                  <div>
                                    <h6 className="fw-bold text-dark mb-0">{res.title}</h6>
                                    <small className="text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                      {res.description}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="badge-pill-accent d-inline-block mb-1">{res.category}</span>
                                <div>
                                  <span className="badge bg-light text-secondary border text-uppercase" style={{ fontSize: '0.7rem' }}>
                                    {res.exchangeType} • {res.condition || 'Good'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="fw-semibold text-dark small">
                                  {res.user ? `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim() : 'Campus Student'}
                                </div>
                                <small className="text-muted">{res.user?.email || 'student@college.edu'}</small>
                              </td>
                              <td>
                                {renderStatusBadge(res)}
                              </td>
                              <td className="text-end pe-3">
                                <div className="btn-group btn-group-sm" role="group">
                                  {!isApproved && (
                                    <button
                                      className="btn btn-success fw-bold px-2.5 py-1.5"
                                      title="Approve resource to show in portal"
                                      onClick={() => handleApproveResource(resId)}
                                    >
                                      <i className="bi bi-check-lg me-1"></i>Approve
                                    </button>
                                  )}
                                  {!isRejected && (
                                    <button
                                      className="btn btn-outline-warning text-dark fw-bold px-2.5 py-1.5"
                                      title="Reject resource"
                                      onClick={() => handleRejectResource(resId)}
                                    >
                                      <i className="bi bi-x-lg me-1"></i>Reject
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline-danger fw-bold px-2.5 py-1.5"
                                    title="Delete listing"
                                    onClick={() => handleDeleteResource(resId)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-50"></i>
                            No resources match the selected criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILL MODERATION */}
          {activeTab === 'skills' && (
            <div>
              {/* Filter Pills */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <button
                  className={`btn btn-sm ${skillFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold px-3`}
                  onClick={() => setSkillFilter('ALL')}
                >
                  All ({skills.length})
                </button>
                <button
                  className={`btn btn-sm ${skillFilter === 'PENDING' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'} fw-bold px-3`}
                  onClick={() => setSkillFilter('PENDING')}
                >
                  <i className="bi bi-hourglass-split me-1"></i>Pending Approval ({pendingSkillCount})
                </button>
                <button
                  className={`btn btn-sm ${skillFilter === 'APPROVED' ? 'btn-success' : 'btn-outline-success'} fw-bold px-3`}
                  onClick={() => setSkillFilter('APPROVED')}
                >
                  <i className="bi bi-check-circle me-1"></i>Approved ({skills.filter(s => s.approved).length})
                </button>
                <button
                  className={`btn btn-sm ${skillFilter === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'} fw-bold px-3`}
                  onClick={() => setSkillFilter('REJECTED')}
                >
                  <i className="bi bi-x-circle me-1"></i>Rejected ({skills.filter(s => (s.approvalStatus || '') === 'REJECTED').length})
                </button>
              </div>

              {/* Table */}
              <div className="glass-card overflow-hidden p-0 shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: '60px' }}>ID</th>
                        <th style={{ minWidth: '220px' }}>Skill Offering</th>
                        <th style={{ minWidth: '130px' }}>Category & Level</th>
                        <th style={{ minWidth: '160px' }}>Tutor</th>
                        <th style={{ minWidth: '140px' }}>Approval Status</th>
                        <th style={{ minWidth: '200px' }} className="text-end pe-3">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skl) => {
                          const sklId = skl.skillId || skl.id;
                          const isApproved = skl.approved === true || skl.approvalStatus === 'APPROVED';
                          const isRejected = skl.approvalStatus === 'REJECTED';

                          return (
                            <tr key={sklId}>
                              <td className="fw-bold text-primary">#{sklId}</td>
                              <td>
                                <h6 className="fw-bold text-dark mb-0">{skl.skillName}</h6>
                                <small className="text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {skl.description}
                                </small>
                                <div className="small text-secondary mt-1">
                                  <i className="bi bi-display me-1"></i>{formatTeachingMethod(skl.teachingMethod)} • <i className="bi bi-clock me-1"></i>{skl.availability || 'Flexible Schedule'}
                                </div>
                              </td>
                              <td>
                                <span className="badge-pill-accent d-inline-block mb-1">{skl.category}</span>
                                <div>
                                  <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                                    {skl.level || 'Intermediate'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="fw-semibold text-dark small">
                                  {skl.user ? `${skl.user.firstName || ''} ${skl.user.lastName || ''}`.trim() : 'Campus Tutor'}
                                </div>
                                <small className="text-muted">{skl.user?.email || 'tutor@college.edu'}</small>
                              </td>
                              <td>
                                {renderStatusBadge(skl)}
                              </td>
                              <td className="text-end pe-3">
                                <div className="btn-group btn-group-sm" role="group">
                                  {!isApproved && (
                                    <button
                                      className="btn btn-success fw-bold px-2.5 py-1.5"
                                      title="Approve skill to show in directory"
                                      onClick={() => handleApproveSkill(sklId)}
                                    >
                                      <i className="bi bi-check-lg me-1"></i>Approve
                                    </button>
                                  )}
                                  {!isRejected && (
                                    <button
                                      className="btn btn-outline-warning text-dark fw-bold px-2.5 py-1.5"
                                      title="Reject skill"
                                      onClick={() => handleRejectSkill(sklId)}
                                    >
                                      <i className="bi bi-x-lg me-1"></i>Reject
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline-danger fw-bold px-2.5 py-1.5"
                                    title="Delete skill"
                                    onClick={() => handleDeleteSkill(sklId)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-50"></i>
                            No skills match the selected criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="glass-card overflow-hidden p-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>College / Department</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((u) => {
                        const uId = u.userId || u.id;
                        return (
                          <tr key={uId}>
                            <td className="fw-bold text-primary">#{uId}</td>
                            <td className="fw-bold text-dark">{u.firstName} {u.lastName}</td>
                            <td className="text-muted">{u.email}</td>
                            <td className="small">{u.college || 'Engineering'} • {u.department || 'CS'}</td>
                            <td>
                              <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger text-white' : 'bg-primary text-white'}`}>
                                {u.role || 'USER'}
                              </span>
                            </td>
                            <td>
                              {u.suspended ? (
                                <div>
                                  <span
                                    className="badge badge-status-rejected px-2.5 py-1.5 fw-bold d-inline-flex align-items-center"
                                    style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                                  >
                                    <i className="bi bi-slash-circle me-1"></i>Suspended
                                  </span>
                                  {u.suspendedUntil && (
                                    <small className="d-block text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                                      Until {new Date(u.suspendedUntil).toLocaleDateString()} {new Date(u.suspendedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </small>
                                  )}
                                  {u.suspensionReason && (
                                    <small className="d-block text-secondary fst-italic mt-0.5" style={{ fontSize: '0.7rem' }}>
                                      "{u.suspensionReason}"
                                    </small>
                                  )}
                                </div>
                              ) : (
                                <span
                                  className="badge badge-status-approved px-2.5 py-1.5 fw-bold d-inline-flex align-items-center"
                                  style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                                >
                                  <i className="bi bi-check-circle-fill me-1"></i>Active
                                </span>
                              )}
                            </td>
                            <td className="text-end pe-3">
                              {u.role !== 'ADMIN' && (
                                <div className="btn-group btn-group-sm" role="group">
                                  {u.suspended ? (
                                    <button
                                      className="btn btn-success fw-bold px-2.5 py-1.5"
                                      onClick={() => handleUnsuspendUser(uId, `${u.firstName || ''} ${u.lastName || ''}`.trim())}
                                      title="Lift suspension and reactivate user"
                                    >
                                      <i className="bi bi-play-circle me-1"></i>Reactivate
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-outline-warning text-dark fw-bold px-2.5 py-1.5"
                                      onClick={() => openSuspendModal(u)}
                                      title="Temporarily suspend user account"
                                    >
                                      <i className="bi bi-pause-circle me-1"></i>Suspend
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline-danger fw-bold px-2.5 py-1.5"
                                    onClick={() => handleDeleteUser(uId, `${u.firstName || ''} ${u.lastName || ''}`.trim())}
                                    title="Permanently delete user account"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="7" className="text-center text-muted py-4">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Temporary Suspension Modal */}
      {suspendModalOpen && selectedUserForSuspend && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1050
          }}
        >
          <div className="card shadow-lg border-0 p-0 overflow-hidden" style={{ width: '92%', maxWidth: '520px', borderRadius: '16px' }}>
            <div className="p-4 text-white" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-pause-circle-fill fs-3"></i>
                  <div>
                    <h5 className="fw-bold mb-0 text-white">Temporarily Suspend User</h5>
                    <small className="opacity-80">Restrict account access without deleting profile or data</small>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeSuspendModal}
                  aria-label="Close"
                ></button>
              </div>
            </div>

            <div className="card-body p-4 bg-white">
              {/* User Card Mini */}
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3 bg-light border">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                  style={{ width: '42px', height: '42px', background: 'var(--primary-gradient)' }}
                >
                  {(selectedUserForSuspend.firstName || 'U')[0]}
                </div>
                <div>
                  <div className="fw-bold text-dark">{selectedUserForSuspend.firstName} {selectedUserForSuspend.lastName}</div>
                  <small className="text-muted">{selectedUserForSuspend.email}</small>
                </div>
              </div>

              {/* Duration Select */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark small mb-1">
                  <i className="bi bi-clock-history me-1 text-warning"></i>Suspension Duration
                </label>
                <select 
                  className="form-select"
                  value={suspendDurationDays}
                  onChange={(e) => setSuspendDurationDays(e.target.value)}
                >
                  <option value="1">1 Day (24 Hours)</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days (1 Week)</option>
                  <option value="14">14 Days (2 Weeks)</option>
                  <option value="30">30 Days (1 Month)</option>
                  <option value="0">Indefinite (Until manually reactivated)</option>
                </select>
                <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                  User will be blocked from logging in during this period.
                </small>
              </div>

              {/* Reason Input */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark small mb-1">
                  <i className="bi bi-chat-left-dots me-1 text-primary"></i>Reason for Suspension
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Unreturned borrowed item, community guidelines..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
                <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                  This reason will be displayed to the user if they try to sign in.
                </small>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3 fw-semibold"
                  onClick={closeSuspendModal}
                  disabled={suspending}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning text-dark fw-bold px-4 shadow-sm"
                  onClick={handleConfirmSuspend}
                  disabled={suspending}
                >
                  {suspending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Suspending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-pause-circle me-1"></i>Confirm Suspension
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default AdminPanel;
