import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom'; // Link ki jagah navigate use karenge
import VideoCard from './VideoCard';
import SkeletonCard from './SkeletonCard';

export default function VideoLibrary() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Data fetch karo
    api.get('/videos')
      .then((res) => setVideos(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));

    // 2. Wapas aane par scroll position restore karo
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('scrollPosition');
      }, 100);
    }
  }, []);

  // Custom click handler
  const handleVideoClick = (videoId) => {
    sessionStorage.setItem('scrollPosition', window.scrollY);
    navigate(`/video/${videoId}`);
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <input 
        type="text" 
        placeholder="Search videos..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} 
        className="p-3 border border-slate-200 rounded-xl w-full mb-8 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && filteredVideos.map((video) => (
          // Link tag ki jagah div with onClick
          <div key={video._id} onClick={() => handleVideoClick(video._id)}>
            <VideoCard video={video} />
          </div>
        ))}
      </div>
      
      {!loading && filteredVideos.length === 0 && (
        <p className="text-center text-slate-500 mt-10 font-bold">
          Koi matching video nahi mili! 🔍
        </p>
      )}
    </div>
  );
}