import { Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatBubble({ message, onReact, index }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isUser
          ? 'bg-gradient-to-br from-moody-500 to-purple-600'
          : 'bg-gradient-to-br from-calm-600 to-teal-600'
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className={`max-w-[80%] group ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Message Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-moody-600 to-purple-700 text-white rounded-br-sm'
            : 'glass border border-white/10 text-white/90 rounded-bl-sm'
        }`}>
          {/* Render newlines */}
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Footer: time + reactions */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-white/30">
            {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
          </span>

          {/* Reaction buttons (only for AI messages) */}
          {!isUser && onReact && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onReact(index, 'helpful')}
                className={`p-1 rounded text-xs transition-all ${
                  message.reaction === 'helpful'
                    ? 'text-green-400 bg-green-500/20'
                    : 'text-white/30 hover:text-green-400'
                }`}
              >
                <ThumbsUp size={10} />
              </button>
              <button
                onClick={() => onReact(index, 'not-helpful')}
                className={`p-1 rounded text-xs transition-all ${
                  message.reaction === 'not-helpful'
                    ? 'text-red-400 bg-red-500/20'
                    : 'text-white/30 hover:text-red-400'
                }`}
              >
                <ThumbsDown size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
