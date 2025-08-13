import React, { useState } from 'react';
import CalendarComponent from './components/Calendar';
import './App.css';
import SignInScreen, { useFirebase } from './components/firebase';

const AppContent: React.FC<{ user: any }> = ({ user }) => {
  const anonymous = { name: 'Anonymous', apartment: 'A1', email: 'anonyomous@anonymous' };
  return (
    <CalendarComponent user={user || anonymous} />
  );
};

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const firebase = useFirebase();

  const handleLogout = () => {
    if (firebase) {
      firebase.auth().signOut();
    }
  };

  return (
    <div className='App'>
      <div className='header'>
        <img src="./icon.png" alt="Tvättpass Icon" className='header-icon' />
        <h1 className='header-title'>Tvättpass</h1>
        <button
          className="hamburger-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="hamburger-icon">
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </div>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      <div className='content-container'>
        <SignInScreen>
          {(user) => <AppContent user={user} />}
        </SignInScreen>
      </div>
    </div>
  );
};

export default App;
