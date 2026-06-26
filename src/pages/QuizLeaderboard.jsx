import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import socket from '../socket';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';

const rankStyles = {
  1: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '🥇' },
  2: { bg: 'bg-slate-50', border: 'border-slate-200', icon: '🥈' },
  3: { bg: 'bg-orange-50', border: 'border-orange-200', icon: '🥉' },
};

export default function QuizLeaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then((res) => setQuizTitle(res.data.quiz.title))
      .catch((err) => console.error(err));

    api.get(`/quizzes/${id}/leaderboard`)
      .then((res) => setLeaderboard(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    socket.emit('join_quiz_room', id);

    const handleUpdate = (data) => setLeaderboard(data);
    socket.on('leaderboard_update', handleUpdate);

    return () => {
      socket.emit('leave_quiz_room', id);
      socket.off('leaderboard_update', handleUpdate);
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-indigo-600 hover:text-indigo-800 font-black text-sm"
      >
        <ArrowLeft size={16} /> BACK
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Trophy className="text-amber-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Live Leaderboard</h1>
            <p className="text-sm text-slate-500 font-bold">{quizTitle}</p>
          </div>
        </div>

        {loading && <p className="text-center text-slate-400 font-bold py-10">Loading leaderboard...</p>}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-bold">No attempts yet. Be the first to take this quiz!</p>
          </div>
        )}

        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const style = rankStyles[entry.rank] || { bg: 'bg-white', border: 'border-slate-200', icon: null };
            return (
              <div
                key={entry.studentId}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${style.bg} ${style.border} shadow-sm`}
              >
                <div className="w-8 text-center font-black text-slate-500">
                  {style.icon || `#${entry.rank}`}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{entry.studentName}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{entry.timeTakenSeconds}s taken</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#1d5ec2]">
                    {entry.score}/{entry.totalMarks}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
