import React, { useState } from 'react';
import { SparkleIcon } from './Icons';

export const GenerationModal = ({ isOpen, onClose, prompt, status, result, error, onSaveApp }) => {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  // Extract pure HTML code from response
  const htmlCode =
    result?.htmlCode ||
    (typeof result === 'string' && result.includes('<!DOCTYPE') ? result : null) ||
    result?.response ||
    '';

  const modelUsed = result?.model || 'gemini-3.1-flash-lite';

  const handleSaveToApps = async () => {
    if (!htmlCode) return;
    if (onSaveApp) {
      try {
        await onSaveApp({
          title: prompt ? (prompt.length > 30 ? prompt.slice(0, 28) + '...' : prompt) : 'Custom App',
          description: `Generated with ${modelUsed} from prompt: "${prompt}"`,
          category: 'Custom AI App',
          color: '#2563eb',
          htmlCode,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        console.error('Failed to save app:', e);
      }
    }
  };

  const handleCopyCode = async () => {
    if (!htmlCode) return;
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const ta = document.createElement('textarea');
      ta.value = htmlCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = (prompt ? prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_') : 'app') + '.html';
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLaunchExternal = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-container ${status === 'success' ? 'modal-container-studio' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-sparkle-circle">
              <SparkleIcon size={20} color="#8b5cf6" />
            </div>
            <div>
              <h3 className="modal-title">
                {status === 'loading'
                  ? 'Gemini is creating your application...'
                  : status === 'error'
                  ? 'Generation Notice'
                  : 'Application Live & Interactive!'}
              </h3>
              <div className="modal-meta-row">
                <span className="modal-prompt-preview">"{prompt}"</span>
                {status === 'success' && (
                  <span className="modal-model-badge">Powered by {modelUsed}</span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-header-actions">
            {status === 'success' && (
              <div className="modal-view-tabs">
                <button
                  type="button"
                  className={`view-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  🖥️ Live App
                </button>
                <button
                  type="button"
                  className={`view-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  &lt;/&gt; Code
                </button>
              </div>
            )}
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {status === 'loading' && (
            <div className="generation-loading-state">
              <div className="pulse-spinner" />
              <p className="loading-step-text">Synthesizing HTML, CSS styles, and JavaScript logic with Gemini 3...</p>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" />
              </div>
              <p className="loading-subhint">Constructing self-contained, responsive single-file web app</p>
            </div>
          )}

          {status === 'error' && (
            <div className="generation-error-state">
              <div className="info-badge">Notice</div>
              <p className="error-message">{error}</p>
              <div className="fallback-card">
                <h4>Captured Prompt:</h4>
                <p>{prompt}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="studio-content-area">
              {activeTab === 'preview' ? (
                <div className="preview-studio-frame">
                  {/* Viewport Toolbar */}
                  <div className="viewport-toolbar">
                    <span className="viewport-label">Viewport:</span>
                    <button
                      type="button"
                      className={`vp-btn ${viewport === 'desktop' ? 'active' : ''}`}
                      onClick={() => setViewport('desktop')}
                      title="Desktop view (100%)"
                    >
                      💻 Desktop
                    </button>
                    <button
                      type="button"
                      className={`vp-btn ${viewport === 'tablet' ? 'active' : ''}`}
                      onClick={() => setViewport('tablet')}
                      title="Tablet view (768px)"
                    >
                      📱 Tablet
                    </button>
                    <button
                      type="button"
                      className={`vp-btn ${viewport === 'mobile' ? 'active' : ''}`}
                      onClick={() => setViewport('mobile')}
                      title="Mobile view (375px)"
                    >
                      📱 Mobile
                    </button>
                    <span className="vp-hint">Live interactive app inside container</span>
                  </div>

                  {/* Responsive Iframe Container */}
                  <div className={`iframe-container-viewport vp-${viewport}`}>
                    <iframe
                      title="Generated App Preview"
                      srcDoc={htmlCode}
                      sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
                      className="studio-live-iframe"
                    />
                  </div>
                </div>
              ) : (
                /* Code View */
                <div className="code-studio-view">
                  <div className="code-toolbar">
                    <span className="code-lang-label">Single-file HTML / Embedded CSS & JS</span>
                    <button type="button" className="btn-copy-code" onClick={handleCopyCode}>
                      {copied ? '✓ Copied!' : '📋 Copy Code'}
                    </button>
                  </div>
                  <pre className="code-snippet-pre">
                    <code>{htmlCode}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>

          {status === 'success' && (
            <div className="studio-footer-right">
              {onSaveApp && (
                <button
                  type="button"
                  className="btn-action-outline"
                  onClick={handleSaveToApps}
                  disabled={saved}
                  title="Save application into My Apps collection"
                >
                  {saved ? '✓ Saved to Apps!' : '💾 Save to My Apps'}
                </button>
              )}
              <button
                type="button"
                className="btn-action-outline"
                onClick={handleDownload}
                title="Download single-file HTML"
              >
                📥 Download HTML
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleLaunchExternal}
                title="Open application in full new browser window"
              >
                🚀 Launch in New Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationModal;
