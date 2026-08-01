import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMood } from '../context/MoodContext';
import MoodOrb from '../components/MoodOrb';
import { ArrowRight, ArrowLeft, Send, Moon, Zap, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const EMOTIONS = [
  { label: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
  { label: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-500' },
  { label: 'Anxious', emoji: '😰', color: 'from-purple-400 to-pink-500' },
  { label: 'Angry', emoji: '😠', color: 'from-red-400 to-orange-500' },
  { label: 'Excited', emoji: '🤩', color: 'from-pink-400 to-rose-500' },
  { label: 'Lonely', emoji: '😔', color: 'from-slate-400 to-blue-500' },
  { label: 'Motivated', emoji: '💪', color: 'from-green-400 to-teal-500' },
  { label: 'Confused', emoji: '😕', color: 'from-gray-400 to-slate-500' },
  { label: 'Grateful', emoji: '🙏', color: 'from-teal-400 to-green-500' },
  { label: 'Stressed', emoji: '😫', color: 'from-orange-400 to-red-500' },
  { label: 'Peaceful', emoji: '😌', color: 'from-cyan-400 to-blue-400' },
  { label: 'Hopeful', emoji: '🌟', color: 'from-moody-400 to-purple-500' },
];

const TRIGGERS = ['Sleep', 'Work/Study', 'Relationships', 'Health', 'Family', 'Money', 'Social media', 'News', 'Weather', 'Food'];

const emotionFromRating = (r) => {
  if (r >= 9) return 'happiness';
  if (r >= 7) return 'motivation';
  if (r >= 6) return 'excitement';
  if (r >= 5) return 'neutral';
  if (r >= 4) return 'sadness';
  if (r >= 2) return 'anxiety';
  return 'fear';
};

export default function MoodCheckin() {
  const { submitMood, submitting } = useMood();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [moodRating, setMoodRating] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [moodText, setMoodText] = useState('');
  const [triggers, setTriggers] = useState([]);
  const [physicalState, setPhysicalState] = useState({ sleepHours: 7, energyLevel: 3, exercisedToday: false });
  const [result, setResult] = useState(null);

  const steps = ['Rate your mood', 'Select emotions', 'Tell us more', 'Physical state'];

  const toggleEmotion = (e) => {
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : prev.length < 5 ? [...prev, e] : prev
    );
  };
  const toggleTrigger = (t) => {
    setTriggers((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleSubmit = async () => {
    try {
      const data = await submitMood({
        moodRating,
        selectedEmotions,
        moodText,
        triggers,
        physicalState,
      });
      setResult(data);
      setStep(4); // show result
      toast.success('Mood analyzed! 🎉');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit mood. Please try again.');
    }
  };

  // ---- Result Screen ----
  if (step === 4 && result) {
    const analysis = result.moodEntry?.aiAnalysis;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-slide-up">
        <div className="glass p-8 text-center">
          <div className="flex justify-center mb-6">
            <MoodOrb emotion={analysis?.primaryEmotion || 'neutral'} moodRating={moodRating} size="lg" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Here's what I noticed 💙</h2>
          <p className="text-white/70 leading-relaxed mb-6">{analysis?.summary || result.aiSummary}</p>

          {analysis?.suggestedActions?.length > 0 && (
            <div className="glass p-4 rounded-xl text-left mb-6">
              <p className="text-xs font-semibold text-moody-300 mb-2 uppercase tracking-wider">Suggested for you</p>
              <ul className="space-y-1.5">
                {analysis.suggestedActions.map((action, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-calm-400">✦</span> {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.crisisDetected && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-left">
              <p className="text-red-300 font-semibold text-sm mb-1">We're concerned about you 💙</p>
              <p className="text-white/60 text-xs">Please reach out for support. You don't have to face this alone.</p>
              <button onClick={() => navigate('/calm')} className="mt-3 btn-danger text-xs py-1.5 px-4">
                Access Emergency Support
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/recommendations')} className="btn-primary flex items-center gap-2">
              See Recommendations <ArrowRight size={14} />
            </button>
            <button onClick={() => navigate('/chat')} className="btn-secondary text-sm">Talk to Moody AI</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-xs text-white/40">
          <span>{steps[step]}</span>
          <span>Step {step + 1}/{steps.length}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-moody-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass p-6 sm:p-8 animate-slide-up">
        {/* Step 0: Mood Rating */}
        {step === 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display font-bold text-2xl text-white mb-2">How are you feeling right now? 🌡️</h2>
              <p className="text-white/50 text-sm">Be honest — this is just for you</p>
            </div>

            <div className="flex justify-center">
              <MoodOrb emotion={emotionFromRating(moodRating)} moodRating={moodRating} size="lg" />
            </div>

            <div className="space-y-3">
              <input
                type="range" min="1" max="10" value={moodRating}
                onChange={(e) => setMoodRating(parseInt(e.target.value))}
                id="mood-slider"
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br
                  [&::-webkit-slider-thumb]:from-moody-400 [&::-webkit-slider-thumb]:to-purple-500
                  [&::-webkit-slider-thumb]:shadow-glow-indigo [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/30">
                <span>1 - Terrible</span>
                <span className="font-bold text-white text-base">{moodRating}/10</span>
                <span>10 - Amazing</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1 text-center">
              {[['😭','1-2'],['😟','3-4'],['😐','5-6'],['😊','7-8'],['🤩','9-10']].map(([emoji, range]) => (
                <div key={range} className="text-xs">
                  <div className="text-xl mb-1">{emoji}</div>
                  <div className="text-white/30">{range}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Emotions */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">What emotions are present? 💭</h2>
              <p className="text-white/50 text-sm">Select up to 5 emotions that resonate</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(({ label, emoji, color }) => {
                const selected = selectedEmotions.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggleEmotion(label)}
                    className={`emotion-tag text-sm py-2 px-4 transition-all duration-200 ${
                      selected
                        ? `bg-gradient-to-r ${color} bg-opacity-30 border-white/30 text-white scale-105`
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {emoji} {label}
                  </button>
                );
              })}
            </div>
            {selectedEmotions.length > 0 && (
              <p className="text-xs text-moody-300">Selected: {selectedEmotions.join(', ')}</p>
            )}
          </div>
        )}

        {/* Step 2: Story */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">What's on your mind? ✍️</h2>
              <p className="text-white/50 text-sm">Share as little or as much as you like — our AI will understand</p>
            </div>

            <textarea
              id="mood-text"
              rows={5}
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              placeholder="Tell me what's going on... How was your day? What's making you feel this way? What happened recently?"
              className="input-field resize-none leading-relaxed"
            />

            <div>
              <p className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wider">What triggered these feelings? (optional)</p>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTrigger(t)}
                    className={`emotion-tag text-xs py-1.5 px-3 ${
                      triggers.includes(t)
                        ? 'bg-moody-600/40 border-moody-400/60 text-moody-200'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Physical State */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Quick body check 🏃</h2>
              <p className="text-white/50 text-sm">Physical state affects our emotions significantly</p>
            </div>

            {/* Sleep */}
            <div className="glass p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Moon size={14} /> Sleep last night
              </div>
              <input
                type="range" min="0" max="12" step="0.5"
                value={physicalState.sleepHours}
                onChange={(e) => setPhysicalState({ ...physicalState, sleepHours: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-moody-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>0 hrs</span>
                <span className="text-white font-medium">{physicalState.sleepHours} hrs</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* Energy */}
            <div className="glass p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Zap size={14} /> Energy level
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setPhysicalState({ ...physicalState, energyLevel: level })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      physicalState.energyLevel >= level
                        ? 'bg-gradient-to-r from-energy-400 to-joy-500 text-gray-900'
                        : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {['😴', '😪', '😐', '😊', '⚡'][level - 1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise */}
            <div className="glass p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Activity size={14} /> Exercised today?
              </div>
              <button
                onClick={() => setPhysicalState({ ...physicalState, exercisedToday: !physicalState.exercisedToday })}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  physicalState.exercisedToday ? 'bg-calm-500' : 'bg-white/10'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                  physicalState.exercisedToday ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              id="checkin-next"
              className="btn-primary flex items-center gap-2"
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              id="checkin-submit"
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send size={14} /> Analyze My Mood</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
