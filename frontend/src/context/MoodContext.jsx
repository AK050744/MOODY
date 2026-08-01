import { createContext, useContext, useState, useCallback } from 'react';
import { moodAPI, recommendationAPI } from '../services/api';
import toast from 'react-hot-toast';

const MoodContext = createContext(null);

export const MoodProvider = ({ children }) => {
  const [latestMood, setLatestMood] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submitMood = useCallback(async (moodData) => {
    setSubmitting(true);
    try {
      // Transform frontend field names to match backend API
      const payload = {
        moodScore: moodData.moodRating,
        selectedEmotions: (moodData.selectedEmotions || []).map(e => e.toLowerCase()),
        rawText: moodData.moodText || '',
        context: {
          sleepHours: moodData.physicalState?.sleepHours,
          exercisedToday: moodData.physicalState?.exercisedToday,
          stressors: moodData.triggers || [],
        },
      };
      const { data } = await moodAPI.submit(payload);
      setLatestMood(data.moodEntry);

      if (data.crisisDetected) {
        toast('We\'re here for you. Please reach out to a trusted person. 💙', {
          icon: '🆘',
          duration: 10000,
        });
      }

      // Fetch recommendations shortly after (they build async)
      setTimeout(async () => {
        try {
          const recRes = await recommendationAPI.getLatest();
          if (recRes.data.data) setRecommendations(recRes.data.data);
        } catch {}
      }, 3000);

      return data;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      const { data } = await recommendationAPI.getLatest();
      setRecommendations(data.data);
      return data.data;
    } catch (err) {
      toast.error('Could not load recommendations');
      throw err;
    }
  }, []);

  const fetchAnalytics = useCallback(async (period = 30) => {
    try {
      const { data } = await moodAPI.getAnalytics({ period });
      setAnalytics(data.analytics);
      return data.analytics;
    } catch (err) {
      throw err;
    }
  }, []);

  return (
    <MoodContext.Provider value={{
      latestMood,
      recommendations,
      analytics,
      submitting,
      submitMood,
      fetchRecommendations,
      fetchAnalytics,
      setRecommendations,
    }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) throw new Error('useMood must be used within MoodProvider');
  return context;
};
