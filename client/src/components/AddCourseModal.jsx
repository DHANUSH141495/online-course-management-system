import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpen, Layers, Clock, User, Image, Link, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddCourseModal({ categories, onClose, onCourseCreated, editingCourse = null }) {
  const { authFetch, showToast } = useAuth();

  const [title, setTitle] = useState(editingCourse ? editingCourse.title : '');
  const [description, setDescription] = useState(editingCourse ? editingCourse.description : '');
  const [instructor, setInstructor] = useState(editingCourse ? editingCourse.instructor : '');
  const [categoryId, setCategoryId] = useState(editingCourse ? editingCourse.category_id : (categories[0]?.id || 1));
  const [level, setLevel] = useState(editingCourse ? editingCourse.level : 'Beginner');
  const [duration, setDuration] = useState(editingCourse ? editingCourse.duration : '12 Hours');
  const [thumbnail, setThumbnail] = useState(
    editingCourse ? editingCourse.thumbnail : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
  );

  const [lessons, setLessons] = useState([
    { title: '1. Fundamentals & Architecture Overview', duration: '30 min', video_url: 'https://www.youtube.com/embed/eIrMbAQSU34', content_markdown: '# Lesson 1\n\nCore foundational principles.' },
    { title: '2. Hands-On Practical Implementation', duration: '45 min', video_url: 'https://www.youtube.com/embed/BSvkUk58K6U', content_markdown: '# Lesson 2\n\nBuilding code step by step.' }
  ]);

  const [loading, setLoading] = useState(false);

  const handleAddLesson = () => {
    setLessons([
      ...lessons,
      {
        title: `${lessons.length + 1}. Advanced Concepts & Project Work`,
        duration: '40 min',
        video_url: 'https://www.youtube.com/embed/31KTdfz55tE',
        content_markdown: '# Next Module\n\nDeep dive into real-world applications.'
      }
    ]);
  };

  const handleRemoveLesson = (index) => {
    if (lessons.length <= 1) {
      showToast('A course must have at least one lesson.', 'error');
      return;
    }
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleLessonChange = (index, field, value) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      instructor,
      category_id: parseInt(categoryId),
      level,
      duration,
      thumbnail,
      lessons
    };

    const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
    const method = editingCourse ? 'PUT' : 'POST';

    const { ok, data } = await authFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (ok) {
      showToast(editingCourse ? 'Course updated successfully!' : 'New course published!', 'success');
      onCourseCreated();
      onClose();
    } else {
      showToast(data.message || 'Failed to save course.', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
          {editingCourse ? 'Edit Course' : 'Create & Publish New Course'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Add course metadata, instructor information, and structured syllabus lessons.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Advanced Java & Microservices Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Instructor Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Jane Smith"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Duration</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 14 Hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Description *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Comprehensive summary of what students will learn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Syllabus Modules / Lessons */}
          {!editingCourse && (
            <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#fff', margin: 0 }}>
                  Curriculum / Lessons ({lessons.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Add Lesson
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {lessons.map((lesson, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', minWidth: '20px' }}>
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 2, padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                      placeholder="Lesson title"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(idx, 'title', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                      placeholder="Duration"
                      value={lesson.duration}
                      onChange={(e) => handleLessonChange(idx, 'duration', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(idx)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.45rem' }}
                      title="Remove lesson"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
