import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function AuthPortal({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('login'); // 'login', 'register', 'forget'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🌐 Google Auth Success Callback Pipeline
  const handleGoogleSuccess = async (credentialResponse) => {
    setStatus('Google Sign-In Synchronizing... 🔄');
    try {
      const res = await api.post('/auth/google-login', {
        token: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (onAuthSuccess) onAuthSuccess(res.data.user);
      navigate('/dashboard');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Google Authentication Failed! ❌');
    }
  };

  // ⚡ NATIVE GOOGLE INITIALIZATION HOOK
  useEffect(() => {
    const initializeGoogleAuth = () => {
      try {
        if (typeof window !== 'undefined' && window.google && window.google.accounts) {
          if (!window.googleInitialized) {
            window.google.accounts.id.initialize({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "665381937501-ifp6c5erg6ukptmv4s2fs52a7vabddor.apps.googleusercontent.com",
              callback: handleGoogleSuccess,
              context: "signin",
              ux_mode: "popup"
            });
            window.googleInitialized = true;
          }

          if (screen === 'login') {
            setTimeout(() => {
              const btnElement = document.getElementById("googleBtnWrapper");
              if (btnElement && window.google && window.google.accounts) {
                window.google.accounts.id.renderButton(btnElement, {
                  theme: "outline",
                  size: "large",
                  text: "signin_with",
                  shape: "rectangular",
                  width: btnElement.offsetWidth
                });
              }
            }, 150);
          }
        } else {
          setTimeout(initializeGoogleAuth, 300);
        }
      } catch (err) {
        console.error("Google script mapping delay handling:", err);
      }
    };

    const scriptExists = document.getElementById('google-gsi-client');
    if (!scriptExists) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(initializeGoogleAuth, 100);
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, [screen]);

  // 📝 Standard Form Submit Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Processing... ⏳');
    try {
      if (screen === 'register') {
        const res = await api.post('/auth/register', { name, email, password, role: 'student' });
        setStatus(res.data.message || 'Registration Successful! Please Sign In.');
        setScreen('login');
      } else if (screen === 'login') {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        if (onAuthSuccess) onAuthSuccess(res.data.user);
        navigate('/dashboard');
      } else if (screen === 'forget') {
        const res = await api.post('/auth/forget-password', { email });
        setStatus(res.data.message);
      }
    } catch (error) {
      setStatus(error.response?.data?.message || 'Something went wrong! ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1d5ec2] p-4 md:p-10 font-sans box-border selection:bg-blue-200">
      
      {/* Container Box */}
      <div className="w-full max-w-[1024px] min-h-[620px] bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 box-border">
        
        {/* Left Container: Visual 3D Branding Panel */}
        <div className="flex-1 bg-gradient-to-tr from-[#e0f2fe] to-[#bae6fd] flex flex-col justify-center items-center p-8 md:p-12 text-center relative select-none">
          <div className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-white flex items-center justify-center shadow-lg mb-6 transform transition-transform duration-500 hover:scale-105">
            <span className="text-7xl md:text-8xl filter drop-shadow-md">🎓</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0369a1] mb-3 tracking-tight">
            Skillora Platform
          </h2>
          <p className="text-sm text-[#0c4a6e] max-w-[320px] leading-relaxed opacity-85 font-medium">
            Analyze metrics, stream industrial workflows, and manage code-base architectures seamlessly.
          </p>

          {/* Dynamic Graphic Waves Accent */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        </div>

        {/* Right Container: Form Sheet */}
        <div className="flex-1 p-8 sm:p-12 md:p-14 flex flex-col justify-center bg-white box-border">
          
          {/* Header Info */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1.5 tracking-tight">
              Welcome To LMS
            </h1>
            <p className="text-sm font-semibold text-gray-500">
              {screen === 'login' && 'Login to your LMS account'}
              {screen === 'register' && 'Enter registration details below'}
              {screen === 'forget' && 'Enter your email for security link'}
            </p>
          </div>

          {/* Status Alert Bar */}
          {status && (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-xs font-bold leading-normal transition-all duration-200">
              {status}
            </div>
          )}

          {/* Master Form Pipeline */}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            
            {screen === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">Full Name</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800">E-Mail</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border"
                />
              </div>
            </div>

            {screen !== 'forget' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-11 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {screen === 'login' && (
              <div className="flex justify-between items-center text-xs mt-1">
                <label className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  Remember me
                </label>
                <span
                  onClick={() => { setScreen('forget'); setStatus(''); }}
                  className="text-red-500 hover:text-red-600 font-bold cursor-pointer transition-colors"
                >
                  Forgot password?
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d5ec2] hover:bg-[#154fa5] active:scale-[0.99] disabled:bg-blue-400 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer box-border mt-2"
            >
              {loading ? 'Processing Framework...' : screen === 'login' ? 'Sign In' : screen === 'register' ? 'Create Account' : 'Dispatch Reset Link'}
            </button>
          </form>

          {/* Google Single Sign-On Module */}
          {screen === 'login' && (
            <div className="mt-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-center my-2">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="px-3 text-xs text-gray-400 font-bold uppercase tracking-wider bg-white whitespace-nowrap">or</span>
                <div className="border-t border-gray-200 w-full"></div>
              </div>
              <div id="googleBtnWrapper" className="w-full min-h-[44px] flex justify-center transition-all duration-200"></div>
            </div>
          )}

          {/* Panel Form Footer Router */}
          <div className="text-center mt-6">
            {screen === 'login' && (
              <p className="text-sm font-semibold text-gray-700">
                Don't have an account?{' '}
                <span onClick={() => { setScreen('register'); setStatus(''); }} className="text-red-500 hover:text-red-600 font-bold cursor-pointer transition-colors">Sign Up</span>
              </p>
            )}
            {screen === 'register' && (
              <p className="text-sm font-semibold text-gray-700">
                Already registered?{' '}
                <span onClick={() => { setScreen('login'); setStatus(''); }} className="text-red-500 hover:text-red-600 font-bold cursor-pointer transition-colors">Sign In</span>
              </p>
            )}
            {screen === 'forget' && (
              <p className="text-sm font-semibold text-gray-700">
                Return back to entry gateway?{' '}
                <span onClick={() => { setScreen('login'); setStatus(''); }} className="text-red-500 hover:text-red-600 font-bold cursor-pointer transition-colors">Sign In</span>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}