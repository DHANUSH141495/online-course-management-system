import React, { useState, useEffect } from 'react';
import { Download, FileText, Code2, BookOpen, ExternalLink, FolderGit2, Check, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CourseResources({ courseId }) {
  const { showToast } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/resources`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResources(data.resources || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Resource link copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'code':
        return <Code2 size={20} color="var(--accent-primary)" />;
      case 'pdf':
        return <FileText size={20} color="var(--accent-rose)" />;
      case 'cheatsheet':
        return <BookOpen size={20} color="var(--accent-emerald)" />;
      default:
        return <FolderGit2 size={20} color="var(--accent-amber)" />;
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <FolderGit2 size={20} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Downloadable Resources & Code Repositories</h3>
        <span className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>
          {resources.length} Assets
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading course assets...
        </div>
      ) : resources.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          <FileText size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: '500' }}>No supplementary files attached for this course yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {resources.map((res) => (
            <div key={res.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, border-color 0.2s'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getIcon(res.type)}
                  </div>
                  <div>
                    <span className="badge badge-secondary" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      {res.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      {res.file_size}
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {res.title}
                </h4>
                {res.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
                    {res.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                  Access Resource
                </a>
                <button 
                  onClick={() => handleCopy(res.url, res.id)}
                  className="btn btn-secondary btn-sm"
                  title="Copy link"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  {copiedId === res.id ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
