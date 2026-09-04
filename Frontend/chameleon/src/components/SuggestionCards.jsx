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
    id: 'simple-calculator',
    title: 'Simple Calculator',
    prompt: 'Build a sleek, modern white-theme calculator with interactive number keys (0-9), arithmetic operations (+, -, *, /), decimal, clear (C), backspace, equals (=), and live calculation history. Features must be 100% working.',
    badgeBg: '#fae8ff',
    iconColor: '#a855f7',
    Icon: CalculatorIcon,
  },
  {
    id: 'pomodoro-timer',
    title: 'Pomodoro Focus Timer',
    prompt: 'Create a minimalist white-theme Pomodoro timer with a 25-minute focus session, 5-minute break mode, working start/pause/reset buttons, and a circular progress countdown. All features must be fully working.',
    badgeBg: '#ffe4e6',
    iconColor: '#f43f5e',
    Icon: HeartIcon,
  },
  {
    id: 'todo-checklist',
    title: 'Daily Task Checklist',
    prompt: 'Build a clean white-theme daily to-do checklist app with an input field to add tasks, working checkboxes to mark complete, filter buttons for All/Active/Completed, and delete buttons. Store tasks in localStorage.',
    badgeBg: '#ecfdf5',
    iconColor: '#059669',
    Icon: CalendarIcon,
  },
  {
    id: 'tip-calculator',
    title: 'Tip & Bill Splitter',
    prompt: 'Build an interactive white-theme tip and bill splitting calculator with inputs for bill amount, tip percentage buttons (10%, 15%, 20%), number of guests counter, and an instant breakdown showing tip amount and total per person.',
    badgeBg: '#ecfdf5',
    iconColor: '#059669',
    Icon: BarChartIcon,
  },
  {
    id: 'stopwatch-timer',
    title: 'Precision Stopwatch',
    prompt: 'Create a digital stopwatch app in a clean white theme with Start, Pause, Lap, and Reset buttons. Display formatted minutes, seconds, and milliseconds, and render a scrollable list of recorded laps.',
    badgeBg: '#dbeafe',
    iconColor: '#2563eb',
    Icon: KeyboardIcon,
  },
  {
    id: 'notes-pad',
    title: 'Quick Notes Pad',
    prompt: 'Build a clean white-theme note scratchpad app. Users can type a note title and content, click Save Note to save it to localStorage, view saved notes in clean cards with timestamps, search notes, and delete notes.',
    badgeBg: '#f3e8ff',
    iconColor: '#9333ea',
    Icon: GraduationCapIcon,
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
