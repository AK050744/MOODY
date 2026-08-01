import { useMemo } from 'react';

const emotionColors = {
  happiness:  { bg: 'from-yellow-400 to-orange-400', glow: 'rgba(251,191,36,0.6)' },
  motivation: { bg: 'from-orange-500 to-red-400',    glow: 'rgba(249,115,22,0.6)' },
  excitement: { bg: 'from-pink-500 to-purple-500',   glow: 'rgba(236,72,153,0.6)' },
  gratitude:  { bg: 'from-green-400 to-teal-400',    glow: 'rgba(52,211,153,0.6)' },
  sadness:    { bg: 'from-blue-500 to-indigo-600',   glow: 'rgba(99,102,241,0.6)' },
  anxiety:    { bg: 'from-purple-500 to-indigo-500', glow: 'rgba(139,92,246,0.6)' },
  loneliness: { bg: 'from-slate-500 to-blue-600',   glow: 'rgba(100,116,139,0.6)' },
  anger:      { bg: 'from-red-500 to-orange-600',   glow: 'rgba(239,68,68,0.6)' },
  fear:       { bg: 'from-gray-600 to-slate-700',   glow: 'rgba(107,114,128,0.6)' },
  neutral:    { bg: 'from-moody-500 to-purple-600', glow: 'rgba(99,102,241,0.5)' },
};

export default function MoodOrb({ emotion = 'neutral', moodRating = 5, size = 'md', animated = true }) {
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
    xl: 'w-72 h-72',
  };

  const colors = emotionColors[emotion] || emotionColors.neutral;
  const intensity = moodRating / 10;

  const glowStyle = useMemo(() => ({
    boxShadow: `0 0 ${30 + intensity * 60}px ${colors.glow}, 0 0 ${60 + intensity * 80}px ${colors.glow.replace('0.6', '0.2')}`,
  }), [colors.glow, intensity]);

  return (
    <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} opacity-20 blur-xl`}
        style={{ transform: 'scale(1.4)' }}
      />

      {/* Spinning ring */}
      {animated && (
        <div
          className={`absolute inset-0 rounded-full border border-white/20 animate-orb-spin`}
          style={{ background: `conic-gradient(from 0deg, transparent, ${colors.glow}, transparent)` }}
        />
      )}

      {/* Main orb */}
      <div
        className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center cursor-pointer
          ${animated ? 'animate-breathing' : ''} transition-all duration-500`}
        style={glowStyle}
      >
        {/* Inner content */}
        <div className="text-center text-white">
          <div className="text-2xl font-display font-black">{moodRating}</div>
          <div className="text-xs font-medium opacity-80">/10</div>
        </div>
      </div>

      {/* Particle dots */}
      {animated && [0, 1, 2].map((i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${colors.bg}`}
          style={{
            animation: `float ${3 + i * 0.8}s ease-in-out infinite ${i * 0.5}s`,
            top: `${20 + i * 25}%`,
            left: `${10 + i * 30}%`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}
