import React, { useState } from 'react';
import api from '../api';
import { User as UserIcon, Mail, Phone, FileText, Save } from 'lucide-react';

export default function Profile({ user, onUpdate }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const res = await api.put('/users/profile', { name, bio, phone });
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) onUpdate(updatedUser);
      setStatus('Profile updated successfully!');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1d5ec2] text-white flex items-center justify-center text-2xl font-black">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{user.name}</p>
            <span className="text-[11px] font-black uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <UserIcon size={12} /> Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Mail size={12} /> Email
            </label>
            <input
              value={user.email}
              disabled
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Phone size={12} /> Phone (optional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <FileText size={12} /> Bio (optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short bio about yourself"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {status && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-4 py-3 rounded-xl">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full bg-[#1d5ec2] hover:bg-[#154fa5] disabled:bg-blue-300 text-white py-3 rounded-xl text-sm font-black transition"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
