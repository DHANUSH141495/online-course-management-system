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
  LayoutDashboard
} from 'lucide-react';

export default function StudentDashboard({ onOpenCourse, onOpenLearningRoom, onExploreCatalog }) {
  const { user, authFetch, openAuthModal } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [dashboardTab, setDashboardTab] = useState('enrolled'); // 'enrolled' | 'wishlist'
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
    const [enrollRes, bookRes] = await Promise.all([
      authFetch('/api/enrollments/my'),
      authFetch('/api/courses/my/bookmarks')
    ]);

    if (enrollRes.ok) {
      setEnrollments(enrollRes.data.enrollments);
      setStats(enrollRes.data.stats);
    }
    if (bookRes.ok) {
      setBookmarks(bookRes.data.courses || []);
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
            <span className="badge badge-emerald">Student Dashboard</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Continue your learning journey where you left off.
          </p>
        </div>

        <button onClick={onExploreCatalog} className="btn btn-outline">
          <BookOpen size={16} /> Browse More Courses
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
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} color="var(--accent-emerald)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLETED</span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.completedCourses}</h3>
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
            <Clock size={24} color="var(--accent-amber)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>IN PROGRESS</span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.inProgressCourses}</h3>
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
            <TrendingUp size={24} color="var(--accent-cyan)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG PROGRESS</span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.averageProgress}%</h3>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.75rem'
      }}>
        <button
          onClick={() => setDashboardTab('enrolled')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: dashboardTab === 'enrolled' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: dashboardTab === 'enrolled' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          My Enrolled Courses ({enrollments.length})
        </button>

        <button
          onClick={() => setDashboardTab('wishlist')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: dashboardTab === 'wishlist' ? '2px solid var(--accent-rose)' : '2px solid transparent',
            color: dashboardTab === 'wishlist' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Saved Wishlist ({bookmarks.length})
        </button>
      </div>

      {/* Enrolled Courses Section */}
      {dashboardTab === 'enrolled' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading your courses...</p>
          ) : enrollments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Enrolled Courses Yet</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                Explore our catalog of structured courses and start learning today with zero friction.
              </p>
              <button onClick={onExploreCatalog} className="btn btn-primary">
                Explore Course Catalog <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="grid-courses">
              {enrollments.map((item) => (
                <div 
                  key={item.enrollment_id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Image Banner */}
                  <div style={{ position: 'relative', height: '160px' }}>
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                      <span className={`badge ${item.status === 'completed' ? 'badge-emerald' : 'badge-indigo'}`}>
                        {item.status === 'completed' ? '✓ Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Instructor: {item.instructor}
                    </p>

                    {/* Progress bar */}
                    <div style={{ marginTop: 'auto', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        <span>{item.completed_lessons || 0} / {item.total_lessons || 0} Lessons Completed</span>
                        <span style={{ color: item.progress_percent === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)' }}>
                          {item.progress_percent}%
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${item.progress_percent}%` }} />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => onOpenLearningRoom(item.course_id)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <PlayCircle size={15} /> {item.progress_percent === 100 ? 'Review Course' : 'Resume'}
                      </button>

                      {item.progress_percent === 100 && (
                        <button
                          onClick={() => handleViewCertificate(item)}
                          className="btn btn-outline btn-sm"
                          style={{ border: '1px solid var(--accent-amber)', color: '#fcd34d' }}
                          title="View Certificate of Completion"
                        >
                          <Award size={15} /> Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wishlist Section */}
      {dashboardTab === 'wishlist' && (
        <div>
          {bookmarks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                Bookmark courses from the catalog to save them for future reference.
              </p>
              <button onClick={onExploreCatalog} className="btn btn-primary">
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid-courses">
              {bookmarks.map((course) => (
                <div 
                  key={course.id} 
                  className="card"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{course.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>By {course.instructor}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                      {course.description}
                    </p>
                    <button 
                      onClick={() => onOpenCourse(course.id)} 
                      className="btn btn-primary btn-sm"
                    >
                      View Syllabus & Enroll <ArrowRight size={15} />
                    </button>
                  </div>
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
