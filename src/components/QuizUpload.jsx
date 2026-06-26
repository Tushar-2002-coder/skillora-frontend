import React, { useState, useRef } from 'react';
import api from '../api';
import { UploadCloud, FileCode } from 'lucide-react';

export default function QuizUpload({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('Please upload a .html file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('File is too large (max 4MB).');
      return;
    }

    setError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => setHtmlContent(event.target.result);
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    if (!htmlContent) {
      setError('Please select an HTML quiz file to upload.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/quizzes', {
        title,
        description,
        sourceType: 'html',
        htmlContent,
      });

      setTitle('');
      setDescription('');
      setFileName('');
      setHtmlContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-4 py-3 rounded-xl">
        Your HTML quiz file should call <code className="bg-amber-100 px-1.5 py-0.5 rounded">window.parent.postMessage(&#123; type: 'QUIZ_SCORE', score, totalMarks &#125;, '*')</code> when the student finishes, so the score gets saved automatically.
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Quiz Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Chapter 5 - Final Quiz"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Description (optional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of this quiz"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">HTML Quiz File</label>
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl px-4 py-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
          <input ref={fileInputRef} type="file" accept=".html,.htm" onChange={handleFileChange} className="hidden" />
          {fileName ? (
            <>
              <FileCode className="text-indigo-500" size={28} />
              <p className="text-sm font-bold text-slate-700">{fileName}</p>
              <p className="text-xs text-slate-400">Click to choose a different file</p>
            </>
          ) : (
            <>
              <UploadCloud className="text-slate-400" size={28} />
              <p className="text-sm font-bold text-slate-500">Click to select your .html quiz file</p>
            </>
          )}
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#1d5ec2] hover:bg-[#154fa5] disabled:bg-blue-300 text-white py-3 rounded-xl text-sm font-black transition"
      >
        {saving ? 'Uploading...' : 'Upload Quiz'}
      </button>
    </form>
  );
}
