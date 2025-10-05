import React, { useState, useEffect } from 'react';
import { useFirebase } from './firebaseClient';
import { useNavigate } from 'react-router-dom';
import WashingLoader from './WashingLoader';
import firebase from 'firebase/compat/app';

import { Association } from '../types/association';

const Menu: React.FC<{ user: firebase.User; onAdminSelect?: (association: Association) => void }> = ({ user, onAdminSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const firebase = useFirebase();
    // Use the user prop directly

  useEffect(() => {
    const fetchAssociations = async () => {
      if (!user || !firebase) return;
      setLoading(true);
      try {
        const snapshot = await firebase.firestore().collection('condominiumAssociations')
          .where('members', 'array-contains', user.uid).get();
        const memberData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Association));

        // small discovery list to allow joining associations (limited to 20)
        const discoverSnapshot = await firebase.firestore().collection('condominiumAssociations')
          .limit(20).get();
        const discoverData = discoverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Association));

        // merge and dedupe by id, keep memberData first
        const combined = [...memberData, ...discoverData].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setAssociations(combined);
      } catch (err) {
        console.error('Failed to fetch associations:', err);
      }
      finally {
        setLoading(false);
      }
    };
    if (menuOpen) {
      fetchAssociations();
    }
  }, [user, firebase, menuOpen]);

  const handleLogout = () => {
    if (firebase) {
      firebase.auth().signOut();
    }
  };

  

  const handleNavigateToAssociation = (association: Association) => {
    setMenuOpen(false);
    navigate(`/association/${association.id}`);
  };

  const handleNavigateToAdmin = (association: Association) => {
    if (onAdminSelect) {
      onAdminSelect(association);
    }
    setMenuOpen(false);
    navigate(`/association/${association.id}/admin`);
  };

  return (
    <>
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
          <div style={{ marginBottom: 8 }}>
            <strong>Associations</strong>
            {loading && <WashingLoader />}
            {!loading && associations.length === 0 && <div>No associations</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {associations.map(a => (
                <li key={a.id} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => handleNavigateToAssociation(a)}
                    aria-label={`Open association ${a.name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      cursor: 'pointer',
                      color: 'inherit',
                      font: 'inherit',
                    }}
                  >
                    {a.name}
                  </button>
                  {a.admins.includes(user?.uid || '') ? (
                    <button style={{ marginLeft: 8 }} onClick={() => handleNavigateToAdmin(a)}>
                      Admin
                    </button>
                  ) : (
                    // if not a member, show Join link; otherwise show (member)
                    (a.members?.includes(user?.uid || '') ? (
                      <span style={{ marginLeft: 8, color: '#888' }}>(member)</span>
                    ) : (
                      <button style={{ marginLeft: 8 }} onClick={() => { setMenuOpen(false); navigate(`/association/${a.id}/join`); }}>
                        Join
                      </button>
                    ))
                  )}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleLogout}>Logout ({user.displayName ?? ''})</button>
        </div>
      )}
    </>
  );
};

export default Menu;
