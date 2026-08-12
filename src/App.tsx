import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StudioModal } from './components/StudioModal';

export function App() {
  const [view, setView] = useState<'home' | 'studio'>('home');

  return (
    <div className={`app-shell view-${view}`}>
      <Header 
        view={view} 
        onNavigate={(newView) => setView(newView)} 
      />
      
      <main className="main-content">
        {view === 'home' ? (
          <HeroSection onStart={() => setView('studio')} />
        ) : (
          <StudioModal />
        )}
      </main>

      <footer className="footer-bar">
        <p>Built for <strong>Hacker House Goa 2026</strong> Builders & Attendees • #FrameInGoa</p>
      </footer>
    </div>
  );
}

export default App;
