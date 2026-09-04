import React from 'react';
import ChameleonLogo from './ChameleonLogo';
import { HomeIcon, GridIcon } from './Icons';
import UserProfileMenu from './UserProfileMenu';
import NotificationPopover from './NotificationPopover';

export const Navbar = ({
  activeTab = 'home',
  onTabChange,
  onLogout,
  user,
  isAuthenticated = true,
}) => {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Left Section: Logo & Navigation */}
        <div className="navbar-left">
          <div
            className="navbar-brand"
            onClick={() => onTabChange && onTabChange('home')}
            role="button"
            tabIndex={0}
          >
            <ChameleonLogo size={32} />
            <span className="brand-name">Chameleon</span>
          </div>

          <nav className="navbar-nav">
            <button
              type="button"
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange('home')}
              id="nav-tab-home"
            >
              <HomeIcon size={16} color={activeTab === 'home' ? '#2563eb' : '#64748b'} />
              <span>Home</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'apps' ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange('apps')}
              id="nav-tab-apps"
            >
              <GridIcon size={16} color={activeTab === 'apps' ? '#2563eb' : '#64748b'} />
              <span>My Apps</span>
            </button>
          </nav>
        </div>

        {/* Right Section: Notification & User Profile / Sign In */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <NotificationPopover />

              <UserProfileMenu
                user={user}
                activeTab={activeTab}
                onNavigate={onTabChange}
                onLogout={onLogout}
              />
            </>
          ) : (
            <button
              type="button"
              className="navbar-signin-btn"
              onClick={() => onTabChange && onTabChange('auth')}
              id="nav-signin-btn"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

