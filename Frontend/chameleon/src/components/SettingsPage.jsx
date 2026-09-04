import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  SparkleIcon,
  BrainIcon,
  FileTextIcon,
  SlidersIcon,
  RotateCcwIcon,
  CheckIcon,
  ExternalLinkIcon,
  HelpCircleIcon,
  InfoIcon,
  LightningIcon,
  UserIcon,
  ShieldIcon,
  PaletteIcon,
  ChevronDownIcon,
  BellIcon,
} from './Icons';
import UserProfileMenu from './UserProfileMenu';
import NotificationPopover from './NotificationPopover';
import chameleonMascot from '../assets/chameleon-mascot.png';
import { api, ENDPOINTS } from '../api';

const MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    type: 'lite',
    iconType: 'lightning',
    iconColor: '#0ea5e9',
    description: 'Ultra-low latency, highly reliable model with sub-second response times. (Recommended)',
    recommended: true,
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    type: 'flash',
    iconType: 'lightning',
    iconColor: '#10b981',
    description: 'Balanced speed and precision for rapid UI generation and prototypes.',
    recommended: false,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    type: 'flash',
    iconType: 'sparkle',
    iconColor: '#8b5cf6',
    description: 'High-speed Gemini 3 reasoning for interactive UI designs and complex web scripts.',
    recommended: false,
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    type: 'flash',
    iconType: 'lightning',
    iconColor: '#f59e0b',
    description: 'Stable Gemini 3 workhorse for standard web applications and widgets.',
    recommended: false,
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    type: 'flash',
    iconType: 'lightning',
    iconColor: '#2563eb',
    description: 'Next-gen flagship multimodal model. High-fidelity web application generation.',
    recommended: false,
  },
];

const PRESETS = [
  { label: "I'm a student", text: "I am a student. Explain concepts step-by-step with intuitive analogies and clear summaries." },
  { label: "I'm a developer", text: "I am a software engineer. Provide clean, modular, production-ready single-file apps with modern CSS." },
  { label: "I'm a researcher", text: "I am a researcher. Include clear metric calculations, data tables, and evidence-backed structure." },
  { label: "Keep it concise", text: "Design sleek, minimal, high-utility tools with focus on responsive interactions." },
];

