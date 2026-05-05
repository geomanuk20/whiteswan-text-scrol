import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import NewsTicker from './components/NewsTicker';
import AdminPanel from './components/AdminPanel';
import NewsCard from './components/NewsCard';

function App() {
  const [scrolls, setScrolls] = useState([]);
  const [displayMode, setDisplayMode] = useState('scroll'); // 'scroll', 'text', 'both'
  const [textDuration, setTextDuration] = useState(5);

  const [bothActiveView, setBothActiveView] = useState('scroll');

  const fetchData = async () => {
    try {
      const [scrollsRes, settingsRes] = await Promise.all([
        axios.get('http://localhost:5005/api/scrolls'),
        axios.get('http://localhost:5005/api/settings')
      ]);
      setScrolls(scrollsRes.data);
      if (settingsRes.data) {
        setDisplayMode(settingsRes.data.displayMode);
        if (settingsRes.data.textDuration !== undefined) {
          setTextDuration(settingsRes.data.textDuration);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

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
        {/* Admin Dashboard Route */}
        <Route path="/admin" element={
          <div className="container">
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
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
              />
            </main>
          </div>
        } />

        {/* Public Output Route (Clean Feed) */}
        <Route path="/" element={<div style={{ width: '100vw', height: '100vh', background: 'transparent' }} />} />
      </Routes>

      {/* Broadcast Graphics (Visible globally for preview & live output) */}
      {displayMode === 'scroll' && (
        <NewsTicker scrolls={scrollingItems} mode={displayMode} />
      )}
      {displayMode === 'text' && (
        <NewsCard items={cardItems} mode={displayMode} textDuration={textDuration} />
      )}
      
      {/* BOTH MODE: Sequential Loop */}
      {displayMode === 'both' && bothActiveView === 'scroll' && (
        <NewsTicker scrolls={scrollingItems} mode={displayMode} onComplete={() => handleBothComplete('scroll')} />
      )}
      {displayMode === 'both' && bothActiveView === 'text' && (
        <NewsCard items={cardItems} mode={displayMode} textDuration={textDuration} onComplete={() => handleBothComplete('text')} />
      )}
    </>
  );
}

export default App;
