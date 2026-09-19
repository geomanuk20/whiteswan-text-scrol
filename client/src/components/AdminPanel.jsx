import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Send, Type, Activity, Edit2, X, CheckCircle, List, FileText, Monitor, Play, PhoneCall, Image as ImageIcon, LayoutGrid } from 'lucide-react';

const AdminPanel = ({ scrolls, fetchScrolls, displayMode, setDisplayMode, textDuration, setTextDuration, scrollSpeed, setScrollSpeed }) => {
  const [activeTab, setActiveTab] = useState('scroll'); // 'scroll', 'text', 'call', 'thumb', 'full'
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [secondaryImage, setSecondaryImage] = useState('');
  const [type, setType] = useState('none');
  const [animation, setAnimation] = useState('scroll-left');
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleModeChange = async (mode) => {
    setDisplayMode(mode);
    try {
      await axios.post('/api/settings', { displayMode: mode, textDuration, scrollSpeed });
      showToast(`Mode switched to ${mode.toUpperCase()}!`);
    } catch (error) {
      console.error('Error updating display mode:', error);
      showToast('Error setting mode', 'error');
    }
  };

  const handleDurationChange = async (duration) => {
    setTextDuration(duration);
    try {
      await axios.post('/api/settings', { displayMode, textDuration: duration, scrollSpeed });
    } catch (error) {
      console.error('Error updating duration:', error);
    }
  };

  const handleScrollSpeedChange = async (speed) => {
    setScrollSpeed(speed);
    try {
      await axios.post('/api/settings', { displayMode, textDuration, scrollSpeed: speed });
    } catch (error) {
      console.error('Error updating scroll speed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalText = activeTab === 'call' ? (name || 'LIVE CALL') : (text || '');
    if (activeTab !== 'thumb' && activeTab !== 'call' && !finalText) return;
    try {
      if (editingId) {
        await axios.put(`/api/scrolls/${editingId}`, { 
          text: finalText, 
          name,
          image,
          secondaryImage,
          type, 
          category: activeTab,
          animation 
        });
        showToast('Update successful!');
      } else {
        await axios.post('/api/scrolls', { 
          text: finalText, 
          name,
          image,
          secondaryImage,
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
    setName('');
    setImage('');
    setSecondaryImage('');
    setType('none');
    setAnimation(targetTab === 'scroll' ? 'scroll-left' : 'slide-up');
    setEditingId(null);
  };

  const startEdit = (scroll) => {
    setEditingId(scroll._id);
    setText(scroll.text || '');
    setName(scroll.name || '');
    setImage(scroll.image || '');
    setSecondaryImage(scroll.secondaryImage || '');
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

  const getTabLabel = () => {
    if (activeTab === 'scroll') return 'Scroll';
    if (activeTab === 'text') return 'Text';
    if (activeTab === 'call') return 'Live Call';
    if (activeTab === 'thumb') return 'Thumb Card';
    if (activeTab === 'full') return 'Full Graphic Card';
    return 'Item';
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImage(dataUrl);
        showToast('Photo uploaded & optimized!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSecondaryImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSecondaryImage(dataUrl);
        showToast('Secondary photo uploaded!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="admin-card glass">
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <CheckCircle size={20} /> {toast.message}
        </div>
      )}

      {/* Mode Control Bar */}
      <div className="mode-control" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#1d3557', fontWeight: 'bold' }}>
            <Monitor size={20} /> LIVE DISPLAY MODE:
          </div>
          <div className="mode-buttons" style={{ flexWrap: 'wrap' }}>
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
              className={`mode-btn ${displayMode === 'call' ? 'active' : ''}`}
              onClick={() => handleModeChange('call')}
            >
              LIVE CALL MODE
            </button>
            <button 
              className={`mode-btn ${displayMode === 'thumb' ? 'active' : ''}`}
              onClick={() => handleModeChange('thumb')}
            >
              THUMB CARD MODE
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
            FLASH / CALL DISPLAY DURATION:
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

      <div className="admin-tabs" style={{ flexWrap: 'wrap' }}>
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
        <button 
          className={`tab-btn ${activeTab === 'call' ? 'active' : ''}`}
          onClick={() => { setActiveTab('call'); resetForm('call'); }}
        >
          <PhoneCall size={18} /> Manage Live Call
        </button>
        <button 
          className={`tab-btn ${activeTab === 'thumb' ? 'active' : ''}`}
          onClick={() => { setActiveTab('thumb'); resetForm('thumb'); }}
        >
          <ImageIcon size={18} /> Manage Thumb Cards
        </button>
      </div>

      <div className="tab-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            {editingId ? <Edit2 size={24} color="#e63946" /> : <Send size={24} color="#e63946" />} 
            {editingId ? `Edit ${getTabLabel()}` : `Manage ${getTabLabel()}`}
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

          {activeTab === 'thumb' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
              {/* Primary Main Image Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: '#1d3557' }}>
                  🖼️ Main Graphic Image (File Upload or URL) *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    id="thumb-file-input"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="thumb-file-input"
                    style={{ padding: '0.75rem 1rem', background: '#1d3557', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >
                    📁 CHOOSE FILE
                  </label>
                  <input
                    type="text"
                    placeholder="or paste main image URL..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '2px solid #eee', margin: 0, fontSize: '0.9rem' }}
                  />
                </div>
                {image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <img 
                      src={image} 
                      alt="Main Preview" 
                      style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #e63946' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#2b9348', fontWeight: 'bold' }}>✓ Main Image Loaded</span>
                    <button 
                      type="button" 
                      onClick={() => setImage('')} 
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Secondary Optional Image Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: '#1d3557' }}>
                  🖼️ Secondary Image (Optional - File Upload or URL)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSecondaryImageFileUpload}
                    id="thumb-secondary-file-input"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="thumb-secondary-file-input"
                    style={{ padding: '0.75rem 1rem', background: '#457b9d', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >
                    📁 CHOOSE FILE
                  </label>
                  <input
                    type="text"
                    placeholder="or paste secondary image URL..."
                    value={secondaryImage}
                    onChange={(e) => setSecondaryImage(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '2px solid #eee', margin: 0, fontSize: '0.9rem' }}
                  />
                </div>
                {secondaryImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <img 
                      src={secondaryImage} 
                      alt="Secondary Preview" 
                      style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #457b9d' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#2b9348', fontWeight: 'bold' }}>✓ Secondary Image Loaded</span>
                    <button 
                      type="button" 
                      onClick={() => setSecondaryImage('')} 
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'call' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: '#1d3557' }}>
                  📞 Caller / Reporter Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. അരവിന്ദ് സമീർ (റിപ്പോർട്ടർ)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #eee', marginBottom: 0 }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: '#1d3557' }}>
                  🖼️ Circle Photo (File Upload or URL)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    id="caller-file-input"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="caller-file-input"
                    style={{ padding: '0.75rem 1rem', background: '#1d3557', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >
                    📁 CHOOSE FILE
                  </label>
                  <input
                    type="text"
                    placeholder="or paste image URL..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '2px solid #eee', margin: 0, fontSize: '0.9rem' }}
                  />
                </div>
                {image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <img 
                      src={image} 
                      alt="Preview" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e63946' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#2b9348', fontWeight: 'bold' }}>✓ Photo Loaded</span>
                    <button 
                      type="button" 
                      onClick={() => setImage('')} 
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'call' && activeTab !== 'thumb' && (
            <textarea
              placeholder={activeTab === 'scroll' ? 'Enter news scrolling content here...' : 'Enter news content here...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={2}
              style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid #eee', marginBottom: '1rem', fontSize: '1rem', outline: 'none' }}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                <Type size={16} /> Label Type ({getTabLabel()})
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
              {editingId ? `Update ${getTabLabel()}` : `Add ${getTabLabel()}`}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn" style={{ background: '#eee', color: '#333' }}>
                <X size={18} /> Cancel
              </button>
            )}
          </div>
        </form>

        <div className="scroll-list">
          <h3>Active {getTabLabel()} Items</h3>
          {filteredScrolls.length === 0 ? (
            <p style={{ marginTop: '1rem', color: '#888' }}>No active entries. Add one above!</p>
          ) : (
            filteredScrolls.map((s) => (
              <div key={s._id} className="scroll-list-item">
                <div style={{ flex: 1 }}>
                  {s.name && <div style={{ fontSize: '0.85rem', color: '#e63946', fontWeight: 'bold', marginBottom: '2px' }}>📞 {s.name}</div>}
                  <div style={{ fontWeight: 'bold' }}>{s.text}</div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>
                    Type: {s.type || 'none'} | Anim: {s.animation || (activeTab === 'scroll' ? 'scroll-left' : 'slide-right')}
                    {s.image && ' | Photo: Attached'}
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
