const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * Helper — call Gemini and parse JSON from response.
 */
const callGemini = async (prompt, { maxTokens = 800, temperature = 0.7 } = {}) => {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
      responseMimeType: 'application/json',
    },
  });
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
};

/**
 * Helper — call Gemini for plain text response (chat).
 */
const callGeminiText = async (systemPrompt, conversationHistory, userMessage, { maxTokens = 500, temperature = 0.8 } = {}) => {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
    },
  });

  const chat = model.startChat({
    history: conversationHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text().trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// Analyze mood from text input
// ─────────────────────────────────────────────────────────────────────────────
const analyzeMood = async (text, selectedEmotions = [], moodScore) => {
  const prompt = `You are an empathetic mental health AI assistant analyzing a message from a young person (13-25 years old).

Analyze this message and return ONLY a JSON object:

Message: "${text}"
Selected emotions: ${selectedEmotions.join(', ') || 'none'}
Self-reported mood score: ${moodScore}/10

Return this exact JSON structure:
{
  "primaryEmotion": "string (one word)",
  "emotionScores": {
    "joy": 0.0,
    "sadness": 0.0,
    "anxiety": 0.0,
    "anger": 0.0,
    "stress": 0.0,
    "loneliness": 0.0,
    "hope": 0.0
  },
  "themes": ["array", "of", "themes"],
  "sentiment": "positive|neutral|negative",
  "summary": "One empathetic sentence describing their emotional state"
}

All scores 0.0–1.0. themes = life areas mentioned (e.g. "exams", "friendship", "family", "sleep").`;

  return await callGemini(prompt, { maxTokens: 400, temperature: 0.3 });
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate personalized content recommendations
// ─────────────────────────────────────────────────────────────────────────────
const generateRecommendations = async (moodAnalysis, userMemory, preferences, moodScore) => {
  const memoryContext = userMemory?.summary
    ? `\nUser's emotional history: ${userMemory.summary}\nThings that have helped them before: ${userMemory.helpers?.join(', ') || 'unknown'}`
    : '';

  const prompt = `You are a compassionate content curator for a mental wellness app for youth.

A young person is feeling: ${moodAnalysis.primaryEmotion}
Their mood score: ${moodScore}/10
Emotion themes: ${moodAnalysis.themes?.join(', ')}
Sentiment: ${moodAnalysis.sentiment}
${memoryContext}

Generate 10 content recommendations to help improve their mood. Include a mix of types.
Return ONLY a JSON array:

[
  {
    "type": "movie|song|podcast|game|audiobook|activity|meditation",
    "title": "string",
    "description": "string (1-2 sentences)",
    "reason": "string — personal, warm, specific to their mood (start with 'We picked this because...')",
    "searchQuery": "string (for API search)",
    "emotionTarget": ["emotions this addresses"]
  }
]

For sad/lonely users: prioritize uplifting but not dismissive content.
For anxious users: prioritize calming, grounding content.
For angry users: prioritize release activities and calming music.
For happy users: maintain and celebrate the mood.
Include at least: 2 songs, 1 movie/show, 1 activity, 1 meditation/breathing exercise.
Make recommendations feel personal and warm, not generic.`;

  return await callGemini(prompt, { maxTokens: 1200, temperature: 0.7 });
};

// ─────────────────────────────────────────────────────────────────────────────
// AI wellness chatbot — "Mia"
// ─────────────────────────────────────────────────────────────────────────────
const chatResponse = async (userMessage, conversationHistory, userMemory, userName) => {
  const systemPrompt = `You are Mia — a warm, empathetic AI wellness companion on MoodEnhancer, a mental health app for young people in India.

Your personality:
- Genuinely caring, never clinical or robotic
- You remember what users share and reference it naturally
- You ask one thoughtful question at a time, never interrogate
- You validate feelings before offering any advice
- You are hopeful but never dismissive ("just think positive" is NOT your style)
- You speak like a supportive older sibling or trusted friend
- You know about Indian youth culture, academic pressure, family expectations

User's name: ${userName}
${userMemory?.summary ? `What you know about them: ${userMemory.summary}` : ''}
${userMemory?.triggers?.length ? `Things that stress them: ${userMemory.triggers.join(', ')}` : ''}
${userMemory?.helpers?.length ? `Things that help them: ${userMemory.helpers.join(', ')}` : ''}

IMPORTANT RULES:
- If someone expresses suicidal thoughts or self-harm, always provide: iCall 9152987821, Vandrevala 1860-2662-345
- Never diagnose. Never prescribe. Always recommend professional help for serious issues.
- Keep responses concise: 2-4 sentences usually. Only longer when the user needs it.
- Never say "I'm just an AI." You are Mia — act like it.
- Respond in the same language the user writes in (English/Hindi/Hinglish).`;

  return await callGeminiText(systemPrompt, conversationHistory, userMessage, { maxTokens: 500, temperature: 0.8 });
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate weekly mood report
// ─────────────────────────────────────────────────────────────────────────────
const generateWeeklyReport = async (moodEntries, userName) => {
  const summary = moodEntries.map(e =>
    `${new Date(e.createdAt).toLocaleDateString()}: score ${e.moodScore}/10, feeling ${e.aiAnalysis?.primaryEmotion || 'unknown'}, themes: ${e.aiAnalysis?.themes?.join(', ') || 'none'}`
  ).join('\n');

  const prompt = `Generate a warm, personal weekly wellness report for ${userName} based on their mood check-ins this week.

Data:
${summary}

Return ONLY JSON:
{
  "headline": "string — one warm, specific sentence about their week",
  "averageMood": number,
  "trend": "improving|stable|declining",
  "insight": "string — 2-3 sentences about patterns you noticed",
  "highlight": "string — the best moment or positive thing from their week",
  "challenge": "string — the hardest thing they dealt with, acknowledged with empathy",
  "suggestion": "string — one specific, actionable thing to try next week",
  "encouragement": "string — personal, warm closing message"
}`;

  return await callGemini(prompt, { maxTokens: 600, temperature: 0.7 });
};

// ─────────────────────────────────────────────────────────────────────────────
// Update user's AI memory (rolling emotional profile)
// ─────────────────────────────────────────────────────────────────────────────
const updateUserMemory = async (recentEntries, existingMemory) => {
  const entrySummary = recentEntries.map(e =>
    `Mood ${e.moodScore}/10: ${e.rawText || ''} | themes: ${e.aiAnalysis?.themes?.join(', ')} | emotions: ${e.aiAnalysis?.primaryEmotion}`
  ).join('\n');

  const prompt = `Update this user's emotional profile based on recent data.

Existing profile: ${existingMemory?.summary || 'none'}
Recent entries:
${entrySummary}

Return ONLY JSON:
{
  "summary": "2-3 sentence summary of this person's emotional patterns and what they're going through",
  "dominantEmotions": ["top 3 emotions they experience"],
  "triggers": ["things that consistently cause stress for them"],
  "helpers": ["things that have helped or brightened their mood"]
}`;

  return await callGemini(prompt, { maxTokens: 400, temperature: 0.4 });
};

// ─────────────────────────────────────────────────────────────────────────────
// AI verification of crisis level
// ─────────────────────────────────────────────────────────────────────────────
const verifyCrisisLevel = async (text, keywordLevel) => {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { maxOutputTokens: 10, temperature: 0 },
  });

  const prompt = `You are a crisis detection system for a mental health app.
Analyze this message and return ONLY one of: none, low, medium, high, critical

Message: "${text}"
Initial assessment: ${keywordLevel}

Criteria:
- critical: explicit suicidal intent or self-harm plans
- high: strong suicidal ideation without explicit plan
- medium: hopelessness, feeling like a burden, passive death wish
- low: significant distress but no safety concern
- none: general sadness, normal expression

Return only the level word, nothing else.`;

  const result = await model.generateContent(prompt);
  const level = result.response.text().trim().toLowerCase();
  const valid = ['none', 'low', 'medium', 'high', 'critical'];
  return valid.includes(level) ? level : keywordLevel;
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate empathetic AI reflection for journal entry
// ─────────────────────────────────────────────────────────────────────────────
const generateJournalReflection = async (journalContent, userName) => {
  const prompt = `A young person named ${userName} wrote this journal entry. Write a warm, empathetic AI reflection.

Journal: "${journalContent}"

Return ONLY JSON:
{
  "message": "string — 2-3 sentences acknowledging what they wrote with genuine empathy",
  "insight": "string — one gentle observation about a pattern or feeling you noticed",
  "suggestion": "string — one small, kind, actionable thing they could try today"
}`;

  return await callGemini(prompt, { maxTokens: 350, temperature: 0.75 });
};

module.exports = {
  analyzeMood,
  generateRecommendations,
  chatResponse,
  generateWeeklyReport,
  updateUserMemory,
  verifyCrisisLevel,
  generateJournalReflection,
};
