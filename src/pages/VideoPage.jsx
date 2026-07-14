import { useState, useEffect, useRef, useCallback } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_VIDEOS = [
  { _id: "v1", title: "Distillation Column Design – Part 1", category: "Mass Transfer", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg", youtubeId: "dQw4w9WgXcQ", duration: "18:42", views: 4820, instructor: "Dr. Sharma" },
  { _id: "v2", title: "Distillation Column Design – Part 2", category: "Mass Transfer", thumbnail: "https://img.youtube.com/vi/3JZ_D3ELwOQ/mqdefault.jpg", youtubeId: "3JZ_D3ELwOQ", duration: "22:10", views: 3910, instructor: "Dr. Sharma" },
  { _id: "v3", title: "McCabe-Thiele Method Explained", category: "Mass Transfer", thumbnail: "https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg", youtubeId: "L_jWHffIx5E", duration: "14:55", views: 2750, instructor: "Prof. Rao" },
  { _id: "v4", title: "Heat Exchanger Fundamentals", category: "Heat Transfer", thumbnail: "https://img.youtube.com/vi/fJ37QL7cb7g/mqdefault.jpg", youtubeId: "fJ37QL7cb7g", duration: "20:30", views: 5100, instructor: "Dr. Patel" },
  { _id: "v5", title: "Shell & Tube HX Design", category: "Heat Transfer", thumbnail: "https://img.youtube.com/vi/SXH46niK9zs/mqdefault.jpg", youtubeId: "SXH46niK9zs", duration: "25:18", views: 3300, instructor: "Dr. Patel" },
  { _id: "v6", title: "Bernoulli's Equation Applications", category: "Fluid Mechanics", thumbnail: "https://img.youtube.com/vi/gUhd7oILFdg/mqdefault.jpg", youtubeId: "gUhd7oILFdg", duration: "16:05", views: 6200, instructor: "Prof. Kumar" },
  { _id: "v7", title: "Pipe Flow & Head Loss", category: "Fluid Mechanics", thumbnail: "https://img.youtube.com/vi/5jLQ4znrKSg/mqdefault.jpg", youtubeId: "5jLQ4znrKSg", duration: "19:40", views: 4100, instructor: "Prof. Kumar" },
  { _id: "v8", title: "Reaction Rate & Order", category: "Chemical Kinetics", thumbnail: "https://img.youtube.com/vi/0mRkFXYQSHs/mqdefault.jpg", youtubeId: "0mRkFXYQSHs", duration: "21:15", views: 3800, instructor: "Dr. Nair" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRelatedVideos(currentVideo, allVideos) {
  const sameCategory = allVideos.filter(
    (v) => v._id !== currentVideo._id && v.category === currentVideo.category
  );
  const others = allVideos
    .filter((v) => v._id !== currentVideo._id && v.category !== currentVideo.category)
    .sort((a, b) => b.views - a.views);
  const combined = [...sameCategory, ...others];
  return combined.slice(0, 6);
}

function formatViews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n;
}

// ─── WatchHistory tracker (simulated backend) ─────────────────────────────────
function useWatchHistory(videoId) {
  const watchedSecondsRef = useRef(0);
  const intervalRef = useRef(null);

  const startTracking = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      watchedSecondsRef.current += 15;
      // Simulated backend call
      const payload = { videoId, watchedSeconds: watchedSecondsRef.current };
      console.log("[WatchHistory] Sending to backend:", payload);

      // In real Skillora: fetch('/api/watch-history', { method:'POST', body: JSON.stringify(payload), ... })
      // Formula on backend: completionRate = watchedSeconds / totalDuration * 100
      // If completionRate >= 80% → mark as completed, award XP

      // Update localStorage history
      try {
        const stored = JSON.parse(localStorage.getItem("sk_watch_history") || "{}");
        stored[videoId] = {
          watchedSeconds: watchedSecondsRef.current,
          lastWatched: Date.now(),
        };
        localStorage.setItem("sk_watch_history", JSON.stringify(stored));
      } catch (_) {}
    }, 15000);
  }, [videoId]);

  const stopTracking = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const resetTracking = useCallback(() => {
    stopTracking();
    watchedSecondsRef.current = 0;
  }, [stopTracking]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return { startTracking, stopTracking, resetTracking };
}

