import { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('tools');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize user profile on mount
  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      const response = await api.getProfile(token);
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <h1>🤖 DevTools Pro</h1>
          <p>AI-Powered Code Assistant Platform</p>
        </div>
        <nav className="nav">
          <button
            className={`nav-btn ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            🛠️ Tools
          </button>
          <button
            className={`nav-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            💰 Plans
          </button>
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            📖 Docs
          </button>
        </nav>
        {token ? (
          <div className="user-info">
            <span>👤 {user?.name || 'User'}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button
            className="btn-login"
            onClick={() => setActiveTab('pricing')}
          >
            🔐 Login
          </button>
        )}
      </header>

      <main className="main">
        {activeTab === 'tools' && <ToolsPage token={token} user={user} />}
        {activeTab === 'pricing' && <PricingPage />}
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'docs' && <DocsPage />}
      </main>

      <footer className="footer">
        <p>© 2026 DevTools Pro. Built with ❤️ by iiixiyan</p>
      </footer>
    </div>
  );
}

// Tools Page - Main Feature
function ToolsPage({ token, user }) {
  const [activeTool, setActiveTool] = useState('generator');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    if (!token) {
      alert('Please login first!');
      return;
    }

    if (!description) {
      alert('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const response = await api.generateCode(language, description);
      if (response.success) {
        setResult(response.code);
      } else {
        alert('Failed to generate code: ' + response.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="tools-page">
      <div className="tools-container">
        <div className="tools-sidebar">
          <div className="tool-selector">
            <h3>Select Tool</h3>
            <button
              className={`tool-btn ${activeTool === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveTool('generator')}
            >
              📝 Code Generator
            </button>
            <button
              className={`tool-btn ${activeTool === 'optimizer' ? 'active' : ''}`}
              onClick={() => setActiveTool('optimizer')}
            >
              ⚡ Code Optimizer
            </button>
            <button
              className={`tool-btn ${activeTool === 'explainer' ? 'active' : ''}`}
              onClick={() => setActiveTool('explainer')}
            >
              📖 Code Explainer
            </button>
            <button
              className={`tool-btn ${activeTool === 'bug-detector' ? 'active' : ''}`}
              onClick={() => setActiveTool('bug-detector')}
            >
              🐛 Bug Detector
            </button>
          </div>

          <div className="tool-info">
            <h4>{activeTool === 'generator' && 'Code Generator'}</h4>
            <p>Generate code from natural language descriptions.</p>
          </div>
        </div>

        <div className="tools-main">
          {activeTool === 'generator' && (
            <div className="tool-panel">
              <h2>📝 Code Generator</h2>
              <div className="input-group">
                <label>Select Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the function or code you want to generate..."
                  rows={4}
                />
              </div>
              <button
                className="btn-generate"
                onClick={generateCode}
                disabled={loading}
              >
                {loading ? '⏳ Generating...' : '🚀 Generate Code'}
              </button>

              {result && (
                <div className="result-panel">
                  <h3>Generated Code</h3>
                  <pre><code>{result}</code></pre>
                  <button className="btn-copy" onClick={() => {
                    navigator.clipboard.writeText(result);
                    alert('Copied to clipboard!');
                  }}>
                    📋 Copy Code
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTool === 'optimizer' && (
            <div className="tool-panel">
              <h2>⚡ Code Optimizer</h2>
              <p>Optimize your existing code for performance and readability.</p>
              <div className="input-group">
                <label>Language</label>
                <select>
                  <option>JavaScript</option>
                  <option>Python</option>
                  <option>TypeScript</option>
                  <option>Java</option>
                </select>
              </div>
              <div className="input-group">
                <label>Enter Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={8}
                />
              </div>
              <button className="btn-generate">Optimize Code</button>
              <div className="result-panel">
                <h3>Optimized Code</h3>
                <p>Features: Performance improvements, better readability, best practices applied</p>
              </div>
            </div>
          )}

          {activeTool === 'explainer' && (
            <div className="tool-panel">
              <h2>📖 Code Explainer</h2>
              <p>Get a clear explanation of any code snippet.</p>
              <div className="input-group">
                <label>Enter Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={8}
                />
              </div>
              <button className="btn-generate">Explain Code</button>
              <div className="result-panel">
                <h3>Code Explanation</h3>
                <p>Clear and simple explanation of how the code works...</p>
              </div>
            </div>
          )}

          {activeTool === 'bug-detector' && (
            <div className="tool-panel">
              <h2>🐛 Bug Detector</h2>
              <p>Analyze your code for bugs, security issues, and potential problems.</p>
              <div className="input-group">
                <label>Language</label>
                <select>
                  <option>JavaScript</option>
                  <option>Python</option>
                  <option>TypeScript</option>
                  <option>Java</option>
                </select>
              </div>
              <div className="input-group">
                <label>Enter Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={8}
                />
              </div>
              <button className="btn-generate">Detect Bugs</button>
              <div className="result-panel">
                <h3>Bug Report</h3>
                <p>Review output...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Pricing Page
function PricingPage() {
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.getPlans();
      if (response.success) {
        setPlans(response.plans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Upgrade to unlock full potential of DevTools Pro</p>
        </div>

        {plans && (
          <div className="pricing-grid">
            {Object.entries(plans).map(([key, plan]) => (
              <div className={`price-card ${key === 'pro' ? 'featured' : ''}`} key={key}>
                <h3>{plan.name}</h3>
                <p className="price">${plan.price}<span className="period">/month</span></p>
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button className="btn-primary">
                  {key === 'free' ? 'Start Free' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Dashboard Page
function Dashboard({ user }) {
  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>GitHub Stars</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>GitHub Forks</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Users</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Current Plan</h3>
          <p>{user?.plan || 'Free'}</p>
        </div>
      </div>

      <div className="progress-section">
        <h2>2-Year Goals ($500,000 Revenue)</h2>
        <div className="milestones">
          <div className="milestone">
            <h3>Q1 2026</h3>
            <p>Project Setup ✓</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="milestone">
            <h3>Q2 2026</h3>
            <p>MVP Release</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '10%' }}></div>
            </div>
          </div>
          <div className="milestone">
            <h3>Q4 2026</h3>
            <p>1,000 Users</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="milestone">
            <h3>Q4 2027</h3>
            <p>$500,000 Revenue</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Docs Page
function DocsPage() {
  return (
    <div className="docs-page">
      <h2>📖 Documentation</h2>
      <div className="docs-content">
        <h3>Getting Started</h3>
        <p>Welcome to DevTools Pro! Here's how to get started...</p>

        <h3>Features</h3>
        <ul>
          <li>Code Generation</li>
          <li>Code Optimization</li>
          <li>Code Explanation</li>
          <li>Bug Detection</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
