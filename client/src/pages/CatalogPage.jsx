import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  Flame, 
  GraduationCap, 
  SlidersHorizontal, 
  Plus,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function CatalogPage({ onSelectCourse, onOpenAddCourse }) {
  const { user, authFetch, openAuthModal, showToast } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  // Fetch courses with current filters
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (sortBy) params.append('sort', sortBy);

      const token = localStorage.getItem('coursify_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/courses?${params.toString()}`, { headers });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/courses/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleToggleBookmark = async (courseId) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const { ok, data } = await authFetch(`/api/courses/${courseId}/bookmark`, {
      method: 'POST'
    });

    if (ok) {
      showToast(data.message, 'success');
      setCourses(courses.map(c => c.id === courseId ? { ...c, is_bookmarked: data.is_bookmarked ? 1 : 0 } : c));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, sortBy, user]);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '3.5rem 0 3rem 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            color: '#a5b4fc',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            Next-Gen E-Learning Platform
          </div>

          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1rem',
            letterSpacing: '-0.03em'
          }}>
            Master In-Demand Tech Skills with{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-primary) 50%, var(--accent-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Structured Learning
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            lineHeight: 1.5
          }}>
            Explore hands-on courses in Core Java, Spring Boot, React, Python AI, and Relational Database Systems. Enroll in seconds and track your real-time progress.
          </p>

          {/* Hero Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.4rem 0.6rem',
            boxShadow: 'var(--shadow-md), 0 0 25px rgba(99, 102, 241, 0.15)',
            maxWidth: '650px',
            margin: '0 auto'
          }}>
            <Search size={20} color="var(--text-muted)" style={{ marginLeft: '0.75rem' }} />
            <input
              type="text"
              placeholder="Search by course title, topic (e.g. Java, Python, SQL), or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="btn btn-outline btn-sm"
                style={{ border: 'none', color: 'var(--text-muted)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Catalog & Filter Controls Section */}
      <section className="container" style={{ marginTop: '1rem' }}>
        {/* Category Pills Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Categories ({courses.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`btn ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat.name} {cat.course_count > 0 && `(${cat.course_count})`}
            </button>
          ))}
        </div>

        {/* Secondary Filter & Sort Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '0.9rem 1.25rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <SlidersHorizontal size={16} />
              <span>Filters:</span>
            </div>

            {/* Level Selector */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="all">All Difficulty Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="popular">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{courses.length}</strong> courses
            </span>

            {user && user.role === 'admin' && (
              <button 
                onClick={onOpenAddCourse}
                className="btn btn-primary btn-sm"
              >
                <Plus size={15} /> Add New Course
              </button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }} />
            <p>Loading course catalog...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : courses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Courses Found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              We couldn't find any courses matching your current search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid-courses">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelectCourse={onSelectCourse}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
