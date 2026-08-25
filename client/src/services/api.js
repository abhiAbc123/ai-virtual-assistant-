const API_BASE = '/api';

/**
 * Helper to get authorization headers
 */
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('jarvis_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// API Services
export const authApi = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  demoLogin: async () => {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  googleOAuth: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  facebookOAuth: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

export const assistantApi = {
  getPresets: async () => {
    const res = await fetch(`${API_BASE}/assistant/presets`);
    return res.json();
  },

  getSettings: async () => {
    const res = await fetch(`${API_BASE}/assistant/settings`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/assistant/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${API_BASE}/assistant/upload-avatar`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return res.json();
  },
};

export const chatApi = {
  sendMessage: async (message, assistantConfig) => {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, assistantConfig }),
    });
    return res.json();
  },

  sendVoiceMessage: async (base64Audio, mimeType, assistantConfig) => {
    const res = await fetch(`${API_BASE}/chat/voice`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ base64Audio, mimeType, assistantConfig }),
    });
    return res.json();
  },

  getHistory: async () => {
    const res = await fetch(`${API_BASE}/chat/history`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  clearHistory: async () => {
    const res = await fetch(`${API_BASE}/chat/history`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
