// components/VideoLibrary.jsx
// Personalized video grid — backend algorithm se sorted order aata hai
import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import VideoCard from './VideoCard';
import SkeletonCard from './SkeletonCard';
import { Search, Filter } from 'lucide-react';

export default function VideoLibrary() {
  const [videos, setVideos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setSearch]  = useState('');
  const [activeCategory, setCat]  = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/videos')
      .then((res) => setVideos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Scroll restore
    const saved = sessionStorage.getItem('scrollPosition');
    if (saved) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(saved));
        sessionStorage.removeItem('scrollPosition');
      }, 100);
    }
  }, []);

  const handleVideoClick = (videoId) => {
    sessionStorage.setItem('scrollPosition', window.scrollY);
    navigate(`/video/${videoId}`);
  };


  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.play(); // Page open hote hi video start
    }
}, [videoId]); // Jab bhi videoId change ho


<video 
    ref={videoRef} 
    onEnded={handleAutoPlayNext} // Video khatam hone par ye function chalega
    src={currentVideoUrl} 
/>

  // Unique categories from loaded videos
  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category).filter(Boolean)))];

  const filtered = videos.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'All' || v.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 bg-white shadow-sm"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <Filter size={13} className="text-slate-400 shrink-0 ml-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCat(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0
                  ${activeCategory === cat
                    ? 'bg-[#1d5ec2] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Algorithm hint banner — shows when personalization is active */}
      {!loading && videos.length > 0 && (
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-500">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Videos sorted by your watch preferences
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && filtered.map((video) => (
          <div key={video._id} onClick={() => handleVideoClick(video._id)} className="cursor-pointer">
            <VideoCard video={video} />
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 font-bold">
          {searchQuery || activeCategory !== 'All'
            ? 'No videos match your search/filter.'
            : 'No videos available yet.'}
        </div>
      )}
    </div>
  );
}
