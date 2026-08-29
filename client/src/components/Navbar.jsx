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
  Check, 
  ShieldCheck,
  History,
  KeyRound
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenVerifyModal, onOpenLoginHistory }) {
  const { user, logout, openAuthModal, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const themes = [
    { id: 'monochrome', name: 'Monochrome Dark (Eye Comfort)', color1: '#ffffff', color2: '#18181b', icon: '👁️' },
    { id: 'paper-white', name: 'Paper White (High Contrast)', color1: '#09090b', color2: '#f4f4f5', icon: '📄' },
    { id: 'oled-black', name: 'OLED Pure Black (Zero Glare)', color1: '#ffffff', color2: '#000000', icon: '🖤' },
    { id: 'eye-warm-sepia', name: 'Warm Sepia (Reading Care)', color1: '#e8cca8', color2: '#1c1916', icon: '☕' },
    { id: 'slate', name: 'Slate Minimalist (Graphite)', color1: '#f8fafc', color2: '#1e293b', icon: '🌫️' }
  ];

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('coursify_theme') || 'monochrome';
  });

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
      background: 'var(--bg-card)',
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
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px var(--accent-glow)'
          }}>
            <GraduationCap size={22} color="currentColor" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Cours<span style={{ color: 'var(--text-muted)' }}>ify</span>
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '0.15rem 0.4rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                letterSpacing: '0.05em'
              }}>B&W EDITION</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1 }}>
              Online Course Management System
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <button
            onClick={() => handleNavClick('catalog')}
            className={`btn ${activePage === 'catalog' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ 
              border: activePage === 'catalog' ? '1px solid var(--border-highlight)' : '1px solid transparent',
              background: activePage === 'catalog' ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
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
                border: activePage === 'student-dashboard' ? '1px solid var(--border-highlight)' : '1px solid transparent',
                background: activePage === 'student-dashboard' ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
              }}
            >
              <LayoutDashboard size={16} />
              My Learning
            </button>
          )}

          <button
            onClick={onOpenVerifyModal}
            className="btn btn-outline"
            style={{ 
              border: '1px solid var(--border-color)',
              background: 'transparent'
            }}
          >
            <ShieldCheck size={16} />
            Verify Certificate
          </button>

          {user && user.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className={`btn ${activePage === 'admin-dashboard' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ 
                border: activePage === 'admin-dashboard' ? '1px solid var(--border-highlight)' : '1px solid transparent',
                background: activePage === 'admin-dashboard' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                fontWeight: 700
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
                border: activePage === 'api-docs' ? '1px solid var(--border-highlight)' : '1px solid transparent',
                background: activePage === 'api-docs' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
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
                padding: '0.35rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem'
              }}
              title="Eye Comfort & Black/White Theme"
            >
              <Palette size={14} />
              <span className="desktop-nav-inline">Eye Comfort</span>
            </button>

            {themePickerOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '260px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 250,
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    👁️ Human Eye Comfort Themes
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
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        border: isSelected ? '1px solid var(--border-highlight)' : '1px solid transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '0.825rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        marginBottom: '3px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{t.icon}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: t.color1,
                            border: '1px solid rgba(255,255,255,0.3)'
                          }} />
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: t.color2,
                            border: '1px solid rgba(255,255,255,0.3)'
                          }} />
                          <span style={{ fontWeight: isSelected ? 700 : 400 }}>{t.name}</span>
                        </div>
                      </div>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick 1-Click Demo Login helpers */}
          {!user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button 
                onClick={() => demoLogin('student')}
                className="btn btn-outline btn-sm"
                title="Login with 1-click as student Dhanush"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              >
                <Sparkles size={13} />
                Demo Student
              </button>
              <button 
                onClick={() => demoLogin('admin')}
                className="btn btn-outline btn-sm"
                title="Login with 1-click as Admin"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              >
                <ShieldAlert size={13} />
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
                  width: '230px',
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
                    <LayoutDashboard size={15} /> My Learning & Profile
                  </button>

                  {user.role === 'admin' && (
                    <button 
                      onClick={() => handleNavClick('admin-dashboard')}
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.2rem', fontWeight: 700 }}
                    >
                      <ShieldAlert size={15} /> Admin Portal & Logs
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      if (user.role === 'admin') {
                        handleNavClick('admin-dashboard');
                      } else {
                        handleNavClick('student-dashboard');
                      }
                      if (onOpenLoginHistory) onOpenLoginHistory();
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.2rem' }}
                  >
                    <History size={15} /> Login & Security Logs
                  </button>

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
          <button 
            onClick={() => { setMobileMenuOpen(false); onOpenVerifyModal(); }}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start' }}
          >
            <ShieldCheck size={16} /> Verify Certificate
          </button>
          {user && user.role === 'admin' && (
            <button 
              onClick={() => handleNavClick('admin-dashboard')}
              className={`btn ${activePage === 'admin-dashboard' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', fontWeight: 700 }}
            >
              <ShieldAlert size={16} /> Admin Portal & Logs
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
