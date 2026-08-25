import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CertificateModal from '../components/CertificateModal';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  PlayCircle,
  Sparkles,
  Flame,
  LayoutDashboard,
  GraduationCap,
  Bookmark,
  Zap,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function StudentDashboard({ onOpenCourse, onOpenLearningRoom, onExploreCatalog, onOpenExam }) {
  const { user, authFetch, openAuthModal } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('enrolled'); // 'enrolled' | 'badges' | 'exams' | 'wishlist'
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState(null);

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const [enrollRes, bookRes, analRes] = await Promise.all([
      authFetch('/api/enrollments/my'),
      authFetch('/api/courses/my/bookmarks'),
      authFetch('/api/enrollments/my/analytics')
    ]);

    if (enrollRes.ok) {
      setEnrollments(enrollRes.data.enrollments || []);
      setStats(enrollRes.data.stats || {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageProgress: 0
      });
    }
    if (bookRes.ok) {
      setBookmarks(bookRes.data.courses || []);
    }
    if (analRes.ok) {
      setAnalytics(analRes.data.analytics || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }}>
          <LayoutDashboard size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Sign In to View Your Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Track your enrolled courses, monitor your learning progress, and claim completion certificates.
          </p>
          <button onClick={() => openAuthModal('login')} className="btn btn-primary">
            Sign In with Demo Account
          </button>
        </div>
      </div>
    );
  }

  const handleViewCertificate = (enrollment) => {
    setCertificateData({
      studentName: user.name,
      courseTitle: enrollment.title,
      instructor: enrollment.instructor,
      completedAt: new Date(enrollment.last_accessed_at || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verificationId: `CRS-${enrollment.course_id}${enrollment.enrollment_id}-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Award': return <Award size={24} color="#f59e0b" />;
      case 'CheckCircle2': return <CheckCircle2 size={24} color="#10b981" />;
      case 'Zap': return <Zap size={24} color="#ec4899" />;
      case 'BookOpen': return <BookOpen size={24} color="#3b82f6" />;
      default: return <Sparkles size={24} color="#8b5cf6" />;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Dashboard Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '2rem' }}>Welcome, {user.name}! 👋</h1>
            <span className="badge badge-emerald">Student Profile</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track learning streaks, completed milestones, and verified credentials.
          </p>
        </div>

        <button onClick={onExploreCatalog} className="btn btn-outline">
          <BookOpen size={16} /> Browse Course Catalog
        </button>
      </div>

      {/* Metrics Stats Cards */}
      <div className="grid-stats" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ENROLLED COURSES</span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.totalCourses}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={24} color="var(--accent-amber)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>LEARNING STREAK</span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{analytics?.currentStreakDays || 3} Days 🔥</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} color="var(--accent-emerald)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CERTIFICATES UNLOCKED</span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.completedCourses}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} color="var(--accent-cyan)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>STUDY TIME LOGGED</span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{analytics?.totalStudyHours || '6.5'} Hours</h3>
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
          className={`btn ${dashboardTab === 'enrolled' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setDashboardTab('enrolled')}
          style={{ borderRadius: '0', borderBottom: dashboardTab === 'enrolled' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <BookOpen size={16} /> My Enrolled Courses ({enrollments.length})
        </button>
        <button 
          className={`btn ${dashboardTab === 'badges' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setDashboardTab('badges')}
          style={{ borderRadius: '0', borderBottom: dashboardTab === 'badges' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <Sparkles size={16} /> Skill Badges & Achievements ({analytics?.achievements?.length || 0})
        </button>
        <button 
          className={`btn ${dashboardTab === 'exams' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setDashboardTab('exams')}
          style={{ borderRadius: '0', borderBottom: dashboardTab === 'exams' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <Award size={16} /> Exam & Certification Records ({analytics?.exams?.length || 0})
        </button>
        <button 
          className={`btn ${dashboardTab === 'wishlist' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setDashboardTab('wishlist')}
          style={{ borderRadius: '0', borderBottom: dashboardTab === 'wishlist' ? '2px solid var(--accent-primary)' : 'none' }}
        >
          <Bookmark size={16} /> Saved Wishlist ({bookmarks.length})
        </button>
      </div>

      {/* Tab 1: Enrolled Courses */}
      {dashboardTab === 'enrolled' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading enrolled courses...
            </div>
          ) : enrollments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <BookOpen size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>You Haven't Enrolled in Any Courses Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Explore our catalog of industry courses, enroll in seconds, and begin learning.
              </p>
              <button onClick={onExploreCatalog} className="btn btn-primary">
                Explore Course Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {enrollments.map((item) => (
                <div key={item.enrollment_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
                  <div>
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem'
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge badge-indigo">{item.category_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.duration}</span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Instructor: {item.instructor}
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                        <strong style={{ color: item.progress_percent === 100 ? 'var(--accent-emerald)' : '#fff' }}>
                          {item.progress_percent}% ({item.completed_lessons}/{item.total_lessons} lessons)
                        </strong>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '6px' }}>
                        <div className="progress-bar-fill" style={{ width: `${item.progress_percent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => onOpenLearningRoom(item.course_id)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <PlayCircle size={15} /> Continue Learning
                    </button>
                    {item.progress_percent === 100 && (
                      <button 
                        onClick={() => handleViewCertificate(item)}
                        className="btn btn-secondary btn-sm"
                        title="View Certificate"
                      >
                        <Award size={15} color="var(--accent-emerald)" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Skill Badges */}
      {dashboardTab === 'badges' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {analytics?.achievements && analytics.achievements.length > 0 ? (
              analytics.achievements.map((ach) => (
                <div key={ach.id} className="card" style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getBadgeIcon(ach.icon)}
                  </div>
                  <div>
                    <span className="badge badge-amber" style={{ fontSize: '0.7rem', marginBottom: '0.3rem' }}>
                      Unlocked Milestone
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
                      {ach.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Complete lessons to unlock verified skill badges.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Exam History */}
      {dashboardTab === 'exams' && (
        <div>
          {analytics?.exams && analytics.exams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.exams.map((exam) => (
                <div key={exam.id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{exam.course_title}</h4>
                      <span className={`badge ${exam.passed ? 'badge-emerald' : 'badge-rose'}`}>
                        {exam.passed ? 'PASSED' : 'NEEDS RETAKE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Score: <strong style={{ color: exam.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{exam.score_percent}%</strong> ({exam.correct_answers}/{exam.total_questions} correct) • Proctor Status: {exam.proctor_status}
                    </div>
                    {exam.certificate_code && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontFamily: 'monospace', marginTop: '0.3rem' }}>
                        Verification Code: {exam.certificate_code}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(exam.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Award size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>No final exam submissions yet. Complete 100% of any course syllabus to take the exam!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Saved Wishlist */}
      {dashboardTab === 'wishlist' && (
        <div>
          {bookmarks.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bookmark size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>Your wishlist is currently empty. Bookmark courses from the catalog to save them here!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {bookmarks.map((c) => (
                <div key={c.id} className="card" style={{ padding: '1.25rem' }}>
                  <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{c.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{c.instructor}</p>
                  <button onClick={() => onOpenCourse(c.id)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    View Details & Enroll
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {certificateData && (
        <CertificateModal
          certificate={certificateData}
          onClose={() => setCertificateData(null)}
        />
      )}
    </div>
  );
}
