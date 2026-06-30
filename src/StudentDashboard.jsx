import React, { useState, useEffect } from 'react';
import api from './api';
import VideoLibrary from './components/VideoLibrary';
import ChatPage from './components/ChatPage';
import QuizList from './components/QuizList';
import QuizHistory from './components/QuizHistory';
import Profile from './components/Profile';
import NotificationBell from './components/NotificationBell';
import MiniCalculator from './components/MiniCalculator';
import { LayoutGrid, MessageSquare, LogOut, GraduationCap, TrendingUp, Trophy, History, UserCircle } from 'lucide-react';

export default function StudentDashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'quizzes' | 'history' | 'chat' | 'profile'
  const [progress, setProgress] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    api.get('/users/progress/me')
      .then((res) => setProgress(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingProgress(false));

    api.get('/quizzes')
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error(err));
  }, []);

  const completedCount = progress.filter((p) => p.completed).length;

  const tabs = [
    { id: 'library', label: 'Courses', icon: LayoutGrid },
    { id: 'quizzes', label: 'Quizzes', icon: Trophy },
    { id: 'history', label: 'My Scores', icon: History },
    { id: 'chat', label: 'Support', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1d5ec2] flex items-center justify-center text-xl shadow-sm">
              🎓
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">Skillora</h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 rounded-xl p-1 mr-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold transition ${
                      activeTab === tab.id ? 'bg-white text-[#1d5ec2] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </nav>

            <NotificationBell />

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1d5ec2] flex items-center justify-center text-xs font-black">
                {user.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="text-sm font-bold text-slate-700">{user.name}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold transition"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Tabs */}
        <div className="lg:hidden flex border-t border-slate-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-3 text-xs font-bold whitespace-nowrap ${activeTab === tab.id ? 'text-[#1d5ec2] border-b-2 border-[#1d5ec2]' : 'text-slate-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'library' && (
          <>
            {/* Welcome + Progress Banner */}
            <div className="bg-gradient-to-r from-[#1d5ec2] to-[#3b7de0] rounded-2xl p-6 md:p-8 mb-8 text-white relative overflow-">
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-black mb-1">Welcome back, {user.name?.split(' ')[0]} 👋</h2>
                <p className="text-blue-100 font-medium text-sm mb-6">Pick up where you left off, or explore something new.</p>

                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 w-fit">
                  <TrendingUp size={20} />
                  <div>
                    <p className="text-xs font-bold text-blue-100 uppercase tracking-wide">Your Progress</p>
                    <p className="text-sm font-black">
                      {loadingProgress ? 'Loading...' : `${completedCount} videos completed`}
                    </p>
                  </div>
                </div>
              </div>
              <GraduationCap size={140} className="absolute -right-6 -bottom-6 opacity-10" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-4">Course Library</h3>
            <VideoLibrary />
          </>
        )}

        {activeTab === 'quizzes' && (
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Quizzes</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Practice quizzes and live competitions, all in one place.</p>
            <QuizList quizzes={quizzes} isAdmin={false} />
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-1">My Quiz Scores</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">A history of every quiz you've attempted.</p>
            <QuizHistory isAdmin={false} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-4">Chat with Support</h3>
            <ChatPage currentUser={user} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-4">My Profile</h3>
            <Profile user={user} onUpdate={onUserUpdate} />
          </div>
        )}
      </main>

      <MiniCalculator />
    </div>
  );
}
