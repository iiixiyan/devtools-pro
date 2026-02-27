import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <h1>DevTools Pro</h1>
          <p>Professional Developer Tools Platform</p>
        </div>
        <nav className="nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            Tools
          </button>
          <button
            className={`nav-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing
          </button>
          <button
            className={`nav-btn ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            Docs
          </button>
        </nav>
      </header>

      <main className="main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'tools' && <ToolsPage />}
        {activeTab === 'pricing' && <PricingPage />}
        {activeTab === 'docs' && <DocsPage />}
      </main>

      <footer className="footer">
        <p>© 2026 DevTools Pro. Open Source & MIT License.</p>
      </footer>
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  return (
    <div className="dashboard">
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
          <h3>Revenue (MRR)</h3>
          <p>$0</p>
        </div>
      </div>

      <div className="progress-section">
        <h2>2-Year Goals</h2>
        <div className="milestones">
          <div className="milestone">
            <h3>Q1 2026</h3>
            <p>Project Setup</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="milestone">
            <h3>Q2 2026</h3>
            <p>MVP Release</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="milestone">
            <h3>Q3 2026</h3>
            <p>First 100 Users</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="milestone">
            <h3>Q4 2026</h3>
            <p>Product Launch</p>
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
  )
}

// Tools Page
function ToolsPage() {
  return (
    <div className="tools-page">
      <h2>Developer Tools</h2>
      <div className="tools-grid">
        <div className="tool-card">
          <h3>Tool 1</h3>
          <p>Description of tool 1...</p>
          <button className="btn-primary">Coming Soon</button>
        </div>
        <div className="tool-card">
          <h3>Tool 2</h3>
          <p>Description of tool 2...</p>
          <button className="btn-primary">Coming Soon</button>
        </div>
        <div className="tool-card">
          <h3>Tool 3</h3>
          <p>Description of tool 3...</p>
          <button className="btn-primary">Coming Soon</button>
        </div>
        <div className="tool-card">
          <h3>Tool 4</h3>
          <p>Description of tool 4...</p>
          <button className="btn-primary">Coming Soon</button>
        </div>
      </div>
    </div>
  )
}

// Pricing Page
function PricingPage() {
  return (
    <div className="pricing-page">
      <h2>Pricing</h2>
      <div className="pricing-grid">
        <div className="price-card">
          <h3>Free</h3>
          <p className="price">$0/month</p>
          <ul>
            <li>Basic Tools</li>
            <li>Community Support</li>
            <li>1 Project</li>
          </ul>
          <button className="btn-secondary">Get Started</button>
        </div>
        <div className="price-card featured">
          <div className="badge">Most Popular</div>
          <h3>Pro</h3>
          <p className="price">$9/month</p>
          <ul>
            <li>All Tools</li>
            <li>Priority Support</li>
            <li>5 Projects</li>
            <li>API Access</li>
          </ul>
          <button className="btn-primary">Start Free Trial</button>
        </div>
        <div className="price-card">
          <h3>Enterprise</h3>
          <p className="price">$29/month</p>
          <ul>
            <li>Everything in Pro</li>
            <li>24/7 Support</li>
            <li>Unlimited Projects</li>
            <li>Custom Integration</li>
          </ul>
          <button className="btn-secondary">Contact Sales</button>
        </div>
      </div>
    </div>
  )
}

// Docs Page
function DocsPage() {
  return (
    <div className="docs-page">
      <h2>Documentation</h2>
      <div className="docs-content">
        <h3>Welcome to DevTools Pro</h3>
        <p>Get started with our developer tools platform...</p>
      </div>
    </div>
  )
}

export default App
