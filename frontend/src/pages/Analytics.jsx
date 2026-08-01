import { useEffect, useState } from 'react';
import { useMood } from '../context/MoodContext';
import { moodAPI } from '../services/api';
import MoodChart from '../components/MoodChart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Brain, Calendar, Activity } from 'lucide-react';

const DAYS_OPTIONS = [7, 14, 30, 90];

const emotionColors = {
  happiness: '#facc15', motivation: '#f97316', excitement: '#ec4899',
  gratitude: '#34d399', sadness: '#818cf8', anxiety: '#a78bfa',
  loneliness: '#94a3b8', anger: '#f87171', fear: '#6b7280', confusion: '#9ca3af',
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/20 px-3 py-2 rounded-xl text-xs">
      <p className="text-white/50 mb-1 capitalize">{label}</p>
      <p className="text-white font-medium">Avg: {payload[0]?.value?.toFixed(1)}/10</p>
    </div>
  );
};

export default function Analytics() {
  const [period, setPeriod] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await moodAPI.getAnalytics({ period });
        setAnalytics(data.analytics);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [period]);

  const fetchWeeklyReport = async () => {
    setReportLoading(true);
    try {
      const { data } = await moodAPI.getWeeklyReport();
      setWeeklyReport(data.report);
    } catch {}
    finally { setReportLoading(false); }
  };

  const trendIcon = analytics?.moodTrend === 'positive' ? TrendingUp :
                    analytics?.moodTrend === 'needs-attention' ? TrendingDown : Minus;
  const trendColor = analytics?.moodTrend === 'positive' ? 'text-green-400' :
                     analytics?.moodTrend === 'needs-attention' ? 'text-red-400' : 'text-yellow-400';

  const dayChartData = analytics?.dayAverages
    ? Object.entries(analytics.dayAverages).map(([day, avg]) => ({ day: day.slice(0, 3), avg }))
    : [];

  const emotionChartData = analytics?.emotionFrequency
    ? Object.entries(analytics.emotionFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([emotion, count]) => ({ emotion: emotion.slice(0, 4), count, fullName: emotion }))
    : [];

  const radarData = analytics?.emotionFrequency
    ? Object.entries(analytics.emotionFrequency).slice(0, 6).map(([emotion, count]) => ({
        subject: emotion.charAt(0).toUpperCase() + emotion.slice(1, 4),
        A: count,
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl gradient-text">Mood Analytics</h1>
          <p className="text-white/40 text-sm mt-0.5">Understand your emotional patterns over time</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === d
                  ? 'bg-moody-600/50 border border-moody-500/50 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-moody-500/30 border-t-moody-500 rounded-full animate-spin" />
        </div>
      ) : !analytics ? (
        <div className="glass p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-white/50 font-medium mb-2">No data for this period</p>
          <p className="text-white/30 text-sm">Check in daily to see your analytics populate.</p>
        </div>
      ) : (
        <>
          {/* Burnout Alert */}
          {analytics.burnoutAlert && (
            <div className="glass border border-red-500/30 bg-red-500/10 p-4 rounded-2xl flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">
                <strong>Burnout Risk:</strong> High stress detected for {analytics.consecutiveHighStressDays} consecutive days.
                Consider using <a href="/calm" className="underline hover:text-red-200">Calm Mode</a> and taking breaks.
              </p>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg Mood', value: `${analytics.avgMoodRating}/10`, icon: Activity, color: 'text-moody-400' },
              { label: 'Avg Stress', value: `${analytics.avgStressLevel}/100`, icon: Brain, color: 'text-red-400' },
              { label: 'Check-ins', value: analytics.totalEntries, icon: Calendar, color: 'text-calm-400' },
              { label: 'Top Emotion', value: analytics.dominantEmotion, icon: trendIcon, color: trendColor, capitalize: true },
            ].map(({ label, value, icon: Icon, color, capitalize }) => (
              <div key={label} className="glass p-5">
                <Icon size={18} className={`${color} mb-3`} />
                <p className={`font-display font-black text-xl text-white ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Trend Chart */}
          {analytics.trendData?.length > 0 && (
            <div className="glass p-6">
              <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
                <TrendingUp size={16} className="text-moody-400" /> Mood & Stress Trend
              </h2>
              <MoodChart data={analytics.trendData} type="area" height={220} />
              <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-moody-500 inline-block rounded" /> Mood (1-10)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Stress/10</span>
              </div>
            </div>
          )}

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Day of Week Patterns */}
            {dayChartData.length > 0 && (
              <div className="glass p-6">
                <h3 className="font-display font-semibold text-white mb-4 text-sm">Mood by Day of Week</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={dayChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                      {dayChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.avg >= 7 ? '#34d399' : entry.avg >= 5 ? '#818cf8' : '#f87171'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Emotion Frequency */}
            {emotionChartData.length > 0 && (
              <div className="glass p-6">
                <h3 className="font-display font-semibold text-white mb-4 text-sm">Emotion Frequency</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={emotionChartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="fullName" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip content={({ active, payload }) => active && payload?.length ? (
                      <div className="glass px-3 py-2 text-xs rounded-xl"><p className="text-white capitalize">{payload[0]?.payload?.fullName}: {payload[0]?.value} times</p></div>
                    ) : null} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {emotionChartData.map((entry) => (
                        <Cell key={entry.emotion} fill={emotionColors[entry.fullName] || '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Weekly AI Report */}
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Brain size={16} className="text-moody-400" /> Weekly AI Report
              </h3>
              {!weeklyReport && (
                <button onClick={fetchWeeklyReport} disabled={reportLoading} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50">
                  {reportLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✨ Generate Report'}
                </button>
              )}
            </div>

            {weeklyReport ? (
              <div className="space-y-4">
                <p className="text-white/70 text-sm leading-relaxed">{weeklyReport.summary}</p>
                {weeklyReport.insights && (
                  <div>
                    <p className="text-xs font-semibold text-moody-300 mb-2 uppercase tracking-wider">Key Insights</p>
                    <ul className="space-y-1.5">
                      {weeklyReport.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="text-calm-400 mt-0.5">✦</span> {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {weeklyReport.recommendations && (
                  <div>
                    <p className="text-xs font-semibold text-calm-300 mb-2 uppercase tracking-wider">Recommendations</p>
                    <ul className="space-y-1.5">
                      {weeklyReport.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="text-moody-400 mt-0.5">→</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {weeklyReport.celebrationNote && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-300">
                    🎉 {weeklyReport.celebrationNote}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/40 text-sm">Generate your personalized AI report based on this week's mood data.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
