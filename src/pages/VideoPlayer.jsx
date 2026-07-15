import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import api from '../api';

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    // 1. Video fetch karein
    api.get(`/videos/${id}`).then(res => setVideo(res.data));
    // 2. Related videos fetch karein
    api.get(`/videos/${id}/related`).then(res => setRelated(res.data));
  }, [id]);

  const onPlayerReady = (event) => {
    event.target.playVideo(); // Auto-play on load
  };

  const onVideoEnd = () => {
    // Agar next video available hai, toh usey open karo
    if (related.length > 0) {
      navigate(`/video/${related[0]._id}`);
    }
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div className="p-5 flex flex-col lg:flex-row gap-6">
      {/* Video Player Section */}
      <div className="flex-1">
        <YouTube
          videoId={video.embedUrl.split('v=')[1]} // Agar URL pura hai to ID extract karo
          opts={{ width: '100%', height: '500', playerVars: { autoplay: 1 } }}
          onReady={onPlayerReady}
          onEnd={onVideoEnd}
        />
        <h1 className="text-2xl font-bold mt-4">{video.title}</h1>
      </div>

      {/* Sidebar: Recommendations */}
      <div className="lg:w-1/3">
        <h2 className="font-bold mb-4">Up Next / Recommendations</h2>
        {related.map((v) => (
          <div key={v._id} onClick={() => navigate(`/video/${v._id}`)} className="cursor-pointer mb-3 flex gap-2">
            <img src={v.thumbnailUrl} className="w-24 h-16 rounded object-cover" />
            <p className="text-sm font-semibold">{v.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}