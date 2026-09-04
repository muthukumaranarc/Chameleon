import React from 'react';
import {
  GraduationCapIcon,
  BarChartIcon,
  CalculatorIcon,
  HeartIcon,
  KeyboardIcon,
  CalendarIcon,
} from './Icons';

const SUGGESTIONS = [
  {
    id: 'study-planner',
    title: 'Create a study planner',
    prompt: 'Create a comprehensive interactive study planner with subject timetables, study goal trackers, and pomodoro timer.',
    badgeBg: '#f3e8ff',
    iconColor: '#9333ea',
    Icon: GraduationCapIcon,
  },
  {
    id: 'expense-tracker',
    title: 'Track my expenses',
    prompt: 'Build a personal expense tracking dashboard with category budgeting, visual breakdown charts, and monthly totals.',
    badgeBg: '#ecfdf5',
    iconColor: '#059669',
    Icon: BarChartIcon,
  },
  {
    id: 'emi-calculator',
    title: 'Build an EMI calculator',
    prompt: 'Create an intuitive EMI loan calculator with payment schedule breakdowns, interest comparison, and amortization graphs.',
    badgeBg: '#fae8ff',
    iconColor: '#a855f7',
    Icon: CalculatorIcon,
  },
  {
    id: 'habit-tracker',
    title: 'Make a habit tracker',
    prompt: 'Design a daily habit streak tracker with check-in widgets, progress statistics, and weekly milestone rewards.',
    badgeBg: '#ffe4e6',
    iconColor: '#f43f5e',
    Icon: HeartIcon,
  },
  {
    id: 'typing-test',
    title: 'Create a typing test',
    prompt: 'Build a fast-paced typing speed test app measuring WPM, accuracy %, real-time error highlights, and timer modes.',
    badgeBg: '#dbeafe',
    iconColor: '#2563eb',
    Icon: KeyboardIcon,
  },
  {
    id: 'timetable-planner',
    title: 'Design a timetable planner',
    prompt: 'Create a visual weekly timetable schedule planner with color-coded slots, drag-and-drop tasks, and recurring events.',
    badgeBg: '#fee2e2',
    iconColor: '#ea580c',
    Icon: CalendarIcon,
  },
];

export const SuggestionCards = ({ onSelectSuggestion }) => {
  return (
    <section className="suggestions-section" aria-label="Quick application ideas">
      <div className="suggestions-grid">
        {SUGGESTIONS.map((item) => {
          const { id, title, prompt, badgeBg, iconColor, Icon } = item;
          return (
            <button
              key={id}
              type="button"
              className="suggestion-card"
              onClick={() => onSelectSuggestion(title, prompt)}
            >
              <div
                className="suggestion-badge"
                style={{ backgroundColor: badgeBg }}
              >
                <Icon size={18} color={iconColor} />
              </div>
              <span className="suggestion-text">{title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SuggestionCards;
