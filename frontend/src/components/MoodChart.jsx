import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/20 px-3 py-2 rounded-xl text-xs shadow-card">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium capitalize">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function MoodChart({ data = [], type = 'line', height = 200 }) {
  const formattedData = data.map((d) => ({
    ...d,
    date: d.date ? format(new Date(d.date), 'MMM d') : '',
    moodRating: typeof d.moodRating === 'number' ? +d.moodRating.toFixed(1) : d.moodRating,
    stressLevel: typeof d.stressLevel === 'number' ? +(d.stressLevel / 10).toFixed(1) : 0,
  }));

  if (!formattedData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-white/30 text-sm">
        No mood data yet. Check in to see your chart! 📊
      </div>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={5} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="moodRating" stroke="#6366f1" strokeWidth={2} fill="url(#moodGrad)" name="Mood" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} />
          <Area type="monotone" dataKey="stressLevel" stroke="#ef4444" strokeWidth={1.5} fill="url(#stressGrad)" name="Stress" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={5} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="moodRating" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} name="Mood" />
        <Line type="monotone" dataKey="stressLevel" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Stress" />
      </LineChart>
    </ResponsiveContainer>
  );
}
