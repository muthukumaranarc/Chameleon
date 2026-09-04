import React from 'react';
import { SparkleIcon } from './Icons';

export const Footer = () => {
  return (
    <footer className="footer-bar">
      <div className="footer-container">
        {/* Left tagline */}
        <div className="footer-left">
          <SparkleIcon size={14} color="#8b5cf6" />
          <span className="footer-tagline">Your ideas. Instant applications.</span>
        </div>

        {/* Right links */}
        <div className="footer-right">
          <span className="footer-link">Create</span>
          <span className="footer-dot">•</span>
          <span className="footer-link">Use</span>
          <span className="footer-dot">•</span>
          <span className="footer-link">Explore</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
