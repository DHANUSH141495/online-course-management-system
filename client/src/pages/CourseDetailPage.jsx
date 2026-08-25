import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  CheckCircle, 
  PlayCircle, 
  ShieldCheck, 
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  MessageSquare
} from 'lucide-react';
import CourseDiscussions from '../components/CourseDiscussions';
import CourseResources from '../components/CourseResources';

export default function CourseDetailPage({ courseId, onBack, onOpenLearningRoom }) {
  const { user, authFetch, openAuthModal, showToast } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(0);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'resources' | 'discussions' | 'reviews'

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('coursify_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/courses/${courseId}`, { headers });
      const data = await res.json();
      if (data.success) {
        setCourse(data.course);
      } else {
        showToast(data.message || 'Course not found', 'error');
        onBack();
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    setEnrolling(true);
    const { ok, data } = await authFetch('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId: course.id })
    });

    setEnrolling(false);

    if (ok) {
      showToast(data.message || 'Enrolled successfully!', 'success');
      onOpenLearningRoom(course.id);
    } else {
      showToast(data.message || 'Enrollment failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading course information...</p>
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = course.is_enrolled === 1 || course.is_enrolled === true;
  const progress = course.user_progress || 0;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Hero Header Card */}
      <div className="card" style={{
        padding: '2.5rem',
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 27, 75, 0.6) 100%)',
        border: '1px solid var(--border-highlight)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {course.category_name && (
                <span className="badge badge-indigo">
                  {course.category_name}
                </span>
              )}
              <span className={`badge ${
                course.level === 'Beginner' ? 'badge-emerald' : 
                course.level === 'Intermediate' ? 'badge-amber' : 'badge-purple'
              }`}>
                {course.level} Level
              </span>
              <span className="badge badge-cyan">
                Free Enrollment
              </span>
            </div>

            <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem', lineHeight: 1.25 }}>
              {course.title}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {course.description}
            </p>

            {/* Instructor & Rating Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div>
                Instructor: <strong style={{ color: '#fff' }}>{course.instructor}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: 600 }}>
                <Star size={16} fill="#fbbf24" stroke="none" />
                <span>{course.rating || '4.9'} ({course.reviews?.length || 12} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={16} />
                <span>{course.total_students || 0} enrolled students</span>
              </div>
            </div>
          </div>

          {/* Right Action Sidebar Box */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <img 
              src={course.thumbnail} 
              alt={course.title} 
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}
            />

            {isEnrolled ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span>Learning Progress</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>{progress}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '1.25rem' }}>
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>

                <button 
                  onClick={() => onOpenLearningRoom(course.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  <PlayCircle size={18} /> Continue Learning
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Free</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>100% Free Access</span>
                </div>

                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginBottom: '0.75rem' }}
                >
                  <Sparkles size={18} /> {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  ⚡ Instant access to all modules, notes & certificate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <button 
          className={`btn ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('curriculum')}
          style={{ borderRadius: '0', borderBottom: activeTab === 'curriculum' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <BookOpen size={16} /> Curriculum & Syllabus ({course.lessons?.length || 0})
        </button>
        <button 
          className={`btn ${activeTab === 'resources' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('resources')}
          style={{ borderRadius: '0', borderBottom: activeTab === 'resources' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <FolderGit2 size={16} /> Course Assets & Resources
        </button>
        <button 
          className={`btn ${activeTab === 'discussions' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('discussions')}
          style={{ borderRadius: '0', borderBottom: activeTab === 'discussions' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <MessageSquare size={16} /> Q&A Forum
        </button>
        <button 
          className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('reviews')}
          style={{ borderRadius: '0', borderBottom: activeTab === 'reviews' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <Star size={16} /> Student Reviews ({course.reviews?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'curriculum' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem' }}>Course Curriculum ({course.lessons?.length || 0} Modules)</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Total Duration: {course.duration}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {course.lessons && course.lessons.map((lesson, idx) => {
                const isExpanded = expandedLesson === idx;
                return (
                  <div 
                    key={lesson.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      onClick={() => setExpandedLesson(isExpanded ? -1 : idx)}
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <PlayCircle size={18} color="var(--accent-primary)" />
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
                          {lesson.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {lesson.duration}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        padding: '1rem 1.25rem',
                        borderTop: '1px solid var(--border-color)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}>
                        <p>{lesson.description || 'Hands-on breakdown and practical coding exercise for this concept.'}</p>
                        {isEnrolled && (
                          <button 
                            onClick={() => onOpenLearningRoom(course.id)}
                            className="btn btn-outline btn-sm"
                            style={{ marginTop: '0.75rem' }}
                          >
                            Launch This Lesson
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Info & Learning Outcomes */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>What You'll Learn</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Industry-standard software architecture patterns</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Hands-on coding exercises and project capstone</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Interview preparation & viva explanation points</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Verified Certificate of Completion upon finishing</span>
                </li>
              </ul>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Instructor Bio</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff' }}>{course.instructor}</strong> has over 10+ years of software engineering and academic experience mentoring thousands of engineers into tier-1 tech firms.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <CourseResources courseId={course.id} />
      )}

      {activeTab === 'discussions' && (
        <CourseDiscussions courseId={course.id} />
      )}

      {activeTab === 'reviews' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Student Reviews & Feedback</h2>
          {course.reviews && course.reviews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {course.reviews.map(r => (
                <div key={r.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img 
                        src={r.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                        alt={r.user_name}
                        style={{ width: 28, height: 28, borderRadius: '50%' }}
                      />
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.user_name}</span>
                    </div>
                    <div style={{ display: 'flex', color: '#fbbf24' }}>
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#fbbf24" stroke="none" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No written reviews submitted yet for this course.</p>
          )}
        </div>
      )}
    </div>
  );
}
