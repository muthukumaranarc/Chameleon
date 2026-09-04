import React, { useState } from 'react';
import landscapeImg from '../assets/landscape-preview.jpg';
import chameleonLogoImg from '../assets/chameleon-logo.png';
import { CheckIcon, SparkleIcon, MoreHorizontalIcon } from './Icons';

export const StudyPlannerVisual = () => (
  <div className="card-banner banner-study">
    <button type="button" className="card-more-btn" aria-label="Options">
      <MoreHorizontalIcon size={16} color="#64748b" />
    </button>
    <div className="banner-left-content">
      <h4 className="banner-heading heading-study">
        Plan Smarter<br />Study Better
      </h4>
      <div className="graduation-cap-badge">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="#2563eb">
          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18C5 19.39 8.13 21.18 12 21.18C15.87 21.18 19 19.39 19 17.18V13.18L12 17.18L5 13.18Z" />
        </svg>
      </div>
    </div>
    <div className="banner-right-widget">
      <div className="mock-study-dashboard">
        <div className="mock-dash-header">
          <span className="mock-dot blue" />
          <span className="mock-line-short" />
        </div>
        <div className="mock-dash-grid">
          <span className="mock-slot active-blue" />
          <span className="mock-slot active-green" />
          <span className="mock-slot active-purple" />
          <span className="mock-slot" />
          <span className="mock-slot active-blue" />
          <span className="mock-slot active-orange" />
        </div>
      </div>
    </div>
  </div>
);

export const ExpenseTrackerVisual = () => (
  <div className="card-banner banner-expense">
    <button type="button" className="card-more-btn dark" aria-label="Options">
      <MoreHorizontalIcon size={16} color="#94a3b8" />
    </button>
    <div className="banner-left-content">
      <h4 className="banner-heading heading-expense">
        Track<br />Your Expenses
      </h4>
      <p className="banner-sub-text">
        Smarter spending<br />for a brighter tomorrow.
      </p>
    </div>
    <div className="banner-right-widget">
      <div className="mock-expense-widget">
        <div className="expense-stat-row">
          <span className="expense-label">Total Spent</span>
          <span className="expense-badge-growth">↑ 12%</span>
        </div>
        <div className="expense-amount">₹ 12,450</div>
        <div className="expense-chart-row">
          <svg className="donut-chart-svg" width="46" height="46" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="14" fill="transparent" stroke="#1e293b" strokeWidth="6" />
            <circle cx="20" cy="20" r="14" fill="transparent" stroke="#38bdf8" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="25" />
            <circle cx="20" cy="20" r="14" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-5" />
            <circle cx="20" cy="20" r="14" fill="transparent" stroke="#f43f5e" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-25" />
            <circle cx="20" cy="20" r="14" fill="transparent" stroke="#a855f7" strokeWidth="6" strokeDasharray="35 65" strokeDashoffset="-40" />
          </svg>
          <div className="expense-legend">
            <div className="legend-item"><span className="dot blue" /> Food 35%</div>
            <div className="legend-item"><span className="dot green" /> Transport 20%</div>
            <div className="legend-item"><span className="dot orange" /> Shopping 15%</div>
            <div className="legend-item"><span className="dot purple" /> Others 30%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ChatAiVisual = () => (
  <div className="card-banner banner-chat">
    <button type="button" className="card-more-btn" aria-label="Options">
      <MoreHorizontalIcon size={16} color="#64748b" />
    </button>
    <div className="banner-left-content">
      <h4 className="banner-heading heading-chat">
        Your AI<br />Companion
      </h4>
      <p className="banner-sub-text purple">
        Ask. Learn. Create.<br />Together.
      </p>
    </div>
    <div className="banner-right-widget">
      <div className="mock-chat-window">
        <div className="mock-chat-bubble-row">
          <img src={chameleonLogoImg} alt="AI" className="chat-avatar-mini" />
          <div className="mock-chat-bubble">How can I help you today?</div>
        </div>
        <div className="mock-chat-input-bar">
          <span className="chat-input-placeholder">Type your message...</span>
          <div className="chat-send-btn">›</div>
        </div>
      </div>
    </div>
  </div>
);

export const HabitTrackerVisual = () => {
  const [habits, setHabits] = useState([
    { id: 1, text: 'Read a book', checked: true },
    { id: 2, text: 'Exercise', checked: false },
    { id: 3, text: 'Drink water', checked: true },
    { id: 4, text: 'Learn something new', checked: false },
  ]);

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, checked: !h.checked } : h))
    );
  };

  return (
    <div className="card-banner banner-habit">
      <button type="button" className="card-more-btn" aria-label="Options">
        <MoreHorizontalIcon size={16} color="#64748b" />
      </button>
      <div className="banner-left-content">
        <h4 className="banner-heading heading-habit">
          Small Habits<br />Big Changes
        </h4>
        <div className="succulent-pot">
          <span className="pot-plant">🪴</span>
        </div>
      </div>
      <div className="banner-right-widget">
        <div className="mock-habit-list">
          {habits.map((item) => (
            <div
              key={item.id}
              className={`habit-row ${item.checked ? 'completed' : ''}`}
              onClick={() => toggleHabit(item.id)}
            >
              <span className={`habit-checkbox ${item.checked ? 'checked' : ''}`}>
                {item.checked && <CheckIcon size={10} color="#ffffff" />}
              </span>
              <span className="habit-name">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NoteKeeperVisual = () => (
  <div className="card-banner banner-note">
    <button type="button" className="card-more-btn" aria-label="Options">
      <MoreHorizontalIcon size={16} color="#64748b" />
    </button>
    <div className="banner-left-content">
      <h4 className="banner-heading heading-note">
        Capture<br />Your Thoughts
      </h4>
      <div className="notebook-stack">
        <span className="book-emoji">📚</span>
      </div>
    </div>
    <div className="banner-right-widget">
      <div className="notes-dual-container">
        <div className="mock-notes-index">
          <div className="notes-index-title">My Notes</div>
          <div className="note-category-item">▫ Ideas</div>
          <div className="note-category-item">▫ Tasks</div>
          <div className="note-category-item">▫ Inspiration</div>
          <div className="note-category-item">▫ Personal</div>
        </div>
        <div className="yellow-sticky-note">
          <p className="sticky-text">
            Good ideas<br />start with<br />a simple note.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const ImageGeneratorVisual = () => (
  <div className="card-banner banner-image">
    <button type="button" className="card-more-btn" aria-label="Options">
      <MoreHorizontalIcon size={16} color="#64748b" />
    </button>
    <div className="banner-left-content">
      <h4 className="banner-heading heading-image">
        Turn Ideas<br />into Images
      </h4>
      <p className="banner-sub-text sky">
        Describe. Generate. Create.
      </p>
      <div className="sparkle-accent">
        <SparkleIcon size={14} color="#0284c7" />
      </div>
    </div>
    <div className="banner-right-widget">
      <div className="mock-image-frame-container">
        <div className="mock-image-frame">
          <img src={landscapeImg} alt="Landscape" className="landscape-thumb" />
        </div>
        <div className="mini-image-prompt-bar">
          <span className="mini-prompt-text">A peaceful mountain landscape...</span>
          <div className="mini-prompt-btn">→</div>
        </div>
      </div>
    </div>
  </div>
);
