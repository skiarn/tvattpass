import React, { useState, useEffect } from 'react';
import { useFirebase } from './firebase';

interface Association {
  id: string;
  name: string;
  admins: string[];
  members: string[];
  joinRequests?: { userId: string; name?: string; email?: string; role?: string }[];
}

const Menu: React.FC<{ user: any; onAdminSelect?: (association: Association) => void }> = ({ user, onAdminSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(false);
    const firebase = useFirebase();
    // Use the user prop directly

  useEffect(() => {
    const fetchAssociations = async () => {
      if (!user || !firebase) return;
      setLoading(true);
      const snapshot = await firebase.firestore().collection('condominiumAssociations')
        .where('members', 'array-contains', user.uid).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Association));
      setAssociations(data);
      setLoading(false);
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

  const handleAdminSelect = (association: Association) => {
    if (onAdminSelect) {
      onAdminSelect(association);
    }
    setMenuOpen(false);
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
            {loading && <div>Loading...</div>}
            {!loading && associations.length === 0 && <div>No associations</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {associations.map(a => (
                <li key={a.id} style={{ marginBottom: 4 }}>
                  {a.name}
                  {a.admins.includes(user?.uid || '') ? (
                    <button style={{ marginLeft: 8 }} onClick={() => handleAdminSelect(a)}>
                      Admin
                    </button>
                  ) : (
                    <span style={{ marginLeft: 8, color: '#888' }}>(member)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </>
  );
};

export default Menu;
