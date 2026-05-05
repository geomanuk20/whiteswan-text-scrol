import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import NewsTicker from './components/NewsTicker';
import AdminPanel from './components/AdminPanel';
import NewsCard from './components/NewsCard';
import Login from './components/Login';

function App() {
  const [scrolls, setScrolls] = useState([]);
  const [displayMode, setDisplayMode] = useState('scroll'); // 'scroll', 'text', 'both'
  const [textDuration, setTextDuration] = useState(5);
  const [scrollSpeed, setScrollSpeed] = useState(70);
  const [auth, setAuth] = useState({ token: localStorage.getItem('whiteswan_token'), user: null });
  const [bothActiveView, setBothActiveView] = useState('scroll');
  const navigate = useNavigate();

  // Add axios interceptor for auth
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [auth.token]);

  const fetchData = async () => {
    try {
      const [scrollsRes, settingsRes] = await Promise.all([
        axios.get('/api/scrolls'),
        axios.get('/api/settings')
      ]);
      setScrolls(scrollsRes.data);
      if (settingsRes.data) {
        setDisplayMode(settingsRes.data.displayMode);
        if (settingsRes.data.textDuration !== undefined) {
          setTextDuration(settingsRes.data.textDuration);
        }
        if (settingsRes.data.scrollSpeed !== undefined) {
          setScrollSpeed(settingsRes.data.scrollSpeed);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const verifyAuth = async () => {
    if (!auth.token) return;
    try {
      const response = await axios.get('/api/auth/verify');
      setAuth(prev => ({ ...prev, user: response.data.username }));
    } catch (error) {
      handleLogout();
    }
  };

  useEffect(() => {
    fetchData();
    verifyAuth();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('whiteswan_token');
    setAuth({ token: null, user: null });
    navigate('/login');
  };

  // Reset the loop to scroll when mode changes to 'both'
  useEffect(() => {
    if (displayMode === 'both') {
      setBothActiveView('scroll');
    }
  }, [displayMode]);

  const handleBothComplete = (currentView) => {
    if (displayMode === 'both') {
      setBothActiveView(currentView === 'scroll' ? 'text' : 'scroll');
    }
  };

  // Filter items based on category
  const scrollingItems = scrolls.filter(s => (s.category || 'scroll') === 'scroll');
  const cardItems = scrolls.filter(s => s.category === 'text');

  return (
    <>
      <Routes>
        {/* Admin Dashboard Route (Protected) */}
        <Route path="/admin" element={
          auth.token ? (
            <div className="container">
              <header style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
                <button 
                  onClick={handleLogout}
                  style={{ position: 'absolute', right: 0, top: 0, padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', color: '#e63946' }}
                >
                  LOGOUT
                </button>
                <h1 style={{ fontSize: '2.5rem', color: '#1d3557', marginBottom: '0.2rem' }}>
                  Broadcast <span style={{ color: '#e63946' }}>Dashboard</span>
                </h1>
                <p style={{ color: '#666' }}>Control your news ticker and alerts in real-time</p>
              </header>

              <main>
                <AdminPanel 
                  scrolls={scrolls} 
                  fetchScrolls={fetchData} 
                  displayMode={displayMode} 
                  setDisplayMode={setDisplayMode}
                  textDuration={textDuration}
                  setTextDuration={setTextDuration}
                  scrollSpeed={scrollSpeed}
                  setScrollSpeed={setScrollSpeed}
                />
              </main>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />

        {/* Login Route */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />

        {/* Public Output Route (Clean Feed) */}
        <Route path="/" element={<div style={{ width: '100vw', height: '100vh', background: 'transparent' }} />} />
      </Routes>

      {/* Broadcast Graphics (Visible globally for preview & live output) */}
      {displayMode === 'scroll' && (
        <NewsTicker scrolls={scrollingItems} mode={displayMode} scrollSpeed={scrollSpeed} />
      )}
      {displayMode === 'text' && (
        <NewsCard items={cardItems} mode={displayMode} textDuration={textDuration} />
      )}
      
      {/* BOTH MODE: Sequential Loop */}
      {displayMode === 'both' && bothActiveView === 'scroll' && (
        <NewsTicker scrolls={scrollingItems} mode={displayMode} scrollSpeed={scrollSpeed} onComplete={() => handleBothComplete('scroll')} />
      )}
      {displayMode === 'both' && bothActiveView === 'text' && (
        <NewsCard items={cardItems} mode={displayMode} textDuration={textDuration} onComplete={() => handleBothComplete('text')} />
      )}
    </>
  );
}

export default App;
