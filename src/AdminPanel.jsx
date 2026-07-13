import React, { useState, useEffect } from 'react';
import api from './api';
import socket from './socket';
import AdminUpload from './components/AdminUpload';
import VideoCard from './components/VideoCard';
import ChatPage from './components/ChatPage';
import QuizBuilder from './components/QuizBuilder';
import QuizUpload from './components/QuizUpload';
import QuizList from './components/QuizList';
import QuizHistory from './components/QuizHistory';
import Profile from './components/Profile';
import NotificationBell from './components/NotificationBell';
import MiniCalculator from './components/MiniCalculator';
import YouTubeImport from './components/YouTubeImport';
import {
  LayoutGrid, Users, MessageSquare, UploadCloud, LogOut, Trash2,
  Trophy, History, UserCircle, Bell, PlusCircle, FileCode2,Youtube
} from 'lucide-react';

export default function AdminPanel({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'students' | 'quizzes' | 'scores' | 'chat' | 'notify' | 'profile'
  const [videos, setVideos] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [quizCreateMode, setQuizCreateMode] = useState(null); // null | 'builder' | 'upload'

  // Send Notification form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifLink, setNotifLink] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [notifStatus, setNotifStatus] = useState('');

  const loadVideos = () => {
    setLoading(true);
    api.get('/videos')
      .then((res) => setVideos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const loadStudents = () => {
    api.get('/users/students')
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  };

  const loadQuizzes = () => {
    api.get('/quizzes')
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadVideos();
    loadStudents();
    loadQuizzes();
  }, []);

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Delete this video? This cannot be undone.')) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete video.');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz? All attempt history for it will also be removed.')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete quiz.');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim()) {
      setNotifStatus('Title is required.');
      return;
    }
    setNotifSending(true);
    setNotifStatus('');
    try {
      const res = await api.post('/notifications', {
        title: notifTitle,
        message: notifMessage,
        link: notifLink || null,
      });
      socket.emit('notification_broadcast', { notificationId: res.data._id });
      setNotifStatus('Notification sent to all students!');
      setNotifTitle('');
      setNotifMessage('');
      setNotifLink('');
    } catch (err) {
      setNotifStatus(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setNotifSending(false);
    }
  };

  const tabs = [
    { id: 'videos', label: 'Videos', icon: LayoutGrid },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'quizzes', label: 'Quizzes', icon: Trophy },
    { id: 'scores', label: 'Quiz Scores', icon: History },
    { id: 'chat', label: 'Support Chat', icon: MessageSquare },
    { id: 'notify', label: 'Notify', icon: Bell },
    { id: 'youtube', label: 'YT Import', icon: Youtube },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden lg:flex">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-[#1d5ec2] flex items-center justify-center text-xl">🎓</div>
          <div>
            <h1 className="text-base font-black leading-none">Skillora</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-[#1d5ec2] text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-6 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#1d5ec2] flex items-center justify-center text-xs font-black">
              {user.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <span className="font-black text-sm">Skillora Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={onLogout} className="text-red-400 text-sm font-bold flex items-center gap-1">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-0 pt-14 lg:pt-0">
        {/* Mobile tabs */}
        <div className="lg:hidden flex border-b border-slate-200 bg-white overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap ${
                  activeTab === tab.id ? 'text-[#1d5ec2] border-b-2 border-[#1d5ec2]' : 'text-slate-400'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Desktop top bar (bell icon, hidden on mobile since it's in the mobile header) */}
        <div className="hidden lg:flex justify-end px-8 pt-6">
          <NotificationBell />
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {activeTab === 'videos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Course Videos</h2>
                  <p className="text-sm text-slate-500 font-medium">{videos.length} videos in the library</p>
                </div>
                <button
                  onClick={() => setShowUploadForm((s) => !s)}
                  className="flex items-center gap-2 bg-[#1d5ec2] hover:bg-[#154fa5] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
                >
                  <UploadCloud size={16} /> {showUploadForm ? 'Close' : 'Upload Video'}
                </button>
              </div>

              {showUploadForm && (
                <div className="mb-8 max-w-xl">
                  <AdminUpload onUploadSuccess={() => { loadVideos(); setShowUploadForm(false); }} />
                </div>
              )}

              {loading && <p className="text-sm text-slate-400 font-bold">Loading videos...</p>}

              {!loading && videos.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-400 font-bold">No videos yet. Upload your first course video!</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => (
                  <div key={video._id} className="relative group">
                    <VideoCard video={video} />
                    <button
                      onClick={() => handleDeleteVideo(video._id)}
                      className="absolute top-2 left-2 bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-lg shadow opacity-0 group-hover:opacity-100 transition"
                      title="Delete video"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Students</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">{students.length} registered students</p>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Name</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Email</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Video Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s._id} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                        <td className="px-6 py-4 text-slate-500">{s.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1d5ec2] rounded-full"
                                style={{
                                  width: s.totalVideos
                                    ? `${Math.min(100, (s.videosCompleted / s.totalVideos) * 100)}%`
                                    : '0%',
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              {s.videosCompleted}/{s.totalVideos}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-bold">
                          No students registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Quizzes</h2>
                  <p className="text-sm text-slate-500 font-medium">{quizzes.length} quizzes created</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizCreateMode(quizCreateMode === 'builder' ? null : 'builder')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                      quizCreateMode === 'builder' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle size={16} /> Build Quiz
                  </button>
                  <button
                    onClick={() => setQuizCreateMode(quizCreateMode === 'upload' ? null : 'upload')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                      quizCreateMode === 'upload' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileCode2 size={16} /> Upload HTML Quiz
                  </button>
                </div>
              </div>

              {quizCreateMode === 'builder' && (
                <div className="mb-8 max-w-2xl">
                  <QuizBuilder onCreated={() => { loadQuizzes(); setQuizCreateMode(null); }} />
                </div>
              )}
              {quizCreateMode === 'upload' && (
                <div className="mb-8 max-w-2xl">
                  <QuizUpload onCreated={() => { loadQuizzes(); setQuizCreateMode(null); }} />
                </div>
              )}

              <QuizList quizzes={quizzes} isAdmin={true} onDelete={handleDeleteQuiz} />
            </div>
          )}

          {activeTab === 'scores' && (
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Quiz Scores</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Every student's quiz attempt history.</p>
              <QuizHistory isAdmin={true} />
            </div>
          )}

          {activeTab === 'chat' && (
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Support Chat</h2>
              <ChatPage currentUser={user} />
            </div>
          )}

          {activeTab === 'notify' && (
            <div className="max-w-xl">
              <h2 className="text-2xl font-black text-slate-900 mb-1">Send Notification</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">This will appear instantly in every student's notification bell.</p>

              <form onSubmit={handleSendNotification} className="space-y-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                  <input
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="e.g. New Live Quiz Scheduled!"
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Message (optional)</label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Direct Link (optional)</label>
                  <input
                    value={notifLink}
                    onChange={(e) => setNotifLink(e.target.value)}
                    placeholder="e.g. /quiz/<quiz-id>"
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Tip: open a quiz card and copy its ID from the URL, e.g. /quiz/665f1...
                  </p>
                </div>

                {notifStatus && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-4 py-3 rounded-xl">
                    {notifStatus}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={notifSending}
                  className="w-full bg-[#1d5ec2] hover:bg-[#154fa5] disabled:bg-blue-300 text-white py-3 rounded-xl text-sm font-black transition"
                >
                  {notifSending ? 'Sending...' : 'Send to All Students'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'profile' && (
            <div> {activeTab === 'youtube' && (
            <YouTubeImport />
          )}
              <h2 className="text-2xl font-black text-slate-900 mb-6">My Profile</h2>
              <Profile user={user} onUpdate={onUserUpdate} />
            </div>
          )}
        </main>
      </div>

      <MiniCalculator />
    </div>
  );
}
