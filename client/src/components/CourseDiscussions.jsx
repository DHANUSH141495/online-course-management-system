import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, User, CheckCircle2, Filter, CornerDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CourseDiscussions({ courseId, currentLessonId = null }) {
  const { user, authFetch, showToast, openAuthModal } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLesson, setFilterLesson] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchDiscussions = async () => {
    try {
      const url = filterLesson && currentLessonId 
        ? `/api/courses/${courseId}/discussions?lesson_id=${currentLessonId}` 
        : `/api/courses/${courseId}/discussions`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDiscussions(data.discussions || []);
      }
    } catch (err) {
      console.error('Fetch discussions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, currentLessonId, filterLesson]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!newContent.trim()) return;

    setSubmitting(true);
    const { ok, data } = await authFetch(`/api/courses/${courseId}/discussions`, {
      method: 'POST',
      body: JSON.stringify({
        lesson_id: currentLessonId || null,
        title: newTitle.trim() || 'Question regarding this topic',
        content: newContent.trim()
      })
    });

    if (ok) {
      showToast('Question posted to forum!', 'success');
      setNewTitle('');
      setNewContent('');
      fetchDiscussions();
    } else {
      showToast(data.message || 'Failed to post question', 'error');
    }
    setSubmitting(false);
  };

  const handlePostReply = async (parentId) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!replyContent.trim()) return;

    const { ok, data } = await authFetch(`/api/courses/${courseId}/discussions`, {
      method: 'POST',
      body: JSON.stringify({
        lesson_id: currentLessonId || null,
        parent_id: parentId,
        content: replyContent.trim()
      })
    });

    if (ok) {
      showToast('Reply submitted!', 'success');
      setReplyingToId(null);
      setReplyContent('');
      fetchDiscussions();
    } else {
      showToast(data.message || 'Failed to submit reply', 'error');
    }
  };

  const handleUpvote = async (id) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const { ok, data } = await authFetch(`/api/courses/discussions/${id}/upvote`, {
      method: 'POST'
    });

    if (ok) {
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, upvotes: data.upvotes } : d));
    }
  };

  // Group root discussions and nested replies
  const rootDiscussions = discussions.filter(d => !d.parent_id);
  const repliesByParent = {};
  discussions.filter(d => d.parent_id).forEach(reply => {
    if (!repliesByParent[reply.parent_id]) repliesByParent[reply.parent_id] = [];
    repliesByParent[reply.parent_id].push(reply);
  });

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Header controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Q&A & Discussion Forum</h3>
          <span className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>
            {discussions.length} Posts
          </span>
        </div>

        {currentLessonId && (
          <button 
            className={`btn btn-sm ${filterLesson ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterLesson(!filterLesson)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Filter size={14} />
            {filterLesson ? 'Showing: Current Module Only' : 'Show: Current Module Only'}
          </button>
        )}
      </div>

      {/* Ask Question Box */}
      <form onSubmit={handleCreatePost} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Ask a Question or Share a Doubt</h4>
        <input 
          type="text"
          className="form-input"
          placeholder="Summary title (e.g., Understanding JVM Bytecode vs Machine Code)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ marginBottom: '0.75rem' }}
        />
        <textarea 
          className="form-input"
          rows={3}
          placeholder="Describe your question or share code snippet..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          style={{ marginBottom: '0.75rem', resize: 'vertical' }}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Send size={16} />
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>

      {/* Discussions Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading community discussions...
        </div>
      ) : rootDiscussions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          <MessageSquare size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: '500' }}>No questions yet for this course.</p>
          <p style={{ fontSize: '0.85rem' }}>Be the first to post a doubt or topic for discussion!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rootDiscussions.map((d) => (
            <div key={d.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img 
                    src={d.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt={d.user_name}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{d.user_name}</span>
                    {d.user_role === 'admin' && (
                      <span className="badge badge-rose" style={{ marginLeft: '0.4rem', fontSize: '0.7rem' }}>Instructor</span>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(d.created_at).toLocaleDateString()} at {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleUpvote(d.id)}
                  className="btn btn-ghost"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.85rem',
                    color: d.upvotes > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                    background: d.upvotes > 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <ThumbsUp size={14} />
                  <span>{d.upvotes || 0}</span>
                </button>
              </div>

              {/* Title & Body */}
              {d.title && (
                <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {d.title}
                </h4>
              )}
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: '0.75rem' }}>
                {d.content}
              </p>

              {/* Reply toggle */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setReplyingToId(replyingToId === d.id ? null : d.id)}
                  style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem' }}
                >
                  Reply
                </button>
                {repliesByParent[d.id]?.length > 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    • {repliesByParent[d.id].length} answers
                  </span>
                )}
              </div>

              {/* Reply input form */}
              {replyingToId === d.id && (
                <div style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
                  <textarea 
                    className="form-input"
                    rows={2}
                    placeholder="Write an explanation or solution..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setReplyingToId(null); setReplyContent(''); }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handlePostReply(d.id)}
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies */}
              {repliesByParent[d.id] && repliesByParent[d.id].length > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  paddingLeft: '1.25rem',
                  borderLeft: '2px solid var(--accent-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {repliesByParent[d.id].map(reply => (
                    <div key={reply.id} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CornerDownRight size={14} color="var(--accent-primary)" />
                          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{reply.user_name}</span>
                          {reply.user_role === 'admin' && (
                            <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>Instructor</span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleUpvote(reply.id)}
                          className="btn btn-ghost"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.1rem 0.4rem',
                            fontSize: '0.75rem',
                            color: reply.upvotes > 0 ? 'var(--accent-primary)' : 'var(--text-muted)'
                          }}
                        >
                          <ThumbsUp size={12} />
                          <span>{reply.upvotes || 0}</span>
                        </button>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
