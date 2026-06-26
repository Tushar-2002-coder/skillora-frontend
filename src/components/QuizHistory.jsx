import React, { useState, useEffect } from 'react';
import api from '../api';
import { History } from 'lucide-react';

// isAdmin=true → shows every student's attempts (admin dashboard)
// isAdmin=false → shows only the logged-in student's own attempts
export default function QuizHistory({ isAdmin }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = isAdmin ? '/quizzes/history/all' : '/quizzes/history/me';
    api.get(endpoint)
      .then((res) => setAttempts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (loading) {
    return <p className="text-sm text-slate-400 font-bold">Loading history...</p>;
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
        <History className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-slate-400 font-bold text-sm">No quiz attempts yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {isAdmin && <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Student</th>}
            <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Quiz</th>
            <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Score</th>
            <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a._id} className="border-b border-slate-100 last:border-0">
              {isAdmin && (
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">{a.student?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{a.student?.email}</p>
                </td>
              )}
              <td className="px-6 py-4 font-medium text-slate-700">{a.quiz?.title || 'Deleted Quiz'}</td>
              <td className="px-6 py-4">
                <span className="font-black text-[#1d5ec2]">{a.score}</span>
                <span className="text-slate-400"> / {a.totalMarks}</span>
              </td>
              <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                {new Date(a.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
