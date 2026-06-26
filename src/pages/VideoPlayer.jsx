import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [marking, setMarking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/videos/${id}`)
      .then((res) => setVideo(res.data))
      .catch((err) => console.error("Error fetching video:", err));
  }, [id]);

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await api.post('/users/progress', { videoId: id, completed: true });
      setCompleted(true);
    } catch (err) {
      console.error("Error updating progress:", err);
    } finally {
      setMarking(false);
    }
  };

  if (!video) return <div className="p-10 text-center font-bold">Loading Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 mb-6 text-indigo-600 hover:text-indigo-800 transition font-black text-sm"
      >
        ← BACK
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Player Section */}
        <div className="space-y-4">
          <div className="bg-black aspect-video rounded-2xl overflow-hidden shadow-xl">
            <iframe 
              src={video.embedUrl} 
              title={video.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900">{video.title}</h1>

          <button
            onClick={handleMarkComplete}
            disabled={marking || completed}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition ${
              completed
                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {completed ? '✅ Marked as Completed' : marking ? 'Saving...' : 'Mark as Completed'}
          </button>
        </div>

        {/* Resources Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-black text-lg mb-4">Course Resources</h3>
          <div className="space-y-3">
             <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700">
               📄 {video.title} - Notes.pdf
             </div>
             <button className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-black">
               Download Materials
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