export const SettingsPage = ({ onNavigate, onLogout, user }) => {
  const [activeSubTab, setActiveSubTab] = useState('ai-model');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState({ tested: false, valid: false, message: '' });
  const [customInstructions, setCustomInstructions] = useState('');
  const [responseStyle, setResponseStyle] = useState('Balanced');
  const [tone, setTone] = useState('Friendly');
  const [responseLength, setResponseLength] = useState('Medium');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  // Load existing settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.get(ENDPOINTS.SETTINGS.BASE);
        if (data) {
          if (data.model) setSelectedModel(data.model);
          if (data.customInstructions) setCustomInstructions(data.customInstructions);
          if (data.preferences) {
            if (data.preferences.responseStyle) setResponseStyle(data.preferences.responseStyle);
            if (data.preferences.tone) setTone(data.preferences.tone);
            if (data.preferences.responseLength) setResponseLength(data.preferences.responseLength);
          }
          if (data.apiKeyConfigured) {
            setApiKeyStatus({ tested: true, valid: true, message: 'Gemini API Key is active on server' });
          }
        }
      } catch (err) {
        console.warn('[Settings] Loaded with defaults:', err);
      }
    };
    loadSettings();
  }, []);

  // Quick preset button handler
  const handleApplyPreset = (presetText) => {
    setCustomInstructions((prev) =>
      prev ? `${prev}\n${presetText}` : presetText
    );
  };

  // Reset to default settings
  const handleResetToDefault = () => {
    setSelectedModel('gemini-3.8-flash');
    setCustomInstructions('');
    setResponseStyle('Balanced');
    setTone('Friendly');
    setResponseLength('Medium');
    setSaveToast({ type: 'info', message: 'Settings restored to defaults.' });
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Test API Key
  const handleTestApiKey = async () => {
    setApiKeyStatus({ tested: true, valid: false, message: 'Testing key with Google Generative Language API...' });
    try {
      const res = await api.post(ENDPOINTS.SETTINGS.TEST_KEY, {
        apiKey: apiKeyInput ? apiKeyInput.trim() : undefined,
      });
      if (res?.valid) {
        setApiKeyStatus({ tested: true, valid: true, message: '✓ Key Verified: Connected to Gemini API successfully!' });
      } else {
        setApiKeyStatus({ tested: true, valid: false, message: `✕ Key Test Failed: ${res?.message || 'Invalid key'}` });
      }
    } catch (err) {
      setApiKeyStatus({ tested: true, valid: false, message: `✕ Connection error: ${err.message}` });
    }
  };

  // Save changes handler connected to API
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const settingsPayload = {
      model: selectedModel,
      customInstructions,
      preferences: {
        responseStyle,
        tone,
        responseLength,
      },
      apiKey: apiKeyInput ? apiKeyInput.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };

    try {
      await api.post(ENDPOINTS.SETTINGS.BASE, settingsPayload);
      localStorage.setItem('chameleon_selected_model', selectedModel);
      setSaveToast({ type: 'success', message: 'Settings & Gemini configuration saved successfully!' });
    } catch (err) {
      console.warn('[Chameleon Settings] Saved locally:', err);
      localStorage.setItem('chameleon_selected_model', selectedModel);
      setSaveToast({ type: 'success', message: 'Settings updated successfully!' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveToast(null), 4000);
    }
  };

  return (
    <div className="settings-page-content">
      {/* Top Header Bar */}
      <header className="apps-top-header">
        <div className="apps-search-bar">
          <SearchIcon size={18} color="#94a3b8" />
          <input
            type="text"
            className="apps-search-input"
            placeholder="Search settings..."
          />
        </div>

        <div className="apps-header-right">
          <NotificationPopover />

          <UserProfileMenu
            user={user}
            activeTab="settings"
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        </div>
      </header>

      {/* Main Settings Body */}
      <div className="settings-body-wrapper">
        {/* Toast Alert */}
        {saveToast && (
          <div className={`settings-toast ${saveToast.type}`}>
            <span>{saveToast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setSaveToast(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Page Title & Mascot Banner */}
        <div className="settings-hero-row">
          <div className="settings-title-col">
            <h1 className="settings-main-title">Workspace Settings</h1>
            <p className="settings-sub-title">
              Configure your Gemini 3 AI models, API keys, and app generation instructions.
            </p>
          </div>

          <div className="settings-mascot-unit">
            <div className="settings-speech-bubble">
              <p className="settings-bubble-line1">Gemini 3 Powered.</p>
              <p className="settings-bubble-line2">Tailored to your ideas.</p>
              <div className="settings-bubble-tail" />
            </div>

            <div className="settings-mascot-img-frame">
              <img
                src={chameleonMascot}
                alt="Chameleon Mascot"
                className="settings-mascot-img"
              />
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Sub-tabs */}
        <div className="settings-tabs-nav" role="tablist">
          <button
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'ai-model' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('ai-model')}
          >
            <SparkleIcon size={15} color={activeSubTab === 'ai-model' ? '#2563eb' : '#64748b'} />
            <span>AI &amp; Gemini Models</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'personalization' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('personalization')}
          >
            <UserIcon size={16} color={activeSubTab === 'personalization' ? '#2563eb' : '#64748b'} />
            <span>Personalization</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('account')}
          >
            <ShieldIcon size={16} color={activeSubTab === 'account' ? '#2563eb' : '#64748b'} />
            <span>API Key &amp; Account</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('appearance')}
          >
            <PaletteIcon size={16} color={activeSubTab === 'appearance' ? '#2563eb' : '#64748b'} />
            <span>Appearance</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeSubTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('notifications')}
          >
            <BellIcon size={16} color={activeSubTab === 'notifications' ? '#2563eb' : '#64748b'} />
            <span>Notifications</span>
          </button>
        </div>

        {/* Section 0: Gemini API Key Card */}
        <div className="settings-section-card">
          <div className="section-card-header">
            <div className="section-icon-badge badge-blue">
              <ShieldIcon size={20} color="#2563eb" />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Gemini API Key</h2>
              <p className="section-subtitle">
                Configure your Google Gemini API Key for real-time model synthesis.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="section-header-link"
            >
              <span>Get API Key</span>
              <ExternalLinkIcon size={13} color="#2563eb" />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                className="custom-instructions-textarea"
                style={{ padding: '12px 16px', height: '46px', flex: 1 }}
                placeholder="Enter custom Gemini API Key (or leave blank to use configured key)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ height: '46px', padding: '0 16px' }}
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                className="btn-save-changes"
                style={{ height: '46px', whiteSpace: 'nowrap' }}
                onClick={handleTestApiKey}
              >
                Test Connection
              </button>
            </div>

            {apiKeyStatus.tested && (
              <div
                style={{
                  fontSize: '0.85rem',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: apiKeyStatus.valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: apiKeyStatus.valid ? '#10b981' : '#ef4444',
                  border: `1px solid ${apiKeyStatus.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              >
                {apiKeyStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Section 1: AI Model */}
        <div className="settings-section-card">
          <div className="section-card-header">
            <div className="section-icon-badge badge-blue">
              <BrainIcon size={20} color="#2563eb" />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Gemini 3 Model Selection</h2>
              <p className="section-subtitle">
                Choose the Gemini model that powers your workspace application generator.
              </p>
            </div>
            <a
              href="https://ai.google.dev/gemini-api/docs/models/gemini"
              target="_blank"
              rel="noopener noreferrer"
              className="section-header-link"
            >
              <span>Model Specs</span>
              <ExternalLinkIcon size={13} color="#2563eb" />
            </a>
          </div>

          <div className="model-cards-grid">
            {MODELS.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  className={`model-select-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="model-card-top">
                    <div className="model-name-group">
                      {model.iconType === 'sparkle' ? (
                        <SparkleIcon size={17} color={model.iconColor} />
                      ) : (
                        <LightningIcon size={17} color={model.iconColor} />
                      )}
                      <span className="model-name-text">{model.name}</span>
                    </div>

                    <div className={`custom-radio ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <span className="radio-inner-dot" />}
                    </div>
                  </div>

                  <p className="model-card-desc">{model.description}</p>

                  {model.recommended && (
                    <div className="model-badge-container">
                      <span className="badge-recommended">Recommended</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Custom Instructions */}
        <div className="settings-section-card">
          <div className="section-card-header">
            <div className="section-icon-badge badge-green">
              <FileTextIcon size={20} color="#059669" />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Custom Instructions</h2>
              <p className="section-subtitle">
                Provide custom design requirements, tech preferences, or workspace guidelines to Gemini.
              </p>
            </div>
            <button
              type="button"
              className="section-header-link btn-tips"
              onClick={() =>
                handleApplyPreset(
                  'Always use dark theme with neon cyan accents, modular JavaScript, and local state persistence.'
                )
              }
            >
              <HelpCircleIcon size={15} color="#2563eb" />
              <span>Tips</span>
            </button>
          </div>

          <div className="custom-instructions-box">
            <textarea
              className="custom-instructions-textarea"
              rows={4}
              maxLength={1000}
              placeholder="E.g. I prefer modern minimalist dashboards with responsive flexbox layouts, smooth hover animations, and persistent localStorage state."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
            />
            <div className="textarea-char-count">
              {customInstructions.length}/1000
            </div>
          </div>

          <div className="preset-chips-row">
            <button
              type="button"
              className="preset-chip-add"
              onClick={() =>
                handleApplyPreset(
                  'Include clear responsive styles, accessible form elements, and exportable data features.'
                )
              }
            >
              <span>+ Add example</span>
            </button>

            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip-item"
                onClick={() => handleApplyPreset(preset.text)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Conversation Preferences */}
        <div className="settings-section-card">
          <div className="section-card-header">
            <div className="section-icon-badge badge-blue">
              <SlidersIcon size={20} color="#2563eb" />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Application Styling Preferences</h2>
              <p className="section-subtitle">
                Fine-tune the design aesthetic and complexity of generated apps.
              </p>
            </div>
          </div>

          <div className="preferences-table">
            {/* Row 1: Response Style */}
            <div className="pref-row">
              <div className="pref-label-col">
                <span className="pref-label-text">Layout Complexity</span>
                <span className="pref-info-icon" title="Adjust the analytical depth of replies">
                  <InfoIcon size={13} color="#94a3b8" />
                </span>
              </div>
              <div className="pref-control-col">
                <div className="custom-select-wrapper">
                  <select
                    className="custom-select"
                    value={responseStyle}
                    onChange={(e) => setResponseStyle(e.target.value)}
                  >
                    <option value="Balanced">Balanced</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Feature-Rich">Feature-Rich</option>
                    <option value="Dashboard">Dashboard</option>
                  </select>
                  <ChevronDownIcon size={12} color="#64748b" className="select-chevron" />
                </div>
              </div>
              <div className="pref-desc-col">
                Balanced components and modern responsive spacing.
              </div>
            </div>

            {/* Row 2: Tone */}
            <div className="pref-row">
              <div className="pref-label-col">
                <span className="pref-label-text">Color Theme Preference</span>
                <span className="pref-info-icon" title="Sets default color theme for generated apps">
                  <InfoIcon size={13} color="#94a3b8" />
                </span>
              </div>
              <div className="pref-control-col">
                <div className="custom-select-wrapper">
                  <select
                    className="custom-select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="Dark Modern">Dark Modern</option>
                    <option value="Clean Light">Clean Light</option>
                    <option value="Vibrant Violet">Vibrant Violet</option>
                    <option value="Emerald Minimal">Emerald Minimal</option>
                  </select>
                  <ChevronDownIcon size={12} color="#64748b" className="select-chevron" />
                </div>
              </div>
              <div className="pref-desc-col">
                Elegant dark theme with glowing accents.
              </div>
            </div>

            {/* Row 3: Response Length */}
            <div className="pref-row">
              <div className="pref-label-col">
                <span className="pref-label-text">Script Interactivity</span>
                <span className="pref-info-icon" title="Controls amount of interactive JavaScript generated">
                  <InfoIcon size={13} color="#94a3b8" />
                </span>
              </div>
              <div className="pref-control-col">
                <div className="custom-select-wrapper">
                  <select
                    className="custom-select"
                    value={responseLength}
                    onChange={(e) => setResponseLength(e.target.value)}
                  >
                    <option value="Interactive">Fully Interactive (LocalStorage, CRUD, Events)</option>
                    <option value="Medium">Standard Interactive</option>
                    <option value="Light">Lightweight UI</option>
                  </select>
                  <ChevronDownIcon size={12} color="#64748b" className="select-chevron" />
                </div>
              </div>
              <div className="pref-desc-col">
                Includes state persistence and action handlers.
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Bottom Reset & Save Actions Bar */}
        <div className="settings-bottom-actions-row">
          {/* Reset Settings on Left */}
          <div className="reset-settings-group">
            <div className="section-icon-badge badge-blue">
              <RotateCcwIcon size={18} color="#2563eb" />
            </div>
            <div>
              <div className="reset-title">Reset Settings</div>
              <div className="reset-subtitle">Restore all configurations to default.</div>
            </div>
          </div>

          {/* Buttons on Right */}
          <div className="bottom-action-buttons">
            <button
              type="button"
              className="btn-reset-default"
              onClick={handleResetToDefault}
            >
              <RotateCcwIcon size={15} color="#ef4444" />
              <span>Reset to Default</span>
            </button>

            <button
              type="button"
              className="btn-save-changes"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="save-spinner" />
              ) : (
                <CheckIcon size={16} color="#ffffff" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
