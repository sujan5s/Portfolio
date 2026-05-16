import React, { useEffect, useState } from 'react';
import './InitialLoader.css';

const InitialLoader = ({ onComplete, isLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let interval;
    if (progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          // Stall at 85% if priority components are not yet loaded
          if (!isLoaded && prev >= 85) {
            return 85;
          }
          // Accelerate to 100% once loaded
          if (isLoaded && prev >= 85) {
            return prev + 3;
          }
          return prev + 1;
        });
      }, isLoaded ? 15 : 25); // Faster intervals once loaded
    } else {
      clearInterval(interval);
      setTimeout(() => {
        setIsFading(true);
        setTimeout(onComplete, 800); // Wait for CSS fade out
      }, 200);
    }

    return () => clearInterval(interval);
  }, [progress, isLoaded, onComplete]);

  return (
    <div className={`loader-container ${isFading ? 'fade-out' : ''}`}>
      <div className="loader-content">
        <div className="name-wrapper">
          <div className="loader-name-container">
            <h1 className="loader-name outline">SUJAN</h1>
            <h1 
              className="loader-name fill" 
              style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
            >
              SUJAN
            </h1>
          </div>
          <div className="percentage">{progress}%</div>
        </div>
      </div>
      <div className="loader-bg">
        <div className="glow-circle"></div>
      </div>
    </div>
  );
};

export default InitialLoader;
