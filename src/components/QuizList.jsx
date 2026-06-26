import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, FileQuestion, Trash2 } from 'lucide-react';

function getQuizStatus(quiz) {
  if (!quiz.isLive) return 'normal';
  const now = new Date();
  const start = new Date(quiz.scheduledAt);
  const end = new Date(start.getTime() + (quiz.durationMinutes || 30) * 60000);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

const statusStyles = {
  upcoming: { label: 'Upcoming', className: 'bg-amber-100 text-amber-700' },
  live: { label: '🔴 LIVE NOW', className: 'bg-red-100 text-red-700 animate-pulse' },
  ended: { label: 'Ended', className: 'bg-slate-100 text-slate-500' },
  normal: { label: 'Quiz', className: 'bg-indigo-100 text-indigo-700' },
};

export default function QuizList({ quizzes, isAdmin, onDelete }) {
  const navigate = useNavigate();

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
        <FileQuestion className="mx-auto text-slate-300 mb-2" size={40} />
        <p className="text-slate-400 font-bold">No quizzes available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => {
        const status = getQuizStatus(quiz);
        const style = statusStyles[status];

        return (
          <div key={quiz._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 relative group">
            {isAdmin && onDelete && (
              <button
                onClick={() => onDelete(quiz._id)}
                className="absolute top-3 right-3 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                title="Delete quiz"
              >
                <Trash2 size={16} />
              </button>
            )}

            <span className={`w-fit text-[10px] font-black px-2.5 py-1 rounded-full ${style.className}`}>
              {style.label}
            </span>

            <h3 className="text-base font-black text-slate-900 leading-tight">{quiz.title}</h3>
            {quiz.description && <p className="text-xs text-slate-500 line-clamp-2">{quiz.description}</p>}

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold mt-1">
              {quiz.sourceType === 'builder' && <span>{quiz.totalQuestions} Questions</span>}
              {quiz.isLive && quiz.scheduledAt && (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {new Date(quiz.scheduledAt).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => navigate(`/quiz/${quiz._id}`)}
                disabled={status === 'upcoming'}
                className="flex-1 bg-[#1d5ec2] hover:bg-[#154fa5] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black py-2.5 rounded-xl transition"
              >
                {status === 'upcoming' ? 'Not Started Yet' : 'Open Quiz'}
              </button>
              {quiz.isLive && (
                <button
                  onClick={() => navigate(`/quiz/${quiz._id}/leaderboard`)}
                  className="px-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition"
                  title="Leaderboard"
                >
                  <Trophy size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
