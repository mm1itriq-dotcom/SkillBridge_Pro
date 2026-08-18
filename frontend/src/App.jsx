import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import Dashboard from './pages/Dashboard'
import './index.css'

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [username, setUsername] = useState('User');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) {
          // Capitalize first letter of email prefix
          const prefix = payload.email.split('@')[0];
          setUsername(prefix.charAt(0).toUpperCase() + prefix.slice(1));
        }
      } catch(e) {}
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      {!isAuthPage && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>SkillBridge</h2>
          </div>
          <nav className="nav-links">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/catalog" className={location.pathname === '/catalog' ? 'active' : ''}>
              Course Catalog
            </Link>
          </nav>
          
          <div className="sidebar-footer">
            <span className="welcome-text">Welcome back, {username}</span>
            <button 
              className="theme-toggle" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
