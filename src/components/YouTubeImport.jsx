
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import {
  Search, Save, RotateCcw, Copy, Download, Edit2, Trash2,
  ChevronLeft, ChevronRight, Sun, Moon, ExternalLink,
  CheckCircle, AlertCircle, Loader2, Youtube, Tag, Eye,
  ThumbsUp, MessageSquare, Clock, Calendar, Hash, Link,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === null || n === undefined) return 'N/A';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function useClipboard() {
  const [copied, setCopied] = useState('');
  const copy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };
  return { copy, copied };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CopyBtn({ value, label, dark }) {
  const { copy, copied } = useClipboard();
  return (
    <button
      onClick={() => copy(value, label)}
      title={`Copy ${label}`}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0
        ${dark
          ? 'bg-white/10 hover:bg-white/20 text-white'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
    >
      {copied === label ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied === label ? 'Copied!' : 'Copy'}
    </button>
  );
}

function Field({ label, value, icon: Icon, mono, dark, rows }) {
  if (!value && value !== 0) return null;
  return (
    <div className={`rounded-xl p-3 border ${dark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide ${dark ? 'text-white/50' : 'text-slate-400'}`}>
          {Icon && <Icon size={11} />} {label}
        </span>
        <CopyBtn value={String(value)} label={label} dark={dark} />
      </div>
      {rows ? (
        <p className={`text-xs leading-relaxed whitespace-pre-wrap line-clamp-4 ${dark ? 'text-white/80' : 'text-slate-700'} ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      ) : (
        <p className={`text-sm font-semibold break-all ${dark ? 'text-white' : 'text-slate-800'} ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </p>
      )}
    </div>
  );
}

function StatBadge({ icon: Icon, value, label, dark }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${dark ? 'bg-white/5' : 'bg-slate-50 border border-slate-200'}`}>
      <Icon size={15} className={dark ? 'text-white/50' : 'text-slate-400'} />
      <div>
        <p className={`text-xs font-black ${dark ? 'text-white' : 'text-slate-800'}`}>{fmt(value)}</p>
        <p className={`text-[10px] font-bold ${dark ? 'text-white/40' : 'text-slate-400'}`}>{label}</p>
      </div>
    </div>
  );
}

function ThumbnailCard({ label, url, dark }) {
  if (!url) return null;
  return (
    <div className={`rounded-xl overflow-hidden border ${dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
      <img src={url} alt={label} className="w-full aspect-video object-cover" />
      <div className={`px-3 py-2 flex items-center justify-between ${dark ? 'border-t border-white/10' : 'border-t border-slate-100'}`}>
        <span className={`text-[11px] font-bold ${dark ? 'text-white/60' : 'text-slate-500'}`}>{label}</span>
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition
            ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
        >
          <Download size={11} /> Download
        </a>
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({ video, onClose, onSaved, dark }) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || '');
  const [category, setCategory] = useState(video.category || 'General');
  const [tags, setTags] = useState((video.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      await api.put(`/youtube/video/${video._id}`, {
        title, description, category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const inp = `w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:ring-2 focus:ring-indigo-300 transition
    ${dark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/30' : 'bg-white border-slate-300 text-slate-800'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${dark ? 'bg-slate-800' : 'bg-white'}`}>
        <h3 className={`font-black text-base mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>Edit Video</h3>
        <div className="space-y-3">
          <input className={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
          <textarea className={inp} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
          <input className={inp} value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />
          <input className={inp} value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" />
        </div>
        {err && <p className="text-red-400 text-xs font-bold mt-3">{err}</p>}
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${dark ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-black bg-[#1d5ec2] hover:bg-[#154fa5] text-white transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Videos List ───────────────────────────────────────────────────────

function SavedVideoCard({ video, onDelete, onEdit, dark }) {
  const thumb = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  return (
    <div className={`rounded-2xl overflow-hidden border group transition hover:shadow-md
      ${dark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      <div className="relative aspect-video overflow-hidden">
        <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {video.durationText && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {video.durationText}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className={`text-sm font-bold leading-tight line-clamp-2 mb-1.5 ${dark ? 'text-white' : 'text-slate-800'}`}>
          {video.title}
        </p>
        <p className={`text-[11px] font-medium mb-2 ${dark ? 'text-white/50' : 'text-slate-400'}`}>
          {video.channelName || 'Skillora'} · {video.category}
        </p>
        <div className="flex gap-2">
          <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition
              ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
            <ExternalLink size={11} /> YouTube
          </a>
          <button onClick={() => onEdit(video)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition
              ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
            <Edit2 size={11} /> Edit
          </button>
          <button onClick={() => onDelete(video)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition ml-auto">
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function YouTubeImport() {
  const [dark, setDark] = useState(false);
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'library'
  const [editTarget, setEditTarget] = useState(null);

  // Library state
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingLib, setLoadingLib] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadLibrary = useCallback(async (p = 1, q = '') => {
    setLoadingLib(true);
    try {
      const res = await api.get(`/youtube/videos?page=${p}&limit=12&search=${encodeURIComponent(q)}`);
      setVideos(res.data.videos);
      setPagination(res.data.pagination);
    } catch (e) {
      showToast('error', 'Failed to load library.');
    } finally { setLoadingLib(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'library') loadLibrary(page, search);
  }, [activeTab, page, loadLibrary]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    setPage(1);
    setTimeout(() => loadLibrary(1, q), 400);
  };

  const handleFetch = async () => {
    if (!url.trim()) return showToast('error', 'Please paste a YouTube URL first.');
    setFetching(true);
    setVideoData(null);
    try {
      const res = await api.post('/youtube/fetch-video', { url });
      setVideoData(res.data);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to fetch video info.');
    } finally { setFetching(false); }
  };

  const handleSave = async () => {
    if (!videoData) return;
    setSaving(true);
    try {
      await api.post('/youtube/save-video', {
        title: videoData.title,
        description: videoData.description,
        youtubeUrl: videoData.youtubeUrl,
        videoId: videoData.videoId,
        embedUrl: videoData.embedUrl,
        durationSeconds: videoData.durationSeconds,
        durationText: videoData.durationText,
        thumbnailUrl: videoData.thumbnailUrl,
        channelName: videoData.channelName,
        publishDate: videoData.publishDate,
        category: videoData.category,
        tags: videoData.tags,
        slug: videoData.slug,
      });
      showToast('success', `"${videoData.title}" saved to Skillora library!`);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to save video.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (video) => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/youtube/video/${video._id}`);
      showToast('success', 'Video deleted.');
      loadLibrary(page, search);
    } catch (e) {
      showToast('error', 'Failed to delete video.');
    }
  };

  const handleReset = () => {
    setUrl('');
    setVideoData(null);
    setToast(null);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const bg    = dark ? 'bg-[#0f172a]' : 'bg-slate-50';
  const card  = dark ? 'bg-white/5 backdrop-blur-md border-white/10' : 'bg-white border-slate-200';
  const text  = dark ? 'text-white' : 'text-slate-900';
  const muted = dark ? 'text-white/50' : 'text-slate-400';
  const inp   = `w-full rounded-xl px-4 py-3 text-sm border outline-none transition focus:ring-2 focus:ring-[#1d5ec2]/40
    ${dark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/30' : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'}`;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-bold max-w-sm
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <EditModal
          video={editTarget}
          dark={dark}
          onClose={() => setEditTarget(null)}
          onSaved={() => loadLibrary(page, search)}
        />
      )}

      {/* ── Header ── */}
      <div className={`sticky top-0 z-10 border-b ${dark ? 'bg-[#0f172a]/90 border-white/10 backdrop-blur' : 'bg-white/90 border-slate-200 backdrop-blur'}`}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center">
              <Youtube className="text-white" size={18} />
            </div>
            <div>
              <h1 className={`text-base font-black leading-none ${text}`}>YouTube Import Tool</h1>
              <p className={`text-[11px] font-bold ${muted}`}>Skillora Admin · Video Library</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
              {['import', 'library'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black capitalize transition
                    ${activeTab === t
                      ? 'bg-[#1d5ec2] text-white shadow-sm'
                      : `${muted} hover:${text}`}`}>
                  {t === 'import' ? '⬆ Import' : '📚 Library'}
                </button>
              ))}
            </div>

            {/* Dark mode toggle */}
            <button onClick={() => setDark(d => !d)}
              className={`p-2 rounded-xl transition ${dark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">

        {/* ══════════════ IMPORT TAB ══════════════ */}
        {activeTab === 'import' && (
          <div className="space-y-6">

            {/* URL Input Card */}
            <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
              <h2 className={`text-base font-black mb-4 ${text}`}>Paste YouTube URL</h2>
              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFetch()}
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                  className={inp}
                />
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleFetch} disabled={fetching || !url.trim()}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black bg-[#1d5ec2] hover:bg-[#154fa5] text-white transition disabled:opacity-40 shrink-0">
                    {fetching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    {fetching ? 'Fetching...' : 'Fetch'}
                  </button>
                  <button onClick={handleReset}
                    className={`p-3 rounded-xl transition ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                    title="Reset">
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
              <p className={`text-[11px] mt-2 font-medium ${muted}`}>
                Supports: youtube.com/watch?v= · youtu.be/ · youtube.com/shorts/
              </p>
            </div>

            {/* Loading skeleton */}
            {fetching && (
              <div className={`rounded-2xl border p-6 shadow-sm animate-pulse ${card}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="aspect-video rounded-xl bg-slate-200 dark:bg-white/10" />
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className={`h-10 rounded-xl ${dark ? 'bg-white/10' : 'bg-slate-100'}`} />)}
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {videoData && !fetching && (
              <>
                {/* Type badge */}
                {videoData.isShort && (
                  <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 text-xs font-black px-3 py-1.5 rounded-full border border-purple-500/30">
                    ⚡ YouTube Short detected
                  </div>
                )}

                {/* Top grid: preview + core info */}
                <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Embedded Player */}
                    <div>
                      <p className={`text-xs font-black uppercase tracking-wide mb-2 ${muted}`}>Preview</p>
                      <div className="aspect-video rounded-xl overflow-hidden bg-black">
                        <iframe
                          src={videoData.embedUrl}
                          title={videoData.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>

                    {/* Core fields */}
                    <div className="space-y-2">
                      <Field label="Title" value={videoData.title} icon={Hash} dark={dark} />
                      <Field label="Video ID" value={videoData.videoId} icon={Hash} mono dark={dark} />
                      <Field label="Channel" value={`${videoData.channelName} (${videoData.channelId})`} dark={dark} />
                      <Field label="Embed URL" value={videoData.embedUrl} icon={Link} mono dark={dark} />
                      <Field label="Slug" value={videoData.slug} icon={Tag} mono dark={dark} />
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBadge icon={Eye} value={videoData.viewCount} label="Views" dark={dark} />
                  <StatBadge icon={ThumbsUp} value={videoData.likeCount} label="Likes" dark={dark} />
                  <StatBadge icon={MessageSquare} value={videoData.commentCount} label="Comments" dark={dark} />
                  <StatBadge icon={Clock} value={videoData.durationText} label="Duration" dark={dark} />
                </div>

                {/* More details */}
                <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                  <p className={`text-xs font-black uppercase tracking-wide mb-4 ${muted}`}>Full Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="YouTube URL" value={videoData.youtubeUrl} icon={Link} mono dark={dark} />
                    <Field label="Category" value={`${videoData.category} (ID: ${videoData.categoryId})`} icon={Tag} dark={dark} />
                    <Field label="Published Date" value={new Date(videoData.publishDate).toLocaleString()} icon={Calendar} dark={dark} />
                    <Field label="Duration (ISO)" value={videoData.durationIso} mono dark={dark} />
                    <Field label="Duration Seconds" value={videoData.durationSeconds} mono dark={dark} />
                    <Field label="Channel ID" value={videoData.channelId} mono dark={dark} />
                    {videoData.isShort && <Field label="Shorts URL" value={videoData.shortUrl} mono dark={dark} />}
                  </div>

                  {videoData.tags?.length > 0 && (
                    <div className="mt-3">
                      <p className={`text-[11px] font-black uppercase tracking-wide mb-2 ${muted}`}>Tags ({videoData.tags.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {videoData.tags.map((t, i) => (
                          <span key={i} className={`text-[11px] font-bold px-2 py-0.5 rounded-full border
                            ${dark ? 'bg-white/10 border-white/20 text-white/70' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <Field label="Description" value={videoData.description} rows dark={dark} />
                  </div>
                </div>

                {/* Embed HTML */}
                <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-black uppercase tracking-wide ${muted}`}>Embed HTML Code</p>
                    <CopyBtn value={videoData.embedHtml} label="Embed HTML" dark={dark} />
                  </div>
                  <pre className={`text-xs p-3 rounded-xl overflow-x-auto font-mono leading-relaxed
                    ${dark ? 'bg-black/30 text-green-400' : 'bg-slate-900 text-green-300'}`}>
                    {videoData.embedHtml}
                  </pre>
                </div>

                {/* Thumbnails */}
                <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                  <p className={`text-xs font-black uppercase tracking-wide mb-4 ${muted}`}>Thumbnails</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(videoData.thumbnails).map(([key, url]) => (
                      <ThumbnailCard key={key} label={key} url={url} dark={dark} />
                    ))}
                  </div>
                </div>

                {/* Save / Reset buttons */}
                <div className="flex gap-3 pb-4">
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black bg-emerald-500 hover:bg-emerald-600 text-white transition disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving to Skillora...' : 'Save to Skillora Library'}
                  </button>
                  <button onClick={handleReset}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black transition
                      ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════ LIBRARY TAB ══════════════ */}
        {activeTab === 'library' && (
          <div className="space-y-5">
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${muted}`} />
                <input
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by title, channel or category..."
                  className={`${inp} pl-10`}
                />
              </div>
              <button onClick={() => loadLibrary(page, search)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#1d5ec2] text-white hover:bg-[#154fa5] transition shrink-0">
                <RotateCcw size={14} /> Refresh
              </button>
            </div>

            {loadingLib && (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#1d5ec2]" size={32} />
              </div>
            )}

            {!loadingLib && videos.length === 0 && (
              <div className={`text-center py-20 rounded-2xl border ${card}`}>
                <Youtube className={`mx-auto mb-3 ${muted}`} size={36} />
                <p className={`font-bold text-sm ${muted}`}>No videos found.</p>
              </div>
            )}

            {!loadingLib && videos.length > 0 && (
              <>
                <p className={`text-xs font-bold ${muted}`}>
                  {pagination?.total} video{pagination?.total !== 1 ? 's' : ''} found
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {videos.map(v => (
                    <SavedVideoCard key={v._id} video={v} dark={dark}
                      onDelete={handleDelete}
                      onEdit={setEditTarget} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
                      className={`p-2 rounded-xl transition disabled:opacity-30
                        ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <ChevronLeft size={18} />
                    </button>
                    <span className={`text-sm font-bold ${muted}`}>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                      className={`p-2 rounded-xl transition disabled:opacity-30
                        ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
