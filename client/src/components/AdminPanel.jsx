import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Send, Type, Activity, Edit2, X, CheckCircle, List, FileText, Monitor, Play } from 'lucide-react';

const AdminPanel = ({ scrolls, fetchScrolls, displayMode, setDisplayMode, textDuration, setTextDuration, scrollSpeed, setScrollSpeed }) => {
  const [activeTab, setActiveTab] = useState('scroll'); // 'scroll' or 'text'
  const [text, setText] = useState('');
  const [type, setType] = useState('none');
  const [animation, setAnimation] = useState('scroll-left');
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleModeChange = async (mode) => {
    try {
      await axios.post('/api/settings', { displayMode: mode });
      setDisplayMode(mode);
      showToast(`Display mode switched to ${mode.toUpperCase()}`);
    } catch (error) {
      console.error('Error updating display mode:', error);
    }
  };

  const handleDurationChange = async (duration) => {
    try {
      await axios.post('/api/settings', { textDuration: duration });
      setTextDuration(duration);
      showToast(`Text duration set to ${duration}s`);
    } catch (error) {
      console.error('Error updating text duration:', error);
      showToast('Error updating duration', 'error');
    }
  };

  const handleScrollSpeedChange = async (speed) => {
    try {
      await axios.post('/api/settings', { scrollSpeed: speed });
      setScrollSpeed(speed);
      showToast(`Scroll speed set to ${speed}s`);
    } catch (error) {
      console.error('Error updating scroll speed:', error);
      showToast('Error updating scroll speed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;
    try {
      if (editingId) {
        await axios.put(`/api/scrolls/${editingId}`, { 
          text, 
          type, 
          category: activeTab,
          animation 
        });
        showToast('Update successful!');
      } else {
        await axios.post('/api/scrolls', { 
          text, 
          type, 
          category: activeTab,
          animation 
        });
        showToast('New entry added!');
      }
      resetForm();
      fetchScrolls();
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Error saving data', 'error');
    }
  };

  const resetForm = (targetTab = activeTab) => {
    setText('');
    setType('none');
    setAnimation(targetTab === 'scroll' ? 'scroll-left' : 'curtain');
    setEditingId(null);
  };

  const startEdit = (scroll) => {
    setEditingId(scroll._id);
    setText(scroll.text);
    setType(scroll.type || 'none');
    setAnimation(scroll.animation || (scroll.category === 'text' ? 'curtain' : 'scroll-left'));
    setActiveTab(scroll.category || 'scroll');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteScroll = async (id) => {
    try {
      await axios.delete(`/api/scrolls/${id}`);
      showToast('Successfully deleted!');
      fetchScrolls();
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Error deleting data', 'error');
    }
  };

  const filteredScrolls = scrolls.filter(s => (s.category || 'scroll') === activeTab);

  return (
    <div className="admin-card glass">
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <CheckCircle size={20} /> {toast.message}
        </div>
      )}

      {/* Mode Control Bar */}
      <div className="mode-control" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#1d3557', fontWeight: 'bold' }}>
            <Monitor size={20} /> LIVE DISPLAY MODE:
          </div>
          <div className="mode-buttons">
            <button 
              className={`mode-btn ${displayMode === 'scroll' ? 'active' : ''}`}
              onClick={() => handleModeChange('scroll')}
            >
              TICKER MODE
            </button>
            <button 
              className={`mode-btn ${displayMode === 'text' ? 'active' : ''}`}
              onClick={() => handleModeChange('text')}
            >
              CARD MODE
            </button>
            <button 
              className={`mode-btn ${displayMode === 'both' ? 'active' : ''}`}
              onClick={() => handleModeChange('both')}
            >
              BOTH MODE
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
          <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>
            FLASH TEXT DISPLAY DURATION:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="number" 
              min="1" 
              max="60" 
              value={textDuration || 5} 
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              style={{ width: '80px', padding: '0.5rem', borderRadius: '8px', border: '2px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#1d3557', margin: 0 }}
            />
            <span style={{ color: '#64748b', fontWeight: 'bold' }}>Seconds</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>
            SCROLL SPEED SETTING (TICKER):
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={scrollSpeed || 25} 
              onChange={(e) => handleScrollSpeedChange(Number(e.target.value))}
              style={{ width: '80px', padding: '0.5rem', borderRadius: '8px', border: '2px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#1d3557', margin: 0 }}
            />
            <span style={{ color: '#64748b', fontWeight: 'bold' }}>Seconds</span>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'scroll' ? 'active' : ''}`}
          onClick={() => { setActiveTab('scroll'); resetForm('scroll'); }}
        >
          <List size={18} /> Manage News Scroll
        </button>
        <button 
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => { setActiveTab('text'); resetForm('text'); }}
        >
          <FileText size={18} /> Manage News Text
        </button>
      </div>

      <div className="tab-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            {editingId ? <Edit2 size={24} color="#e63946" /> : <Send size={24} color="#e63946" />} 
            {editingId ? `Edit ${activeTab === 'scroll' ? 'Scroll' : 'Text'}` : `Manage News ${activeTab === 'scroll' ? 'Scroll' : 'Text'}`}
          </h2>
          
          {/* Quick Go Live button */}
          <button 
            className="btn btn-go-live"
            onClick={() => handleModeChange(activeTab)}
          >
            <Play size={16} fill="white" /> GO LIVE WITH THIS CATEGORY
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder={`Enter news ${activeTab === 'scroll' ? 'scrolling' : 'static'} text here...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={activeTab === 'text' ? 4 : 2}
            style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid #eee', marginBottom: '1rem', fontSize: '1rem', outline: 'none' }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                <Type size={16} /> {activeTab === 'scroll' ? 'Scroll Type' : 'Text Type'}
              </label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #eee' }}
              >
                <option value="none">None (No Label)</option>
                <option value="breaking">Breaking News</option>
                <option value="update">Regular Update</option>
                <option value="alert">Alert</option>
                <option value="info">Information</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                <Activity size={16} /> Animation Type
              </label>
              <select 
                value={animation} 
                onChange={(e) => setAnimation(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #eee' }}
              >
                {activeTab === 'scroll' ? (
                  <>
                    <option value="scroll-left">Scroll Left (Normal)</option>
                    <option value="scroll-fast">Scroll Left (Fast)</option>
                    <option value="fade">Fade In/Out</option>
                    <option value="pulse">Pulse Effect</option>
                  </>
                ) : (
                  <>
                    <option value="zoom-in">Zoom In</option>
                    <option value="bounce">Bounce Effect</option>
                    <option value="fade">Fade In</option>
                    <option value="pulse">Pulse Alert</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="flip-x">3D Flip</option>
                    <option value="flash-glitch">News Flash Glitch</option>
                    <option value="cube-break">3D Cube Break</option>
                    <option value="curtain">Curtain Reveal</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {editingId ? `Update ${activeTab === 'scroll' ? 'Scroll' : 'Text'}` : `Add News ${activeTab === 'scroll' ? 'Scroll' : 'Text'}`}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn" style={{ background: '#eee', color: '#333' }}>
                <X size={18} /> Cancel
              </button>
            )}
          </div>
        </form>

        <div className="scroll-list">
          <h3>Active {activeTab === 'scroll' ? 'Scrolls' : 'Text Items'}</h3>
          {filteredScrolls.length === 0 ? (
            <p style={{ marginTop: '1rem', color: '#888' }}>No active entries. Add one above!</p>
          ) : (
            filteredScrolls.map((s) => (
              <div key={s._id} className="scroll-list-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{s.text}</div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>
                    Type: {s.type || 'none'} | Anim: {s.animation || (activeTab === 'scroll' ? 'scroll-left' : 'slide-right')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="edit-btn" onClick={() => startEdit(s)} title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button className="delete-btn" onClick={() => deleteScroll(s._id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
