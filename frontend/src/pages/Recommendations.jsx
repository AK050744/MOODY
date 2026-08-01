import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMood } from '../context/MoodContext';
import ContentCard from '../components/ContentCard';
import { recommendationAPI } from '../services/api';
import { RefreshCw, Film, Music, Mic, Book, Gamepad2, Dumbbell, Brain, Zap, Youtube, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'songs', label: 'Music', icon: Music },
  { id: 'podcasts', label: 'Podcasts', icon: Mic },
  { id: 'audiobooks', label: 'Audiobooks', icon: Book },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'activities', label: 'Activities', icon: Dumbbell },
  { id: 'meditation', label: 'Meditate', icon: Brain },
  { id: 'motivational', label: 'Motivational', icon: Zap },
];

export default function Recommendations() {
  const navigate = useNavigate();
  const { recommendations, fetchRecommendations } = useMood();
  const [activeTab, setActiveTab] = useState('movies');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(!recommendations);

  useEffect(() => {
    if (!recommendations) {
      setLoading(true);
      fetchRecommendations().finally(() => setLoading(false));
    }
  }, [recommendations, fetchRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await recommendationAPI.refresh();
      await fetchRecommendations();
      toast.success('Recommendations refreshed! 🔄');
    } catch {
      toast.error('Could not refresh. Try again after checking in.');
    } finally {
      setRefreshing(false);
    }
  };

  const currentItems = recommendations?.[activeTab] || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 border-moody-500/30 border-t-moody-500 rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Loading your personalized content...</p>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="font-display font-bold text-2xl text-white mb-3">No recommendations yet</h2>
        <p className="text-white/50 text-sm mb-6">Complete a mood check-in to get personalized content curated just for you.</p>
        <button onClick={() => navigate('/checkin')} className="btn-primary">Start Mood Check-in</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display font-black text-3xl gradient-text mb-1">Curated For You</h1>
          {recommendations.moodContext && (
            <p className="text-white/50 text-sm flex items-center gap-2">
              <Sparkles size={12} className="text-moody-400" />
              Based on your <span className="text-white capitalize">{recommendations.moodContext.primaryEmotion}</span> mood
              · Rating {recommendations.moodContext.moodRating}/10
            </p>
          )}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          id="recs-refresh"
          className="btn-secondary flex items-center gap-2 text-sm py-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => {
          const count = recommendations[id]?.length || 0;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              id={`tab-${id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                activeTab === id
                  ? 'bg-moody-600/50 border border-moody-500/50 text-white'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              <Icon size={14} />
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-white/20' : 'bg-white/10'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentItems.map((item, idx) => (
            <ContentCard
              key={item.externalId || idx}
              item={item}
              category={activeTab.replace('s', '')}
              recommendationId={recommendations._id}
            />
          ))}
        </div>
      ) : (
        <div className="glass p-12 text-center rounded-2xl">
          <div className="text-5xl mb-4">
            {TABS.find(t => t.id === activeTab)?.icon ? '🎭' : '📭'}
          </div>
          <p className="text-white/50 font-medium mb-1">No {activeTab} found right now</p>
          <p className="text-white/30 text-sm">Try refreshing or check back after your next mood check-in.</p>
        </div>
      )}

      {/* Mood context footer */}
      {recommendations.moodContext && (
        <div className="mt-8 glass p-4 rounded-xl flex items-center gap-4 text-sm text-white/40">
          <Sparkles size={14} className="text-moody-400 flex-shrink-0" />
          <p>These recommendations were generated based on your <strong className="text-white/60 capitalize">{recommendations.moodContext.primaryEmotion}</strong> mood
          ({recommendations.moodContext.overallSentiment?.replace('-', ' ')}).
          Rate items to improve future recommendations.</p>
        </div>
      )}
    </div>
  );
}
