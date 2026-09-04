import React, { useState } from 'react';
import {
  StudyPlannerVisual,
  ExpenseTrackerVisual,
  ChatAiVisual,
  HabitTrackerVisual,
  NoteKeeperVisual,
  ImageGeneratorVisual,
} from './CardVisuals';
import { SearchIcon, PlusIcon } from './Icons';
import UserProfileMenu from './UserProfileMenu';
import NotificationPopover from './NotificationPopover';
import chameleonMascot from '../assets/chameleon-mascot.png';

const APPS_DATA = [
  {
    id: 'study-planner',
    title: 'Study Planner',
    description: 'Create personalized study plans, track your progress, and achieve your goals.',
    buttonClass: 'btn-open-blue',
    VisualComponent: StudyPlannerVisual,
  },
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    description: 'Monitor your income and expenses with beautiful insights.',
    buttonClass: 'btn-open-green',
    VisualComponent: ExpenseTrackerVisual,
  },
  {
    id: 'chat-ai',
    title: 'Chat with AI',
    description: 'Get instant answers, brainstorm ideas, and solve problems.',
    buttonClass: 'btn-open-purple',
    VisualComponent: ChatAiVisual,
  },
  {
    id: 'habit-tracker',
    title: 'Habit Tracker',
    description: 'Build and track good habits with AI support.',
    buttonClass: 'btn-open-red',
    VisualComponent: HabitTrackerVisual,
  },
  {
    id: 'note-keeper',
    title: 'Note Keeper',
    description: 'Write, organize, and access your notes anywhere.',
    buttonClass: 'btn-open-orange',
    VisualComponent: NoteKeeperVisual,
  },
  {
    id: 'image-generator',
    title: 'Image Generator',
    description: 'Create stunning images from your ideas using AI.',
    buttonClass: 'btn-open-sky',
    VisualComponent: ImageGeneratorVisual,
  },
];

export const AppsPage = ({
  onCreateNewApp,
  onOpenApp,
  onNavigate,
  onLogout,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotification, setHasNotification] = useState(true);

  // Filter apps by search query
  const filteredApps = APPS_DATA.filter((app) =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="apps-category-tag">MY APPS</div>
            <h1 className="apps-main-title">
              Your Ideas, Live as <span className="highlight-apps">Apps.</span>
            </h1>
            <p className="apps-main-desc">
              All the applications you've created with Chameleon, in one place.
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

        {/* 6 Apps Cards Grid */}
        <section className="apps-cards-grid" aria-label="Created Applications">
          {filteredApps.map((app) => {
            const { id, title, description, buttonClass, VisualComponent } = app;
            return (
              <div key={id} className="app-main-card">
                {/* Visual Banner Preview on top */}
                <VisualComponent />

                {/* Content & Metadata */}
                <div className="app-card-details">
                  <h3 className="app-title-text">{title}</h3>
                  <p className="app-description-text">{description}</p>
                  <div className="app-action-row">
                    <button
                      type="button"
                      className={`btn-open-app ${buttonClass}`}
                      onClick={() => onOpenApp && onOpenApp(app)}
                    >
                      <span>Open App</span>
                      <span className="arrow-glyph">→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default AppsPage;
