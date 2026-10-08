import React, { useState, useEffect } from 'react';
import { User } from './types';
import { apiService } from './services/apiService';

// Standard Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RestApiTesterModal } from './components/RestApiTesterModal';
import { JavaProjectModal } from './components/JavaProjectModal';

// Apple Liquid UI Model Components
import { AppleLiquidBackground } from './components/AppleLiquidBackground';
import { AppleDynamicIsland } from './components/AppleDynamicIsland';
import { AppleLiquidDock } from './components/AppleLiquidDock';
import { AppleWalletPassModal } from './components/AppleWalletPassModal';

// Pages
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { StudentRegistrationPage } from './pages/StudentRegistrationPage';
import { CollegesPage } from './pages/CollegesPage';
import { CollegeDetailsPage } from './pages/CollegeDetailsPage';
import { CollegeRegistrationPage } from './pages/CollegeRegistrationPage';
import { AddEventPage } from './pages/AddEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { CollegeDashboardPage } from './pages/CollegeDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => apiService.getCurrentUser());
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Apple Liquid UI Model state (enabled by default for modern liquid aesthetic)
  const [liquidMode, setLiquidMode] = useState<boolean>(true);

  // Modals
  const [apiTesterOpen, setApiTesterOpen] = useState<boolean>(false);
  const [javaModalOpen, setJavaModalOpen] = useState<boolean>(false);
  const [walletPassModalOpen, setWalletPassModalOpen] = useState<boolean>(false);

  // Initialize service storage
  useEffect(() => {
    apiService.init();
  }, []);

  // Scroll to top on navigation
  const navigateTo = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEvent = (id: string) => {
    navigateTo('event-details', { eventId: id });
  };

  const handleRegisterEvent = (id: string) => {
    navigateTo('student-registration', { eventId: id });
  };

  const handleSelectCollege = (id: string) => {
    navigateTo('college-details', { collegeId: id });
  };

  const toggleLiquidMode = () => {
    setLiquidMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen relative flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-500 ${
      liquidMode ? 'bg-slate-100/60' : 'bg-slate-50'
    }`}>
      
      {/* Apple Liquid Animated Fluid Mesh Background Layer */}
      <AppleLiquidBackground enabled={liquidMode} />

      {/* Apple Dynamic Island Floating Control Pill */}
      <AppleDynamicIsland
        onNavigate={navigateTo}
        onOpenApiTester={() => setApiTesterOpen(true)}
        onOpenJavaModal={() => setJavaModalOpen(true)}
        onOpenWalletPasses={() => setWalletPassModalOpen(true)}
        liquidMode={liquidMode}
        onToggleLiquidMode={toggleLiquidMode}
        currentUser={currentUser}
      />

      {/* Top Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenApiTester={() => setApiTesterOpen(true)}
        onOpenJavaModal={() => setJavaModalOpen(true)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        liquidMode={liquidMode}
        onToggleLiquidMode={toggleLiquidMode}
        onOpenWalletPasses={() => setWalletPassModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 relative z-10 pb-20">
        {currentView === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectEvent={handleSelectEvent}
            onRegisterEvent={handleRegisterEvent}
            onOpenApiTester={() => setApiTesterOpen(true)}
            onOpenJavaModal={() => setJavaModalOpen(true)}
          />
        )}

        {currentView === 'events' && (
          <EventsPage
            initialCategory={viewParams.category}
            initialSearch={viewParams.search}
            onSelectEvent={handleSelectEvent}
            onRegisterEvent={handleRegisterEvent}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'event-details' && (
          <EventDetailsPage
            eventId={viewParams.eventId}
            onBack={() => navigateTo('events')}
            onRegister={handleRegisterEvent}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'student-registration' && (
          <StudentRegistrationPage
            eventId={viewParams.eventId}
            currentUser={currentUser}
            onBack={() => navigateTo('event-details', { eventId: viewParams.eventId })}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'colleges' && (
          <CollegesPage
            onSelectCollege={handleSelectCollege}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'college-details' && (
          <CollegeDetailsPage
            collegeId={viewParams.collegeId}
            onBack={() => navigateTo('colleges')}
            onSelectEvent={handleSelectEvent}
            onRegisterEvent={handleRegisterEvent}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'college-registration' && (
          <CollegeRegistrationPage
            onBack={() => navigateTo('colleges')}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'add-event' && (
          <AddEventPage
            initialCollegeId={viewParams.collegeId}
            onBack={() => navigateTo('events')}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'edit-event' && (
          <EditEventPage
            eventId={viewParams.eventId}
            onBack={() => navigateTo('event-details', { eventId: viewParams.eventId })}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'college-dashboard' && (
          <CollegeDashboardPage
            currentUser={currentUser}
            onNavigate={navigateTo}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboardPage
            onNavigate={navigateTo}
            onOpenApiTester={() => setApiTesterOpen(true)}
            onOpenJavaModal={() => setJavaModalOpen(true)}
          />
        )}

        {currentView === 'search' && (
          <SearchPage
            initialQuery={viewParams.query}
            onSelectEvent={handleSelectEvent}
            onRegisterEvent={handleRegisterEvent}
            onSelectCollege={handleSelectCollege}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            currentUser={currentUser}
            onLoginSuccess={(u) => setCurrentUser(u)}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onNavigate={navigateTo}
            onOpenApiTester={() => setApiTesterOpen(true)}
            onOpenJavaModal={() => setJavaModalOpen(true)}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Global Campus Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenApiTester={() => setApiTesterOpen(true)}
        onOpenJavaModal={() => setJavaModalOpen(true)}
      />

      {/* Apple Liquid Glass Dock Floating at bottom */}
      <AppleLiquidDock
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenApiTester={() => setApiTesterOpen(true)}
        onOpenJavaModal={() => setJavaModalOpen(true)}
        onOpenWalletPasses={() => setWalletPassModalOpen(true)}
        liquidMode={liquidMode}
        onToggleLiquidMode={toggleLiquidMode}
        currentUser={currentUser}
      />

      {/* Apple Wallet Holographic Pass Modal */}
      <AppleWalletPassModal
        isOpen={walletPassModalOpen}
        onClose={() => setWalletPassModalOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Interactive REST API Testing Console Modal */}
      <RestApiTesterModal
        isOpen={apiTesterOpen}
        onClose={() => setApiTesterOpen(false)}
      />

      {/* Java Spring Boot Companion Code Viewer & Zip Exporter Modal with RBAC */}
      <JavaProjectModal
        isOpen={javaModalOpen}
        onClose={() => setJavaModalOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

    </div>
  );
}
