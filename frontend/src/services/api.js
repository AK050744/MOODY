import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('moody_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('moody_token');
      localStorage.removeItem('moody_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/preferences', data),
  completeOnboarding: (data) => api.put('/auth/preferences', data),
  changePassword: (data) => api.put('/auth/preferences', data),
};

// ---- Mood ----
export const moodAPI = {
  submit: (data) => api.post('/mood/checkin', data),
  getHistory: (params) => api.get('/mood/history', { params }),
  getToday: () => api.get('/mood/today'),
  getAnalytics: (params) => api.get('/analytics/dashboard', { params }),
  getWeeklyReport: () => api.get('/analytics/weekly-report'),
  getPatterns: () => api.get('/analytics/patterns'),
  followUp: (id, data) => api.post(`/mood/${id}/followup`, data),
};

// ---- Recommendations ----
export const recommendationAPI = {
  getLatest: () => api.get('/recommendations'),
  getHistory: (params) => api.get('/recommendations', { params }),
  getByCategory: (category) => api.get('/recommendations', { params: { type: category } }),
  submitFeedback: (id, data) => api.post(`/recommendations/${id}/feedback`, data),
  refresh: () => api.get('/recommendations'),
};

// ---- Chat ----
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (params) => {
    const sessionId = params?.sessionId || params;
    return api.get(`/chat/history/${sessionId}`);
  },
  getSessions: () => api.get('/chat/sessions'),
  getActiveSession: () => api.get('/chat/sessions'),
  endSession: () => Promise.resolve({ data: { success: true } }),
  react: () => Promise.resolve({ data: { success: true } }),
};

// ---- Journal ----
export const journalAPI = {
  create: (data) => api.post('/journal', data),
  getAll: (params) => api.get('/journal', { params }),
  getOne: (id) => api.get(`/journal/${id}`),
  update: (id, data) => api.put(`/journal/${id}`, data),
  delete: (id) => api.delete(`/journal/${id}`),
  getPrompt: () => Promise.resolve({ data: { prompt: 'What are you grateful for today?' } }),
  getAnalytics: () => Promise.resolve({ data: { totalEntries: 0, streak: 0 } }),
};

// ---- Community ----
export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (data) => api.post('/community/posts', data),
  sendHug: (id) => api.post(`/community/posts/${id}/hug`),
  addReply: (id, data) => api.post(`/community/posts/${id}/reply`, data),
};

// ---- Feedback ----
export const feedbackAPI = {
  submit: (data) => Promise.resolve({ data: { success: true } }),
  getAll: () => Promise.resolve({ data: { feedback: [] } }),
};

// ---- Emergency ----
export const emergencyAPI = {
  getResources: () => api.get('/mood/calm-mode'),
  triggerCalmMode: () => api.get('/mood/calm-mode'),
};

export default api;
