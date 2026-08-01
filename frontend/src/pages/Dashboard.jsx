import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { moodAPI } from '../services/api';
import MoodOrb from '../components/MoodOrb';
import MoodChart from '../components/MoodChart';
import { Brain, Sparkles, BookOpen, MessageCircle, TrendingUp, AlertTriangle, ArrowRight, Calendar, Flame } from 'lucide-react';

const quickActions = [
  { icon: Brain, label: 'Check In', desc: 'How are you feeling?', to: '/checkin', color: 'from-moody-500 to-purple-600' },
  { icon: Sparkles, label: 'For You', desc: 'Your recommendations', to: '/recommendations', color: 'from-pink-500 to-rose-600' },
  { icon: MessageCircle, label: 'AI Chat', desc: 'Talk it out', to: '/chat', color: 'from-calm-500 to-teal-600' },
  { icon: BookOpen, label: 'Journal', desc: 'Write your thoughts', to: '/journal', color: 'from-yellow-500 to-orange-500' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { fetchAnalytics } = useMood();
  const [analytics, setAnalytics] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsData, historyData] = await Promise.allSettled([
          fetchAnalytics(14),
          moodAPI.getHistory({ limit: 7 }),
        ]);

        if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
        if (historyData.status === 'fulfilled') setRecentMoods(historyData.value.data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    loadData();
  }, [fetchAnalytics]);

  const latestMood = recentMoods[0];
  const emotion = latestMood?.aiAnalysis?.primaryEmotion || 'neutral';
  const moodRating = latestMood?.moodRating || 5;

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const moodTrendColor = {
    positive: 'text-green-400',
    neutral: 'text-yellow-400',
    'needs-attention': 'text-red-400',
  }[analytics?.moodTrend] || 'text-white/40';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Burnout Alert */}
      {analytics?.burnoutAlert && (
        <div className="glass border border-red-500/30 bg-red-500/10 p-4 rounded-2xl flex items-center gap-4 animate-slide-up">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-300 text-sm">Burnout Risk Detected</p>
            <p className="text-white/50 text-xs mt-0.5">You've had high stress for {analytics.consecutiveHighStressDays} days in a row. Consider taking a break and using calm mode.</p>
          </div>
          <Link to="/calm" className="ml-auto flex-shrink-0 btn-danger text-xs py-1.5 px-3">Calm Mode</Link>
        </div>
      )}

      {/* Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Greeting Card */}
        <div className="lg:col-span-2 glass p-6 sm:p-8 relative overflow-hidden">
          <div className="bg-orb w-48 h-48 bg-moody-600 top-0 right-0 opacity-10" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-white/40 text-sm font-medium mb-1">{greetingTime()},</p>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
                  {user?.name?.split(' ')[0]} 👋
                </h1>
                {latestMood ? (
                  <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                    Last check-in: <span className="text-white capitalize font-medium">{emotion}</span> · {moodRating}/10
                    {latestMood.aiAnalysis?.summary && (
                      <span className="block mt-2 text-white/40 text-xs italic line-clamp-2">{latestMood.aiAnalysis.summary}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-white/50 text-sm">Ready for your first mood check-in? 🌱</p>
                )}
              </div>
              {latestMood && (
                <MoodOrb emotion={emotion} moodRating={moodRating} size="md" />
              )}
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              <Link to="/checkin" className="btn-primary flex items-center gap-2 text-sm">
                <Brain size={14} /> Check In Now
              </Link>
              {latestMood && (
                <Link to="/recommendations" className="btn-secondary flex items-center gap-2 text-sm">
                  <Sparkles size={14} /> See Recs
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="glass p-6 flex flex-col gap-4">
          <h3 className="font-display font-bold text-white text-sm">Your 14-Day Summary</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-moody-500/30 border-t-moody-500 rounded-full animate-spin" />
            </div>
          ) : analytics ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white/50 text-xs">Avg Mood</span>
                <span className="font-display font-bold text-white">{analytics.avgMoodRating}/10</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white/50 text-xs">Avg Stress</span>
                <span className="font-bold text-white">{analytics.avgStressLevel}/100</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white/50 text-xs">Check-ins</span>
                <span className="font-bold text-white">{analytics.totalEntries}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white/50 text-xs">Top Emotion</span>
                <span className="font-bold text-white capitalize">{analytics.dominantEmotion}</span>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/10">
                <TrendingUp size={14} className={moodTrendColor} />
                <span className={`text-xs font-medium capitalize ${moodTrendColor}`}>
                  {analytics.moodTrend?.replace('-', ' ')}
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
              <div className="text-3xl">📊</div>
              <p className="text-white/40 text-xs">Check in daily to see your mood trends here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Flame size={16} className="text-energy-400" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map(({ icon: Icon, label, desc, to, color }) => (
            <Link key={to} to={to} className="glass-hover p-5 flex flex-col gap-3 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-card`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all mt-auto" />
            </Link>
          ))}
        </div>
      </div>

      {/* Mood Chart */}
      {analytics?.trendData?.length > 0 && (
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-moody-400" /> Mood Trend (14 Days)
            </h2>
            <Link to="/analytics" className="text-xs text-moody-400 hover:text-moody-300 flex items-center gap-1 transition-colors">
              Full analytics <ArrowRight size={12} />
            </Link>
          </div>
          <MoodChart data={analytics.trendData} type="area" height={180} />
          <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-moody-500 inline-block rounded" /> Mood</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Stress</span>
          </div>
        </div>
      )}

      {/* Recent Moods */}
      {recentMoods.length > 0 && (
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <Calendar size={16} className="text-calm-400" /> Recent Check-ins
            </h2>
          </div>
          <div className="space-y-2">
            {recentMoods.slice(0, 5).map((mood) => (
              <div key={mood._id} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                  ${mood.moodRating >= 7 ? 'bg-green-500/20 text-green-400' :
                    mood.moodRating >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'}`}>
                  {mood.moodRating}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm capitalize font-medium">{mood.aiAnalysis?.primaryEmotion || 'Unknown'}</p>
                  <p className="text-white/30 text-xs truncate">{mood.aiAnalysis?.summary?.slice(0, 60)}...</p>
                </div>
                <span className="text-white/20 text-xs flex-shrink-0">{mood.dayOfWeek}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
