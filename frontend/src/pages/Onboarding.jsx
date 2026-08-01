import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  {
    id: 'interests',
    title: 'What are you into? 🎯',
    subtitle: 'Select everything that resonates with you',
    type: 'multiselect',
    field: 'interests',
    options: [
      '🎬 Movies', '🎵 Music', '📚 Reading', '🎮 Gaming', '🧘 Meditation',
      '🏃 Fitness', '🎙️ Podcasts', '✍️ Writing', '🎨 Art', '🍳 Cooking',
      '🌿 Nature', '🤝 Socializing', '💻 Tech', '🎭 Theatre', '📸 Photography',
    ],
  },
  {
    id: 'genres',
    title: 'What genres do you love? 🎭',
    subtitle: 'For better movie and music recommendations',
    type: 'multiselect',
    field: 'genres',
    options: [
      '😂 Comedy', '😭 Drama', '😱 Horror', '🚀 Sci-Fi', '🧙 Fantasy',
      '💕 Romance', '🎬 Action', '🔍 Mystery', '🎵 Pop', '🎸 Rock',
      '🎹 Classical', '🎤 Hip-Hop', '🎷 Jazz', '🌍 World Music', '🎧 Lo-Fi',
    ],
  },
  {
    id: 'struggles',
    title: 'What do you sometimes struggle with? 💙',
    subtitle: 'This helps us prepare the right support for you. No judgment, all private.',
    type: 'multiselect',
    field: 'struggles',
    options: [
      '😰 Exam stress', '😔 Low motivation', '😟 Social anxiety', '😴 Sleep issues',
      '😢 Loneliness', '😠 Anger management', '😫 Burnout', '💔 Heartbreak',
      '🏠 Family stress', '💰 Financial worry', '🎯 Lack of direction', '📱 Social media pressure',
    ],
  },
  {
    id: 'goals',
    title: 'What do you want from Moody? 🌟',
    subtitle: 'We\'ll tailor your experience to match',
    type: 'singleselect',
    field: 'primaryGoal',
    options: [
      '🎯 Improve my overall mood',
      '😴 Better sleep & relaxation',
      '💪 Build motivation & confidence',
      '🧘 Manage stress & anxiety',
      '💙 Process emotions & feelings',
      '🌱 Build healthy daily habits',
    ],
  },
];

export default function Onboarding() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({ interests: [], genres: [], struggles: [], primaryGoal: '' });
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  const toggle = (field, value) => {
    if (currentStep.type === 'singleselect') {
      setSelections((prev) => ({ ...prev, [field]: value }));
    } else {
      setSelections((prev) => {
        const arr = prev[field];
        return {
          ...prev,
          [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
        };
      });
    }
  };

  const isSelected = (field, value) => {
    if (currentStep.type === 'singleselect') return selections[field] === value;
    return selections[field]?.includes(value);
  };

  const canProceed = () => {
    const val = selections[currentStep.field];
    return Array.isArray(val) ? val.length > 0 : !!val;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const payload = {
        interests: [...selections.interests, ...selections.genres],
        preferences: {
          genres: {
            movies: selections.genres.filter((g) => ['😭 Drama','😂 Comedy','😱 Horror','🚀 Sci-Fi','🧙 Fantasy','💕 Romance','🎬 Action','🔍 Mystery'].includes(g)).map((g) => g.replace(/^.+\s/, '')),
            music: selections.genres.filter((g) => ['🎵 Pop','🎸 Rock','🎹 Classical','🎤 Hip-Hop','🎷 Jazz','🌍 World Music','🎧 Lo-Fi'].includes(g)).map((g) => g.replace(/^.+\s/, '')),
          },
        },
      };
      const { data } = await authAPI.completeOnboarding(payload);
      updateUser(data.user);
      toast.success('You\'re all set! Let\'s check in on your mood 🌱');
      navigate('/checkin');
    } catch {
      toast.error('Could not save preferences. You can update them in profile.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="bg-orb w-96 h-96 bg-calm-600 top-0 right-0 opacity-15" />
      <div className="bg-orb w-72 h-72 bg-moody-600 bottom-0 left-0 opacity-15" />

      <div className="relative z-10 w-full max-w-2xl animate-slide-up">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40 font-medium">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs text-white/40">{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-moody-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="glass p-8 shadow-card">
          <h2 className="font-display font-bold text-2xl text-white mb-1">{currentStep.title}</h2>
          <p className="text-white/50 text-sm mb-8">{currentStep.subtitle}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {currentStep.options.map((option) => (
              <button
                key={option}
                onClick={() => toggle(currentStep.field, option)}
                className={`emotion-tag transition-all duration-200 text-sm py-2 px-4 ${
                  isSelected(currentStep.field, option)
                    ? 'bg-moody-600/40 border-moody-400/60 text-moody-200 scale-105'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={14} /> Back
            </button>

            {isLastStep ? (
              <button
                onClick={handleFinish}
                disabled={!canProceed() || loading}
                id="onboarding-finish"
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><CheckCircle size={16} /> Finish Setup</>
                )}
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                id="onboarding-next"
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-4 text-center text-white/30 text-xs hover:text-white/50 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
