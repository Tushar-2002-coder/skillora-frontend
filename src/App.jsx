import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPortal from './AuthPortal';
import ResetPassword from './ResetPassword';
import AdminPanel from './AdminPanel';
import StudentDashboard from './StudentDashboard';
import VideoPlayer from './pages/VideoPlayer';
import QuizPlayer from './pages/QuizPlayer';
import QuizLeaderboard from './pages/QuizLeaderboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try { setCurrentUser(JSON.parse(storedUser)); } 
      catch (error) { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userPayload) => setCurrentUser(userPayload);
  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    window.location.reload();
  };
  const handleUserUpdate = (updatedUser) => setCurrentUser(updatedUser);

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<AuthPortal onAuthSuccess={handleAuthSuccess} />} />
      </Routes>
    );
  }

  // Component logic for dashboard to avoid repetition
  const DashboardComponent = currentUser.role === 'admin' 
    ? <AdminPanel user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
    : <StudentDashboard user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;

  return (
    <Routes>
      {/* Root path par dashboard */}
      <Route path="/" element={DashboardComponent} />
      
      {/* Explicit /dashboard path */}
      <Route path="/dashboard" element={DashboardComponent} />
      
      {/* Video Player path */}
      <Route path="/video/:id" element={<VideoPlayer onLogout={handleLogout} />} />

      {/* Quiz Player + Live Leaderboard */}
      <Route path="/quiz/:id" element={<QuizPlayer />} />
      <Route path="/quiz/:id/leaderboard" element={<QuizLeaderboard />} />

      {/* Logged-in user hitting reset link again -> send to dashboard */}
      <Route path="/reset-password/:token" element={DashboardComponent} />
    </Routes>
  );
}
