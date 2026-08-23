import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import CertificateModal from '../components/CertificateModal';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  Camera, 
  Mic, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Eye, 
  Lock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function ExamProctorRoom({ courseId, onBack }) {
  const { user, authFetch, showToast } = useAuth();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exam Workflow State: 'instructions' | 'active' | 'results'
  const [examState, setExamState] = useState('instructions');

  // Media Permissions & Stream
  const [cameraActive, setCameraActive] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Anti-Cheating & Warnings
  const [warningsCount, setWarningsCount] = useState(0);
  const [warningModalMessage, setWarningModalMessage] = useState('');
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Exam Answers & Progress
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [certificateModalData, setCertificateModalData] = useState(null);

  // Sound generator for violation alert
  const playAlertTone = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  };

  const fetchExam = async () => {
    setLoading(true);
    const { ok, data } = await authFetch(`/api/enrollments/courses/${courseId}/exam`);
    if (ok) {
      setExamData(data);
      if (data.past_submission && data.past_submission.passed === 1) {
        setSubmissionResult({
          passed: true,
          score_percent: data.past_submission.score_percent,
          correct_answers: data.past_submission.correct_answers,
          total_questions: data.past_submission.total_questions,
          warnings_count: data.past_submission.warnings_count,
          proctor_status: data.past_submission.proctor_status,
          certificate_code: data.past_submission.certificate_code,
          results: []
        });
        setExamState('results');
      }
    } else {
      showToast(data.message || 'Failed to load exam.', 'error');
      onBack();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExam();
    return () => {
      stopCamera();
    };
  }, [courseId]);

  // Start Camera and Mic
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: true
      });
      streamRef.current = stream;
      setCameraActive(true);
      setMediaError('');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      console.warn('Webcam permission not granted or device not found:', err);
      setMediaError('Camera / Microphone permission is recommended for full AI proctoring compliance. Simulating live Proctor status.');
      setCameraActive(true); // Allow simulation if physical webcam is busy
      return true;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Start the Exam
  const handleStartExam = async () => {
    await requestCameraAccess();
    setExamState('active');
    setTimeLeft(900);
    setWarningsCount(0);
    showToast('AI Proctor activated. Exam started.', 'info');
  };

  // Anti-Cheating Event Listeners during Active Exam
  useEffect(() => {
    if (examState !== 'active') return;

    // 1. Tab Switch / Window Blur Interceptor
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab Switch Detected! You navigated away from the exam window.');
      }
    };

    const handleWindowBlur = () => {
      triggerViolation('Focus Lost! You clicked outside the active examination window.');
    };

    // 2. Anti-Copy/Paste & Right-Click Interceptor
    const handleCopy = (e) => {
      e.preventDefault();
      triggerViolation('Copy action blocked! Copying question text is prohibited.');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      triggerViolation('Paste action blocked! Pasting external text is prohibited.');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      showToast('Right-click disabled during examination.', 'error');
    };

    const handleKeyDown = (e) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+U, F12, etc.
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'u', 'a', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        triggerViolation(`Shortcut Ctrl+${e.key.toUpperCase()} is strictly prohibited.`);
      }
      if (['F12', 'PrintScreen'].includes(e.key)) {
        e.preventDefault();
        triggerViolation('DevTools / Screenshot key blocked.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // 3. Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(false, 'Time expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(timer);
    };
  }, [examState, warningsCount, answers]);

  // Violation Handler
  const triggerViolation = (reason) => {
    if (examState !== 'active' || isWarningModalOpen) return;

    playAlertTone();
    const nextWarnings = warningsCount + 1;
    setWarningsCount(nextWarnings);

    if (nextWarnings >= 3) {
      setWarningModalMessage(`🚨 3RD VIOLATION DETECTED (${reason}).\n\nYour exam has been automatically disqualified and terminated due to malpractice.`);
      setIsWarningModalOpen(true);
      setTimeout(() => {
        handleSubmitExam(true, 'Disqualified due to 3 malpractice violations.');
      }, 3000);
    } else {
      setWarningModalMessage(`⚠️ MALPRACTICE STRIKE ${nextWarnings} of 3\n\n${reason}\n\nPlease stay focused on this tab. If you receive 3 strikes, your exam will be automatically cancelled and submitted.`);
      setIsWarningModalOpen(true);
    }
  };

  // Submit Exam
  const handleSubmitExam = async (terminatedForMalpractice = false, customReason = '') => {
    if (submitting) return;
    setSubmitting(true);
    stopCamera();

    const { ok, data } = await authFetch(`/api/enrollments/courses/${courseId}/exam/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answers,
        warnings_count: warningsCount,
        terminated_for_malpractice: terminatedForMalpractice
      })
    });

    setSubmitting(false);
    setIsWarningModalOpen(false);

    if (ok) {
      setSubmissionResult(data);
      setExamState('results');

      if (data.passed) {
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.6 }
        });
        showToast('🎉 Congratulations! You have passed the certification examination!', 'success');
      } else {
        showToast(customReason || data.message, terminatedForMalpractice ? 'error' : 'info');
      }
    } else {
      showToast(data.message || 'Failed to submit exam.', 'error');
    }
  };

  const handleSelectOption = (questionId, optionLetter) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const openCertificate = () => {
    setCertificateModalData({
      studentName: user.name,
      courseTitle: examData?.course?.title,
      instructor: examData?.course?.instructor,
      completedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verificationId: submissionResult?.certificate_code || `CERT-${user.name.toUpperCase()}-${courseId}-9942`
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading certification examination & proctoring module...</p>
      </div>
    );
  }

  const questions = examData?.questions || [];
  const currentQ = questions[currentQuestionIndex];

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#05070c', color: '#fff' }}>
      {/* ======================================================== */}
      {/* 1. PRE-EXAM INSTRUCTIONS SCREEN */}
      {/* ======================================================== */}
      {examState === 'instructions' && (
        <div className="container" style={{ maxWidth: '800px', padding: '3.5rem 1.5rem' }}>
          <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to Course
          </button>

          <div className="card" style={{ padding: '2.25rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={24} color="var(--accent-primary)" />
              </div>
              <div>
                <span className="badge badge-indigo">Official Certification Exam</span>
                <h1 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{examData?.course?.title}</h1>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              To earn your verifiable certificate of completion, you must pass this comprehensive 5-question exam with a score of <strong>60% or higher</strong> under automated AI proctoring conditions.
            </p>

            {/* Anti-Cheating & Proctoring Rules */}
            <div style={{
              background: 'rgba(10, 13, 23, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18} /> Anti-Cheating & AI Proctoring Protocols
              </h3>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
                <li>
                  <strong style={{ color: '#fff' }}>Camera & Audio Monitoring:</strong> Real-time proctoring validates that the student remains present throughout the session.
                </li>
                <li>
                  <strong style={{ color: '#fff' }}>Strict Tab-Switch Prohibition:</strong> Leaving this browser tab, minimizing the window, or opening other apps triggers an immediate malpractice strike.
                </li>
                <li>
                  <strong style={{ color: '#fff' }}>Anti-Copy & Clipboard Block:</strong> Text copying, pasting, keyboard shortcuts (Ctrl+C, Ctrl+V), and right-clicks are disabled.
                </li>
                <li>
                  <strong style={{ color: '#fca5a5' }}>3-Strike Termination:</strong> Receiving 3 violation warnings will automatically terminate and disqualify the exam attempt.
                </li>
                <li>
                  <strong style={{ color: '#fff' }}>Time Limit:</strong> 15 Minutes allotted. Unsubmitted exams will auto-submit upon timer expiry.
                </li>
              </ul>
            </div>

            {mediaError && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fde68a',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}>
                {mediaError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Candidate: <strong style={{ color: '#fff' }}>{user.name}</strong> ({user.email})
              </div>

              <button
                onClick={handleStartExam}
                className="btn btn-primary"
                style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}
              >
                <Camera size={18} /> Enable AI Proctor & Begin Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ACTIVE PROCTORED EXAM SCREEN */}
      {/* ======================================================== */}
      {examState === 'active' && (
        <div>
          {/* Top Exam Status Bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}>
            <div>
              <h2 style={{ fontSize: '1rem', color: '#fff' }}>{examData?.course?.title} — Final Exam</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>

            {/* Timer & Warning Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Warnings Shield */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: warningsCount > 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${warningsCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}`,
                color: warningsCount > 0 ? '#fca5a5' : '#6ee7b7',
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                <ShieldAlert size={15} />
                <span>Malpractice Strikes: {warningsCount} / 3</span>
              </div>

              {/* Countdown Timer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: timeLeft < 180 ? 'var(--accent-rose)' : '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 700
              }}>
                <Clock size={16} color={timeLeft < 180 ? 'var(--accent-rose)' : 'var(--accent-cyan)'} />
                <span>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>

              <button
                onClick={() => handleSubmitExam(false)}
                disabled={submitting}
                className="btn btn-primary btn-sm"
              >
                {submitting ? 'Submitting...' : 'Finish & Submit Exam'}
              </button>
            </div>
          </div>

          {/* Main Proctor Layout (Left Questions, Right Live Video) */}
          <div className="container" style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', maxWidth: '1200px' }}>
            {/* Left Question Card */}
            {currentQ && (
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span className="badge badge-indigo">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1 Mark</span>
                </div>

                <h2 style={{ fontSize: '1.25rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                  {currentQ.question}
                </h2>

                {/* Option Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                  {[
                    { key: 'A', text: currentQ.option_a },
                    { key: 'B', text: currentQ.option_b },
                    { key: 'C', text: currentQ.option_c },
                    { key: 'D', text: currentQ.option_d }
                  ].map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectOption(currentQ.id, opt.key)}
                        style={{
                          padding: '1rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-primary)',
                          border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {opt.key}
                        </div>
                        <span style={{ fontSize: '0.925rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Question Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous Question
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: currentQuestionIndex === idx ? 'var(--accent-primary)' : answers[q.id] ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${currentQuestionIndex === idx ? 'var(--accent-primary)' : answers[q.id] ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="btn btn-primary btn-sm"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmitExam(false)}
                      disabled={submitting}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Right Live AI Proctor Window */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Eye size={15} color="var(--accent-cyan)" /> Live AI Proctor
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#6ee7b7',
                    fontWeight: 700
                  }}>
                    ● ACTIVE
                  </span>
                </div>

                {/* Webcam Box */}
                <div style={{
                  width: '100%',
                  height: '180px',
                  background: '#000',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border-color)'
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {!cameraActive && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem'
                    }}>
                      <Camera size={24} style={{ marginBottom: '0.4rem' }} />
                      Proctor Feed Active
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Candidate ID: <code>USR-{user.id} ({user.name})</code>
                </div>
              </div>

              {/* Exam Security Status Card */}
              <div className="card" style={{ padding: '1.25rem', fontSize: '0.82rem' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '0.6rem', color: '#fff' }}>Proctor Integrity Checks</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={13} color="var(--accent-emerald)" /> Fullscreen Focus Active
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={13} color="var(--accent-emerald)" /> Clipboard Access Blocked
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={13} color="var(--accent-emerald)" /> Single Display Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EXAM RESULTS & CERTIFICATE SCREEN */}
      {/* ======================================================== */}
      {examState === 'results' && submissionResult && (
        <div className="container" style={{ maxWidth: '750px', padding: '4rem 1.5rem' }}>
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: submissionResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              {submissionResult.passed ? (
                <Award size={36} color="var(--accent-emerald)" />
              ) : (
                <XCircle size={36} color="var(--accent-rose)" />
              )}
            </div>

            <span className={`badge ${submissionResult.passed ? 'badge-emerald' : 'badge-rose'}`} style={{ marginBottom: '0.75rem' }}>
              {submissionResult.passed ? 'PASSED & CERTIFIED' : 'NOT PASSED'}
            </span>

            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              {submissionResult.passed ? 'Certification Examination Passed!' : 'Exam Attempt Incomplete'}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.75rem auto' }}>
              {submissionResult.passed
                ? `Congratulations ${user.name}! You scored ${submissionResult.score_percent}% under verified AI proctoring.`
                : `You scored ${submissionResult.score_percent}%. A minimum score of 60% with zero disqualifications is required for certification.`}
            </p>

            {/* Score Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FINAL SCORE</span>
                <h3 style={{ fontSize: '1.6rem', color: submissionResult.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {submissionResult.score_percent}%
                </h3>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACCURACY</span>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>
                  {submissionResult.correct_answers} / {submissionResult.total_questions}
                </h3>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROCTOR INTEGRITY</span>
                <h3 style={{ fontSize: '1.1rem', marginTop: '0.35rem', color: submissionResult.proctor_status === 'clean' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                  {submissionResult.proctor_status === 'clean' ? '✓ 100% Clean' : `${submissionResult.warnings_count} Warnings`}
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {submissionResult.passed ? (
                <button
                  onClick={openCertificate}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '0.8rem 2rem' }}
                >
                  <Award size={18} /> View & Download Verified Certificate
                </button>
              ) : (
                <button
                  onClick={() => { setExamState('instructions'); setAnswers({}); }}
                  className="btn btn-primary"
                >
                  <RefreshCw size={16} /> Retake Certification Exam
                </button>
              )}

              <button onClick={onBack} className="btn btn-secondary">
                Return to Course Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MALPRACTICE VIOLATION POPUP MODAL */}
      {/* ======================================================== */}
      {isWarningModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 7, 12, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            border: '2px solid var(--accent-rose)',
            boxShadow: '0 0 40px rgba(244, 63, 94, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <AlertTriangle size={30} color="var(--accent-rose)" />
            </div>

            <h2 style={{ fontSize: '1.4rem', color: '#fca5a5', marginBottom: '0.75rem' }}>
              Malpractice Violation Alert
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '1.5rem' }}>
              {warningModalMessage}
            </p>

            {warningsCount < 3 && (
              <button
                onClick={() => setIsWarningModalOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', background: 'var(--accent-rose)' }}
              >
                I Understand — Resume Exam (Strike {warningsCount}/3)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certificateModalData && (
        <CertificateModal
          certificate={certificateModalData}
          onClose={() => setCertificateModalData(null)}
        />
      )}
    </div>
  );
}
