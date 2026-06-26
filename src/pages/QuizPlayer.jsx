import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import socket from '../socket';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function QuizPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const startTimeRef = useRef(Date.now());
  const iframeRef = useRef(null);

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then((res) => {
        setQuiz(res.data.quiz);
        setAlreadyAttempted(res.data.alreadyAttempted);
        setExistingAttempt(res.data.existingAttempt);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load quiz.');
      });
  }, [id]);

  // Listen for postMessage from an uploaded HTML quiz iframe
  useEffect(() => {
    const handleMessage = async (event) => {
      if (!event.data || event.data.type !== 'QUIZ_SCORE') return;
      const { score, totalMarks } = event.data;

      try {
        const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        await api.post(`/quizzes/${id}/submit-score`, { score, totalMarks, timeTakenSeconds });
        socket.emit('quiz_score_submitted', { quizId: id });
        setResult({ score, totalMarks });
      } catch (err) {
        console.error('Failed to save HTML quiz score:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id]);

  const handleAnswerSelect = (qIndex, oIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const handleSubmitBuilderQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setError('');
    try {
      const answerArray = quiz.questions.map((_, i) => answers[i] ?? -1);
      const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const res = await api.post(`/quizzes/${id}/submit`, {
        answers: answerArray,
        timeTakenSeconds,
      });

      socket.emit('quiz_score_submitted', { quizId: id });
      setResult({ score: res.data.score, totalMarks: res.data.totalMarks });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">Loading quiz...</div>;
  }

  const displayResult = result || (alreadyAttempted && existingAttempt ? existingAttempt : null);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-indigo-600 hover:text-indigo-800 font-black text-sm"
      >
        <ArrowLeft size={16} /> BACK
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">{quiz.title}</h1>
          {quiz.description && <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>}
        </div>

        {displayResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
            <Trophy className="text-emerald-500" size={36} />
            <div>
              <p className="text-sm font-bold text-emerald-700">Quiz Completed!</p>
              <p className="text-2xl font-black text-emerald-800">
                {displayResult.score} / {displayResult.totalMarks}
              </p>
            </div>
            {quiz.isLive && (
              <button
                onClick={() => navigate(`/quiz/${id}/leaderboard`)}
                className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition"
              >
                View Leaderboard
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Builder-type quiz: render MCQ form (only if not yet completed) */}
        {quiz.sourceType === 'builder' && !displayResult && (
          <div className="space-y-5">
            {quiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm font-black text-slate-800 mb-3">
                  {qIndex + 1}. {q.questionText}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oIndex) => (
                    <label
                      key={oIndex}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                        answers[qIndex] === oIndex
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={answers[qIndex] === oIndex}
                        onChange={() => handleAnswerSelect(qIndex, oIndex)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmitBuilderQuiz}
              disabled={submitting}
              className="w-full bg-[#1d5ec2] hover:bg-[#154fa5] disabled:bg-blue-300 text-white py-3.5 rounded-xl text-sm font-black transition"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        )}

        {/* HTML-type quiz: render in an iframe (only if not yet completed) */}
        {quiz.sourceType === 'html' && !displayResult && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '70vh' }}>
            <iframe
              ref={iframeRef}
              srcDoc={quiz.htmlContent}
              title={quiz.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        )}
      </div>
    </div>
  );
}
