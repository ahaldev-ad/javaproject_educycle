import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedPage from '../components/AnimatedPage';
import ResourceCard from '../components/ResourceCard';
import RequestModal from '../components/RequestModal';
import { resourceService } from '../services/resourceService';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

gsap.registerPlugin(ScrollTrigger);

const Resources = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [allResources, setAllResources] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [exchangeType, setExchangeType] = useState('');

  // Modal State
  const [selectedResource, setSelectedResource] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const filterRef = useRef(null);
  const gridRef = useRef(null);

  // New Resource Form
  const [newResource, setNewResource] = useState({
    title: '',
    category: 'Textbooks',
    condition: 'Good',
    exchangeType: 'donate',
    description: '',
    quantity: 1,
    imageUrl: ''
  });

  const categories = ['Textbooks', 'Notes', 'Lab Kits', 'Project Components', 'Lab Equipment', 'Other'];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getAll();
      const raw = data.content || data || [];
      // Strictly show only approved resources in public exchange
      const approvedOnly = raw.filter(item => {
        if (item.approvalStatus) {
          return item.approvalStatus === 'APPROVED';
        }
        return item.approved !== false;
      });
      setAllResources(approvedOnly);
    } catch (err) {
      showError("Failed to fetch resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live filter resources whenever allResources, category, exchangeType, or search changes
  useEffect(() => {
    let filtered = [...allResources];

    if (category) {
      filtered = filtered.filter(item =>
        (item.category || '').toLowerCase() === category.toLowerCase()
      );
    }

    if (exchangeType) {
      filtered = filtered.filter(item =>
        (item.exchangeType || '').toLowerCase() === exchangeType.toLowerCase()
      );
    }

    if (search && search.trim() !== '') {
      const query = search.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const owner = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.toLowerCase();
        return title.includes(query) || desc.includes(query) || cat.includes(query) || owner.includes(query);
      });
    }

    setResources(filtered);
  }, [allResources, category, exchangeType, search]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (filterRef.current) {
        gsap.fromTo(
          filterRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!loading && gridRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          gridRef.current.children,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
            },
          }
        );
      });
      return () => ctx.revert();
    }
  }, [loading, resources]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = user?.userId || user?.id;
      await resourceService.create({ ...newResource, userId });
      showSuccess("Resource submitted! It will be visible in the exchange after Admin approval.");
      setShowPostModal(false);
      setNewResource({
        title: '',
        category: 'Textbooks',
        condition: 'Good',
        exchangeType: 'donate',
        description: '',
        quantity: 1,
        imageUrl: ''
      });
      fetchResources();
    } catch (err) {
      showError("Failed to post resource.");
    }
  };

  const handleRequestSubmit = async (data) => {
    try {
      await requestService.createResourceRequest(data);
      showSuccess("Resource request sent successfully!");
    } catch (err) {
      showError(err.response?.data?.message || "Request failed.");
    }
  };

  return (
    <AnimatedPage className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge-pill-accent mb-2">
            <i className="bi bi-box-seam-fill me-1"></i> Academic Marketplace
          </span>
          <h2 className="fw-extrabold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>Academic Resources Exchange</h2>
          <p className="text-muted mb-0">Browse textbooks, lab equipment, notes, and components posted by campus peers</p>
        </div>
        {isAuthenticated && (
          <button className="btn btn-primary fw-bold px-4 py-2.5 d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto" onClick={() => setShowPostModal(true)}>
            <i className="bi bi-plus-circle-fill fs-5"></i>
            <span>Post a Resource</span>
          </button>
        )}
      </div>

      {/* Optimized & Minimal Filter Toolbar */}
      <div ref={filterRef} className="minimal-filter-bar mb-4">
        <div className="filter-main-row">
          <div className="filter-search-box">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Search by title, subject, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-btn"
                title="Clear search"
                onClick={() => setSearch('')}
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>

          <div className="filter-selects-group">
            <div className="filter-select-box">
              <i className="bi bi-arrow-left-right select-icon"></i>
              <select
                className={`filter-select-minimal ${exchangeType ? 'active' : ''}`}
                value={exchangeType}
                onChange={(e) => setExchangeType(e.target.value)}
                aria-label="Filter by exchange type"
              >
                <option value="">Exchange: All</option>
                <option value="donate">Type: Donate</option>
                <option value="lend">Type: Lend</option>
                <option value="exchange">Type: Exchange</option>
              </select>
              <i className="bi bi-chevron-down select-arrow"></i>
            </div>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="category-chips-bar">
          <button
            type="button"
            className={`category-chip-btn ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(category === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meta Bar: Results count & clear action */}
        <div className="filter-meta-bar">
          <span>
            Showing <strong className="text-dark">{resources.length}</strong> of {allResources.length} resources
          </span>
          {(search || category || exchangeType) && (
            <button
              type="button"
              className="filter-reset-link"
              onClick={() => {
                setSearch('');
                setCategory('');
                setExchangeType('');
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div ref={gridRef} className="row g-3 g-md-4">
          {resources.length > 0 ? (
            resources.map((item) => (
              <div className="col-lg-3 col-md-6" key={item.id || item.resourceId}>
                <ResourceCard resource={item} onRequest={(res) => setSelectedResource(res)} />
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 glass-card">
              <i className="bi bi-box-seam display-4 text-primary opacity-50 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">No resources found</h5>
              <p className="text-muted small">Try tweaking your search keywords or category filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal to Post New Resource */}
      {showPostModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(3, 27, 56, 0.55)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPostModal(false);
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content glass-card overflow-hidden p-0 border-0">
              <div className="modal-header text-white p-4" style={{ background: 'var(--primary-gradient)' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-plus-circle-fill fs-4"></i>Post Academic Resource
                </h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowPostModal(false)}></button>
              </div>
              <form onSubmit={handlePostSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-dark">Resource Title</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Data Structures & Algorithms textbook"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Category</label>
                      <select
                        className="form-select"
                        value={newResource.category}
                        onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Condition</label>
                      <select
                        className="form-select"
                        value={newResource.condition}
                        onChange={(e) => setNewResource({ ...newResource, condition: e.target.value })}
                      >
                        <option value="New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Exchange Type</label>
                      <select
                        className="form-select"
                        value={newResource.exchangeType}
                        onChange={(e) => setNewResource({ ...newResource, exchangeType: e.target.value })}
                      >
                        <option value="donate">Donate</option>
                        <option value="lend">Lend</option>
                        <option value="exchange">Exchange</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={newResource.quantity}
                        onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Image URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://example.com/image.jpg"
                        value={newResource.imageUrl}
                        onChange={(e) => setNewResource({ ...newResource, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Description & Pickup Details</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        required
                        placeholder="Provide details about edition, condition, and preferred campus pickup locations..."
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer p-4 pt-0 border-0 flex-column align-items-stretch gap-2">
                  <div className="alert alert-info border-0 p-2.5 mb-1 small d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check text-primary fs-5"></i>
                    <span>Submissions are verified by platform administrators before appearing on campus listings.</span>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light px-4" onClick={() => setShowPostModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-4 fw-bold">Submit for Approval</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      <RequestModal
        show={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        item={selectedResource}
        type="resource"
        onSubmit={handleRequestSubmit}
      />
    </AnimatedPage>
  );
};

export default Resources;
