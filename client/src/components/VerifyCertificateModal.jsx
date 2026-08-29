import React, { useState } from 'react';
import { ShieldCheck, Search, Award, CheckCircle2, AlertTriangle, X, Calendar, User, BookOpen, Sparkles, CheckCircle } from 'lucide-react';

export default function VerifyCertificateModal({ isOpen, onClose, initialCode = '' }) {
  const [code, setCode] = useState(initialCode || 'CERT-DHANUSH-11-8178');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e, customCode) => {
    if (e) e.preventDefault();
    const queryCode = customCode || code;
    if (!queryCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/enrollments/verify-certificate/${encodeURIComponent(queryCode.trim())}`);
      const data = await res.json();

      if (res.ok && (data.success || data.is_valid)) {
        setResult(data.certificate);
      } else {
        setError(data.message || 'Certificate verification failed. No authentic record found.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error while verifying certificate.');
    } finally {
      setLoading(false);
    }
  };

  const tryDemoCertificate = (sampleCode) => {
    setCode(sampleCode);
    handleVerify(null, sampleCode);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Official Certificate Verifier</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cryptographically validate student credentials & milestones</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1-Click Fast Demo Fill */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            ⚡ Sample Valid Certificates:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              type="button" 
              onClick={() => tryDemoCertificate('CERT-DHANUSH-11-8178')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <Sparkles size={12} /> CERT-DHANUSH-11-8178
            </button>
            <button 
              type="button" 
              onClick={() => tryDemoCertificate('CERT-DHANUSH-11-7895')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              CERT-DHANUSH-11-7895
            </button>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={(e) => handleVerify(e)} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input 
            type="text"
            className="form-input"
            placeholder="e.g. CERT-DHANUSH-11-8178"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ flex: 1, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            required
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <Search size={16} />
            {loading ? 'Verifying...' : 'Verify ID'}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '0.9rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fecdd3',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <AlertTriangle size={18} color="#fb7185" />
            <div>{error}</div>
          </div>
        )}

        {/* Verified Result Card */}
        {result && (
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-highlight)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <CheckCircle size={18} />
              <span>OFFICIALLY VERIFIED & AUTHENTIC CREDENTIAL</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Recipient Student</span>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <User size={16} />
                  {result.student_name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Course Completed</span>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <BookOpen size={16} />
                  {result.course_title}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Instructor & Level</span>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {result.instructor_name} ({result.course_level})
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Exam Score & Proctoring</span>
                <div style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: '700', marginTop: '0.2rem' }}>
                  {result.score_percent}% (Passed • Proctor: {result.proctor_status})
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Issued Date</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Calendar size={14} />
                  {new Date(result.issued_date || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Credential Token</span>
                <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>
                  {result.code}
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              <span>Issued by Coursify Certification Authority</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                STATUS: VALID & RECORDED
              </span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
