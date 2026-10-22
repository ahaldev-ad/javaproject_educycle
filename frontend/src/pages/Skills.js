import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedPage from '../components/AnimatedPage';
import SkillCard from '../components/SkillCard';
import RequestModal from '../components/RequestModal';
import { skillService } from '../services/skillService';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [allSkills, setAllSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  // Modal State
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const filterRef = useRef(null);
  const gridRef = useRef(null);

  // New Skill Form
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    category: 'Programming',
    level: 'Intermediate',
    teachingMethod: 'ONE_ON_ONE',
    availability: '',
    description: ''
  });

  const skillCategories = ['Programming', 'Mathematics', 'Languages', 'Design', 'Music', 'Sports', 'Arts', 'Other'];

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await skillService.getAll();
      const raw = data.content || data || [];
      // Strictly show only approved skills in public directory
      const approvedOnly = raw.filter(item => {
        if (item.approvalStatus) {
          return item.approvalStatus === 'APPROVED';
        }
        return item.approved !== false;
      });
      setAllSkills(approvedOnly);
    } catch (err) {
      showError("Failed to fetch skill offerings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live filter skills whenever allSkills, category, level, or search changes
  useEffect(() => {
    let filtered = [...allSkills];

    if (category) {
      filtered = filtered.filter(skill =>
        (skill.category || '').toLowerCase() === category.toLowerCase()
      );
    }

    if (level) {
      filtered = filtered.filter(skill =>
        (skill.level || '').toLowerCase() === level.toLowerCase()
      );
    }

    if (search && search.trim() !== '') {
      const query = search.trim().toLowerCase();
      filtered = filtered.filter(skill => {
        const name = (skill.skillName || '').toLowerCase();
        const desc = (skill.description || '').toLowerCase();
        const cat = (skill.category || '').toLowerCase();
        const tutor = `${skill.user?.firstName || ''} ${skill.user?.lastName || ''}`.toLowerCase();
        return name.includes(query) || desc.includes(query) || cat.includes(query) || tutor.includes(query);
      });
    }

    setSkills(filtered);
  }, [allSkills, category, level, search]);

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
  }, [loading, skills]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSkills();
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = user?.userId || user?.id;
      await skillService.create({ ...newSkill, userId });
      showSuccess("Skill offer submitted! It will be visible in the directory after Admin approval.");
      setShowPostModal(false);
      setNewSkill({
        skillName: '',
        category: 'Programming',
        level: 'Intermediate',
        teachingMethod: 'ONE_ON_ONE',
        availability: '',
        description: ''
      });
      fetchSkills();
    } catch (err) {
      showError("Failed to post skill offer.");
    }
  };

  const handleRequestSubmit = async (data) => {
    try {
      await requestService.createSkillRequest(data);
      showSuccess("Skill learning request sent successfully!");
    } catch (err) {
      showError(err.response?.data?.message || "Request failed.");
    }
  };

  return (
    <AnimatedPage className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge-pill-accent mb-2">
            <i className="bi bi-mortarboard-fill me-1"></i> Peer Learning
          </span>
          <h2 className="fw-extrabold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>Peer Skill Exchange</h2>
          <p className="text-muted mb-0">Learn programming, mathematics, foreign languages, and design from fellow students</p>
        </div>
        {isAuthenticated && (
          <button className="btn btn-primary fw-bold px-4 py-2.5 d-flex align-items-center gap-2" onClick={() => setShowPostModal(true)}>
            <i className="bi bi-plus-circle-fill fs-5"></i>
            <span>Offer a Skill</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div ref={filterRef} className="glass-card p-4 mb-5">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by skill name, tech stack, language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {skillCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All Expertise Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="col-md-1 d-flex gap-1">
            <button type="submit" className="btn btn-primary w-100 fw-bold" title="Search">
              <i className="bi bi-search"></i>
            </button>
            {(search || category || level) && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                title="Reset Filters"
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setLevel('');
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div ref={gridRef} className="row g-4">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div className="col-lg-3 col-md-6" key={skill.id || skill.skillId}>
                <SkillCard skill={skill} onRequest={(sk) => setSelectedSkill(sk)} />
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 glass-card">
              <i className="bi bi-mortarboard display-4 text-primary opacity-50 d-block mb-3"></i>
              <h5 className="fw-bold text-dark">No skills found</h5>
              <p className="text-muted small">Be the first student to offer a skill in this category!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal to Post New Skill */}
      {showPostModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(3, 27, 56, 0.55)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content glass-card overflow-hidden p-0 border-0">
              <div className="modal-header text-white p-4" style={{ background: 'var(--primary-gradient)' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-mortarboard-fill fs-4"></i>Offer a Skill to Peers
                </h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowPostModal(false)}></button>
              </div>
              <form onSubmit={handlePostSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-dark">Skill / Subject Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Python Programming & Data Science basics"
                        value={newSkill.skillName}
                        onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Category</label>
                      <select
                        className="form-select"
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      >
                        {skillCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Expertise Level</label>
                      <select
                        className="form-select"
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                      >
                        <option value="Beginner">Beginner Friendly</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Session Mode</label>
                      <select
                        className="form-select"
                        value={newSkill.teachingMethod}
                        onChange={(e) => setNewSkill({ ...newSkill, teachingMethod: e.target.value })}
                      >
                        <option value="ONE_ON_ONE">One-on-One Tutoring</option>
                        <option value="GROUP">Group Study Session</option>
                        <option value="ASYNC">Async Code Review / Q&A</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Weekly Availability</label>
                      <input
                        type="text"
                        className="form-control"
                        list="availability-presets"
                        placeholder="e.g. Weekends, 2-4 hrs"
                        value={newSkill.availability}
                        onChange={(e) => setNewSkill({ ...newSkill, availability: e.target.value })}
                      />
                      <datalist id="availability-presets">
                        <option value="Weekends (2-4 hrs)" />
                        <option value="Weekday Evenings (3-5 hrs)" />
                        <option value="1-2 hours/week" />
                        <option value="3-5 hours/week" />
                        <option value="Flexible Schedule" />
                      </datalist>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Description & Teaching Overview</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        required
                        placeholder="Describe what you will cover, prerequisites, and how you prefer to organize study sessions..."
                        value={newSkill.description}
                        onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer p-4 pt-0 border-0 flex-column align-items-stretch gap-2">
                  <div className="alert alert-info border-0 p-2.5 mb-1 small d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check text-primary fs-5"></i>
                    <span>Skill offerings are reviewed by platform administrators before appearing in the public directory.</span>
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
        show={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        item={selectedSkill}
        type="skill"
        onSubmit={handleRequestSubmit}
      />
    </AnimatedPage>
  );
};

export default Skills;
