import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  Code, 
  LogOut, 
  User, 
  ShieldAlert, 
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Palette,
  Check
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, openAuthModal, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const themes = [
    { id: 'midnight', name: 'Midnight Cyber', color1: '#6366f1', color2: '#06b6d4', icon: '🌌' },
    { id: 'emerald', name: 'Matrix Emerald', color1: '#10b981', color2: '#34d399', icon: '🌲' },
    { id: 'amethyst', name: 'Cosmic Amethyst', color1: '#a855f7', color2: '#ec4899', icon: '🔮' },
    { id: 'ocean', name: 'Oceanic Sapphire', color1: '#0284c7', color2: '#38bdf8', icon: '🌊' },
    { id: 'sunset', name: 'Sunset Ember', color1: '#f43f5e', color2: '#fb923c', icon: '🌅' }
  ];

  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('coursify_theme') || 'midnight');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('coursify_theme', currentTheme);
  }, [currentTheme]);

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    setThemePickerOpen(false);
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 13, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('catalog')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
                Cours<span style={{ color: 'var(--accent-cyan)' }}>ify</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.15rem 0.4rem',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>PRO</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1 }}>
              Course Management System
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <button
            onClick={() => handleNavClick('catalog')}
            className={`btn ${activePage === 'catalog' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ 
              border: activePage === 'catalog' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activePage === 'catalog' ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
            }}
          >
            <BookOpen size={16} />
            Explore Courses
          </button>

          {user && (
            <button
              onClick={() => handleNavClick('student-dashboard')}
              className={`btn ${activePage === 'student-dashboard' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ 
                border: activePage === 'student-dashboard' ? '1px solid var(--accent-emerald)' : '1px solid transparent',
                background: activePage === 'student-dashboard' ? 'rgba(16, 185, 129, 0.12)' : 'transparent'
              }}
            >
              <LayoutDashboard size={16} />
              My Learning
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className={`btn ${activePage === 'admin-dashboard' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ 
                border: activePage === 'admin-dashboard' ? '1px solid var(--accent-rose)' : '1px solid transparent',
                background: activePage === 'admin-dashboard' ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
                color: '#fda4af'
              }}
            >
              <ShieldAlert size={16} />
              Admin Portal
            </button>
          )}

          {(!user || user.role === 'admin') && (
            <button
              onClick={() => handleNavClick('api-docs')}
              className={`btn ${activePage === 'api-docs' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ 
                border: activePage === 'api-docs' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                background: activePage === 'api-docs' ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
            >
              <Code size={16} />
              REST APIs
            </button>
          )}
        </nav>

        {/* Right Actions / Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setThemePickerOpen(!themePickerOpen)}
              className="btn btn-outline btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem'
              }}
              title="Change Theme Palette"
            >
              <Palette size={14} color="var(--accent-cyan)" />
              <span className="desktop-nav-inline">Theme</span>
            </button>

            {themePickerOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '210px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 250,
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Select Theme Palette
                  </span>
                </div>

                {themes.map((t) => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTheme(t.id)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        border: 'none',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontSize: '0.825rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        marginBottom: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{t.icon}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: t.color1
                          }} />
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: t.color2
                          }} />
                          <span style={{ fontWeight: isSelected ? 600 : 400 }}>{t.name}</span>
                        </div>
                      </div>
                      {isSelected && <Check size={14} color="var(--accent-emerald)" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick 1-Click Demo Login helpers for Viva/Grading */}
          {!user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button 
                onClick={() => demoLogin('student')}
                className="btn btn-outline btn-sm"
                title="Login with 1-click as student Dhanush"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              >
                <Sparkles size={13} color="var(--accent-emerald)" />
                Demo Student
              </button>
              <button 
                onClick={() => demoLogin('admin')}
                className="btn btn-outline btn-sm"
                title="Login with 1-click as Admin"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              >
                <ShieldAlert size={13} color="var(--accent-rose)" />
                Demo Admin
              </button>
            </div>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                  alt={user.name} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </div>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '220px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>

                  <button 
                    onClick={() => handleNavClick('student-dashboard')}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.2rem' }}
                  >
                    <LayoutDashboard size={15} /> My Learning
                  </button>

                  {user.role === 'admin' && (
                    <button 
                      onClick={() => handleNavClick('admin-dashboard')}
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.2rem', color: '#fda4af' }}
                    >
                      <ShieldAlert size={15} /> Admin Portal
                    </button>
                  )}

                  <button 
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', marginTop: '0.4rem' }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => openAuthModal('login')}
                className="btn btn-outline btn-sm"
              >
                Sign In
              </button>
              <button 
                onClick={() => openAuthModal('register')}
                className="btn btn-primary btn-sm"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-toggle"
            style={{ padding: '0.45rem' }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <button 
            onClick={() => handleNavClick('catalog')}
            className={`btn ${activePage === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <BookOpen size={16} /> Explore Courses
          </button>
          {user && (
            <button 
              onClick={() => handleNavClick('student-dashboard')}
              className={`btn ${activePage === 'student-dashboard' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <LayoutDashboard size={16} /> My Learning
            </button>
          )}
          {user && user.role === 'admin' && (
            <button 
              onClick={() => handleNavClick('admin-dashboard')}
              className={`btn ${activePage === 'admin-dashboard' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', color: '#fda4af' }}
            >
              <ShieldAlert size={16} /> Admin Portal
            </button>
          )}
          {(!user || user.role === 'admin') && (
            <button 
              onClick={() => handleNavClick('api-docs')}
              className={`btn ${activePage === 'api-docs' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <Code size={16} /> REST API Explorer
            </button>
          )}
        </div>
      )}

      {/* Inline styles for responsive visibility */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
