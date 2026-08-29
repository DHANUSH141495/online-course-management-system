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
  Info,
  FolderGit2,
  MessageSquare,
  Award,
  KeyRound,
  History,
  ShieldAlert
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
      group: 'Authentication & Session',
      method: 'GET',
      path: '/api/auth/login-history',
      desc: 'Fetch current authenticated user personal sign-in & security history stored in DB.',
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
      auth: true,
      body: {
        courseId: 1
      }
    },
    {
      group: 'Course Catalog & Syllabus',
      method: 'GET',
      path: '/api/courses/my/bookmarks',
      desc: 'Get list of courses saved to current student wishlist.',
      auth: true
    },
    {
      group: 'Course Resources & Q&A Discussions',
      method: 'GET',
      path: '/api/courses/1/resources',
      desc: 'Fetch downloadable source code files, cheat sheets, and architecture diagrams.',
      auth: false
    },
    {
      group: 'Course Resources & Q&A Discussions',
      method: 'GET',
      path: '/api/courses/1/discussions',
      desc: 'Retrieve community Q&A discussion threads and answers.',
      auth: false
    },
    {
      group: 'Course Resources & Q&A Discussions',
      method: 'POST',
      path: '/api/courses/1/discussions',
      desc: 'Post a new doubt or question in the course discussion forum.',
      auth: true,
      body: {
        title: 'How does Spring Boot auto-configuration work internally?',
        content: 'Can someone explain the role of @EnableAutoConfiguration and Spring factories loader?'
      }
    },
    {
      group: 'Course Resources & Q&A Discussions',
      method: 'POST',
      path: '/api/courses/discussions/1/upvote',
      desc: 'Upvote a helpful question or answer in the forum.',
      auth: true,
      body: {}
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
      auth: true,
      body: {}
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
        note_text: 'JVM JIT Compiler compiles frequently executed bytecode to native machine code for faster runtime execution.'
      }
    },
    {
      group: 'Certification & Analytics',
      method: 'GET',
      path: '/api/enrollments/courses/1/exam',
      desc: 'Fetch final certification exam questions for a completed course.',
      auth: true
    },
    {
      group: 'Certification & Analytics',
      method: 'GET',
      path: '/api/enrollments/verify-certificate/CERT-DHANUSH-11-7895',
      desc: 'Public verification of student credentials and issuing authenticity.',
      auth: false
    },
    {
      group: 'Certification & Analytics',
      method: 'GET',
      path: '/api/enrollments/my/analytics',
      desc: 'Retrieve student learning streaks, study hours, notes count, and skill badges.',
      auth: true
    },
    {
      group: 'Admin Analytics & Management',
      method: 'GET',
      path: '/api/admin/login-logs',
      desc: 'Fetch full platform login & access audit records with metrics and filtering.',
      auth: true,
      role: 'admin'
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
      // Auto-attach auth token if endpoint requires auth and user is unauthenticated
      if (current.auth && !token) {
        await demoLogin(current.role === 'admin' ? 'admin' : 'student');
      }

      const options = {
        method: current.method
      };

      if (current.method === 'POST' || current.method === 'PUT') {
        if (editableBody && editableBody.trim()) {
          try {
            JSON.parse(editableBody); // test syntax
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
        } else {
          options.body = JSON.stringify({});
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
          <Code size={24} />
          <h1 style={{ fontSize: '2rem' }}>REST API Documentation & Explorer</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Test all {endpoints.length} endpoints in real-time with editable JSON payloads and inspect relational backend responses.
        </p>

        <div style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <KeyRound size={16} />
            <span>
              Current Session: {user ? (
                <strong style={{ color: 'var(--text-primary)' }}>Logged in as {user.name} ({user.role})</strong>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Unauthenticated (Guest)</span>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => demoLogin('student')} 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <Sparkles size={13} /> 1-Click Student Auth
            </button>
            <button 
              onClick={() => demoLogin('admin')} 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <ShieldAlert size={13} /> 1-Click Admin Auth
            </button>
          </div>
        </div>
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
                  onClick={() => setSelectedEndpoint(idx)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--text-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      background: ep.method === 'GET' ? 'rgba(255, 255, 255, 0.1)' : ep.method === 'POST' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-primary)'
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ep.group}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {ep.path}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Request / Response Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Endpoint Details Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)'
                }}>
                  {current.method}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {current.path}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {current.auth && (
                  <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ShieldCheck size={13} /> Bearer JWT Required
                  </span>
                )}
                {current.role && (
                  <span className="badge badge-purple">
                    Role: {current.role}
                  </span>
                )}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {current.desc}
            </p>

            {/* Request Body Editor (if POST / PUT) */}
            {(current.method === 'POST' || current.method === 'PUT') && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    JSON Request Payload:
                  </span>
                  {current.path === '/api/auth/register' && (
                    <button
                      onClick={generateFreshEmail}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', color: 'var(--text-primary)' }}
                    >
                      <RefreshCw size={12} /> Generate Unique Email
                    </button>
                  )}
                </div>
                <textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="form-textarea"
                  rows={current.body && Object.keys(current.body).length > 4 ? 8 : 5}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Headers: <code>Content-Type: application/json</code>
                {token && current.auth && (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-primary)' }}>
                    • Authorization: Bearer {token.slice(0, 12)}...
                  </span>
                )}
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={requestLoading}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                {requestLoading ? (
                  <RefreshCw size={16} className="spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>{requestLoading ? 'Executing...' : 'Execute API Call'}</span>
              </button>
            </div>
          </div>

          {/* Live Response Panel */}
          {apiResponse && (
            <div className="card" style={{ padding: '1.5rem', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    HTTP RESPONSE
                  </span>
                  <span className={`badge ${apiResponse.ok ? 'badge-emerald' : 'badge-rose'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                    Status: {apiResponse.status} {apiResponse.ok ? 'OK' : 'Error'}
                  </span>
                </div>

                <button
                  onClick={() => copySnippet(JSON.stringify(apiResponse.data, null, 2))}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre style={{
                background: 'var(--bg-primary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: apiResponse.ok ? '#a7f3d0' : '#fecdd3',
                lineHeight: 1.5,
                border: '1px solid var(--border-color)',
                maxHeight: '400px'
              }}>
                {JSON.stringify(apiResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
