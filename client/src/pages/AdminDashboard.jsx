import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddCourseModal from '../components/AddCourseModal';
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ExternalLink, 
  GraduationCap,
  History,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Monitor,
  Calendar,
  Lock,
  KeyRound
} from 'lucide-react';

export default function AdminDashboard({ onOpenCourse }) {
  const { user, authFetch, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'enrollments' | 'users' | 'login-logs'
  
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Login Logs State
  const [loginLogs, setLoginLogs] = useState([]);
  const [logStats, setLogStats] = useState(null);
  const [logSearch, setLogSearch] = useState('');
  const [logFilterRole, setLogFilterRole] = useState('all');
  const [logFilterStatus, setLogFilterStatus] = useState('all');
  const [logLoading, setLogLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes, catsRes, enrollRes, usersRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/courses'),
        authFetch('/api/courses/categories'),
        authFetch('/api/admin/enrollments'),
        authFetch('/api/admin/users')
      ]);

      if (statsRes.ok) setStats(statsRes.data.stats);
      if (coursesRes.ok) setCourses(coursesRes.data.courses);
      if (catsRes.ok) setCategories(catsRes.data.categories);
      if (enrollRes.ok) setEnrollments(enrollRes.data.enrollments);
      if (usersRes.ok) setUsersList(usersRes.data.users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginLogs = async () => {
    setLogLoading(true);
    try {
      const query = new URLSearchParams();
      if (logSearch.trim()) query.append('search', logSearch.trim());
      if (logFilterRole !== 'all') query.append('role', logFilterRole);
      if (logFilterStatus !== 'all') query.append('status', logFilterStatus);

      const res = await authFetch(`/api/admin/login-logs?${query.toString()}`);
      if (res.ok) {
        setLoginLogs(res.data.logs || []);
        setLogStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load login audit logs:', err);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchLoginLogs();
  }, []);

  useEffect(() => {
    if (activeTab === 'login-logs') {
      fetchLoginLogs();
    }
  }, [activeTab, logFilterRole, logFilterStatus]);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete the course "${courseTitle}"? This will also remove associated syllabus lessons and enrollments.`)) {
      return;
    }

    const { ok, data } = await authFetch(`/api/courses/${courseId}`, {
      method: 'DELETE'
    });

    if (ok) {
      showToast(data.message || 'Course deleted.', 'success');
      fetchAdminData();
    } else {
      showToast(data.message || 'Failed to delete course.', 'error');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Change role of user to "${newRole}"?`)) return;

    const { ok, data } = await authFetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole })
    });

    if (ok) {
      showToast(data.message, 'success');
      fetchAdminData();
    } else {
      showToast(data.message || 'Failed to update role.', 'error');
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all login activity records from the database?')) return;

    const { ok, data } = await authFetch('/api/admin/login-logs', {
      method: 'DELETE'
    });

    if (ok) {
      showToast(data.message || 'Login records cleared.', 'info');
      fetchLoginLogs();
    } else {
      showToast(data.message || 'Failed to clear records.', 'error');
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hrs ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const parseBrowser = (userAgent) => {
    if (!userAgent) return 'Browser / Client';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
    if (userAgent.includes('Python')) return 'API Script (Python)';
    if (userAgent.includes('Postman')) return 'Postman Client';
    return userAgent.slice(0, 30);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--text-primary)' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Admin Privileges Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            You need to be logged in as an administrator to access the admin portal and audit logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Top Admin Header */}
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
            <h1 style={{ fontSize: '2rem' }}>Administrator Portal 🛡️</h1>
            <span className="badge badge-purple">System Admin</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage courses, monitor student progress, and inspect live database login & security logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => { setEditingCourse(null); setIsAddModalOpen(true); }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Create New Course
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      {stats && (
        <div className="grid-stats" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL STUDENTS</span>
              <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.totalStudents}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL COURSES</span>
              <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.totalCourses}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL ENROLLMENTS</span>
              <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.totalEnrollments}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DB LOGIN LOGS</span>
              <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{logStats?.totalLogins || loginLogs.length}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'courses' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'courses' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'courses' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Course Management ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('enrollments')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'enrollments' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'enrollments' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'enrollments' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Student Progress Monitor ({enrollments.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'users' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          User Accounts ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('login-logs')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'login-logs' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'login-logs' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'login-logs' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <History size={16} />
          Login & Access Audit Logs ({loginLogs.length})
        </button>
      </div>

      {/* Tab 1: Course Management */}
      {activeTab === 'courses' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <input
                type="text"
                placeholder="Search courses..."
                className="form-input"
                style={{ paddingLeft: '2.5rem', padding: '0.55rem 0.75rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <button 
              onClick={() => { setEditingCourse(null); setIsAddModalOpen(true); }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} /> Add Course
            </button>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Course</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Instructor</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Level</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Students</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter((c) => !searchFilter || c.title.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((course) => (
                    <tr key={course.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <p style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{course.title}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.duration}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge" style={{ fontSize: '0.7rem' }}>
                          {course.category_name || 'General'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {course.instructor}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge" style={{ fontSize: '0.7rem' }}>
                          {course.level}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                        {course.total_students || 0}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => onOpenCourse(course.id)}
                            className="btn btn-secondary btn-sm"
                            title="Preview Course"
                          >
                            <ExternalLink size={14} />
                          </button>

                          <button
                            onClick={() => { setEditingCourse(course); setIsAddModalOpen(true); }}
                            className="btn btn-secondary btn-sm"
                            title="Edit Course"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            className="btn btn-danger btn-sm"
                            title="Delete Course"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Student Enrollment & Progress Monitor */}
      {activeTab === 'enrollments' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Enrolled Course</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Learning Progress</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Enrolled Date</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((item) => (
                <tr key={item.enrollment_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={item.student_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.student_name}`}
                        alt={item.student_name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, color: '#fff', margin: 0 }}>{item.student_name}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.student_email}</span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.course_title}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', minWidth: '180px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>{item.completed_lessons || 0} / {item.total_lessons || 0} Lessons</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {item.progress_percent}%
                      </strong>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${item.progress_percent}%` }} />
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge" style={{ fontSize: '0.7rem' }}>
                      {item.status === 'completed' ? '✓ Completed' : 'In Progress'}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(item.enrolled_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: User Accounts */}
      {activeTab === 'users' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>User</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Courses Enrolled</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Role Action</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                        alt={u.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      />
                      <span style={{ fontWeight: 600, color: '#fff' }}>{u.name}</span>
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-emerald'}`} style={{ fontSize: '0.7rem' }}>
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                    {u.enrolled_count || 0}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                    {u.completed_count || 0}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleRole(u.id, u.role)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Toggle to {u.role === 'admin' ? 'Student' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Login & Access Audit Logs (Stored in DB) */}
      {activeTab === 'login-logs' && (
        <div>
          {/* Summary Stats for Logins */}
          {logStats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL LOGINS</span>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{logStats.totalLogins}</h4>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SUCCESSFUL SIGN-INS</span>
                <h4 style={{ fontSize: '1.4rem', color: '#34d399', marginTop: '0.2rem' }}>{logStats.successfulLogins}</h4>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>FAILED ATTEMPTS</span>
                <h4 style={{ fontSize: '1.4rem', color: '#f87171', marginTop: '0.2rem' }}>{logStats.failedLogins}</h4>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE UNIQUE USERS</span>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{logStats.uniqueUsersCount}</h4>
              </div>
            </div>
          )}

          {/* Search & Filter Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="Search user, email, IP, browser..."
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', padding: '0.55rem 0.75rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchLoginLogs(); }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              <select 
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={logFilterRole}
                onChange={(e) => setLogFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Students Only</option>
                <option value="admin">Admins Only</option>
              </select>

              <select 
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={logFilterStatus}
                onChange={(e) => setLogFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="success">Success Only (✓)</option>
                <option value="failed">Failed Only (✕)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={fetchLoginLogs}
                disabled={logLoading}
                className="btn btn-secondary btn-sm"
                title="Refresh database logs"
              >
                <RotateCw size={14} className={logLoading ? 'spin' : ''} /> Refresh
              </button>

              <button 
                onClick={handleClearLogs}
                className="btn btn-danger btn-sm"
                title="Clear all login logs"
              >
                <Trash2 size={14} /> Clear History
              </button>
            </div>
          </div>

          {/* Database Records Table */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>User / Identity</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>IP Address</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Device / Browser</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Login Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No login audit records found matching the current criteria.
                    </td>
                  </tr>
                ) : (
                  loginLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={log.user_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${log.user_name || 'Guest'}`}
                            alt={log.user_name}
                            style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                          />
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                              {log.user_name || 'Anonymous User'}
                            </p>
                            <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '2px' }}>
                              {log.role || 'guest'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {log.email}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          <Globe size={13} color="var(--text-muted)" />
                          <span>{log.ip_address || '127.0.0.1'}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Monitor size={13} />
                          <span>{parseBrowser(log.user_agent)}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        {log.status === 'success' ? (
                          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle size={11} /> SUCCESS
                          </span>
                        ) : (
                          <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                            <AlertTriangle size={11} /> FAILED
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '0.85rem' }}>
                            {formatRelativeTime(log.login_at)}
                          </p>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            {new Date(log.login_at).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isAddModalOpen && (
        <AddCourseModal
          categories={categories}
          editingCourse={editingCourse}
          onClose={() => setIsAddModalOpen(false)}
          onCourseCreated={fetchAdminData}
        />
      )}
    </div>
  );
}
