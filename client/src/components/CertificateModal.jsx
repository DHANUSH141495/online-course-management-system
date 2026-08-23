import React from 'react';
import { X, Award, CheckCircle, Printer, Download, Share2 } from 'lucide-react';

export default function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  const { studentName, courseTitle, completedAt, verificationId, instructor } = certificate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '750px',
          background: '#0e131f',
          padding: '2.5rem',
          border: '2px solid rgba(99, 102, 241, 0.4)'
        }}
      >
        {/* Close Button */}
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
          <X size={22} />
        </button>

        {/* Certificate Frame */}
        <div 
          id="certificate-print-area"
          style={{
            border: '8px double rgba(255, 255, 255, 0.15)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at center, rgba(30, 41, 69, 0.6) 0%, rgba(10, 13, 23, 0.95) 100%)',
            borderRadius: 'var(--radius-lg)',
            position: 'relative'
          }}
        >
          {/* Badge Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)'
          }}>
            <Award size={36} color="#ffffff" />
          </div>

          <p style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--accent-cyan)',
            marginBottom: '0.5rem'
          }}>
            Certificate of Completion
          </p>

          <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Coursify Learning Academy
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            This officially certifies that
          </p>

          <h1 style={{
            fontSize: '2.2rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            color: '#a5b4fc',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(99, 102, 241, 0.5)',
            textUnderlineOffset: '8px',
            marginBottom: '1.5rem'
          }}>
            {studentName || 'Dhanush'}
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            has successfully completed all required coursework, practical exercises, and modules for:
          </p>

          <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '2rem' }}>
            "{courseTitle}"
          </h3>

          {/* Footer of Certificate */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Instructor</p>
              <p style={{ color: '#fff' }}>{instructor || 'Prof. K. Venkatesh'}</p>
            </div>

            <div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Issued Date</p>
              <p style={{ color: '#fff' }}>{completedAt || new Date().toLocaleDateString()}</p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Verification ID</p>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                {verificationId || 'CRS-2026-8941'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
