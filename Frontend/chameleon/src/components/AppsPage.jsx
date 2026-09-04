import React, { useState, useEffect } from 'react';
import {
  StudyPlannerVisual,
  ExpenseTrackerVisual,
  ChatAiVisual,
  HabitTrackerVisual,
  NoteKeeperVisual,
  ImageGeneratorVisual,
} from './CardVisuals';
import { SearchIcon, PlusIcon, SparkleIcon } from './Icons';
import UserProfileMenu from './UserProfileMenu';
import NotificationPopover from './NotificationPopover';
import chameleonMascot from '../assets/chameleon-mascot.png';
import { api, ENDPOINTS } from '../api';

const STARTER_VISUAL_MAP = {
  'study-planner': { comp: StudyPlannerVisual, btnClass: 'btn-open-blue' },
  'expense-tracker': { comp: ExpenseTrackerVisual, btnClass: 'btn-open-green' },
  'chat-ai': { comp: ChatAiVisual, btnClass: 'btn-open-purple' },
  'habit-tracker': { comp: HabitTrackerVisual, btnClass: 'btn-open-red' },
  'note-keeper': { comp: NoteKeeperVisual, btnClass: 'btn-open-orange' },
  'image-generator': { comp: ImageGeneratorVisual, btnClass: 'btn-open-sky' },
};

export const AppsPage = ({
  onCreateNewApp,
  onOpenApp,
  onNavigate,
  onLogout,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [appsList, setAppsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const data = await api.get(ENDPOINTS.APPS.BASE);
      if (Array.isArray(data)) {
        setAppsList(data);
      }
    } catch (err) {
      console.warn('[Chameleon Apps] Fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDeleteApp = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`${ENDPOINTS.APPS.BASE}/${id}`);
      setAppsList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete app', err);
    }
  };

  // Filter apps by search query
  const filteredApps = appsList.filter((app) =>
    (app.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="apps-page-content">
      {/* Top Header Bar */}
      <header className="apps-top-header">
        <div className="apps-search-bar">
          <SearchIcon size={18} color="#94a3b8" />
          <input
            type="text"
            className="apps-search-input"
            placeholder="Search your apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="apps-header-right">
          <NotificationPopover />

          <UserProfileMenu
            user={user}
            activeTab="apps"
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        </div>
      </header>

      {/* Main Page Content */}
      <div className="apps-body-wrapper">
        {/* Hero Header Section */}
        <section className="apps-hero-banner">
          <div className="apps-hero-left">
            <div className="apps-category-tag">WORKSPACE APPS</div>
            <h1 className="apps-main-title">
              Your Ideas, Live as <span className="highlight-apps">Apps.</span>
            </h1>
            <p className="apps-main-desc">
              All applications generated with Gemini 3 and Chameleon, ready to launch and inspect.
            </p>
          </div>

          <div className="apps-hero-right">
            {/* Mascot and Speech Bubble */}
            <div className="apps-mascot-unit">
              <div className="apps-speech-bubble">
                <p className="speech-title">Build. Explore. Grow.</p>
                <p className="speech-impact">Your apps, your impact.</p>
                <div className="speech-tail-right" />
              </div>

              <div className="apps-mascot-frame">
                <img
                  src={chameleonMascot}
                  alt="Chameleon Mascot"
                  className="apps-mascot-img"
                />
              </div>
            </div>

            {/* Create New App Button */}
            <button
              type="button"
              className="btn-create-app"
              onClick={onCreateNewApp}
            >
              <PlusIcon size={18} color="#ffffff" />
              <span>Create New App</span>
            </button>
          </div>
        </section>

        {/* Apps Cards Grid or Empty State */}
        {loading ? (
          <div className="apps-empty-container">
            <div className="apps-loading-spinner" />
            <p className="apps-empty-subtitle">Loading your applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="apps-empty-container">
            <div className="apps-empty-icon-circle">
              <SparkleIcon size={32} color="#8b5cf6" />
            </div>
            <h3 className="apps-empty-title">
              {searchQuery ? 'No matching applications' : 'No Applications Created Yet'}
            </h3>
            <p className="apps-empty-subtitle">
              {searchQuery
                ? `We couldn't find any app matching "${searchQuery}". Try a different keyword.`
                : 'Your created applications will appear here. Generate your first interactive web application in seconds with Chameleon AI!'}
            </p>
            <button
              type="button"
              className="btn-create-app apps-empty-action-btn"
              onClick={onCreateNewApp}
            >
              <PlusIcon size={18} color="#ffffff" />
              <span>Create New App</span>
            </button>
          </div>
        ) : (
          <section className="apps-cards-grid" aria-label="Created Applications">
            {filteredApps.map((app) => {
              const { id, title, description, color } = app;
              const visualInfo = STARTER_VISUAL_MAP[id];
              const VisualComponent = visualInfo?.comp;
              const buttonClass = visualInfo?.btnClass || 'btn-open-purple';

              return (
                <div key={id} className="app-main-card">
                  {/* Visual Banner Preview on top */}
                  {VisualComponent ? (
                    <VisualComponent />
                  ) : (
                    <div
                      className="custom-app-banner-card"
                      style={{
                        background: `linear-gradient(135deg, ${color || '#2563eb'}25, rgba(15,23,42,0.8))`,
                        borderBottom: `1px solid rgba(255,255,255,0.08)`,
                      }}
                    >
                      <div className="custom-banner-icon">
                        <SparkleIcon size={24} color={color || '#60a5fa'} />
                      </div>
                      <span className="custom-banner-tag">{app.category || 'AI Application'}</span>
                    </div>
                  )}

                  {/* Content & Metadata */}
                  <div className="app-card-details">
                    <div className="app-card-header-row">
                      <h3 className="app-title-text">{title}</h3>
                      <button
                        type="button"
                        className="btn-card-del"
                        onClick={(e) => handleDeleteApp(e, id)}
                        title="Delete application"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="app-description-text">{description}</p>
                    <div className="app-action-row">
                      <button
                        type="button"
                        className={`btn-open-app ${buttonClass}`}
                        onClick={() => onOpenApp && onOpenApp(app)}
                      >
                        <span>Open &amp; Run App</span>
                        <span className="arrow-glyph">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default AppsPage;
