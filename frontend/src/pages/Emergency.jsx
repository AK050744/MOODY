import { useEffect, useState } from 'react';
import { emergencyAPI } from '../services/api';
import BreathingExercise from '../components/BreathingExercise';
import { Phone, Heart, Shield, Wind, ChevronDown, ChevronUp } from 'lucide-react';

export default function Emergency() {
  const [resources, setResources] = useState(null);
  const [activeTab, setActiveTab] = useState('breathing');
  const [completedBreathing, setCompletedBreathing] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  useEffect(() => {
    emergencyAPI.triggerCalmMode({ reason: 'User accessed calm mode', stressLevel: 100 }).catch(() => {});
    emergencyAPI.getResources().then(({ data }) => setResources(data.data)).catch(() => {});

    const interval = setInterval(() => {
      setAffirmationIndex((i) => (i + 1) % 6);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const TABS = [
    { id: 'breathing', label: 'Breathe', icon: Wind },
    { id: 'grounding', label: 'Ground Me', icon: Heart },
    { id: 'hotlines', label: 'Get Help', icon: Phone },
    { id: 'affirmations', label: 'Affirmations', icon: Shield },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Emergency Header */}
      <div className="glass p-6 border border-calm-500/30 bg-gradient-to-br from-calm-900/40 to-indigo-900/40 text-center relative overflow-hidden">
        <div className="bg-orb w-48 h-48 bg-calm-600 top-0 right-0 opacity-10" />
        <div className="relative z-10">
          <div className="text-4xl mb-3">💙</div>
          <h1 className="font-display font-black text-2xl text-white mb-2">You're in Safe Space</h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
            Take a breath. You reached out — that's the bravest thing. We're here with you, one moment at a time.
          </p>
        </div>
      </div>

      {/* Scrolling Affirmation Bar */}
      {resources?.affirmations && (
        <div className="glass px-6 py-3 rounded-xl text-center border border-white/10 overflow-hidden">
          <p className="text-moody-300 text-sm italic transition-all duration-500 animate-fade-in" key={affirmationIndex}>
            {resources.affirmations[affirmationIndex]}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="grid grid-cols-4 gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            id={`calm-tab-${id}`}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-calm-600/50 border border-calm-500/50 text-white'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass p-6 min-h-[400px]">
        {/* Breathing */}
        {activeTab === 'breathing' && (
          <div>
            <h2 className="font-display font-bold text-lg text-white text-center mb-2">4-7-8 Breathing</h2>
            <p className="text-white/50 text-xs text-center mb-4">
              This technique activates your body's natural calm response. Follow the animation.
            </p>
            <BreathingExercise
              cycles={4}
              onComplete={() => setCompletedBreathing(true)}
            />
            {completedBreathing && (
              <div className="mt-4 p-4 rounded-xl bg-green-500/15 border border-green-500/30 text-center">
                <p className="text-green-300 text-sm">Amazing job! How are you feeling now? 🌟</p>
              </div>
            )}
          </div>
        )}

        {/* Grounding */}
        {activeTab === 'grounding' && resources?.groundingExercises && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-lg text-white mb-4">Grounding Exercises</h2>
            {resources.groundingExercises.map((ex, idx) => (
              <div key={ex.name} className="glass border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedExercise(expandedExercise === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ex.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{ex.name}</p>
                      <p className="text-white/40 text-xs">{ex.duration}</p>
                    </div>
                  </div>
                  {expandedExercise === idx ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                </button>

                {expandedExercise === idx && (
                  <div className="px-4 pb-4 animate-slide-up">
                    <ol className="space-y-2">
                      {ex.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                          <span className="w-5 h-5 rounded-full bg-moody-600/40 text-moody-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Crisis Hotlines */}
        {activeTab === 'hotlines' && resources?.crisisHotlines && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <p className="text-red-300 font-semibold text-sm mb-1">If you're in immediate danger</p>
              <p className="text-white/60 text-xs">Please call emergency services (100 or 112) immediately. Your life matters.</p>
            </div>
            <h2 className="font-display font-bold text-lg text-white">Crisis Support Helplines</h2>
            {resources.crisisHotlines.map((line) => (
              <a
                key={line.name}
                href={`tel:${line.number}`}
                className="glass-hover p-4 rounded-xl flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={16} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{line.name}</p>
                  <p className="text-white/40 text-xs">{line.available}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400 text-sm">{line.number}</p>
                  <p className="text-white/30 text-xs">Tap to call</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Affirmations */}
        {activeTab === 'affirmations' && resources?.affirmations && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-lg text-white mb-4 text-center">You Are Enough 💙</h2>
            <div className="grid grid-cols-1 gap-3">
              {resources.affirmations.map((a, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-gradient-to-r from-moody-600/20 to-purple-600/20 border border-moody-500/20 text-center"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className="text-white/80 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="glass p-4 rounded-xl text-center border border-white/5">
        <p className="text-white/30 text-xs leading-relaxed">
          Remember: Seeking help is a sign of strength, not weakness. Moody is a wellness support tool, not a medical service.
          For clinical support, please speak to a professional.
        </p>
      </div>
    </div>
  );
}
