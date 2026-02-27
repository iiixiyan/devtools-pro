const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = {
  // Code generation
  generateCode: async (language, description, complexity = 'medium') => {
    const response = await fetch(`${API_URL}/api/v1/code/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, description, complexity })
    });
    return response.json();
  },

  // Code optimization
  optimizeCode: async (code, language) => {
    const response = await fetch(`${API_URL}/api/v1/code/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language })
    });
    return response.json();
  },

  // Code explanation
  explainCode: async (code) => {
    const response = await fetch(`${API_URL}/api/v1/code/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    return response.json();
  },

  // Bug detection
  detectBugs: async (code, language) => {
    const response = await fetch(`${API_URL}/api/v1/code/detect-bugs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language })
    });
    return response.json();
  },

  // Authentication
  register: async (email, password, name) => {
    const response = await fetch(`${API_URL}/api/v1/subscriptions/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name })
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/v1/subscriptions/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  getPlans: async () => {
    const response = await fetch(`${API_URL}/api/v1/subscriptions/plans`);
    return response.json();
  },

  upgradePlan: async (plan, token) => {
    const response = await fetch(`${API_URL}/api/v1/subscriptions/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan, token })
    });
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/api/v1/subscriptions/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  getUsage: async (token) => {
    const response = await fetch(`${API_URL}/api/v1/subscriptions/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  healthCheck: async () => {
    const response = await fetch(`${API_URL}/api/v1/health`);
    return response.json();
  }
};

export default api;
