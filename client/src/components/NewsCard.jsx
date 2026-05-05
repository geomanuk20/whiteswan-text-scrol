import React, { useState, useEffect } from 'react';

const NewsCard = ({ items, mode, textDuration = 5, onComplete }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState(0);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle through items based on textDuration
  useEffect(() => {
    if (!items || items.length === 0) {
      if (mode === 'both' && onComplete) onComplete();
      return;
    }
    
    // If there is only 1 item, we still want it to display for textDuration and then trigger onComplete
    const cycleTimer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next >= items.length) {
          if (mode === 'both' && onComplete) onComplete();
          return 0;
        }
        return next;
      });
    }, textDuration * 1000);
    
    return () => clearInterval(cycleTimer);
  }, [items, textDuration, mode, onComplete]);

  // Reset index if items change and activeIndex becomes out of bounds
  useEffect(() => {
    if (items && activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items, activeIndex]);

  if (!items || items.length === 0) return null;

  const activeItem = items[activeIndex] || items[0]; 

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  return (
    <div className="flash-container">
      <div className="flash-wrapper">
        {/* Branding Section (Matches Image) */}
        <div className="flash-branding">
          <div className="logo-box-white">
            <img src="/logo.png" alt="Logo" className="flash-logo" />
            <div className="live-clock-blue">
              LIVE | {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Centered News Text */}
        <div 
          key={`${activeItem._id}-${activeIndex}`}
          className={`flash-content ${activeItem.animation || 'zoom-in'}`}
        >
          <span className="flash-text-main">
            {activeItem.text}
          </span>
        </div>

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

export default NewsCard;
