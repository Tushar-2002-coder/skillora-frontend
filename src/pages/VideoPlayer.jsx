import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube'; // Library for control
import api from '../api';

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]); // Recommended videos

  useEffect(() => {
    // 1. Fetch current video
    api.get(`/videos/${id}`).then((res) => setVideo(res.data));
    // 2. Fetch related videos (Algorithm based)
    api.get(`/videos/${id}/related`).then((res) => setRelated(res.data));
  }, [id]);

  const onPlayerReady = (event) => {
    event.target.playVideo(); // Auto-start
  };

  const handleNextVideo = () => {
    // Agar next video hai to us par jump karo
    if (related.length > 0) {
      navigate(`/video/${related[0]._id}`);
    }
  };

  if (!video) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[0%_100%] gap-6">
        {/* Player Section */}
        <div className="space-y-4">
          <div className="bg-black aspect-video rounded-2xl overflow-hidden shadow-xl">
            <YouTube
  videoId={video.videoId}
  opts={{
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      // Yeh line sabse important hai
      origin: 'https://skillora-frontend-alpha.vercel.app', 
      widget_referrer: 'https://skillora-frontend-alpha.vercel.app'
    },
  }}
  onReady={onPlayerReady}
  onEnd={handleNextVideo}
/>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{video.title}</h1>
        </div>

        {/* Sidebar: Recommendations (YouTube Like Feel) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-black text-lg mb-4">Up Next</h3>
          <div className="space-y-4">
            {related.map((v) => (
              <div 
                key={v._id} 
                onClick={() => navigate(`/video/${v._id}`)} 
                className="cursor-pointer flex gap-3 group"
              >
                <img src={v.thumbnailUrl} className="w-24 h-16 rounded-lg object-cover" />
                <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}