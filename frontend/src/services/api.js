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

  // Template generation
  generateFromTemplate: async (templateId, parameters) => {
    const response = await fetch(`${API_URL}/api/v1/templates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId, parameters })
    });
    return response.json();
  },

  getTemplates: async (category = null, language = null) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (language) params.append('language', language);

    const url = params.toString()
      ? `${API_URL}/api/v1/templates/templates?${params}`
      : `${API_URL}/api/v1/templates/templates`;

    const response = await fetch(url);
    return response.json();
  },

  getTemplate: async (id) => {
    const response = await fetch(`${API_URL}/api/v1/templates/templates/${id}`);
    return response.json();
  },

  // API documentation
  generateAPIDocs: async (apiDefinition) => {
    const response = await fetch(`${API_URL}/api/v1/api-docs/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiDefinition })
    });
    return response.json();
  },

  generateSwagger: async (apiDefinition) => {
    const response = await fetch(`${API_URL}/api/v1/api-docs/swagger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiDefinition })
    });
    return response.json();
  },

  generatePostman: async (apiDefinition) => {
    const response = await fetch(`${API_URL}/api/v1/api-docs/postman`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiDefinition })
    });
    return response.json();
  },

  generateHTMLDocs: async (apiDefinition) => {
    const response = await fetch(`${API_URL}/api/v1/api-docs/html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiDefinition })
    });
    return response.json();
  },

  // Test generation
  generateUnitTests: async (code, language = 'javascript') => {
    const response = await fetch(`${API_URL}/api/v1/tests/unit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language })
    });
    return response.json();
  },

  generateIntegrationTests: async (apiEndpoints, data) => {
    const response = await fetch(`${API_URL}/api/v1/tests/integration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiEndpoints, data })
    });
    return response.json();
  },

  generateE2ETests: async (userFlow, features) => {
    const response = await fetch(`${API_URL}/api/v1/tests/e2e`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userFlow, features })
    });
    return response.json();
  },

  generateCoverageReport: async (testResults) => {
    const response = await fetch(`${API_URL}/api/v1/tests/coverage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testResults })
    });
    return response.json();
  },

  getTestBestPractices: async (language = 'javascript') => {
    const response = await fetch(`${API_URL}/api/v1/tests/best-practices?language=${language}`);
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
