import React from 'react';

// Seconds ko MM:SS format mein convert karta hai
function formatDuration(totalSeconds) {
  if (!totalSeconds) return '--:--';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video }) {
  return (
    <div className="group cursor-pointer space-y-3">
      {/* Thumbnail Area */}
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-md bg-slate-100">
        <img 
          src={video.thumbnailUrl || 'https://placehold.co/400x225?text=Skillora'} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded">
          {formatDuration(video.durationInSeconds)}
        </span>
      </div>

      {/* Meta-info */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-xs font-black text-slate-500">
          S
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">
            {video.title}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Skillora Learning • {video.views || 0} views
          </p>
        </div>
      </div>
    </div>
  );
}