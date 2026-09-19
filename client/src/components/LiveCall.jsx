import React, { useState, useEffect } from 'react';
import { PhoneCall, User } from 'lucide-react';

const LiveCall = ({ callItems = [], newsItems = [], cardItems = [], mode, textDuration = 5, scrollSpeed = 25, onComplete }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCallIndex, setActiveCallIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [bottomView, setBottomView] = useState('scroll');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle call items if multiple caller entries exist
  useEffect(() => {
    if (!callItems || callItems.length === 0) {
      if (mode === 'both' && onComplete) onComplete();
      return;
    }
    const timer = setInterval(() => {
      setActiveCallIndex((prev) => {
        const next = prev + 1;
        if (next >= callItems.length) {
          if (mode === 'both' && onComplete) onComplete();
          return 0;
        }
        return next;
      });
    }, textDuration * 1000);
    return () => clearInterval(timer);
  }, [callItems, textDuration, mode, onComplete]);

  // Cycle news cards if cardItems exist
  useEffect(() => {
    if (!cardItems || cardItems.length === 0) return;
    const cardTimer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % cardItems.length);
    }, (textDuration || 5) * 1000);
    return () => clearInterval(cardTimer);
  }, [cardItems, textDuration]);

  // Alternate bottom bar between 'scroll' (Ticker Mode) and 'text' (Card Mode) if cardItems exist
  useEffect(() => {
    if (!cardItems || cardItems.length === 0) {
      setBottomView('scroll');
      return;
    }
    const viewTimer = setInterval(() => {
      setBottomView((prev) => (prev === 'scroll' ? 'text' : 'scroll'));
    }, (textDuration || 5) * 1000 * 2);
    return () => clearInterval(viewTimer);
  }, [cardItems, textDuration]);

  const activeCall = callItems[activeCallIndex] || callItems[0] || {};

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  const formatTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\b[a-z]/g, (l) => l.toUpperCase());
  };

  const rawCallerName = activeCall.name || activeCall.text || 'ലൈവ് കോൾ';
  const callerName = formatTitleCase(rawCallerName);
  const callerImage = activeCall.image;

  // News ticker items for the red bottom scroll bar
  const validNews = (newsItems && newsItems.length > 0)
    ? newsItems.filter(i => i && i.text && i.text.trim() !== '')
    : [];

  const tickerData = validNews.length > 0 ? validNews : [{ text: 'തത്സമയം വാർത്തകൾ' }];

  const multiplier = Math.max(2, Math.ceil(12 / tickerData.length));
  let repeatedItems = [];
  for (let i = 0; i < multiplier; i++) {
    repeatedItems = repeatedItems.concat(tickerData);
  }

  const activeCard = (cardItems && cardItems.length > 0) ? (cardItems[activeCardIndex] || cardItems[0]) : null;

  return (
    <div className="live-call-container">
      {/* FLOATING CALLER BADGE ON TOP OF THE SCROLL BAR */}
      <div className="live-call-top-badge">
        <div className="top-caller-avatar-box">
          {callerImage ? (
            <img 
              src={callerImage} 
              alt={callerName} 
              className="top-caller-img" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="top-caller-fallback-avatar">
              <User size={22} color="#ffffff" />
            </div>
          )}
          <span className="live-dot-indicator" />
        </div>

        <div className="top-caller-info">
          <div className="top-caller-live-row">
            <PhoneCall size={16} className="phone-icon-animated" />
            <span className="top-caller-live-title">തത്സമയം</span>
          </div>
          <span className="top-caller-name">{callerName}</span>
        </div>
      </div>

      <div className="live-call-wrapper">
        {/* Branding Section */}
        <div className="flash-branding">
          <div className="logo-box-white">
            <img src="/logo.png" alt="Logo" className="flash-logo" />
            <div className="live-clock-blue">
              LIVE | {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* BOTTOM RED BAR: Switches between Ticker Mode (scroll) and Card Mode (animated text) */}
        {bottomView === 'text' && activeCard ? (
          <div 
            key={`card-${activeCard._id || activeCardIndex}-${activeCardIndex}`}
            className={`flash-content ${activeCard.animation || 'zoom-in'}`}
          >
            <div className="thumb-text-wrapper" style={{ textAlign: 'center', alignItems: 'center' }}>
              {activeCard.type && activeCard.type !== 'none' && (
                <span className={`type-label ${activeCard.type}`}>
                  {activeCard.type === 'breaking' ? 'BREAKING NEWS' : activeCard.type.toUpperCase()}
                </span>
              )}
              <span className="flash-text-main">
                {activeCard.text}
              </span>
            </div>
          </div>
        ) : (
          <div 
            className="ticker-content" 
            style={{ animationDuration: `${scrollSpeed || 25}s` }}
          >
            {repeatedItems.map((item, index) => (
              <span key={`${item._id || index}-${index}`} className="ticker-item">
                {item.type && item.type !== 'none' && (
                  <span className={`type-label ${item.type}`}>
                    {item.type === 'breaking' ? 'BREAKING NEWS' : item.type.toUpperCase()}
                  </span>
                )}
                {item.text}
              </span>
            ))}
          </div>
        )}

        {/* Subscribe Badge */}
        <div className="flash-subscribe">
          <div className="subscribe-circle">
            <span className="sub-top">SUBSCRIBE</span>
            <span className="sub-bottom">NOW</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCall;
