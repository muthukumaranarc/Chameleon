import React, { useState } from 'react';
import { SparkleIcon, ArrowRightIcon } from './Icons';

export const PromptInput = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'Tell me what you want to create...',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value && value.trim() && !isLoading) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value && value.trim() && !isLoading) {
        onSubmit(value.trim());
      }
    }
  };

  return (
    <section className="prompt-input-section">
      <form
        className={`prompt-input-card ${isFocused ? 'focused' : ''} ${
          isLoading ? 'loading' : ''
        }`}
        onSubmit={handleSubmit}
      >
        {/* Purple Sparkle Icon on Left */}
        <div className="prompt-icon-left">
          <SparkleIcon size={22} color="#8b5cf6" />
        </div>

        {/* Text Input */}
        <input
          type="text"
          className="prompt-text-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="Prompt Input"
        />

        {/* Submit Arrow Button on Right */}
        <button
          type="submit"
          className="prompt-submit-button"
          disabled={!value || !value.trim() || isLoading}
          aria-label="Create application"
        >
          {isLoading ? (
            <div className="button-spinner" />
          ) : (
            <ArrowRightIcon size={20} color="#ffffff" />
          )}
        </button>
      </form>
    </section>
  );
};

export default PromptInput;
