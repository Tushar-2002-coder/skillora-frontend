import React, { useState } from 'react';
import api from '../api';
import { Plus, Trash2 } from 'lucide-react';

const emptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswerIndex: 0,
});

export default function QuizBuilder({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qIndex].options];
      opts[oIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (index) => setQuestions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    const invalidQuestion = questions.find(
      (q) => !q.questionText.trim() || q.options.some((o) => !o.trim())
    );
    if (invalidQuestion) {
      setError('Please fill in all questions and all 4 options for each question.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/quizzes', {
        title,
        description,
        sourceType: 'builder',
        questions,
        isLive,
        scheduledAt: isLive && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        durationMinutes,
      });

      setTitle('');
      setDescription('');
      setIsLive(false);
      setScheduledAt('');
      setQuestions([emptyQuestion()]);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Quiz Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Algebra Basics Quiz"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Description (optional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of this quiz"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
        />
      </div>

      <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <input
          type="checkbox"
          id="isLive"
          checked={isLive}
          onChange={(e) => setIsLive(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="isLive" className="text-sm font-bold text-indigo-800">
          Make this a scheduled Live Quiz Competition
        </label>
      </div>

      {isLive && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Question {qIndex + 1}</p>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <input
              value={q.questionText}
              onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
              placeholder="Type the question..."
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none mb-3 focus:ring-2 focus:ring-indigo-100"
            />

            <div className="space-y-2">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctAnswerIndex === oIndex}
                    onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
                    className="w-4 h-4 shrink-0"
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2">Select the radio button next to the correct answer.</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-bold"
      >
        <Plus size={16} /> Add Another Question
      </button>

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
        {saving ? 'Creating Quiz...' : 'Create Quiz'}
      </button>
    </form>
  );
}
