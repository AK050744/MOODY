import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { journalAPI } from '../services/api';
import { Plus, BookOpen, Trash2, Edit3, Calendar, Tag, Flame, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MOOD_CONFIG = {
  great:    { emoji: '🤩', color: 'text-green-400 bg-green-500/20' },
  good:     { emoji: '😊', color: 'text-teal-400 bg-teal-500/20' },
  okay:     { emoji: '😐', color: 'text-yellow-400 bg-yellow-500/20' },
  bad:      { emoji: '😟', color: 'text-orange-400 bg-orange-500/20' },
  terrible: { emoji: '😢', color: 'text-red-400 bg-red-500/20' },
};

export default function Journal() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', mood: 'okay', tags: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [entriesRes, analyticsRes, promptRes] = await Promise.allSettled([
          journalAPI.getAll({ limit: 20 }),
          journalAPI.getAnalytics(),
          journalAPI.getPrompt(),
        ]);
        if (entriesRes.status === 'fulfilled') setEntries(entriesRes.value.data.data || []);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.analytics);
        if (promptRes.status === 'fulfilled') setPrompt(promptRes.value.data.prompt);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return toast.error('Please write something first');
    setSubmitting(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await journalAPI.create({ ...form, tags });
      setEntries((prev) => [data.data, ...prev]);
      setForm({ title: '', content: '', mood: 'okay', tags: '' });
      setWriting(false);
      toast.success('Journal entry saved! ✍️');
    } catch {
      toast.error('Could not save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await journalAPI.delete(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      setDeleteId(null);
      toast.success('Entry deleted');
    } catch {
      toast.error('Could not delete entry');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl gradient-text">My Journal</h1>
          <p className="text-white/40 text-sm mt-0.5">Your private space to reflect and grow</p>
        </div>
        <button onClick={() => setWriting(!writing)} id="journal-new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Analytics Strip */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Entries', value: analytics.totalEntries, icon: BookOpen },
            { label: 'Total Words', value: analytics.totalWords?.toLocaleString(), icon: Edit3 },
            { label: 'Writing Streak', value: `${analytics.currentStreak} days`, icon: Flame },
            { label: 'Avg Per Entry', value: `${analytics.avgWordsPerEntry} words`, icon: Tag },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass p-4 flex items-center gap-3">
              <Icon size={16} className="text-moody-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">{value}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Daily Prompt */}
      {prompt && !writing && (
        <div className="glass p-5 border border-moody-500/20 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-moody-300 mb-1 uppercase tracking-wider">Today's Reflection Prompt</p>
            <p className="text-white/80 text-sm leading-relaxed italic">{prompt}</p>
          </div>
          <button
            onClick={() => { setForm(f => ({ ...f, content: prompt + '\n\n' })); setWriting(true); }}
            className="flex-shrink-0 btn-secondary text-xs py-1.5 px-3"
          >
            Use Prompt
          </button>
        </div>
      )}

      {/* Write Form */}
      {writing && (
        <div className="glass p-6 animate-slide-up">
          <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <Edit3 size={16} className="text-moody-400" /> New Entry
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title (optional)"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field"
            />

            <textarea
              rows={8}
              placeholder="What's on your mind? Write freely — this is just for you..."
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              id="journal-content"
              className="input-field resize-none leading-relaxed"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Mood</label>
                <select
                  value={form.mood}
                  onChange={(e) => setForm(f => ({ ...f, mood: e.target.value }))}
                  className="input-field text-sm"
                >
                  {Object.entries(MOOD_CONFIG).map(([key, { emoji }]) => (
                    <option key={key} value={key} className="bg-gray-900">{emoji} {key.charAt(0).toUpperCase() + key.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="gratitude, work, anxiety..."
                  value={form.tags}
                  onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitting} id="journal-save" className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✍️ Save Entry'}
              </button>
              <button type="button" onClick={() => setWriting(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-moody-500/30 border-t-moody-500 rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-5xl mb-4">📓</div>
          <p className="text-white/50 font-medium mb-2">No entries yet</p>
          <p className="text-white/30 text-sm">Start writing your first journal entry above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const moodCfg = MOOD_CONFIG[entry.mood] || MOOD_CONFIG.okay;
            return (
              <div key={entry._id} className="glass-hover p-5 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {entry.mood && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${moodCfg.color}`}>
                          {moodCfg.emoji} {entry.mood}
                        </span>
                      )}
                      <span className="text-xs text-white/30 flex items-center gap-1">
                        <Calendar size={10} />
                        {entry.entryDate ? format(new Date(entry.entryDate), 'MMM d, yyyy') : ''}
                      </span>
                      {entry.wordCount > 0 && (
                        <span className="text-xs text-white/20">{entry.wordCount} words</span>
                      )}
                    </div>
                    {entry.title && (
                      <h3 className="font-semibold text-white text-sm mb-1">{entry.title}</h3>
                    )}
                    <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">{entry.content}</p>
                    {entry.tags?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {entry.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDeleteId(entry._id)}
                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass p-6 rounded-2xl max-w-sm w-full animate-slide-up">
            <h3 className="font-display font-bold text-lg text-white mb-2">Delete Entry?</h3>
            <p className="text-white/50 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1 text-sm">Delete</button>
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
