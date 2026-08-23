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
  SlidersHorizontal,
  GraduationCap,
  Layers
} from 'lucide-react';

export default function AdminDashboard({ onOpenCourse }) {
  const { user, authFetch, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'enrollments' | 'users'
  
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

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

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
          <ShieldAlert size={48} color="var(--accent-rose)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Admin Privileges Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            You need to be logged in as an administrator to access the admin portal.
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
            Manage courses, monitor student progress, and analyze enrollment analytics.
          </p>
        </div>

        <button 
          onClick={() => { setEditingCourse(null); setIsAddModalOpen(true); }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Create New Course
        </button>
      </div>

      {/* Metrics Stat Cards */}
      {stats && (
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
              <Users size={24} color="var(--accent-primary)" />
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
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} color="var(--accent-cyan)" />
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
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={24} color="var(--accent-amber)" />
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
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={24} color="var(--accent-emerald)" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG PROGRESS</span>
              <h3 style={{ fontSize: '1.75rem', color: '#fff' }}>{stats.averageProgress}%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'courses' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'courses' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
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
            borderBottom: activeTab === 'enrollments' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'enrollments' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
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
            borderBottom: activeTab === 'users' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'users' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          User Accounts ({usersList.length})
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
                        <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                          {course.category_name || 'General'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {course.instructor}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={`badge ${
                          course.level === 'Beginner' ? 'badge-emerald' : 
                          course.level === 'Intermediate' ? 'badge-amber' : 'badge-purple'
                        }`} style={{ fontSize: '0.7rem' }}>
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
                      <strong style={{ color: item.progress_percent === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)' }}>
                        {item.progress_percent}%
                      </strong>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${item.progress_percent}%` }} />
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${item.status === 'completed' ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '0.7rem' }}>
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

                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
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
