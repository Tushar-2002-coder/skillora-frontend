import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Updating cryptographic hashes... ⏳');
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setStatus(res.data.message || 'Password security credentials updated successfully! 🎉');
      
      // ✅ Smooth single-page router application transition to portal home
      setTimeout(() => navigate('/'), 2500); 
    } catch (error) {
      setStatus(error.response?.data?.message || 'Reset failed! Link may have expired or corrupted. ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1d5ec2] p-4 font-sans box-border selection:bg-blue-200">
      
      {/* Structural Centralized Core Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-2xl p-8 md:p-10 border border-gray-200 box-border flex flex-col justify-center">
        
        {/* Component Header Identity */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1d5ec2] flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
            🔐
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1.5 tracking-tight">
            Set New Password
          </h2>
          <p className="text-xs font-semibold text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            Enter a strong cryptographic password for your secure portal account.
          </p>
        </div>
        
        {/* Interactive Toast Message Notification */}
        {status && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-xs font-bold leading-normal text-center transition-all duration-200">
            {status}
          </div>
        )}

        {/* Input Interactive Form Sheet */}
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-gray-800 pl-0.5">New Secure Password</label>
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1d5ec2] hover:bg-[#154fa5] active:scale-[0.99] disabled:bg-blue-400 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer box-border mt-2"
          >
            {loading ? 'Re-compiling Security Layers...' : 'Update Token Password 🚀'}
          </button>
        </form>

        {/* Dynamic Cancel Route Fallback */}
        <div className="text-center mt-5">
          <span 
            onClick={() => navigate('/')} 
            className="text-xs font-bold text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
          >
            Cancel and Return Entry Gateway
          </span>
        </div>

      </div>
    </div>
  );
}