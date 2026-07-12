import React, { useState, useEffect, useRef } from 'react';

export function AnimatedNumber({ value, suffix = '', duration = 1200, prefix = '' }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end) || end === 0) {
      setCurrent(0);
      return;
    }
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCurrent(start + easedProgress * (end - start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  const numStr = value?.toString() || '';
  if (isNaN(parseFloat(value))) {
    return <>{prefix}{value}{suffix}</>;
  }

  const decimalMatch = numStr.match(/\.(\d+)/);
  const decimals = Math.min(2, decimalMatch ? decimalMatch[1].length : 0);
  
  return <>{prefix}{current.toFixed(decimals)}{suffix}</>;
}

export function ScrollReveal({ children, className = '', delay = 0, duration = 800 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px 80px 0px' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}
