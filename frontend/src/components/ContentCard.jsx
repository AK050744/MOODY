import { ExternalLink, Star, Heart } from 'lucide-react';
import { useState } from 'react';
import { feedbackAPI } from '../services/api';
import toast from 'react-hot-toast';

const categoryIcons = {
  movie: '🎬',
  song: '🎵',
  podcast: '🎙️',
  audiobook: '📚',
  game: '🎮',
  activity: '🏃',
  meditation: '🧘',
  motivational: '⚡',
  youtube: '▶️',
};

const categoryColors = {
  movie: 'from-red-500/20 to-orange-500/20 border-red-500/20',
  song: 'from-green-500/20 to-teal-500/20 border-green-500/20',
  podcast: 'from-purple-500/20 to-pink-500/20 border-purple-500/20',
  audiobook: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/20',
  game: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
  activity: 'from-teal-500/20 to-green-500/20 border-teal-500/20',
  meditation: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/20',
  motivational: 'from-yellow-500/20 to-red-500/20 border-yellow-500/20',
};

export default function ContentCard({ item, category, recommendationId }) {
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleRating = async (stars) => {
    if (feedbackSent) return;
    setRating(stars);

    try {
      await feedbackAPI.submit({
        recommendationId,
        category,
        itemTitle: item.title,
        itemExternalId: item.externalId,
        rating: stars,
        helpful: stars >= 3,
      });
      setFeedbackSent(true);
      toast.success('Thanks for rating! 🙏');
    } catch {
      toast.error('Could not save rating');
    }
  };

  const colors = categoryColors[category] || 'from-moody-500/20 to-purple-500/20 border-moody-500/20';

  return (
    <div className={`group relative glass-hover border bg-gradient-to-br ${colors} p-4 flex flex-col gap-3 animate-fade-in`}>
      {/* Image */}
      {item.imageUrl && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-white/5">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Category Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs font-medium">
            <span>{categoryIcons[category] || '✨'}</span>
            <span className="capitalize">{category}</span>
          </div>

          {/* Platform Badge */}
          {item.platform && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white/70">
              {item.platform}
            </div>
          )}
        </div>
      )}

      {/* No image placeholder */}
      {!item.imageUrl && (
        <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${colors.replace('/20', '/40')} flex items-center justify-center text-4xl`}>
          {categoryIcons[category] || '✨'}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-0.5">{item.title}</h3>
        {item.author && (
          <p className="text-xs text-white/50 mb-1">{item.author}</p>
        )}
        {item.description && (
          <p className="text-xs text-white/40 line-clamp-2">{item.description}</p>
        )}

        {/* Why Recommended */}
        {item.whyRecommended && (
          <div className="mt-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-moody-300/80 italic">✨ {item.whyRecommended}</p>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {item.year && <span className="text-xs text-white/30">{item.year}</span>}
          {item.duration && <span className="text-xs text-white/30">⏱ {item.duration}</span>}
          {item.rating && (
            <span className="text-xs text-yellow-400/80 flex items-center gap-0.5">
              <Star size={10} fill="currentColor" /> {typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        {/* Star Rating */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className={`transition-all duration-150 ${
                star <= rating ? 'text-yellow-400 scale-110' : 'text-white/20 hover:text-yellow-400/60'
              }`}
            >
              <Star size={12} fill={star <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={() => setLiked(!liked)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${liked ? 'text-red-400 bg-red-500/20' : 'text-white/30 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>

          {/* External Link */}
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-moody-600/30 hover:bg-moody-600/60 text-moody-300 hover:text-white transition-all duration-200"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
