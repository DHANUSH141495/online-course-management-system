import React from 'react';
import { GraduationCap, Github, Shield, Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer({ onNavigate, onOpenVerifyModal }) {
  return (
    <footer style={{
      marginTop: '5rem',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '3.5rem 0 2rem 0'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                Cours<span style={{ color: 'var(--accent-cyan)' }}>ify</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Enterprise-grade Online Course Management & E-Learning System built with React, Express, Relational SQLite, and JWT Role-Based Access Control.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
              <Sparkles size={13} /> Project 2 for Convergence
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><a href="#catalog" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}>Course Catalog</a></li>
              <li><a href="#mylearning" onClick={(e) => { e.preventDefault(); onNavigate('student-dashboard'); }}>Student Dashboard</a></li>
              <li>
                <a href="#verify" onClick={(e) => { e.preventDefault(); if (onOpenVerifyModal) onOpenVerifyModal(); }} style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} /> Official Certificate Verifier
                </a>
              </li>
              <li><a href="#admin" onClick={(e) => { e.preventDefault(); onNavigate('admin-dashboard'); }}>Admin Portal</a></li>
              <li><a href="#apis" onClick={(e) => { e.preventDefault(); onNavigate('api-docs'); }}>Interactive REST API Explorer</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem' }}>Technology Stack</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['React 18', 'Vite', 'Express.js', 'Better-SQLite3', 'JWT Auth', 'Bcrypt.js', 'Vanilla CSS Tokens', 'RESTful API', 'Canvas Confetti'].map((t) => (
                <span key={t} className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Demo Accounts */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem' }}>Demo Accounts</h4>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Student: </span>
                <code>dhanush@gmail.com</code> / <code>Student@123</code>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>Admin: </span>
                <code>admin@coursify.com</code> / <code>Admin@123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Coursify Course Management System. Author: Dhanush.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Relational SQL Schema v1.0</span>
            <span>•</span>
            <span>REST API v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
