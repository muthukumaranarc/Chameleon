import React from 'react';
import { SparkleIcon } from './Icons';

export const GenerationModal = ({ isOpen, onClose, prompt, status, result, error }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-sparkle-circle">
              <SparkleIcon size={20} color="#8b5cf6" />
            </div>
            <div>
              <h3 className="modal-title">
                {status === 'loading'
                  ? 'Chameleon is building your app...'
                  : status === 'error'
                  ? 'Request Notice'
                  : 'Application Ready!'}
              </h3>
              <p className="modal-prompt-preview">"{prompt}"</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {status === 'loading' && (
            <div className="generation-loading-state">
              <div className="pulse-spinner" />
              <p className="loading-step-text">Synthesizing components, logic, and design...</p>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="generation-error-state">
              <div className="info-badge">Backend Status</div>
              <p className="error-message">{error}</p>
              <div className="fallback-card">
                <h4>Prompt Captured:</h4>
                <p>{prompt}</p>
                <p className="hint-text">
                  Connected to API Base URL:{' '}
                  <code>{import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}</code>
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="generation-success-state">
              <div className="success-banner">
                🎉 Workspace successfully updated with your new application.
              </div>
              {result && (
                <div className="result-preview-box">
                  <pre>{typeof result === 'object' ? JSON.stringify(result, null, 2) : result}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {status === 'success' && (
            <button type="button" className="btn-primary" onClick={onClose}>
              Launch App
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationModal;
