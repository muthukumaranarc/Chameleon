import { useState, useEffect } from 'react';
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
import { api, ENDPOINTS } from './api';
import './App.css';

const DEFAULT_USER = {
  name: 'Muthu',
  email: 'muthu@chameleon.ai',
  avatar: muthuAvatar,
};

function App() {
  // Authentication disabled by default as requested (no forced blocking)
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('chameleon_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Selected Gemini 3 Model - Default to high-speed & reliable gemini-3.1-flash-lite
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('chameleon_selected_model');
    if (!saved || saved === 'gemini-3.8-flash' || saved.includes('2.5')) {
      localStorage.setItem('chameleon_selected_model', 'gemini-3.1-flash-lite');
      return 'gemini-3.1-flash-lite';
    }
    return saved;
  });

  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('idle'); // 'loading' | 'success' | 'error'
  const [modalResult, setModalResult] = useState(null);
  const [modalError, setModalError] = useState('');

  // Handle model change and persist
  const handleModelChange = (model) => {
    setSelectedModel(model);
    localStorage.setItem('chameleon_selected_model', model);
  };

  // Handle Logout (Auth view preserved without deleting files)
  const handleLogout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT, {
        user: currentUser?.name || 'Muthu',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.info('[Chameleon Auth] Handled logout:', err.message || err);
    }

    setJustLoggedOut(true);
    setActiveTab('auth');
  };

  // Handle Login Success
  const handleLoginSuccess = (userData) => {
    const userObj = {
      name: userData?.name || 'Muthu',
      email: userData?.email || 'muthu@chameleon.ai',
      avatar: userData?.avatar || muthuAvatar,
    };

    localStorage.setItem('chameleon_user', JSON.stringify(userObj));
    setIsAuthenticated(true);
    setCurrentUser(userObj);
    setJustLoggedOut(false);
    setActiveTab('home');
  };

  // Tab navigation
  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  // Handle prompt creation with optional multimodal image upload
  const handleCreateApp = async (prompt, attachedImage = null) => {
    if (!prompt || !prompt.trim()) return;

    setPromptText(prompt);
    setIsLoading(true);
    setModalOpen(true);
    setModalStatus('loading');
    setModalError('');
    setModalResult(null);

    try {
      // Connect to Gemini 3 endpoint on backend
      const payload = {
        prompt: prompt.trim(),
        model: selectedModel,
        imageBase64: attachedImage?.base64,
        mimeType: attachedImage?.mimeType,
      };

      const response = await api.post(ENDPOINTS.GEMINI.GENERATE, payload);

      if (response && response.success) {
        setModalStatus('success');
        setModalResult(response);

        // Automatically save newly generated app to backend storage
        if (response.htmlCode) {
          try {
            const appTitle = prompt.length > 32 ? prompt.slice(0, 30) + '...' : prompt;
            await api.post(ENDPOINTS.APPS.BASE, {
              title: appTitle,
              description: `Generated with ${selectedModel} from prompt: "${prompt}"`,
              category: 'Custom AI App',
              color: '#2563eb',
              htmlCode: response.htmlCode,
            });
          } catch (saveErr) {
            console.warn('Could not auto-save app to backend:', saveErr);
          }
        }
      } else {
        setModalStatus('error');
        setModalError(response?.error || 'Failed to generate app code.');
      }
    } catch (err) {
      console.error('[Chameleon] Generation error:', err);
      setModalStatus('error');
      setModalError(
        err.message?.includes('Failed to fetch')
          ? 'Could not connect to Chameleon backend at port 8080. Please ensure the Spring Boot server is running.'
          : err.message || 'Error occurred while communicating with Gemini.'
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

  const handleSaveApp = async (appData) => {
    try {
      await api.post(ENDPOINTS.APPS.BASE, appData);
    } catch (err) {
      console.warn('Could not save app to backend:', err);
    }
  };

  // Handle clicking Open App from the My Apps page - immediately launches live app preview
  const handleOpenApp = async (app) => {
    setPromptText(app.title);

    // If app already contains working htmlCode, launch directly
    if (app.htmlCode) {
      setModalResult({
        htmlCode: app.htmlCode,
        prompt: app.title,
        model: selectedModel,
        success: true,
      });
      setModalStatus('success');
      setModalOpen(true);
      return;
    }

    // Otherwise fetch the app code from backend
    try {
      setIsLoading(true);
      setModalOpen(true);
      setModalStatus('loading');
      const data = await api.get(`${ENDPOINTS.APPS.BASE}/${app.id}`);
      if (data && data.htmlCode) {
        setModalResult({
          htmlCode: data.htmlCode,
          prompt: data.title,
          model: selectedModel,
          success: true,
        });
        setModalStatus('success');
      } else {
        // Fallback to generating
        handleCreateApp(`Build application: ${app.title} - ${app.description}`);
      }
    } catch (err) {
      console.warn('Error fetching app by id, regenerating:', err);
      handleCreateApp(`Build application: ${app.title} - ${app.description}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {activeTab === 'auth' ? (
        /* Dedicated Authentication Page preserved without deletion */
        <AuthPage
          onBackToHome={() => setActiveTab('home')}
          onLoginSuccess={handleLoginSuccess}
          justLoggedOut={justLoggedOut}
        />
      ) : activeTab === 'settings' ? (
        /* Settings Layout with Sidebar */
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
        /* My Apps Layout with Left Sidebar */
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
        /* Home Page Layout */
        <div className="app-container">
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
            <HeroSection />

            {/* Prompt Search Input Pill with Gemini 3 Models & Image Attachment */}
            <PromptInput
              value={promptText}
              onChange={setPromptText}
              onSubmit={handleCreateApp}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
            />

            {/* Quick Suggestions */}
            <SuggestionCards onSelectSuggestion={handleSelectSuggestion} />
          </main>

          <Footer />
        </div>
      )}

      {/* Interactive Generation Modal / Live App Studio */}
      <GenerationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        prompt={promptText}
        status={modalStatus}
        result={modalResult}
        error={modalError}
        onSaveApp={handleSaveApp}
      />
    </>
  );
}

export default App;