// ─── Countdown Overlay ────────────────────────────────────────────────────────
function CountdownOverlay({ nextVideo, onPlayNow, onCancel }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) { onPlayNow(); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onPlayNow]);

  return (
    <div className="countdown-overlay">
      <div className="countdown-card">
        <p className="countdown-label">Up Next</p>
        <div className="countdown-thumb-row">
          <img src={nextVideo.thumbnail} alt={nextVideo.title} className="countdown-thumb" />
          <div className="countdown-meta">
            <p className="countdown-title">{nextVideo.title}</p>
            <p className="countdown-sub">{nextVideo.instructor} · {nextVideo.duration}</p>
          </div>
        </div>
        <div className="countdown-ring">
          <svg viewBox="0 0 56 56" width="64" height="64">
            <circle cx="28" cy="28" r="24" fill="none" stroke="#ffffff22" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24" fill="none"
              stroke="#6C63FF" strokeWidth="4"
              strokeDasharray={`${(count / 5) * 150.8} 150.8`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dasharray 0.9s linear" }}
            />
          </svg>
          <span className="countdown-num">{count}</span>
        </div>
        <div className="countdown-actions">
          <button className="btn-playnow" onClick={onPlayNow}>▶ Play Now</button>
          <button className="btn-cancel" onClick={onCancel}>✕ Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Related Video Card ───────────────────────────────────────────────────────
function RelatedCard({ video, isNext, onClick }) {
  return (
    <div className="related-card" onClick={() => onClick(video)}>
      <div className="related-thumb-wrap">
        <img src={video.thumbnail} alt={video.title} className="related-thumb" />
        <span className="related-duration">{video.duration}</span>
        {isNext && <span className="upnext-badge">▶ Up Next</span>}
      </div>
      <div className="related-info">
        <p className="related-title">{video.title}</p>
        <p className="related-instructor">{video.instructor}</p>
        <p className="related-meta">{video.category} · {formatViews(video.views)} views</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VideoPage({ initialVideoId = "v1" }) {
  const [currentVideo, setCurrentVideo] = useState(
    () => MOCK_VIDEOS.find((v) => v._id === initialVideoId) || MOCK_VIDEOS[0]
  );
  const [autoplay, setAutoplay] = useState(
    () => localStorage.getItem("sk_autoplay") !== "false"
  );
  const [showCountdown, setShowCountdown] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // force remount on video change
  const countdownTriggered = useRef(false);
  const { startTracking, stopTracking, resetTracking } = useWatchHistory(currentVideo._id);

  const relatedVideos = getRelatedVideos(currentVideo, MOCK_VIDEOS);
  const nextVideo = relatedVideos[0];

  // YouTube embed URL with autoplay
  const embedUrl = `https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`;

  // Toggle autoplay & persist
  const toggleAutoplay = () => {
    setAutoplay((prev) => {
      const next = !prev;
      localStorage.setItem("sk_autoplay", String(next));
      return next;
    });
    setShowCountdown(false);
  };

  // Navigate to a video
  const navigateTo = (video) => {
    resetTracking();
    setShowCountdown(false);
    countdownTriggered.current = false;
    setCurrentVideo(video);
    setIframeKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Simulate "video ending" detection via postMessage (YouTube API)
  // In a real app, use YT.Player onStateChange event
  useEffect(() => {
    const handler = (e) => {
      if (typeof e.data !== "string") return;
      try {
        const d = JSON.parse(e.data);
        // YT fires info.playerState === 0 when ended
        if (d.info?.playerState === 0 && autoplay && nextVideo && !countdownTriggered.current) {
          countdownTriggered.current = true;
          stopTracking();
          setShowCountdown(true);
        }
      } catch (_) {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [autoplay, nextVideo, stopTracking]);

  // Start tracking when video loads
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [currentVideo._id, startTracking, stopTracking]);

  // Demo: trigger countdown after 8s for showcase purposes
  // (Remove this in production — use real YT ended event above)
  const demoCountdown = () => {
    if (!autoplay || !nextVideo || countdownTriggered.current) return;
    countdownTriggered.current = true;
    stopTracking();
    setShowCountdown(true);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="vp-root">
        {/* ── Header ── */}
        <header className="vp-header">
          <div className="vp-logo">
            <span className="logo-s">S</span>killora
          </div>
          <div className="vp-header-right">
            <button
              className={`autoplay-toggle ${autoplay ? "on" : "off"}`}
              onClick={toggleAutoplay}
              title="Toggle Autoplay"
            >
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-label">Autoplay {autoplay ? "ON" : "OFF"}</span>
            </button>
          </div>
        </header>

        {/* ── Layout ── */}
        <main className="vp-layout">
          {/* Left: Player + Info */}
          <section className="vp-main">
            {/* Player */}
            <div className="player-wrap">
              <iframe
                key={iframeKey}
                src={embedUrl}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="player-iframe"
              />

              {/* Countdown overlay */}
              {showCountdown && nextVideo && (
                <CountdownOverlay
                  nextVideo={nextVideo}
                  onPlayNow={() => { setShowCountdown(false); navigateTo(nextVideo); }}
                  onCancel={() => { setShowCountdown(false); countdownTriggered.current = false; startTracking(); }}
                />
              )}
            </div>

            {/* Video Info */}
            <div className="vp-info">
              <div className="vp-category-chip">{currentVideo.category}</div>
              <h1 className="vp-title">{currentVideo.title}</h1>
              <div className="vp-meta-row">
                <div className="vp-instructor">
                  <div className="avatar">{currentVideo.instructor[0]}</div>
                  <span>{currentVideo.instructor}</span>
                </div>
                <div className="vp-stats">
                  <span>👁 {formatViews(currentVideo.views)} views</span>
                  <span>⏱ {currentVideo.duration}</span>
                </div>
              </div>

              {/* Demo button — remove in prod */}
              <div className="demo-bar">
                <span className="demo-hint">🧪 Demo: Simulate video ending</span>
                <button className="demo-btn" onClick={demoCountdown}>
                  Trigger Countdown
                </button>
              </div>
            </div>
          </section>

          {/* Right: Related Videos */}
          <aside className="vp-sidebar">
            <div className="sidebar-head">
              <h2 className="sidebar-title">Up Next</h2>
              <span className="sidebar-sub">{currentVideo.category} & more</span>
            </div>
            <div className="related-list">
              {relatedVideos.map((v, i) => (
                <RelatedCard
                  key={v._id}
                  video={v}
                  isNext={i === 0 && autoplay}
                  onClick={navigateTo}
                />
              ))}
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .vp-root {
    min-height: 100vh;
    background: #0f0f13;
    color: #e8e8f0;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }

  /* ── Header ── */
  .vp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    background: #16161e;
    border-bottom: 1px solid #ffffff0f;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .vp-logo { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.5px; }
  .logo-s {
    display: inline-block;
    background: linear-gradient(135deg, #6C63FF, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Autoplay Toggle */
  .autoplay-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 20px;
    transition: background 0.2s;
    color: #e8e8f0;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .autoplay-toggle:hover { background: #ffffff10; }
  .toggle-track {
    width: 40px;
    height: 22px;
    border-radius: 11px;
    background: #333;
    position: relative;
    transition: background 0.25s;
    flex-shrink: 0;
  }
  .autoplay-toggle.on .toggle-track { background: #6C63FF; }
  .toggle-thumb {
    position: absolute;
    top: 3px; left: 3px;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.25s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 1px 4px #0005;
  }
  .autoplay-toggle.on .toggle-thumb { transform: translateX(18px); }
  .toggle-label { white-space: nowrap; }
  .autoplay-toggle.on .toggle-label { color: #a78bfa; }

  /* ── Layout ── */
  .vp-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
    max-width: 1320px;
    margin: 0 auto;
    padding: 24px 20px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .vp-layout { grid-template-columns: 1fr; }
  }

  /* ── Player ── */
  .player-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
  }
  .player-iframe {
    width: 100%; height: 100%;
    border: none;
    display: block;
  }

  /* ── Video Info ── */
  .vp-info {
    padding: 18px 0 0;
  }
  .vp-category-chip {
    display: inline-block;
    background: #6C63FF22;
    color: #a78bfa;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 10px;
    border: 1px solid #6C63FF44;
  }
  .vp-title {
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.35;
    margin-bottom: 14px;
    color: #f0f0f8;
  }
  .vp-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  .vp-instructor {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.88rem;
    color: #b0b0c0;
    font-weight: 500;
  }
  .avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6C63FF, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }
  .vp-stats {
    display: flex;
    gap: 16px;
    font-size: 0.82rem;
    color: #888;
  }

  /* Demo bar */
  .demo-bar {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    background: #1e1e2e;
    border: 1px dashed #6C63FF55;
    border-radius: 10px;
    padding: 12px 16px;
  }
  .demo-hint { font-size: 0.8rem; color: #888; }
  .demo-btn {
    background: #6C63FF;
    color: #fff;
    border: none;
    padding: 6px 16px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }
  .demo-btn:hover { background: #5a52e0; }

  /* ── Sidebar ── */
  .vp-sidebar {
    background: #16161e;
    border-radius: 14px;
    border: 1px solid #ffffff0a;
    overflow: hidden;
  }
  .sidebar-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 16px 18px 12px;
    border-bottom: 1px solid #ffffff0a;
  }
  .sidebar-title {
    font-size: 1rem;
    font-weight: 700;
    color: #f0f0f8;
  }
  .sidebar-sub { font-size: 0.75rem; color: #666; }
  .related-list { display: flex; flex-direction: column; }

  /* ── Related Card ── */
  .related-card {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #ffffff06;
    transition: background 0.18s;
  }
  .related-card:last-child { border-bottom: none; }
  .related-card:hover { background: #ffffff08; }
  .related-thumb-wrap {
    position: relative;
    flex-shrink: 0;
    width: 120px;
    height: 68px;
    border-radius: 8px;
    overflow: hidden;
    background: #0f0f13;
  }
  .related-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
  .related-duration {
    position: absolute;
    bottom: 4px; right: 4px;
    background: #000a;
    color: #fff;
    font-size: 0.68rem;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 4px;
  }
  .upnext-badge {
    position: absolute;
    top: 4px; left: 4px;
    background: #6C63FF;
    color: #fff;
    font-size: 0.62rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.4px;
  }
  .related-info { flex: 1; min-width: 0; }
  .related-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: #e0e0f0;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 4px;
  }
  .related-instructor { font-size: 0.73rem; color: #888; margin-bottom: 2px; }
  .related-meta { font-size: 0.7rem; color: #555; }

  /* ── Countdown Overlay ── */
  .countdown-overlay {
    position: absolute;
    inset: 0;
    background: #000000cc;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .countdown-card {
    background: #1a1a28;
    border: 1px solid #6C63FF33;
    border-radius: 16px;
    padding: 24px 28px;
    max-width: 340px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px #00000088;
  }
  .countdown-label {
    font-size: 0.72rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #6C63FF;
    font-weight: 700;
    margin-bottom: 14px;
  }
  .countdown-thumb-row {
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    margin-bottom: 20px;
  }
  .countdown-thumb {
    width: 80px;
    height: 46px;
    object-fit: cover;
    border-radius: 7px;
    flex-shrink: 0;
  }
  .countdown-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: #e8e8f0;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .countdown-sub { font-size: 0.72rem; color: #666; margin-top: 3px; }
  .countdown-ring {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .countdown-num {
    position: absolute;
    font-size: 1.5rem;
    font-weight: 800;
    color: #f0f0f8;
  }
  .countdown-actions { display: flex; gap: 12px; justify-content: center; }
  .btn-playnow {
    background: #6C63FF;
    color: #fff;
    border: none;
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-playnow:hover { background: #5a52e0; transform: translateY(-1px); }
  .btn-cancel {
    background: transparent;
    color: #888;
    border: 1px solid #333;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-cancel:hover { color: #e8e8f0; border-color: #555; }
`;
