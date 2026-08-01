import { useEffect, useRef, useState } from 'react';
import { chatAPI } from '../services/api';
import ChatBubble from '../components/ChatBubble';
import { Send, Bot, RefreshCw, Plus, Heart, Brain, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

const SESSION_TYPES = [
  { id: 'emotional-support', label: 'Emotional Support', icon: Heart, desc: 'Talk about your feelings', color: 'from-pink-500 to-rose-600' },
  { id: 'wellness-coach', label: 'Wellness Coach', icon: Brain, desc: 'Build healthy habits', color: 'from-moody-500 to-purple-600' },
  { id: 'general', label: 'Just Chat', icon: Smile, desc: 'Casual conversation', color: 'from-calm-500 to-teal-600' },
];

const SUGGESTIONS = [
  "I'm feeling really stressed about exams 😰",
  "I had a rough day and need to vent",
  "Help me with a quick breathing exercise",
  "I feel lonely and don't know why",
  "Give me a motivational boost 💪",
  "I can't sleep — what should I do?",
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionType, setSessionType] = useState('emotional-support');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingIndicator]);

  const startSession = (type = sessionType) => {
    setSessionType(type);
    setStarted(true);
    setMessages([{
      role: 'assistant',
      content: type === 'emotional-support'
        ? "Hi there! 💙 I'm Moody, your emotional wellness companion. I'm here to listen without judgment. What's on your mind today?"
        : type === 'wellness-coach'
        ? "Hey! 🌱 I'm your wellness coach. I'm here to help you build positive habits and stay accountable. What would you like to work on?"
        : "Hey! 😊 Just here to chat. How are you doing today?",
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || sending) return;
    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setTypingIndicator(true);

    try {
      const { data } = await chatAPI.sendMessage({
        content: text.trim(),
        sessionId,
      });
      setSessionId(data.sessionId);
      setTypingIndicator(false);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.message.content,
        timestamp: data.message.createdAt || new Date(),
      }]);
    } catch (err) {
      setTypingIndicator(false);
      toast.error('Could not send message. Please try again.');
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleReact = async (index, reaction) => {
    if (!sessionId) return;
    setMessages((prev) => prev.map((m, i) => i === index ? { ...m, reaction } : m));
    try {
      await chatAPI.react({ sessionId, messageIndex: index, reaction });
    } catch {}
  };

  const newSession = () => {
    if (sessionId) chatAPI.endSession(sessionId).catch(() => {});
    setSessionId(null);
    setMessages([]);
    setStarted(false);
  };

  // ---- Session Picker ----
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-glow-indigo">
            <Bot size={28} />
          </div>
          <h1 className="font-display font-black text-3xl gradient-text mb-2">Moody AI Chat</h1>
          <p className="text-white/50">A safe space to talk, vent, reflect, or just connect.</p>
        </div>

        <div className="space-y-3 mb-8">
          {SESSION_TYPES.map(({ id, label, icon: Icon, desc, color }) => (
            <button
              key={id}
              onClick={() => startSession(id)}
              id={`session-${id}`}
              className="w-full glass-hover p-5 flex items-center gap-4 text-left group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{label}</p>
                <p className="text-white/40 text-sm">{desc}</p>
              </div>
              <div className="text-white/20 group-hover:text-white/60 transition-colors">→</div>
            </button>
          ))}
        </div>

        <div className="glass p-4 rounded-xl">
          <p className="text-xs text-white/30 text-center">🔒 Conversations are private and never shared. If you're in crisis, access Emergency Support from the SOS button above.</p>
        </div>
      </div>
    );
  }

  // ---- Chat Interface ----
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Header */}
      <div className="glass p-3 rounded-2xl mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-calm-500 to-teal-600 flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Moody AI</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow inline-block" />
              Always here for you
            </p>
          </div>
        </div>
        <button onClick={newSession} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
          <Plus size={12} /> New Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 scrollbar-hide">
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={msg}
            index={idx}
            onReact={msg.role === 'assistant' ? handleReact : null}
          />
        ))}

        {/* Typing Indicator */}
        {typingIndicator && (
          <div className="flex items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-calm-600 to-teal-600 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="glass border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions (first message only) */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass p-3 rounded-2xl mt-4 flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }}
          placeholder="Type your message... (Enter to send)"
          rows={1}
          id="chat-input"
          className="flex-1 bg-transparent text-white placeholder-white/30 text-sm resize-none focus:outline-none max-h-32 leading-relaxed"
          style={{ fieldSizing: 'content' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || sending}
          id="chat-send"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-indigo"
        >
          {sending ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
