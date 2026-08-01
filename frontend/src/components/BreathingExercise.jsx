import { useState, useEffect } from 'react';

const phases = [
  { label: 'Breathe In',  duration: 4, scale: 1.4, color: 'from-calm-400 to-teal-500' },
  { label: 'Hold',         duration: 7, scale: 1.4, color: 'from-moody-400 to-purple-500' },
  { label: 'Breathe Out', duration: 8, scale: 1.0, color: 'from-blue-400 to-cyan-500' },
  { label: 'Hold',         duration: 4, scale: 1.0, color: 'from-indigo-400 to-blue-500' },
];

export default function BreathingExercise({ onComplete, cycles = 4 }) {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const [cyclesLeft, setCyclesLeft] = useState(cycles);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhaseIndex((pi) => {
            const nextPhase = (pi + 1) % phases.length;
            if (nextPhase === 0) {
              setCyclesLeft((c) => {
                if (c - 1 <= 0) {
                  setIsActive(false);
                  setCompleted(true);
                  onComplete?.();
                  return 0;
                }
                return c - 1;
              });
            }
            setTimeLeft(phases[nextPhase].duration);
            return nextPhase;
          });
          return phases[phaseIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phaseIndex, onComplete]);

  const currentPhase = phases[phaseIndex];
  const progress = 1 - timeLeft / currentPhase.duration;

  if (completed) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-6xl animate-bounce">🌟</div>
        <div className="text-center">
          <h3 className="font-display font-bold text-xl text-white mb-2">Well done!</h3>
          <p className="text-white/60">You completed the breathing exercise. How do you feel?</p>
        </div>
        <button onClick={() => { setCompleted(false); setCyclesLeft(cycles); setPhaseIndex(0); setTimeLeft(phases[0].duration); }} className="btn-secondary text-sm">
          Do it again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* Cycles Counter */}
      <div className="text-sm text-white/50">
        Cycle {cycles - cyclesLeft + 1} of {cycles}
      </div>

      {/* Breathing Circle */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 224 224">
          <circle cx="112" cy="112" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle
            cx="112" cy="112" r="100"
            fill="none"
            stroke="url(#breathGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 100}`}
            strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <defs>
            <linearGradient id="breathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated Orb */}
        <div
          className={`w-36 h-36 rounded-full bg-gradient-to-br ${currentPhase.color} flex items-center justify-center transition-transform duration-[1000ms] ease-in-out`}
          style={{ transform: `scale(${isActive ? currentPhase.scale : 1})` }}
        >
          <div className="text-center text-white">
            <div className="font-display font-black text-3xl">{timeLeft}</div>
            <div className="text-xs font-medium opacity-80">seconds</div>
          </div>
        </div>
      </div>

      {/* Phase Label */}
      <div className="text-center">
        <div className="font-display font-bold text-2xl text-white">{currentPhase.label}</div>
        <div className="text-sm text-white/40 mt-1">
          {phaseIndex === 0 ? 'Slowly through your nose' :
           phaseIndex === 2 ? 'Slowly through your mouth' : 'Stay still and calm'}
        </div>
      </div>

      {/* Controls */}
      {!isActive ? (
        <button onClick={() => setIsActive(true)} className="btn-calm px-8">
          {timeLeft === phases[0].duration && phaseIndex === 0 ? 'Start Breathing Exercise' : 'Continue'}
        </button>
      ) : (
        <button onClick={() => setIsActive(false)} className="btn-secondary px-8 text-sm">
          Pause
        </button>
      )}
    </div>
  );
}
