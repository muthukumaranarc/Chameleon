import React from 'react';
import ChameleonLogo from './ChameleonLogo';
import { HomeIcon, GridIcon, SettingsIcon, SparkleIcon, CrownIcon } from './Icons';
import chameleonMascot from '../assets/chameleon-mascot.png';

export const Sidebar = ({ activeTab = 'settings', onTabChange }) => {
  const menuItems = [
    { id: 'home', label: 'Home', Icon: HomeIcon },
    { id: 'apps', label: 'My Apps', Icon: GridIcon },
    { id: 'settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <aside className="app-sidebar">
      {/* Top Brand Section */}
      <div className="sidebar-brand-section" onClick={() => onTabChange && onTabChange('home')}>
        <div className="sidebar-logo-row">
          <ChameleonLogo size={32} />
          <span className="sidebar-brand-name">Chameleon</span>
        </div>
        <div className="sidebar-brand-tagline">IDEAS • APPS • POSSIBILITIES</div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {menuItems.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange(id)}
            >
              <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Cards */}
      <div className="sidebar-footer-group">
        {/* Upgrade (Soon) Card */}
        <div className="sidebar-upgrade-card">
          <div className="upgrade-card-header">
            <div className="upgrade-title-row">
              <span className="crown-emoji">👑</span>
              <span className="upgrade-card-title">Upgrade (Soon)</span>
            </div>
            <span className="upgrade-arrow">›</span>
          </div>
          <p className="upgrade-card-sub">More models. More power. Coming soon!</p>
        </div>

        {/* Mascot Quote Card */}
        <div className="sidebar-quote-card">
          <div className="sidebar-quote-text">
            <p className="quote-line-1">"Same curiosity.</p>
            <p className="quote-line-2">A smarter you."</p>
          </div>

          <div className="sidebar-mascot-unit">
            <div className="quote-sparkle-dot">
              <SparkleIcon size={11} color="#8b5cf6" />
            </div>
            <img
              src={chameleonMascot}
              alt="Chameleon Mascot"
              className="sidebar-mascot-graphic"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
