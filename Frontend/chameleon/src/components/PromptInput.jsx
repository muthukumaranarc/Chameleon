import React, { useState, useRef } from 'react';
import { SparkleIcon, ArrowRightIcon } from './Icons';

export const PromptInput = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'Tell me what you want to create... (e.g. "Create a calculater with white theam")',
  selectedModel = 'gemini-3.1-flash-lite',
  onModelChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null); // { name, base64, mimeType }
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        name: file.name,
        base64: reader.result,
        mimeType: file.type || 'image/png',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setAttachedImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value && value.trim() && !isLoading) {
      onSubmit(value.trim(), attachedImage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value && value.trim() && !isLoading) {
        onSubmit(value.trim(), attachedImage);
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
        <div className="prompt-icon-left" title="Gemini 3 AI Workspace">
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

        {/* Attached image preview chip if selected */}
        {attachedImage && (
          <div className="attached-mockup-chip" title="Mockup attached for multimodal generation">
            <span className="chip-icon">🖼️</span>
            <span className="chip-name">{attachedImage.name}</span>
            <button
              type="button"
              className="chip-remove"
              onClick={handleRemoveImage}
              aria-label="Remove attached image"
            >
              ✕
            </button>
          </div>
        )}

        {/* Model Selector Pill */}
        <div className="prompt-model-badge" title="Active Gemini Model">
          <span className="model-dot" />
          <select
            className="model-inline-select"
            value={selectedModel}
            onChange={(e) => onModelChange && onModelChange(e.target.value)}
            disabled={isLoading}
            aria-label="Select Gemini model"
          >
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite ⚡ (Fast &amp; Reliable)</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
            <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
            <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
            <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
          </select>
        </div>

        {/* Hidden Image File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
        />

        {/* Paperclip / Attach Image Button */}
        <button
          type="button"
          className="prompt-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload wireframe or mockup screenshot"
          disabled={isLoading}
          aria-label="Attach wireframe mockup"
        >
          📎
        </button>

        {/* Submit Arrow Button on Right */}
        <button
          type="submit"
          className="prompt-submit-button"
          disabled={!value || !value.trim() || isLoading}
          aria-label="Create application"
          title="Generate Application"
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
