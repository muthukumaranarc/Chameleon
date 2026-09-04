import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PromptInput from './components/PromptInput';
import SuggestionCards from './components/SuggestionCards';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import AppsPage from './components/AppsPage';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/AuthPage';
import GenerationModal from './components/GenerationModal';
import muthuAvatar from './assets/muthu-avatar.png';
import { api, API_BASE_URL } from './api';
import './App.css';

const DEFAULT_USER = {
  name: 'Muthu',
  email: 'muthu@chameleon.ai',
  avatar: muthuAvatar,
};

function App() {
  // Read auth state from localStorage (defaults to true for existing active sessions)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('chameleon_auth');
    return saved !== null ? saved === 'true' : true;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('chameleon_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Track if user just performed a logout action
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  // Active view tab: 'home' | 'apps' | 'settings' | 'auth'
  const [activeTab, setActiveTab] = useState(() => {
    const savedAuth = localStorage.getItem('chameleon_auth');
    return savedAuth === 'false' ? 'auth' : 'home';
  });

  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('idle'); // 'loading' | 'success' | 'error'
  const [modalResult, setModalResult] = useState(null);
  const [modalError, setModalError] = useState('');

  // Handle Logout - full flow: API call, clear stored session, redirect to Auth page
  const handleLogout = async () => {
    try {
      // Notify backend auth service
      await api.post('/api/auth/logout', {
        user: currentUser?.name || 'Muthu',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.info(`[Chameleon Auth] Handled local logout for ${API_BASE_URL}:`, err.message || err);
    }

    // Clear authentication state and tokens
    localStorage.setItem('chameleon_auth', 'false');
    localStorage.removeItem('chameleon_user');
    sessionStorage.clear();

    setIsAuthenticated(false);
    setCurrentUser(null);
    setJustLoggedOut(true);
    setActiveTab('auth');
  };

  // Handle Login Success - full flow: save user data, update auth state, return to workspace
  const handleLoginSuccess = (userData) => {
    const userObj = {
      name: userData?.name || 'Muthu',
      email: userData?.email || 'muthu@chameleon.ai',
      avatar: userData?.avatar || muthuAvatar,
    };

    localStorage.setItem('chameleon_auth', 'true');
    localStorage.setItem('chameleon_user', JSON.stringify(userObj));

    setIsAuthenticated(true);
    setCurrentUser(userObj);
    setJustLoggedOut(false);
    setActiveTab('home');
  };

  // Safe tab navigation that checks authentication status for protected routes
  const handleNavigate = (tab) => {
    if (!isAuthenticated && (tab === 'apps' || tab === 'settings')) {
      setActiveTab('auth');
      return;
    }
    setActiveTab(tab);
  };

  // Handle prompt creation
  const handleCreateApp = async (prompt) => {
    if (!prompt || !prompt.trim()) return;

    setPromptText(prompt);
    setIsLoading(true);
    setModalOpen(true);
    setModalStatus('loading');
    setModalError('');
    setModalResult(null);

    try {
      // Connect to centralized backend API using the configured backend URL
      const response = await api.post('/api/generate', {
        prompt: prompt.trim(),
        user: currentUser?.name || 'Muthu',
        timestamp: new Date().toISOString(),
      });

      setModalStatus('success');
      setModalResult(response);
    } catch (err) {
      console.info(
        `[Chameleon] Backend call to ${API_BASE_URL} responded:`,
        err.message || err
      );

      // Provide clean feedback for both live backend and offline fallback
      setModalStatus('error');
      setModalError(
        `Sent request to backend at "${API_BASE_URL}". ${
          err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
            ? 'Backend is currently starting up or waiting for connection. The request parameters are captured.'
            : err.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion card selection
  const handleSelectSuggestion = (title, detailedPrompt) => {
    setPromptText(title);
    handleCreateApp(detailedPrompt || title);
  };

  // Handle clicking Open App from the My Apps page
  const handleOpenApp = (app) => {
    setPromptText(app.title);
    handleCreateApp(`Open application: ${app.title} - ${app.description}`);
  };

  return (
    <>
      {activeTab === 'auth' ? (
        /* Dedicated Authentication Page matching the Auth template */
        <AuthPage
          onBackToHome={() => setActiveTab('home')}
          onLoginSuccess={handleLoginSuccess}
          justLoggedOut={justLoggedOut}
        />
      ) : activeTab === 'settings' ? (
        /* Settings Layout with Sidebar matching the Settings template */
        <div className="apps-layout-container">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleNavigate}
          />

          <SettingsPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            user={currentUser}
          />
        </div>
      ) : activeTab === 'apps' ? (
        /* My Apps Layout with Left Sidebar matching the template */
        <div className="apps-layout-container">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleNavigate}
          />

          <AppsPage
            onCreateNewApp={() => handleNavigate('home')}
            onOpenApp={handleOpenApp}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            user={currentUser}
          />
        </div>
      ) : (
        /* Home Page Layout matching the Home template */
        <div className="app-container">
          {/* Decorative ambient dot on top-left */}
          <div className="bg-ambient-dot" aria-hidden="true" />

          {/* Top Navigation */}
          <Navbar
            activeTab={activeTab}
            onTabChange={handleNavigate}
            onLogout={handleLogout}
            user={currentUser}
            isAuthenticated={isAuthenticated}
          />

          {/* Main Content Body */}
          <main className="main-wrapper">
            {/* Hero Section with Greeting, Headline & Mascot */}
            <HeroSection />

            {/* Prompt Search Input Pill */}
            <PromptInput
              value={promptText}
              onChange={setPromptText}
              onSubmit={handleCreateApp}
              isLoading={isLoading}
            />

            {/* 3x2 Grid Quick Suggestions */}
            <SuggestionCards onSelectSuggestion={handleSelectSuggestion} />
          </main>

          {/* Bottom Footer */}
          <Footer />
        </div>
      )}

      {/* Interactive Generation Modal */}
      <GenerationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        prompt={promptText}
        status={modalStatus}
        result={modalResult}
        error={modalError}
      />
    </>
  );
}

export default App;

