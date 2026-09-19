import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const PopCard = ({ items, mode, textDuration = 5, onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Cycle through items based on textDuration
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

  // Reset index if items change
  useEffect(() => {
    if (items && activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items, activeIndex]);

  if (!items || items.length === 0) return null;

  const activeItem = items[activeIndex] || items[0];

  const bigNumber = activeItem.text || '4250';
  const subtitle = activeItem.name || 'വോട്ടിന് മുന്നിൽ';
  const tagText = activeItem.type && activeItem.type !== 'none' ? activeItem.type.toUpperCase() : 'KOZHIKODE NORTH';
  const candidatePhoto = activeItem.image;

  return (
    <div className="full-card-overlay">
      <div 
        key={`${activeItem._id}-${activeIndex}`}
        className={`full-card-box ${activeItem.animation || 'zoom-in'}`}
      >
        {/* Left Side Info (Big Number + Malayalam Subtitle + Ribbon Tag) */}
        <div className="full-card-left">
          <div className="full-card-big-number">
            {bigNumber}
          </div>
          <div className="full-card-subtitle">
            {subtitle}
          </div>
          {tagText && (
            <div className="full-card-ribbon">
              <span>{tagText}</span>
            </div>
          )}
        </div>

        {/* Right Side Photo & Angled Blue Graphic Backdrop */}
        <div className="full-card-right">
          <div className="full-card-backdrop-shape" />
          <div className="full-card-photo-wrapper">
            {candidatePhoto ? (
              <img 
                src={candidatePhoto} 
                alt="Candidate Portrait" 
                className="full-card-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="full-card-fallback-avatar">
                <User size={80} color="#ffffff" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopCard;
