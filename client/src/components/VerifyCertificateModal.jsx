import React, { useState } from 'react';
import { ShieldCheck, Search, Award, CheckCircle2, AlertTriangle, X, Calendar, User, BookOpen, ExternalLink } from 'lucide-react';

export default function VerifyCertificateModal({ isOpen, onClose, initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/enrollments/verify-certificate/${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.certificate);
      } else {
        setError(data.message || 'Certificate verification failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error while verifying certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 640, width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Official Certificate Verifier</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cryptographically validate student credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text"
            className="form-input"
            placeholder="e.g. CERT-DHANUSH-11-8178"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            required
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <Search size={18} />
            {loading ? 'Verifying...' : 'Verify ID'}
          </button>
        </form>

        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            <AlertTriangle size={20} />
            <div>{error}</div>
          </div>
        )}

        {result && (
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 'bold', marginBottom: '1rem' }}>
              <CheckCircle2 size={20} />
              <span>OFFICIALLY VERIFIED & AUTHENTIC CREDENTIAL</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient Student</span>
                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <User size={16} color="var(--accent-primary)" />
                  {result.student_name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Course Completed</span>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <BookOpen size={16} color="var(--accent-primary)" />
                  {result.course_title}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Instructor & Level</span>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {result.instructor_name} ({result.course_level})
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exam Score & Status</span>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '600', marginTop: '0.2rem' }}>
                  {result.score_percent}% (Passed • Proctor: {result.proctor_status})
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issue Date</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Calendar size={14} />
                  {new Date(result.issued_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verification Token</span>
                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>
                  {result.code}
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <span>Authenticated by Coursify Certification Authority</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: '500' }}>Status: ACTIVE / NON-REVOKED</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
