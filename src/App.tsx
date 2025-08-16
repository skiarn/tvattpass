import React, { useState, useEffect } from 'react';
import CalendarComponent from './components/Calendar';
import AssociationSelector from './components/AssociationSelector';
import './App.css';
import SignInScreen from './components/firebase';
import Menu from './components/Menu';
import AssociationAdminPage from './components/AssociationAdminPage';
import { useFirebase } from './components/firebase';


const AppContent: React.FC<{ user: any }> = ({ user }) => {
  const [association, setAssociation] = useState<any>(null);
  const [associations, setAssociations] = useState<any[]>([]);
  const firebase = useFirebase();

  useEffect(() => {
    const fetchAssociations = async () => {
      if (!user || !firebase) return;
      // Fetch associations where user is a member or admin
      const snapshot = await firebase.firestore().collection('condominiumAssociations')
        .where('members', 'array-contains', user.uid).get();
      const adminSnapshot = await firebase.firestore().collection('condominiumAssociations')
        .where('admins', 'array-contains', user.uid).get();
      const memberData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const adminData = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Merge and deduplicate
      const allAssociations = [...memberData, ...adminData].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setAssociations(allAssociations);
    };
    fetchAssociations();
  }, [user, firebase]);

  // If user belongs to any association, show calendar directly
  if (associations.length > 0) {
    return <CalendarComponent user={user} associations={associations} />;
  }
  // Otherwise, show create/join association options
  return <AssociationSelector onSelect={setAssociation} associations={associations} />;
};

const App: React.FC = () => {
  const [adminAssociation, setAdminAssociation] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  return (
    <SignInScreen>
      {(user) => {
        setCurrentUser(user);
        return (
          <div className='App'>
            <div className='header'>
              <img src="./icon.png" alt="Tvattpass Icon" className='header-icon' />
              <h1 className='header-title'>Tvattpass</h1>
              <Menu user={user} onAdminSelect={setAdminAssociation} />
            </div>
            {adminAssociation ? (
              <AssociationAdminPage association={adminAssociation} onClose={() => setAdminAssociation(null)} />
            ) : (
              <AppContent user={user} />
            )}
          </div>
        );
      }}
    </SignInScreen>
  );
};
export default App;
