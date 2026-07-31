/**
 * CRISIS DETECTION SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the most important file in MoodEnhancer.
 * It runs on every mood entry and every chat message.
 * It looks for signs that a user may be in danger — and responds with
 * warmth, not alarm. The goal is to make them feel heard first, then safe.
 *
 * Levels:
 *   none     → no risk signals
 *   low      → general sadness, "I'm tired of everything"
 *   medium   → "I wish I could disappear", "nobody cares"
 *   high     → "I want to hurt myself", "I can't go on"
 *   critical → direct statements of suicidal intent or self-harm plans
 */

const logger = require('../utils/logger');
const openaiService = require('./openaiService');

// Keyword tiers — ordered by severity
const CRISIS_KEYWORDS = {
  critical: [
    'want to die', 'kill myself', 'end my life', 'suicide', 'suicidal',
    'hurt myself', 'cut myself', 'self harm', 'self-harm', 'overdose',
    'don\'t want to live', 'no reason to live', 'मरना चाहता हूं', 'मर जाना चाहता हूं',
    'जीना नहीं चाहता', 'खुद को नुकसान',
  ],
  high: [
    'can\'t go on', 'can\'t take it anymore', 'want to disappear forever',
    'better off without me', 'everyone would be better off', 'no point in living',
    'wish i was dead', 'wish i were dead', 'tired of living', 'give up on life',
  ],
  medium: [
    'nobody cares about me', 'completely alone', 'no one would miss me',
    'wish i could disappear', 'feel like a burden', 'nothing matters anymore',
    'what\'s the point', 'can\'t feel anything', 'completely numb',
    'no hope', 'hopeless', 'trapped', 'no way out',
  ],
  low: [
    'so tired of everything', 'exhausted mentally', 'can\'t handle this',
    'feeling really low', 'breaking down', 'falling apart',
  ],
};

// Responses by level — warm, human, not clinical
const CRISIS_RESPONSES = {
  critical: {
    message: `I'm really glad you shared that with me, and I want you to know I hear you completely. What you're feeling right now sounds incredibly heavy — and you don't have to carry it alone.\n\nPlease reach out right now to someone who can be with you:\n\n📞 **iCall (India):** 9152987821\n📞 **Vandrevala Foundation:** 1860-2662-345 (24/7, free)\n📞 **NIMHANS:** 080-46110007\n\nThese are real people who want to listen. You matter. This moment is not permanent — I promise it can get better. Will you call one of them right now?`,
    requiresAction: true,
  },
  high: {
    message: `Hey — I'm here, and I'm not going anywhere. What you just shared tells me you're carrying something really painful right now.\n\nI want you to know: feelings like this are a signal that you need more support than usual — and that's completely okay to ask for.\n\nIf things feel really dark, please talk to someone:\n📞 **iCall:** 9152987821\n📞 **Vandrevala Foundation:** 1860-2662-345\n\nYou reached out here — that took courage. Can you tell me a little more about what's been happening?`,
    requiresAction: false,
  },
  medium: {
    message: `I hear you. What you're feeling sounds exhausting — and really lonely. Those feelings are valid, even when they're hard to hold.\n\nI'm here to listen. Sometimes just getting it out helps. Would you like to tell me more about what's been going on? You don't have to face this alone.`,
    requiresAction: false,
  },
  low: {
    message: `It sounds like you're going through a really tough time right now. I see you, and I'm here. Take a breath — you don't have to figure everything out tonight. What's weighing on you the most?`,
    requiresAction: false,
  },
};

/**
 * Scan text for crisis signals using keyword matching + AI verification.
 * Returns { level, detected, keywords, response }
 */
const detectCrisis = async (text) => {
  if (!text || text.trim().length < 3) {
    return { level: 'none', detected: false, keywords: [], response: null };
  }

  const lower = text.toLowerCase();
  let highestLevel = 'none';
  const foundKeywords = [];

  // Keyword scan
  for (const [level, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        foundKeywords.push(kw);
        if (levelPriority(level) > levelPriority(highestLevel)) {
          highestLevel = level;
        }
      }
    }
  }

  // If medium or higher, verify with AI (reduces false positives)
  if (levelPriority(highestLevel) >= levelPriority('medium')) {
    try {
      const aiLevel = await openaiService.verifyCrisisLevel(text, highestLevel);
      // Only upgrade, never downgrade below 'low' if keywords found
      if (levelPriority(aiLevel) > levelPriority(highestLevel)) {
        highestLevel = aiLevel;
      }
    } catch (err) {
      // If AI check fails, keep keyword-based result — safety first
      logger.error('AI crisis verification failed, keeping keyword result:', err.message);
    }
  }

  const detected = highestLevel !== 'none';
  const response = detected ? CRISIS_RESPONSES[highestLevel] : null;

  if (detected) {
    logger.warn(`Crisis detected [${highestLevel}] — keywords: ${foundKeywords.join(', ')}`);
  }

  return {
    level: highestLevel,
    detected,
    keywords: foundKeywords,
    response,
  };
};

const levelPriority = (level) => {
  const map = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
  return map[level] ?? 0;
};

/**
 * Build a calm-mode response object for the frontend.
 * Triggered when a user clicks "I need help right now".
 */
const getCalmModeContent = () => ({
  message: "You reached out — that's brave. I'm right here with you.",
  breathingExercise: {
    name: '4-7-8 Breathing',
    steps: [
      { action: 'Breathe in', duration: 4, instruction: 'Slowly through your nose' },
      { action: 'Hold', duration: 7, instruction: 'Hold your breath gently' },
      { action: 'Breathe out', duration: 8, instruction: 'Slowly through your mouth' },
    ],
    rounds: 4,
  },
  groundingExercise: {
    name: '5-4-3-2-1 Grounding',
    steps: [
      'Name 5 things you can see right now',
      'Name 4 things you can physically feel',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
    ],
  },
  helplines: [
    { name: 'iCall (India)', number: '9152987821', available: 'Mon–Sat, 8am–10pm' },
    { name: 'Vandrevala Foundation', number: '1860-2662-345', available: '24/7, free' },
    { name: 'NIMHANS Helpline', number: '080-46110007', available: '24/7' },
  ],
  affirmation: "This feeling is temporary. You have survived hard days before. You are not alone.",
});

module.exports = { detectCrisis, getCalmModeContent, levelPriority };
