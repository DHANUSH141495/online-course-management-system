import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CertificateModal from '../components/CertificateModal';
import CourseDiscussions from '../components/CourseDiscussions';
import CourseResources from '../components/CourseResources';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Sparkles,
  Edit3,
  HelpCircle,
  Save,
  Check,
  Lock,
  GraduationCap,
  ListChecks,
  AlertCircle,
  FolderGit2,
  MessageSquare,
  Bot,
  Send
} from 'lucide-react';

export default function LearningRoom({ courseId, onBack, onOpenExam }) {
  const { user, authFetch, showToast } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  // In-Lesson Tabs: 'precontent' | 'notes' | 'mynotes' | 'quiz' | 'resources' | 'discussions' | 'ai-buddy'
  const [activeTab, setActiveTab] = useState('notes');
  const [personalNotes, setPersonalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedFeedback, setNotesSavedFeedback] = useState(false);

  // Quiz state
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // AI Study Assistant state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: '👋 Hi! I am your AI Study Buddy. Ask me any doubt about this lesson, request a code example, or ask for an exam tip!' }
  ]);
  const [aiThinking, setAiThinking] = useState(false);

  const fetchClassroom = async () => {
    setLoading(true);
    const { ok, data } = await authFetch(`/api/enrollments/courses/${courseId}/learn`);
    if (ok) {
      setCourse(data.course);
      setEnrollment(data.enrollment);
      setLessons(data.lessons || []);
      setProgressPercent(data.enrollment?.progress_percent || 0);
      setCompletedLessonIds(new Set(data.enrollment?.completed_lesson_ids || []));
    } else {
      showToast(data.message || 'Failed to access classroom.', 'error');
      onBack();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClassroom();
  }, [courseId]);

  const activeLesson = lessons[activeLessonIndex];
  const isCurrentCompleted = activeLesson ? completedLessonIds.has(activeLesson.id) : false;

  // Sequential learning lock helper: Lesson is unlocked if it's the first lesson OR previous lesson is completed
  const isLessonUnlocked = (index) => {
    if (index === 0) return true;
    const prevLesson = lessons[index - 1];
    return prevLesson ? completedLessonIds.has(prevLesson.id) : false;
  };

  // Load personal notes for active lesson
  useEffect(() => {
    if (activeLesson) {
      setQuizSelectedOption(null);
      setQuizSubmitted(false);
      const fetchNotes = async () => {
        const { ok, data } = await authFetch(`/api/enrollments/lessons/${activeLesson.id}/notes`);
        if (ok) {
          setPersonalNotes(data.note_text || '');
        }
      };
      fetchNotes();
    }
  }, [activeLesson?.id]);

  const handleSaveNotes = async () => {
    if (!activeLesson) return;
    setSavingNotes(true);
    const { ok } = await authFetch(`/api/enrollments/lessons/${activeLesson.id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note_text: personalNotes })
    });
    setSavingNotes(false);
    if (ok) {
      setNotesSavedFeedback(true);
      setTimeout(() => setNotesSavedFeedback(false), 2500);
      showToast('Personal study notes saved!', 'success');
    }
  };

  const handleToggleLesson = async (lessonId, lessonIndex) => {
    // Check sequential prerequisite if attempting to complete an ahead lesson
    if (lessonIndex > 0 && !isLessonUnlocked(lessonIndex)) {
      showToast(`🔒 Sequential learning lock: Please complete Module ${lessonIndex} before checking this lesson.`, 'error');
      return;
    }

    if (toggling) return;
    setToggling(true);

    const { ok, data } = await authFetch(`/api/enrollments/courses/${course.id}/lessons/${lessonId}/complete`, {
      method: 'POST'
    });

    setToggling(false);

    if (ok) {
      const nextSet = new Set(completedLessonIds);
      if (data.is_completed) {
        nextSet.add(lessonId);
      } else {
        nextSet.delete(lessonId);
      }

      setCompletedLessonIds(nextSet);
      setProgressPercent(data.progress_percent);

      if (data.progress_percent === 100 && !completedLessonIds.has(lessonId)) {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 }
        });
        showToast('🎉 Course completed 100%! The Final Certification Exam is now unlocked!', 'success');
      } else {
        showToast(data.message, 'info');
      }
    }
  };

  const openCertificate = () => {
    setCertificateData({
      studentName: user.name,
      courseTitle: course.title,
      instructor: course.instructor,
      completedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verificationId: `CRS-${course.id}${enrollment?.id || '1'}-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  // Mock quiz generator based on course & lesson
  const getQuizData = () => {
    if (course.title.toLowerCase().includes('java')) {
      return {
        question: 'Which component is responsible for compiling Java source code into bytecode (.class)?',
        options: ['Java Virtual Machine (JVM)', 'Java Compiler (javac)', 'Java Runtime Environment (JRE)', 'Just-In-Time Compiler (JIT)'],
        correctIndex: 1,
        explanation: '`javac` is the Java compiler that transforms human-readable .java source files into portable bytecode (.class files).'
      };
    } else if (course.title.toLowerCase().includes('react')) {
      return {
        question: 'Which React hook should be used to run side effects such as fetching data or setting up subscriptions?',
        options: ['useState', 'useMemo', 'useEffect', 'useCallback'],
        correctIndex: 2,
        explanation: '`useEffect` lets you synchronize a component with external systems, perform API calls, and clean up subscriptions.'
      };
    } else if (course.title.toLowerCase().includes('python')) {
      return {
        question: 'Which Pandas method is commonly used to load CSV data into a 2D DataFrame?',
        options: ['pd.read_csv()', 'pd.load_table()', 'pd.open_file()', 'pd.from_csv()'],
        correctIndex: 0,
        explanation: '`pandas.read_csv()` reads a comma-separated values (csv) file into a Pandas DataFrame.'
      };
    } else {
      return {
        question: 'What is the primary objective of Database Normalization (e.g. 1NF to 3NF)?',
        options: ['To duplicate records across tables', 'To eliminate data redundancy and insertion/deletion anomalies', 'To slow down query execution', 'To remove all primary keys'],
        correctIndex: 1,
        explanation: 'Normalization organizes columns and tables in a relational database to minimize data duplication and prevent anomalies.'
      };
    }
  };

  // AI Study Buddy Interactive handler
  const handleAskAi = (e) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiThinking) return;

    const userQ = aiQuestion.trim();
    setAiMessages(prev => [...prev, { role: 'user', text: userQ }]);
    setAiQuestion('');
    setAiThinking(true);

    setTimeout(() => {
      let aiAns = '';
      const lower = userQ.toLowerCase();

      if (lower.includes('exam') || lower.includes('pass') || lower.includes('certification')) {
        aiAns = `💡 **Exam Strategy Tip for ${course.title}**:\n- Review the core concepts in modules 1 through ${lessons.length}.\n- You need at least 60% score to pass.\n- Make sure your webcam is enabled and you remain on the tab during proctoring to prevent warnings!`;
      } else if (lower.includes('code') || lower.includes('example') || lower.includes('syntax')) {
        aiAns = `💻 **Quick Code Breakdown for ${activeLesson.title}**:\n\`\`\`javascript\n// Practice snippet related to this concept\nconst executeModule = async () => {\n  console.log("Mastering ${activeLesson.title}");\n  return { success: true, timestamp: Date.now() };\n};\n\`\`\`\nTry running this in your local console!`;
      } else if (lower.includes('explain') || lower.includes('what is') || lower.includes('how')) {
        aiAns = `🧠 **Concept Explanation**:\nRegarding "${userQ}":\nIn ${course.title}, this refers to how system components communicate efficiently while preserving encapsulation and scalability. Review the syllabus notes tab for step-by-step code demonstrations!`;
      } else {
        aiAns = `✨ Great question! In **${activeLesson.title}**, focusing on clean separation of concerns and understanding the lifecycle flow is essential. Let me know if you want a detailed code snippet or an interview practice question on this topic!`;
      }

      setAiMessages(prev => [...prev, { role: 'assistant', text: aiAns }]);
      setAiThinking(false);
    }, 900);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading course classroom...</p>
      </div>
    );
  }

  if (!course || !activeLesson) return null;

  const quiz = getQuizData();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: 'calc(100vh - 70px)' }}>
      {/* Top Classroom Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>{course.title}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor: {course.instructor}</span>
          </div>
        </div>

        {/* Progress & Certificate/Exam Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Course Progress: <strong style={{ color: 'var(--accent-emerald)' }}>{progressPercent}%</strong>
            </span>
            <div className="progress-bar-bg" style={{ width: '100px', height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {progressPercent === 100 ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onOpenExam(course.id)}
                className="btn btn-primary btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Award size={16} /> Take Certification Exam
              </button>
              <button
                onClick={openCertificate}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <GraduationCap size={16} /> View Certificate
              </button>
            </div>
          ) : (
            <button
              onClick={() => showToast(`Complete all modules to 100% to unlock the exam (${completedLessonIds.size}/${lessons.length} done).`, 'info')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.7 }}
            >
              <Lock size={14} /> Exam Locked ({progressPercent}%)
            </button>
          )}
        </div>
      </div>

      {/* Main Classroom Layout: Video & Content on Left, Sticky Sidebar on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 'calc(100vh - 130px)' }}>
        {/* Left Video & Content Player */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto' }}>
          {/* Responsive Embedded Video Container */}
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 Aspect Ratio
            height: 0,
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            background: '#000',
            boxShadow: 'var(--shadow-xl)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <iframe
              src={activeLesson.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
              title={activeLesson.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Lesson Title & Completion Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
                Module #{activeLesson.order_index || activeLessonIndex + 1}
              </span>
              <h1 style={{ fontSize: '1.6rem', color: '#fff' }}>{activeLesson.title}</h1>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration: {activeLesson.duration}</span>
            </div>

            <button
              onClick={() => handleToggleLesson(activeLesson.id, activeLessonIndex)}
              disabled={toggling}
              className={`btn ${isCurrentCompleted ? 'btn-secondary' : 'btn-primary'}`}
              style={{
                border: isCurrentCompleted ? '1px solid var(--accent-emerald)' : 'none',
                color: isCurrentCompleted ? '#6ee7b7' : '#fff'
              }}
            >
              {isCurrentCompleted ? (
                <>
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  Completed (Click to unmark)
                </>
              ) : (
                <>
                  <Circle size={18} />
                  Mark Lesson as Complete
                </>
              )}
            </button>
          </div>

          {/* Interactive Lesson Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '0.2rem'
          }}>
            <button
              onClick={() => setActiveTab('precontent')}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'precontent' ? '2px solid var(--accent-secondary)' : '2px solid transparent',
                color: activeTab === 'precontent' ? 'var(--accent-secondary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <ListChecks size={15} /> Prerequisites
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'notes' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === 'notes' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FileText size={15} /> Syllabus Notes
            </button>

            <button
              onClick={() => setActiveTab('mynotes')}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'mynotes' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: activeTab === 'mynotes' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Edit3 size={15} /> My Scratchpad
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'quiz' ? '2px solid var(--accent-amber)' : '2px solid transparent',
                color: activeTab === 'quiz' ? 'var(--accent-amber)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <HelpCircle size={15} /> Mini Quiz
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'resources' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
                color: activeTab === 'resources' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FolderGit2 size={15} /> Files & Code
            </button>

            <button
              onClick={() => setActiveTab('discussions')}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'discussions' ? '2px solid var(--accent-purple)' : '2px solid transparent',
                color: activeTab === 'discussions' ? 'var(--accent-purple)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <MessageSquare size={15} /> Q&A Forum
            </button>

            <button
              onClick={() => setActiveTab('ai-buddy')}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'ai-buddy' ? '2px solid #ec4899' : '2px solid transparent',
                color: activeTab === 'ai-buddy' ? '#ec4899' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Bot size={15} /> AI Study Buddy
            </button>
          </div>

          {/* Tab 0: Pre-Content & Prerequisites */}
          {activeTab === 'precontent' && (
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>
                <ListChecks size={18} />
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Course Prerequisites & Setup Orientation</h3>
              </div>

              <div style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '1rem' }}>
                  Welcome to <strong>{course.title}</strong>! Before beginning the core lessons, ensure you have completed the following setup requirements:
                </p>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <li><strong>Target Audience Level:</strong> {course.level}</li>
                  <li><strong>Total Estimated Duration:</strong> {course.duration}</li>
                  <li><strong>Required Environment:</strong> Modern Code Editor (VS Code / IntelliJ), Git, and Node.js / JDK / Python installed.</li>
                  <li><strong>Sequential Learning Policy:</strong> Lessons must be completed sequentially without skipping. Complete each module checklist to unlock subsequent modules.</li>
                  <li><strong>Certification Final Exam:</strong> Upon achieving 100% course completion, you will unlock the AI-proctored certification examination.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 1: Syllabus Notes */}
          {activeTab === 'notes' && (
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <div style={{
                fontSize: '0.925rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap'
              }}>
                {activeLesson.content_markdown || '# Lesson Overview\n\nFollow along with the video instruction above.'}
              </div>
            </div>
          )}

          {/* Tab 2: My Personal Study Scratchpad */}
          {activeTab === 'mynotes' && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Personal notes saved specifically for <strong>{activeLesson.title}</strong>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {notesSavedFeedback && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Check size={14} /> Saved
                    </span>
                  )}
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="btn btn-primary btn-sm"
                  >
                    <Save size={14} /> {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>

              <textarea
                className="form-textarea"
                rows={7}
                placeholder="Write your personal observations, key algorithm notes, interview tips, or code snippets here..."
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
              />
            </div>
          )}

          {/* Tab 3: Mini Quiz */}
          {activeTab === 'quiz' && (
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-amber">Concept Check</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Test your understanding</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                {quiz.question}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {quiz.options.map((opt, idx) => {
                  const isSelected = quizSelectedOption === idx;
                  const isCorrect = idx === quiz.correctIndex;
                  let bg = 'var(--bg-primary)';
                  let border = 'var(--border-color)';

                  if (quizSubmitted) {
                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = 'var(--accent-emerald)';
                    } else if (isSelected && !isCorrect) {
                      bg = 'rgba(244, 63, 94, 0.15)';
                      border = 'var(--accent-rose)';
                    }
                  } else if (isSelected) {
                    bg = 'rgba(99, 102, 241, 0.15)';
                    border = 'var(--accent-primary)';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !quizSubmitted && setQuizSelectedOption(idx)}
                      style={{
                        padding: '0.85rem 1.1rem',
                        borderRadius: 'var(--radius-md)',
                        background: bg,
                        border: `1px solid ${border}`,
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        fontSize: '0.9rem',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  disabled={quizSelectedOption === null}
                  onClick={() => setQuizSubmitted(true)}
                  className="btn btn-primary btn-sm"
                >
                  Submit Answer
                </button>
              ) : (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                    {quizSelectedOption === quiz.correctIndex ? (
                      <span style={{ color: 'var(--accent-emerald)' }}>✓ Correct! Well done.</span>
                    ) : (
                      <span style={{ color: 'var(--accent-rose)' }}>✗ Incorrect. Review explanation below:</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {quiz.explanation}
                  </p>
                  <button
                    onClick={() => { setQuizSubmitted(false); setQuizSelectedOption(null); }}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '0.75rem' }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Resources */}
          {activeTab === 'resources' && (
            <CourseResources courseId={course.id} />
          )}

          {/* Tab 5: Q&A Forum */}
          {activeTab === 'discussions' && (
            <CourseDiscussions courseId={course.id} currentLessonId={activeLesson.id} />
          )}

          {/* Tab 6: AI Study Buddy */}
          {activeTab === 'ai-buddy' && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Bot size={20} color="#ec4899" />
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>AI Study Buddy & Doubt Explainer</h3>
              </div>

              <div style={{
                maxHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1rem',
                paddingRight: '0.5rem'
              }}>
                {aiMessages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                ))}
                {aiThinking && (
                  <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    AI is analyzing your question...
                  </div>
                )}
              </div>

              <form onSubmit={handleAskAi} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text"
                  className="form-input"
                  placeholder={`Ask a question about ${activeLesson.title}...`}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={aiThinking}>
                  <Send size={16} /> Ask
                </button>
              </form>
            </div>
          )}

          {/* Bottom Next/Previous Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button
              disabled={activeLessonIndex === 0}
              onClick={() => setActiveLessonIndex(activeLessonIndex - 1)}
              className="btn btn-secondary"
            >
              <ChevronLeft size={16} /> Previous Lesson
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Lesson {activeLessonIndex + 1} of {lessons.length}
            </span>

            <button
              disabled={activeLessonIndex === lessons.length - 1}
              onClick={() => {
                const nextIdx = activeLessonIndex + 1;
                if (!isLessonUnlocked(nextIdx)) {
                  showToast(`🔒 Complete Module ${activeLessonIndex + 1} first before proceeding.`, 'error');
                  return;
                }
                setActiveLessonIndex(nextIdx);
              }}
              className="btn btn-primary"
            >
              Next Lesson <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Sidebar Checklist with Sequential Locking */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 130px)',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.25rem' }}>Course Modules</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {completedLessonIds.size} of {lessons.length} completed (Sequential Progression)
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessonIds.has(lesson.id);
              const isActive = activeLessonIndex === idx;
              const isUnlocked = isLessonUnlocked(idx);

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    if (!isUnlocked) {
                      showToast(`🔒 Module locked: Please complete Module ${idx} first.`, 'error');
                      return;
                    }
                    setActiveLessonIndex(idx);
                  }}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    opacity: isUnlocked ? 1 : 0.45,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLesson(lesson.id, idx);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        marginTop: '2px',
                        color: isCompleted ? 'var(--accent-emerald)' : 'var(--text-muted)'
                      }}
                      title={isCompleted ? 'Completed' : 'Mark as complete'}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  ) : (
                    <div style={{ marginTop: '2px', color: 'var(--text-muted)' }}>
                      <Lock size={16} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#fff' : isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                      lineHeight: 1.35,
                      marginBottom: '0.25rem'
                    }}>
                      {lesson.title}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {lesson.duration} {!isUnlocked && '(Locked)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {certificateData && (
        <CertificateModal
          certificate={certificateData}
          onClose={() => setCertificateData(null)}
        />
      )}
    </div>
  );
}
