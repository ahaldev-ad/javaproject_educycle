import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedPage from '../components/AnimatedPage';
import ResourceCard from '../components/ResourceCard';
import SkillCard from '../components/SkillCard';
import RequestModal from '../components/RequestModal';
import { resourceService } from '../services/resourceService';
import { skillService } from '../services/skillService';
import { requestService } from '../services/requestService';
import { statsService } from '../services/miscServices';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [skills, setSkills] = useState([]);
  const [liveStats, setLiveStats] = useState({
    resources: null,
    skills: null,
    students: null
  });
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  const heroSectionRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroBadgeRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroBtnsRef = useRef(null);

  const statsSectionRef = useRef(null);
  const resourcesHeaderRef = useRef(null);
  const resourcesGridRef = useRef(null);
  const skillsHeaderRef = useRef(null);
  const skillsGridRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resData, skillData, statsData] = await Promise.all([
          resourceService.getAll({ limit: 4 }),
          skillService.getAll({ limit: 4 }),
          statsService.getLiveStats()
        ]);
        const rawRes = resData.content || resData || [];
        const rawSkills = skillData.content || skillData || [];
        const approvedRes = rawRes.filter(item => item.approvalStatus ? item.approvalStatus === 'APPROVED' : item.approved !== false);
        const approvedSkills = rawSkills.filter(item => item.approvalStatus ? item.approvalStatus === 'APPROVED' : item.approved !== false);
        setResources(approvedRes);
        setSkills(approvedSkills);

        if (statsData) {
          setLiveStats({
            resources: statsData.resourcesShared ?? statsData.totalResources ?? approvedRes.length,
            skills: statsData.skillsOffered ?? statsData.skillSessions ?? statsData.totalSkills ?? approvedSkills.length,
            students: statsData.activeStudents ?? statsData.totalUsers ?? 0
          });
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Load Entrance Timeline
      const tl = gsap.timeline();
      if (heroBadgeRef.current) {
        tl.fromTo(heroBadgeRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      }
      if (heroTitleRef.current) {
        tl.fromTo(heroTitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, "-=0.4");
      }
      if (heroTextRef.current) {
        tl.fromTo(heroTextRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, "-=0.4");
      }
      if (heroBtnsRef.current) {
        tl.fromTo(heroBtnsRef.current, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' }, "-=0.3");
      }

      // Parallax Hero Image on Scroll
      if (heroImageRef.current && heroSectionRef.current) {
        gsap.to(heroImageRef.current, {
          yPercent: 15,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Stats Section ScrollTrigger Reveal
      if (statsSectionRef.current) {
        gsap.fromTo(
          statsSectionRef.current.children,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: statsSectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Trending Resources Header ScrollTrigger Reveal
      if (resourcesHeaderRef.current) {
        gsap.fromTo(
          resourcesHeaderRef.current,
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: resourcesHeaderRef.current,
              start: 'top 85%',
            },
          }
        );
      }

      // Featured Skills Header ScrollTrigger Reveal
      if (skillsHeaderRef.current) {
        gsap.fromTo(
          skillsHeaderRef.current,
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: skillsHeaderRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Trigger grid stagger when loaded and scrolled into view
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        if (resourcesGridRef.current) {
          gsap.fromTo(
            resourcesGridRef.current.children,
            { y: 45, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.65,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: resourcesGridRef.current,
                start: 'top 85%',
              },
            }
          );
        }

        if (skillsGridRef.current) {
          gsap.fromTo(
            skillsGridRef.current.children,
            { y: 45, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.65,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: skillsGridRef.current,
                start: 'top 85%',
              },
            }
          );
        }
      });

      return () => ctx.revert();
    }
  }, [loading, resources, skills]);

  const handleRequestClick = (item, type) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedItem(item);
    setModalType(type);
  };

  const handleModalSubmit = async (data) => {
    try {
      if (modalType === 'resource') {
        await requestService.createResourceRequest(data);
      } else {
        await requestService.createSkillRequest(data);
      }
      showSuccess("Request submitted successfully!");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit request.");
    }
  };

  return (
    <AnimatedPage className="home-page pb-5">
      {/* Flowing Minimal Hero Section */}
      <section ref={heroSectionRef} className="py-5 mb-5 position-relative overflow-hidden">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span ref={heroBadgeRef} className="badge-pill-accent mb-3 py-2 px-3 fs-6 shadow-sm">
                <i className="bi bi-mortarboard-fill me-1"></i> Campus Peer Collaborative Platform
              </span>
              <h1 ref={heroTitleRef} className="display-4 fw-extrabold mb-3 text-dark" style={{ letterSpacing: '-0.03em', lineHeight: '1.15' }}>
                Share Resources, <br />
                <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Exchange Skills & Grow
                </span>
              </h1>
              <p ref={heroTextRef} className="lead text-muted mb-4 pe-lg-4" style={{ lineHeight: '1.7' }}>
                EduCycle connects students within your institution to donate, lend, or swap academic materials and offer peer-to-peer tutoring seamlessly.
              </p>
              <div ref={heroBtnsRef} className="d-flex flex-wrap gap-3 hero-btns-wrap">
                <Link to="/resources" className="btn btn-primary btn-lg fw-bold px-4 py-3 shadow-lg d-flex align-items-center gap-2">
                  <span>Browse Resources</span>
                  <i className="bi bi-arrow-right fs-5"></i>
                </Link>
                <Link to="/skills" className="btn btn-outline-primary btn-lg fw-bold px-4 py-3 d-flex align-items-center gap-2">
                  <span>Explore Peer Skills</span>
                  <i className="bi bi-compass fs-5"></i>
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="position-relative">
                <div
                  className="position-absolute top-50 start-50 translate-middle w-100 h-100 rounded-circle"
                  style={{ background: 'radial-gradient(circle, rgba(5,79,163,0.15) 0%, rgba(5,79,163,0) 70%)', filter: 'blur(30px)', zIndex: -1 }}
                ></div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glass Stats Counter Section with ScrollTrigger */}
      <section className="container mb-5">
        <div ref={statsSectionRef} className="row g-3 g-md-4 text-center">
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 p-md-4 h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-2"
                style={{ width: '44px', height: '44px', background: 'var(--primary-light)' }}
              >
                <i className="bi bi-box-seam-fill fs-5"></i>
              </div>
              <h3 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                {liveStats.resources !== null ? liveStats.resources : (resources.length || 0)}
              </h3>
              <p className="text-muted small mb-0 fw-semibold">Resources Shared</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 p-md-4 h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-2"
                style={{ width: '44px', height: '44px', background: 'var(--primary-light)' }}
              >
                <i className="bi bi-people-fill fs-5"></i>
              </div>
              <h3 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                {liveStats.skills !== null ? liveStats.skills : (skills.length || 0)}
              </h3>
              <p className="text-muted small mb-0 fw-semibold">Peer Skills Offered</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 p-md-4 h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-2"
                style={{ width: '44px', height: '44px', background: 'var(--primary-light)' }}
              >
                <i className="bi bi-mortarboard-fill fs-5"></i>
              </div>
              <h3 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                {liveStats.students !== null ? liveStats.students : 0}
              </h3>
              <p className="text-muted small mb-0 fw-semibold">Active Students</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 p-md-4 h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-2"
                style={{ width: '44px', height: '44px', background: 'var(--primary-light)' }}
              >
                <i className="bi bi-tree-fill fs-5"></i>
              </div>
              <h3 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>100%</h3>
              <p className="text-muted small mb-0 fw-semibold">Sustainable Exchange</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Resources with ScrollTrigger */}
      <section className="container mb-5">
        <div ref={resourcesHeaderRef} className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end gap-3 mb-4">
          <div>
            <span className="badge-pill-accent mb-2">
              <i className="bi bi-award-fill me-1"></i> Academic Marketplace
            </span>
            <h2 className="fw-extrabold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Trending Resources</h2>
          </div>
          <Link to="/resources" className="btn btn-outline-primary fw-bold px-4">
            View All <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div ref={resourcesGridRef} className="row g-3 g-md-4">
            {resources.length > 0 ? (
              resources.slice(0, 4).map((item) => (
                <div className="col-lg-3 col-md-6" key={item.id || item.resourceId}>
                  <ResourceCard resource={item} onRequest={(res) => handleRequestClick(res, 'resource')} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted py-5 glass-card">No resources available at the moment.</div>
            )}
          </div>
        )}
      </section>

      {/* Featured Skills with ScrollTrigger */}
      <section className="container mb-5">
        <div ref={skillsHeaderRef} className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end gap-3 mb-4">
          <div>
            <span className="badge-pill-accent mb-2">
              <i className="bi bi-lightning-charge-fill me-1"></i> Peer Learning
            </span>
            <h2 className="fw-extrabold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Featured Peer Skills</h2>
          </div>
          <Link to="/skills" className="btn btn-outline-primary fw-bold px-4">
            Explore All <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div ref={skillsGridRef} className="row g-4">
            {skills.length > 0 ? (
              skills.slice(0, 4).map((skill) => (
                <div className="col-lg-3 col-md-6" key={skill.id || skill.skillId}>
                  <SkillCard skill={skill} onRequest={(sk) => handleRequestClick(sk, 'skill')} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted py-5 glass-card">No skill offers available right now.</div>
            )}
          </div>
        )}
      </section>

      <RequestModal
        show={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        type={modalType}
        onSubmit={handleModalSubmit}
      />
    </AnimatedPage>
  );
};

export default Home;
