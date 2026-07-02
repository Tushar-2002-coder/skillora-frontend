import React, { useState } from 'react';
import api from '../api';

export default function AdminUpload({ onUploadSuccess }) {
  const [formData, setFormData] = useState({ 
    title: '', 
    thumbnailUrl: '', 
    embedUrl: '', 
    durationInSeconds: '', 
    category: 'General' 
  });

  // 🛠️ Metadata Fetch Logic
  const handleAutoFill = async () => {
    if (!formData.embedUrl) return alert("Pehle YouTube link daalo!");
    try {
      // Backend ko call kar rahe hain metadata ke liye
      const res = await api.post('/videos/fetch-metadata', { videoUrl: formData.embedUrl });
      
      setFormData(prev => ({
        ...prev,
        title: res.data.title,
        thumbnailUrl: res.data.thumbnail // API se aaye hue thumbnail ko set karo
      }));
    } catch (err) {
      alert("Metadata fetch nahi ho paya, link check karo!");
    }
  };

  const formatUrl = (url) => {
    if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalEmbedUrl = formatUrl(formData.embedUrl);
    
    try {
      await api.post('/videos', { ...formData, embedUrl: finalEmbedUrl });
      alert("✅ Video successfully deployed!");
      setFormData({ title: '', thumbnailUrl: '', embedUrl: '', durationInSeconds: '', category: 'General' });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      {/* YouTube URL Field with Fetch Button */}
      <div className="flex gap-2">
        <input 
          placeholder="YouTube URL (Paste here then click Fetch)" 
          value={formData.embedUrl} 
          onChange={(e) => setFormData({...formData, embedUrl: e.target.value})} 
          className="w-full border p-2 rounded" 
          required
        />
        <button 
          type="button" 
          onClick={handleAutoFill}
          className="bg-slate-800 text-white px-4 rounded font-bold hover:bg-slate-900"
        >
          Fetch
        </button>
      </div>

      <input 
        placeholder="Title" 
        value={formData.title} 
        onChange={(e) => setFormData({...formData, title: e.target.value})} 
        className="w-full border p-2 rounded" 
        required
      />
      <input 
        placeholder="Thumbnail URL" 
        value={formData.thumbnailUrl} 
        onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})} 
        className="w-full border p-2 rounded" 
      />
      <input 
        type="number" 
        placeholder="Duration (in seconds)" 
        value={formData.durationInSeconds} 
        onChange={(e) => setFormData({...formData, durationInSeconds: e.target.value})} 
        className="w-full border p-2 rounded" 
      />
      
      <button 
        type="submit" 
        className="w-full bg-indigo-600 text-white p-2 rounded font-bold hover:bg-indigo-700 transition-all"
      >
        Deploy Video
      </button>
    </form>
  );
}