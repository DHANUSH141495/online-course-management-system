import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Code, 
  Send, 
  Database, 
  ShieldCheck, 
  Check, 
  Copy, 
  Terminal, 
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';

export default function ApiDocsPage() {
  const { user, token, authFetch, demoLogin, showToast } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [editableBody, setEditableBody] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      group: 'Authentication & Session',
      method: 'POST',
      path: '/api/auth/register',
      desc: 'Register a new student or admin account with validation.',
      auth: false,
      body: {
        name: 'Alex Turner',
        email: `student_${Math.floor(1000 + Math.random() * 9000)}@coursify.com`,
        password: 'Student@123',
        role: 'student'
      }
    },
    {
      group: 'Authentication & Session',
      method: 'POST',
      path: '/api/auth/login',
      desc: 'Authenticate user credentials and receive a signed JWT token.',
      auth: false,
      body: {
        email: 'dhanush@gmail.com',
        password: 'Student@123'
      }
    },
    {
      group: 'Authentication & Session',
      method: 'GET',
      path: '/api/auth/me',
      desc: 'Retrieve currently authenticated user profile from token.',
      auth: true
    },
    {
      group: 'Course Catalog & Syllabus',
      method: 'GET',
      path: '/api/courses?search=Java&category=all&level=all',
      desc: 'Query courses with optional full-text search, filtering, and sorting.',
      auth: false
    },
    {
      group: 'Course Catalog & Syllabus',
      method: 'GET',
      path: '/api/courses/categories',
      desc: 'Fetch list of all course categories with active course counts.',
      auth: false
    },
    {
      group: 'Course Catalog & Syllabus',
      method: 'GET',
      path: '/api/courses/1',
      desc: 'Fetch comprehensive course details, syllabus modules, and reviews.',
      auth: false
    },
    {
      group: 'Course Catalog & Syllabus',
      method: 'POST',
      path: '/api/courses/1/bookmark',
      desc: 'Toggle bookmark/wishlist status for a course.',
      auth: true
    },
    {
      group: 'Course Catalog & Syllabus',
      method: 'GET',
      path: '/api/courses/my/bookmarks',
      desc: 'Get list of courses saved to current student wishlist.',
      auth: true
    },
    {
      group: 'Course Catalog & Syllabus',
      method: 'POST',
      path: '/api/courses',
      desc: 'Create and publish a new course with syllabus modules (Admin only).',
      auth: true,
      role: 'admin',
      body: {
        title: 'Microservices with Spring Boot & Docker',
        description: 'Design distributed resilient systems using Java Spring Boot.',
        instructor: 'Dr. Michael Chen',
        category_id: 1,
        level: 'Advanced',
        duration: '16 Hours',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
      }
    },
    {
      group: 'Enrollment & Progress Tracking',
      method: 'POST',
      path: '/api/enrollments',
      desc: 'Enroll student in a course and initialize progress tracking.',
      auth: true,
      body: {
        courseId: 1
      }
    },
    {
      group: 'Enrollment & Progress Tracking',
      method: 'GET',
      path: '/api/enrollments/my',
      desc: 'Retrieve student enrolled courses, completion statuses, and progress %.',
      auth: true
    },
    {
      group: 'Enrollment & Progress Tracking',
      method: 'GET',
      path: '/api/enrollments/courses/1/learn',
      desc: 'Fetch classroom view, video players, and completed lesson IDs.',
      auth: true
    },
    {
      group: 'Enrollment & Progress Tracking',
      method: 'POST',
      path: '/api/enrollments/courses/1/lessons/1/complete',
      desc: 'Toggle lesson completion and trigger automatic % recalculation.',
      auth: true
    },
    {
      group: 'Enrollment & Progress Tracking',
      method: 'GET',
      path: '/api/enrollments/lessons/1/notes',
      desc: 'Fetch student private study notes for a specific lesson.',
      auth: true
    },
    {
      group: 'Enrollment & Progress Tracking',
      method: 'POST',
      path: '/api/enrollments/lessons/1/notes',
      desc: 'Save student personal study scratchpad notes for a lesson.',
      auth: true,
      body: {
        note_text: 'JVM JIT Compiler compiles frequently executed bytecode to native machine code.'
      }
    },
    {
      group: 'Admin Analytics & Management',
      method: 'GET',
      path: '/api/admin/stats',
      desc: 'Aggregate system statistics (students, courses, completions).',
      auth: true,
      role: 'admin'
    },
    {
      group: 'Admin Analytics & Management',
      method: 'GET',
      path: '/api/admin/enrollments',
      desc: 'Retrieve comprehensive student progress log across all courses.',
      auth: true,
      role: 'admin'
    },
    {
      group: 'Admin Analytics & Management',
      method: 'GET',
      path: '/api/admin/users',
      desc: 'List all registered user accounts with roles.',
      auth: true,
      role: 'admin'
    }
  ];

  const current = endpoints[selectedEndpoint];

  useEffect(() => {
    if (current.body) {
      setEditableBody(JSON.stringify(current.body, null, 2));
    } else {
      setEditableBody('');
    }
    setApiResponse(null);
  }, [selectedEndpoint]);

  const generateFreshEmail = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const freshBody = {
      name: `Student User ${randomNum}`,
      email: `student_${randomNum}@coursify.com`,
      password: 'Student@123',
      role: 'student'
    };
    setEditableBody(JSON.stringify(freshBody, null, 2));
  };

  const handleExecuteRequest = async () => {
    setRequestLoading(true);
    setApiResponse(null);

    try {
      const options = {
        method: current.method
      };

      if (editableBody && (current.method === 'POST' || current.method === 'PUT')) {
        try {
          options.body = editableBody;
        } catch (e) {
          setApiResponse({
            status: 400,
            ok: false,
            data: { message: 'Invalid JSON body syntax in editor.' }
          });
          setRequestLoading(false);
          return;
        }
      }

      const { ok, status, data } = await authFetch(current.path, options);
      setApiResponse({ status, ok, data });
    } catch (err) {
      setApiResponse({ status: 500, ok: false, data: { error: err.message } });
    } finally {
      setRequestLoading(false);
    }
  };

  const copySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Code size={24} color="var(--accent-cyan)" />
          <h1 style={{ fontSize: '2rem' }}>REST API Documentation & Explorer</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Test all endpoints in real-time with editable JSON payloads and inspect relational backend responses.
        </p>

        {!user && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem',
            color: '#c7d2fe'
          }}>
            <Info size={16} color="var(--accent-primary)" />
            <span>
              Tip: Click <strong>"⚡ Demo Student"</strong> or <strong>"⚡ Demo Admin"</strong> in the top navbar to automatically attach Bearer JWT tokens to authenticated requests.
            </span>
          </div>
        )}
      </div>

      {/* Explorer Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        {/* Endpoint List Sidebar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              API Endpoints ({endpoints.length})
            </span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {endpoints.map((ep, idx) => {
              const isSelected = selectedEndpoint === idx;
              return (
                <div
                  key={idx}
                  onClick={() => { setSelectedEndpoint(idx); }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      background: ep.method === 'GET' ? 'rgba(16, 185, 129, 0.2)' : ep.method === 'POST' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: ep.method === 'GET' ? '#6ee7b7' : ep.method === 'POST' ? '#a5b4fc' : '#fcd34d'
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: isSelected ? '#fff' : 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {ep.path.split('?')[0]}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ep.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Endpoint Runner & Response Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card for Current Endpoint */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: current.method === 'GET' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: current.method === 'GET' ? '#6ee7b7' : '#a5b4fc'
                  }}>
                    {current.method}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>
                    {current.path}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{current.desc}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {current.role === 'admin' && user?.role !== 'admin' && (
                  <button
                    onClick={async () => {
                      await demoLogin('admin');
                      showToast('Switched to Demo Admin account! You can now execute Admin endpoints.', 'success');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ border: '1px solid var(--accent-amber)', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    title="Logs in as admin@coursify.com to grant required admin privileges"
                  >
                    ⚡ Switch to Demo Admin
                  </button>
                )}

                <button
                  onClick={handleExecuteRequest}
                  disabled={requestLoading}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <Send size={15} /> {requestLoading ? 'Sending...' : 'Test Request'}
                </button>
              </div>
            </div>

            {/* Role Warning for Admin Endpoints */}
            {current.role === 'admin' && user?.role !== 'admin' && (
              <div style={{
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '0.8rem',
                color: '#fde68a',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <ShieldCheck size={14} color="var(--accent-amber)" />
                <span>
                  <strong>Role-Based Access Control (RBAC):</strong> This endpoint requires <code>role: admin</code>. If tested as a student, the server will return <code>403 Forbidden</code>. Click <strong>"⚡ Switch to Demo Admin"</strong> above to test with admin rights.
                </span>
              </div>
            )}

            {/* Auth & Headers Meta */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <span>
                Auth Required: <strong>{current.auth ? (current.role ? `Yes (${current.role} role)` : 'Yes (JWT Bearer)') : 'No (Public)'}</strong>
              </span>
              <span>•</span>
              <span>Logged-in User: <strong>{user ? `${user.name} (${user.role})` : 'None (Unauthenticated)'}</strong></span>
              <span>•</span>
              <span>Content-Type: <code>application/json</code></span>
            </div>
          </div>

          {/* Request Payload Editor (if applicable) */}
          {current.body && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Editable Request JSON Body</span>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {current.path === '/api/auth/register' && (
                    <button
                      onClick={generateFreshEmail}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      <RefreshCw size={12} /> New Test User
                    </button>
                  )}
                  <button
                    onClick={() => copySnippet(editableBody)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />} Copy JSON
                  </button>
                </div>
              </div>

              <textarea
                className="form-textarea"
                rows={7}
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: '#a5b4fc',
                  background: 'var(--bg-primary)'
                }}
              />
            </div>
          )}

          {/* Live Response Viewer */}
          <div className="card" style={{ padding: '1.25rem', minHeight: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Terminal size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Live Server Response</span>
              </div>

              {apiResponse && (
                <span className={`badge ${apiResponse.ok ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.75rem' }}>
                  HTTP {apiResponse.status} {apiResponse.ok ? 'OK' : 'Response'}
                </span>
              )}
            </div>

            {requestLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Executing HTTP request against Express backend...
              </div>
            ) : apiResponse ? (
              <pre style={{
                background: 'var(--bg-primary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: apiResponse.ok ? '#86efac' : '#fca5a5',
                overflowX: 'auto',
                maxHeight: '400px'
              }}>
                {JSON.stringify(apiResponse.data, null, 2)}
              </pre>
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Click <strong>"Test Request"</strong> above to send a live HTTP request to the Express server.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
