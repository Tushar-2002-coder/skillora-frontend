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

  // 🛠️ URL Transformation Logic
  const formatUrl = (url) => {
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    // Agar link mein 'youtu.be/' hai toh use bhi embed mein badal sakte hain
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // URL transformation apply karo
    const finalEmbedUrl = formatUrl(formData.embedUrl);
    
    try {
      // Backend ko transformed data ke saath bhej rahe hain
      await api.post('/videos', { 
        ...formData, 
        embedUrl: finalEmbedUrl 
      });
      
      alert("✅ Video successfully deployed to cluster!");
      setFormData({ title: '', thumbnailUrl: '', embedUrl: '', durationInSeconds: '', category: 'General' });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed: Check console for schema errors!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
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
        placeholder="YouTube URL (Normal or Embed)" 
        value={formData.embedUrl} 
        onChange={(e) => setFormData({...formData, embedUrl: e.target.value})} 
        className="w-full border p-2 rounded" 
        required
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