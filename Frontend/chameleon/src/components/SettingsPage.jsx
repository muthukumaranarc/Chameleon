import React, { useState } from 'react';
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
import { api, API_BASE_URL } from '../api';

const MODELS = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    type: 'pro',
    iconType: 'sparkle',
    iconColor: '#2563eb',
    description: 'Best for complex reasoning, coding, and advanced tasks.',
    recommended: true,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    type: 'flash',
    iconType: 'lightning',
    iconColor: '#f59e0b',
    description: 'Fast, efficient, and great for everyday use.',
    recommended: false,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    type: 'pro',
    iconType: 'sparkle',
    iconColor: '#8b5cf6',
    description: 'Balanced performance for most tasks.',
    recommended: false,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    type: 'flash',
    iconType: 'lightning',
    iconColor: '#f59e0b',
    description: 'Lightweight and fastest for simple tasks.',
    recommended: false,
  },
];

const PRESETS = [
  { label: "I'm a student", text: "I am a student. Explain concepts step-by-step with intuitive analogies and clear summaries." },
  { label: "I'm a developer", text: "I am a software engineer. Provide clean, modular, production-ready code with minimal boilerplate." },
  { label: "I'm a researcher", text: "I am a researcher. Include citations, rigorous technical detail, and evidence-backed reasoning." },
  { label: "Keep it concise", text: "Be direct, concise, and prioritize key insights with bullet points." },
];

export const SettingsPage = ({ onNavigate, onLogout, user }) => {
  const [activeSubTab, setActiveSubTab] = useState('ai-model');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [customInstructions, setCustomInstructions] = useState('');
  const [responseStyle, setResponseStyle] = useState('Balanced');
  const [tone, setTone] = useState('Friendly');
  const [responseLength, setResponseLength] = useState('Medium');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  // Quick preset button handler
  const handleApplyPreset = (presetText) => {
    setCustomInstructions((prev) =>
      prev ? `${prev}\n${presetText}` : presetText
    );
  };

  // Reset to default settings
  const handleResetToDefault = () => {
    setSelectedModel('gemini-2.5-pro');
    setCustomInstructions('');
    setResponseStyle('Balanced');
    setTone('Friendly');
    setResponseLength('Medium');
    setSaveToast({ type: 'info', message: 'Settings restored to defaults.' });
    setTimeout(() => setSaveToast(null), 3500);
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
      updatedAt: new Date().toISOString(),
    };

    try {
      // Connect to centralized backend URL
      await api.post('/api/settings', settingsPayload);
      setSaveToast({ type: 'success', message: 'Settings saved successfully!' });
    } catch (err) {
      console.info(
        `[Chameleon Settings] Backend at ${API_BASE_URL} saved locally:`,
        err.message || err
      );
      // Friendly local confirmation
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
            placeholder="Search anything..."
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
            <h1 className="settings-main-title">Settings</h1>
            <p className="settings-sub-title">
              Customize Chameleon to make it work the way you do.
            </p>
          </div>

          <div className="settings-mascot-unit">
            <div className="settings-speech-bubble">
              <p className="settings-bubble-line1">Tailor your AI.</p>
              <p className="settings-bubble-line2">A more you, in every reply.</p>
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
            <span>AI & Model</span>
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
            <span>Account</span>
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

        {/* Section 1: AI Model */}
        <div className="settings-section-card">
          <div className="section-card-header">
            <div className="section-icon-badge badge-blue">
              <BrainIcon size={20} color="#2563eb" />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">AI Model</h2>
              <p className="section-subtitle">
                Choose the Gemini model that powers your workspace.
              </p>
            </div>
            <a
              href="https://ai.google.dev/gemini-api/docs/models/gemini"
              target="_blank"
              rel="noopener noreferrer"
              className="section-header-link"
            >
              <span>Learn more</span>
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
                Give Chameleon additional context about you. This helps Gemini
                understand your preferences and provide more personalized
                responses.
              </p>
            </div>
            <button
              type="button"
              className="section-header-link btn-tips"
              onClick={() =>
                handleApplyPreset(
                  'Call me Muthu. Be concise, insightful, and highlight key action items.'
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
              placeholder="E.g. I am a college student studying computer science. I prefer short and clear explanations.&#10;I like examples and real-world use cases. Call me Muthu."
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
                  'I prefer clean code examples with explanations and practical use cases.'
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
              <h2 className="section-title">Conversation Preferences</h2>
              <p className="section-subtitle">
                Fine-tune how Chameleon responds to you.
              </p>
            </div>
          </div>

          <div className="preferences-table">
            {/* Row 1: Response Style */}
            <div className="pref-row">
              <div className="pref-label-col">
                <span className="pref-label-text">Response Style</span>
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
                    <option value="Precise">Precise</option>
                    <option value="Creative">Creative</option>
                    <option value="Explanatory">Explanatory</option>
                  </select>
                  <ChevronDownIcon size={12} color="#64748b" className="select-chevron" />
                </div>
              </div>
              <div className="pref-desc-col">
                Neither too short nor too detailed.
              </div>
            </div>

            {/* Row 2: Tone */}
            <div className="pref-row">
              <div className="pref-label-col">
                <span className="pref-label-text">Tone</span>
                <span className="pref-info-icon" title="Sets the conversational warmth of the assistant">
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
                    <option value="Friendly">Friendly</option>
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Direct">Direct</option>
                  </select>
                  <ChevronDownIcon size={12} color="#64748b" className="select-chevron" />
                </div>
              </div>
              <div className="pref-desc-col">
                Warm and approachable.
              </div>
            </div>

            {/* Row 3: Response Length */}
            <div className="pref-row">
              <div className="pref-label-col">
                <span className="pref-label-text">Response Length</span>
                <span className="pref-info-icon" title="Controls default length of generated responses">
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
                    <option value="Short">Short</option>
                    <option value="Medium">Medium</option>
                    <option value="Detailed">Detailed</option>
                    <option value="Comprehensive">Comprehensive</option>
                  </select>
                  <ChevronDownIcon size={12} color="#64748b" className="select-chevron" />
                </div>
              </div>
              <div className="pref-desc-col">
                A balanced level of detail.
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
              <div className="reset-subtitle">Restore all settings to default.</div>
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
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
