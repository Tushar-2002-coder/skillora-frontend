import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "665381937501-ifp6c5erg6ukptmv4s2fs52a7vabddor.apps.googleusercontent.com";

export default function AuthPortal({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: useCallback se ensure hota hai ki yeh function reference stable rahe
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setStatus({ type: 'info', msg: 'Google Sign-In verifying...' });
    try {
      const res = await api.post('/auth/google-login', {
        token: credentialResponse.credential,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (onAuthSuccess) onAuthSuccess(res.data.user);
      navigate('/dashboard');
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Google login failed.' });
    }
  }, [navigate, onAuthSuccess]);

  // ✅ FIX: window.googleInitialized flag HATA DIYA — yeh stale callback ka root cause tha
  // Ab har baar jab screen 'login' pe aata hai, Google button fresh render hota hai
  useEffect(() => {
    if (screen !== 'login') return;

    const renderGoogleButton = () => {
      const btnElement = document.getElementById('googleBtnWrapper');
      if (!btnElement || !window.google?.accounts) return;

      // Re-initialize with fresh callback every time login screen shows
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSuccess,
        context: 'signin',
        ux_mode: 'popup',
      });

      // Clear old button and render fresh
      btnElement.innerHTML = '';
      window.google.accounts.id.renderButton(btnElement, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: btnElement.offsetWidth || 320,
      });
    };

    // If GSI script already loaded, render immediately
    if (window.google?.accounts) {
      renderGoogleButton();
      return;
    }

    // Else load the script fresh
    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      // Script tag exists but google object not ready yet — poll briefly
      const poll = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(poll);
          renderGoogleButton();
        }
      }, 150);
      return () => clearInterval(poll);
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setTimeout(renderGoogleButton, 100);
    };
    document.head.appendChild(script);
  }, [screen, handleGoogleSuccess]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'info', msg: 'Processing...' });
    try {
      if (screen === 'register') {
        const res = await api.post('/auth/register', { name, email, password, role: 'student' });
        setStatus({ type: 'success', msg: res.data.message || 'Registration successful! Please sign in.' });
        setScreen('login');
      } else if (screen === 'login') {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (onAuthSuccess) onAuthSuccess(res.data.user);
        navigate('/dashboard');
      } else if (screen === 'forget') {
        const res = await api.post('/auth/forget-password', { email });
        setStatus({ type: 'success', msg: res.data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const switchScreen = (s) => {
    setScreen(s);
    setStatus({ type: '', msg: '' });
  };

  const statusStyles = {
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    error:   'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1d5ec2] p-4 md:p-10 font-sans box-border">
      <div className="w-full max-w-[1024px] min-h-[620px] bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200">

        {/* Left Panel */}
        <div className="flex-1 bg-gradient-to-tr from-[#e0f2fe] to-[#bae6fd] flex flex-col justify-center items-center p-8 md:p-12 text-center relative select-none">
          <div className="w-44 h-44 rounded-full bg-white flex items-center justify-center shadow-lg mb-6 hover:scale-105 transition-transform duration-300">
            <span className="text-7xl">🎓</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0369a1] mb-3 tracking-tight">
            Skillora Platform
          </h2>
          <p className="text-sm text-[#0c4a6e] max-w-[320px] leading-relaxed opacity-85 font-medium">
            Courses, live quizzes, chat support, and progress tracking — all in one place.
          </p>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-8 sm:p-12 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1.5 tracking-tight">
              Welcome To LMS
            </h1>
            <p className="text-sm font-semibold text-gray-500">
              {screen === 'login' && 'Login to your account'}
              {screen === 'register' && 'Create a new account'}
              {screen === 'forget' && 'Enter your email to reset password'}
            </p>
          </div>

          {status.msg && (
            <div className={`mb-4 border px-4 py-3 rounded-xl text-xs font-bold leading-normal ${statusStyles[status.type] || statusStyles.info}`}>
              {status.msg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            {screen === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">Full Name</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-gray-400" />
                  <input type="text" placeholder="Your full name" value={name}
                    onChange={(e) => setName(e.target.value)} required
                    className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800">E-Mail</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-gray-400" />
                <input type="email" placeholder="example@gmail.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border" />
              </div>
            </div>

            {screen !== 'forget' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-11 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {screen === 'login' && (
              <div className="flex justify-between items-center text-xs mt-1">
                <label className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  Remember me
                </label>
                <span onClick={() => switchScreen('forget')}
                  className="text-red-500 hover:text-red-600 font-bold cursor-pointer">
                  Forgot password?
                </span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#1d5ec2] hover:bg-[#154fa5] active:scale-[0.99] disabled:bg-blue-400 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer mt-2">
              {loading ? 'Please wait...' :
                screen === 'login' ? 'Sign In' :
                screen === 'register' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {/* Google Sign-In */}
          {screen === 'login' && (
            <div className="mt-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-center my-2">
                <div className="border-t border-gray-200 w-full" />
                <span className="px-3 text-xs text-gray-400 font-bold uppercase tracking-wider bg-white whitespace-nowrap">or</span>
                <div className="border-t border-gray-200 w-full" />
              </div>
              <div id="googleBtnWrapper" className="w-full min-h-[44px] flex justify-center" />
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6">
            {screen === 'login' && (
              <p className="text-sm font-semibold text-gray-700">
                Don't have an account?{' '}
                <span onClick={() => switchScreen('register')} className="text-red-500 font-bold cursor-pointer hover:text-red-600">Sign Up</span>
              </p>
            )}
            {screen === 'register' && (
              <p className="text-sm font-semibold text-gray-700">
                Already registered?{' '}
                <span onClick={() => switchScreen('login')} className="text-red-500 font-bold cursor-pointer hover:text-red-600">Sign In</span>
              </p>
            )}
            {screen === 'forget' && (
              <p className="text-sm font-semibold text-gray-700">
                Back to{' '}
                <span onClick={() => switchScreen('login')} className="text-red-500 font-bold cursor-pointer hover:text-red-600">Sign In</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
