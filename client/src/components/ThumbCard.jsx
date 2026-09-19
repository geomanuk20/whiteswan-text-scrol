import React, { useState, useEffect } from 'react';

const ThumbCard = ({ items, newsItems, cardItems = [], mode, textDuration = 5, scrollSpeed = 25, onComplete }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [bottomView, setBottomView] = useState('scroll');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle through floating image items based on textDuration
  useEffect(() => {
    if (!items || items.length === 0) {
      if (mode === 'both' && onComplete) onComplete();
      return;
    }
    
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

  // Cycle news cards if cardItems exist
  useEffect(() => {
    if (!cardItems || cardItems.length === 0) return;
    const cardTimer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % cardItems.length);
    }, (textDuration || 5) * 1000);
    return () => clearInterval(cardTimer);
  }, [cardItems, textDuration]);

  // Alternate bottom bar between 'scroll' (Ticker Mode) and 'text' (Card Mode) ONLY in Both Mode
  useEffect(() => {
    if (mode !== 'both') {
      setBottomView('scroll');
      return;
    }
    const viewTimer = setInterval(() => {
      setBottomView((prev) => (prev === 'scroll' ? 'text' : 'scroll'));
    }, (textDuration || 5) * 1000);
    return () => clearInterval(viewTimer);
  }, [textDuration, mode]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  const activeItem = (items && items.length > 0) ? (items[activeIndex] || items[0]) : null;
  const thumbImage = activeItem ? activeItem.image : null;
  const secondaryImage = activeItem ? activeItem.secondaryImage : null;

  // News ticker items for the red bottom scroll bar (filtering non-empty news text)
  const validNews = (newsItems && newsItems.length > 0)
    ? newsItems.filter(i => i && i.text && i.text.trim() !== '')
    : [];

  const validItems = (items && items.length > 0)
    ? items.filter(i => i && i.text && i.text.trim() !== '')
    : [];

  const tickerData = validNews.length > 0 
    ? validNews 
    : (validItems.length > 0 ? validItems : [{ text: 'തത്സമയം വാർത്തകൾ' }]);

  const multiplier = Math.max(2, Math.ceil(12 / tickerData.length));
  let repeatedItems = [];
  for (let i = 0; i < multiplier; i++) {
    repeatedItems = repeatedItems.concat(tickerData);
  }

  const activeCard = (cardItems && cardItems.length > 0) 
    ? (cardItems[activeCardIndex] || cardItems[0]) 
    : activeItem;

  return (
    <div className="thumb-card-container">
      {/* FLOATING PRIMARY THUMBNAIL PHOTO BADGE ON TOP RIGHT */}
      {thumbImage && (
        <div key={`thumb-main-${activeItem?._id || activeIndex}-${activeIndex}`} className="thumb-image-box-floating">
          <img 
            src={thumbImage} 
            alt="Main News Thumbnail" 
            className="thumb-img-floating" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* FLOATING SECONDARY OPTIONAL THUMBNAIL BADGE ON TOP LEFT */}
      {secondaryImage && (
        <div key={`thumb-sec-${activeItem?._id || activeIndex}-${activeIndex}`} className="thumb-secondary-image-box-floating-left">
          <img 
            src={secondaryImage} 
            alt="Secondary News Thumbnail" 
            className="thumb-img-floating" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="thumb-card-wrapper">
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
            key={`card-${activeCard._id || activeIndex}-${activeCardIndex || activeIndex}`}
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

export default ThumbCard;
