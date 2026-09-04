import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, SparkleIcon, CheckIcon } from './Icons';

export const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to Chameleon!',
      text: 'Start turning natural language ideas into full working apps.',
      time: 'Just now',
      unread: true,
      icon: '🎉',
    },
    {
      id: 2,
      title: 'Gemini 2.5 Pro Active',
      text: 'Default model updated for advanced coding and reasoning.',
      time: '15m ago',
      unread: true,
      icon: '⚡',
    },
    {
      id: 3,
      title: 'Workspace Ready',
      text: 'Your 6 default applications have been synchronized.',
      time: '1h ago',
      unread: false,
      icon: '✨',
    },
  ]);

  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setHasUnread(false);
  };

  return (
    <div className="notification-popover-container" ref={popoverRef}>
      <button
        type="button"
        className="icon-button notification-button"
        aria-label="Notifications"
        onClick={handleToggle}
      >
        <BellIcon size={19} color="#475569" />
        {hasUnread && <span className="notification-dot" />}
      </button>

      {isOpen && (
        <div className="notifications-dropdown-card">
          <div className="notifications-header">
            <h4 className="notifications-title">Notifications</h4>
            <button
              type="button"
              className="btn-mark-all-read"
              onClick={markAllRead}
            >
              Mark all as read
            </button>
          </div>

          <div className="notifications-list">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`notification-item ${item.unread ? 'unread' : ''}`}
              >
                <span className="notif-icon">{item.icon}</span>
                <div className="notif-content">
                  <div className="notif-title-row">
                    <span className="notif-item-title">{item.title}</span>
                    <span className="notif-item-time">{item.time}</span>
                  </div>
                  <p className="notif-item-text">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
