import React, { useState, useEffect, useRef } from 'react';

const NewsTicker = ({ scrolls: incomingScrolls, mode, onComplete, scrollSpeed }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayScrolls, setDisplayScrolls] = useState(incomingScrolls);
  const pendingScrollsRef = useRef(incomingScrolls);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // When incomingScrolls change, just update the ref, don't update state immediately
  useEffect(() => {
    pendingScrollsRef.current = incomingScrolls;
    if (displayScrolls.length === 0 && incomingScrolls.length > 0) {
      setDisplayScrolls(incomingScrolls);
    }
  }, [incomingScrolls, displayScrolls.length]);

  // Handle empty scrolls in both mode
  useEffect(() => {
    if (mode === 'both' && onComplete && (!incomingScrolls || incomingScrolls.length === 0)) {
      onComplete();
    }
  }, [incomingScrolls, mode, onComplete]);

  const handleAnimationIteration = () => {
    if (JSON.stringify(displayScrolls) !== JSON.stringify(pendingScrollsRef.current)) {
      setDisplayScrolls(pendingScrollsRef.current);
    }
    if (mode === 'both' && onComplete) {
      onComplete();
    }
  };

  if (!displayScrolls || displayScrolls.length === 0) return null;

  // Double the items for seamless looping
  const items = [...displayScrolls, ...displayScrolls];

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  const getItemStyle = (item) => {
    let color = 'white';
    if (item.type === 'breaking') color = '#fff';
    if (item.type === 'alert') color = '#ffff00';
    if (item.type === 'info') color = '#00ffff';
    return { color };
  };

  const getContentClass = () => {
    const hasFast = displayScrolls.some(s => s.animation === 'scroll-fast');
    return `ticker-content ${hasFast ? 'fast' : ''}`;
  };

  return (
    <div className="ticker-container">
      <div className="ticker-wrapper">
        {/* Brand Section (Matches Flash Mode) */}
        <div className="flash-branding" style={{ zIndex: 20 }}>
          <div className="logo-box-white">
            <img src="/logo.png" alt="Whites TV News" className="flash-logo" />
            <div className="live-clock-blue">
              LIVE | {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Ticker Content */}
        <div 
          className={getContentClass()} 
          onAnimationIteration={handleAnimationIteration}
          style={{ animationDuration: `${scrollSpeed || 25}s` }}
        >
          {items.map((item, index) => (
            <div 
              key={`${item._id}-${index}`} 
              className={`ticker-item ${item.animation || ''}`}
              style={getItemStyle(item)}
            >
              {item.type === 'breaking' && <span className="type-label">BREAKING</span>}
              {item.type === 'alert' && <span className="type-label">ALERT</span>}
              {item.type === 'info' && <span className="type-label">INFO</span>}
              {item.type === 'update' && <span className="type-label">UPDATE</span>}
              {item.text}
            </div>
          ))}
        </div>

        {/* Subscribe Badge (Matches Flash Mode) */}
        <div className="flash-subscribe" style={{ zIndex: 30, position: 'absolute', right: '0' }}>
          <div className="subscribe-circle">
            <span className="sub-top">SUBSCRIBE</span>
            <span className="sub-bottom">NOW</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
