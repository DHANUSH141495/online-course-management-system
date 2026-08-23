import React from 'react';
import { Star, Users, Clock, BookOpen, CheckCircle, ArrowRight, Bookmark } from 'lucide-react';

export default function CourseCard({ course, onSelectCourse, onToggleBookmark }) {
  const isEnrolled = course.is_enrolled === 1 || course.is_enrolled === true;
  const progress = course.user_progress || 0;

  return (
    <div 
      className="card" 
      onClick={() => onSelectCourse(course.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%'
      }}
    >
      {/* Thumbnail Banner */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img 
          src={course.thumbnail} 
          alt={course.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(10, 13, 23, 0.9) 100%)'
        }} />

        {/* Category Badge & Bookmark Button */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {course.category_name && (
              <span className="badge badge-indigo">
                {course.category_name}
              </span>
            )}
            <span className={`badge ${
              course.level === 'Beginner' ? 'badge-emerald' : 
              course.level === 'Intermediate' ? 'badge-amber' : 'badge-purple'
            }`}>
              {course.level}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleBookmark) onToggleBookmark(course.id);
            }}
            style={{
              background: 'rgba(10, 13, 23, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: course.is_bookmarked ? 'var(--accent-rose)' : '#fff',
              transition: 'transform 0.15s ease'
            }}
            title={course.is_bookmarked ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Bookmark size={15} fill={course.is_bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Enrolled Status Overlay */}
        {isEnrolled && (
          <div style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '1rem',
            right: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#6ee7b7', marginBottom: '0.25rem' }}>
              <span>{progress === 100 ? '🎉 Completed' : 'In Progress'}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Course Details Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#fff', lineHeight: 1.35 }}>
          {course.title}
        </h3>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          By <strong style={{ color: 'var(--text-secondary)' }}>{course.instructor}</strong>
        </p>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.45,
          flex: 1
        }}>
          {course.description}
        </p>

        {/* Meta Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', fontWeight: 600 }}>
            <Star size={14} fill="#fbbf24" stroke="none" />
            <span>{course.rating || '4.9'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <BookOpen size={14} />
            <span>{course.total_lessons || 4} Lessons</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={14} />
            <span>{course.duration || '12h'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={14} />
            <span>{course.total_students || 0}</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className={`btn ${isEnrolled ? 'btn-primary' : 'btn-outline'}`}
          style={{ width: '100%', marginTop: '1rem', padding: '0.6rem' }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectCourse(course.id);
          }}
        >
          {isEnrolled ? (
            <>Continue Learning <ArrowRight size={15} /></>
          ) : (
            <>View Syllabus & Enroll <ArrowRight size={15} /></>
          )}
        </button>
      </div>
    </div>
  );
}
