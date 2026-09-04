import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, GridIcon, SettingsIcon, HomeIcon, LogOutIcon } from './Icons';
import muthuAvatar from '../assets/muthu-avatar.png';

export const UserProfileMenu = ({
  user = { name: 'Muthu', email: 'muthu@example.com' },
  onNavigate,
  onLogout,
  activeTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAction = (tab) => {
    setDropdownOpen(false);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const userName = user?.name || 'Muthu';
  const userEmail = user?.email || 'muthu@example.com';
  const userAvatar = user?.avatar || muthuAvatar;

  return (
    <div className="user-profile-menu" ref={dropdownRef}>
      <button
        type="button"
        className="user-profile-trigger"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-label="User profile and options"
        id="user-profile-menu-trigger"
      >
        <img
          src={userAvatar}
          alt={userName}
          className="user-avatar-img"
        />
        <span className="user-name">{userName}</span>
        <ChevronDownIcon
          size={12}
          color="#64748b"
          className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`}
        />
      </button>

      {dropdownOpen && (
        <div className="profile-dropdown-card" id="user-profile-dropdown">
          {/* User Info Header */}
          <div className="profile-card-header">
            <img
              src={userAvatar}
              alt={userName}
              className="profile-card-avatar"
            />
            <div className="profile-card-meta">
              <div className="profile-card-name-row">
                <span className="profile-card-name">{userName}</span>
                <span className="profile-plan-badge">PRO</span>
              </div>
              <div className="profile-card-email">{userEmail}</div>
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* Navigation Links */}
          <button
            type="button"
            className={`dropdown-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleAction('home')}
            id="profile-menu-home"
          >
            <HomeIcon size={15} color={activeTab === 'home' ? '#2563eb' : '#64748b'} />
            <span>Home Workspace</span>
          </button>

          <button
            type="button"
            className={`dropdown-item ${activeTab === 'apps' ? 'active' : ''}`}
            onClick={() => handleAction('apps')}
            id="profile-menu-apps"
          >
            <GridIcon size={15} color={activeTab === 'apps' ? '#2563eb' : '#64748b'} />
            <span>My Created Apps</span>
          </button>

          <button
            type="button"
            className={`dropdown-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleAction('settings')}
            id="profile-menu-settings"
          >
            <SettingsIcon size={15} color={activeTab === 'settings' ? '#2563eb' : '#64748b'} />
            <span>Workspace Settings</span>
          </button>

          <div className="dropdown-divider" />

          {/* Sign Out / Logout Action */}
          <button
            type="button"
            className="dropdown-item text-danger"
            onClick={handleSignOut}
            id="profile-menu-logout"
          >
            <LogOutIcon size={15} color="#dc2626" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;

