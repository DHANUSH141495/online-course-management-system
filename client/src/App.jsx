import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AddCourseModal from './components/AddCourseModal';
import CatalogPage from './pages/CatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import LearningRoom from './pages/LearningRoom';
import AdminDashboard from './pages/AdminDashboard';
import ApiDocsPage from './pages/ApiDocsPage';
import { useAuth } from './context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const { toasts, user, authFetch } = useAuth();
  const [activePage, setActivePage] = useState('catalog'); // 'catalog' | 'course-detail' | 'student-dashboard' | 'learning-room' | 'admin-dashboard' | 'api-docs'
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isGlobalAddCourseOpen, setIsGlobalAddCourseOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories once for global modal usage
  React.useEffect(() => {
    fetch('/api/courses/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setActivePage('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLearningRoom = (courseId) => {
    setSelectedCourseId(courseId);
    setActivePage('learning-room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <Navbar activePage={activePage} setActivePage={handlePageChange} />

      {/* Main Content View Switcher */}
      <main style={{ flex: 1 }}>
        {activePage === 'catalog' && (
          <CatalogPage 
            onSelectCourse={handleSelectCourse}
            onOpenAddCourse={() => setIsGlobalAddCourseOpen(true)}
          />
        )}

        {activePage === 'course-detail' && selectedCourseId && (
          <CourseDetailPage 
            courseId={selectedCourseId}
            onBack={() => handlePageChange('catalog')}
            onOpenLearningRoom={handleOpenLearningRoom}
          />
        )}

        {activePage === 'student-dashboard' && (
          <StudentDashboard 
            onOpenCourse={handleSelectCourse}
            onOpenLearningRoom={handleOpenLearningRoom}
            onExploreCatalog={() => handlePageChange('catalog')}
          />
        )}

        {activePage === 'learning-room' && selectedCourseId && (
          <LearningRoom 
            courseId={selectedCourseId}
            onBack={() => handlePageChange(user?.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
          />
        )}

        {activePage === 'admin-dashboard' && (
          <AdminDashboard 
            onOpenCourse={handleSelectCourse}
          />
        )}

        {activePage === 'api-docs' && (
          <ApiDocsPage />
        )}
      </main>

      {/* Footer (hidden in dedicated full-screen learning room for distraction-free focus) */}
      {activePage !== 'learning-room' && (
        <Footer onNavigate={handlePageChange} />
      )}

      {/* Global Modals */}
      <AuthModal />

      {isGlobalAddCourseOpen && (
        <AddCourseModal 
          categories={categories}
          onClose={() => setIsGlobalAddCourseOpen(false)}
          onCourseCreated={() => {
            setIsGlobalAddCourseOpen(false);
            if (activePage === 'catalog') {
              window.location.reload();
            }
          }}
        />
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--accent-rose)" />}
            {toast.type === 'info' && <Info size={18} color="var(--accent-primary)" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
