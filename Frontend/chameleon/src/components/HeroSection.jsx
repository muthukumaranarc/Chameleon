import React from 'react';
import chameleonMascot from '../assets/chameleon-mascot.png';

export const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        {/* Left Side: Headline & Description */}
        <div className="hero-text-container">
          <div className="hero-greeting">
            HELLO, MUTHU <span className="wave-hand">👋</span>
          </div>

          <h1 className="hero-title">
            What do you need <span className="highlight-today">today?</span>
          </h1>

          <p className="hero-subtitle">
            Describe what you need in natural language and Chameleon will create
            a working application for you — instantly.
          </p>
        </div>

        {/* Right Side: Speech Bubble & Mascot */}
        <div className="hero-mascot-container">
          {/* Speech Bubble */}
          <div className="speech-bubble">
            <p className="bubble-line">One workspace.</p>
            <p className="bubble-line">Many possibilities.</p>
            <div className="bubble-tail" />
          </div>



          {/* Mascot Image */}
          <div className="mascot-image-wrapper">
            <img
              src={chameleonMascot}
              alt="Chameleon Mascot"
              className="mascot-img"
            />
            <div className="mascot-shadow" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
