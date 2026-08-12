import React from 'react';

interface HeaderProps {
  view: 'home' | 'studio';
  onNavigate: (view: 'home' | 'studio') => void;
}

export const Header: React.FC<HeaderProps> = ({ view, onNavigate }) => {
  return (
    <header className={`hh-header header-view-${view}`}>
      <div className="header-inner">
        {view === 'home' ? (
          /* Home View Header: Clean studio branding matching Image 1 */
          <>
            <div className="studio-brand" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
              <span className="time-logo">2:47PM</span>
              <span className="studio-txt">STUDIO</span>
            </div>

            <div className="header-links">
              <a href="#hype" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('studio'); }}>
                CHECK HYPE
              </a>
              <button className="create-hatch-btn" onClick={() => onNavigate('studio')}>
                CREATE
              </button>
            </div>
          </>
        ) : (
          /* Studio View Header: Builder social generator branding matching Image 2 */
          <>
            <div className="header-left-brand" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
              <div className="logo-text-block">
                <span className="logo-main font-display">HACKER</span>
                <span className="logo-goa">गोवा</span>
                <span className="logo-main font-display">HOUSE</span>
              </div>
              <span className="logo-sub">Builder Social Card Generator</span>
            </div>

            <div className="header-links">
              <div className="studio-header-right">
                <button className="nav-back-home" onClick={() => onNavigate('home')}>
                  ← HOME
                </button>
                <div className="studio-brand-badge">
                  <span className="time-logo">2:47PM</span>
                  <span className="studio-txt">STUDIO</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
