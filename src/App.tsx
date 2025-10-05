import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AssociationSelector from './components/AssociationSelector';
import './App.css';
import SignInScreen from './components/firebase';
import Menu from './components/Menu';
import { useFirebase } from './components/firebaseClient';
import AssociationPage from './pages/AssociationPage';
import AssociationAdminRoute from './pages/AssociationAdminRoute';
import JoinAssociationPage from './pages/JoinAssociationPage';
import WashingLoader from './components/WashingLoader';
import firebase from 'firebase/compat/app';
import { Association, JoinRequest } from './types/association';

const AppContent: React.FC<{ user: firebase.User }> = ({ user }) => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(false);
  const firebase = useFirebase();

  useEffect(() => {
    const fetchAssociations = async () => {
      if (!user || !firebase) return;
      setLoading(true);
      try {
        // Fetch associations where user is a member or admin
        const snapshot = await firebase.firestore().collection('condominiumAssociations')
          .where('members', 'array-contains', user.uid).get();
        const adminSnapshot = await firebase.firestore().collection('condominiumAssociations')
          .where('admins', 'array-contains', user.uid).get();
        const memberData = snapshot.docs.map(doc => {
          const data = doc.data() as Partial<Association>;
          return {
            id: doc.id,
            name: data?.name ?? '',
            admins: Array.isArray(data?.admins) ? data.admins : [],
            members: Array.isArray(data?.members) ? data.members : [],
            joinRequests: Array.isArray(data?.joinRequests) ? data.joinRequests : undefined,
            // keep any other fields available but typed as unknown via index signature
            ...data,
          } as Association;
        });

        const adminData = adminSnapshot.docs.map(doc => {
          const data = doc.data() as Partial<Association>;
          return {
            id: doc.id,
            name: data?.name ?? '',
            admins: Array.isArray(data?.admins) ? data.admins : [],
            members: Array.isArray(data?.members) ? data.members : [],
            joinRequests: Array.isArray(data?.joinRequests) ? data.joinRequests : undefined,
            ...data,
          } as Association;
        });
        // Merge and deduplicate
        const allAssociations = [...memberData, ...adminData].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setAssociations(allAssociations);
      } finally {
        setLoading(false);
      }
    };
    fetchAssociations();
  }, [user, firebase]);

  // If user belongs to any association, show calendar directly (the calendar expects associations prop)
  // If user has any pending join request (invitation in progress), show that first
  if (loading) return <WashingLoader />;
  const hasPendingRequest = associations.some(a => a.joinRequests?.some((r: JoinRequest) => r.userId === user?.uid));
  if (hasPendingRequest) {
    return <div>Invitation in progress</div>;
  }

  if (associations.length > 0) {
    
    // Redirect to the first association's route so the app uses routing
    return <Navigate to={`/association/${associations[0].id}`} replace />;
  }
  // Otherwise, show create/join association options
  return <AssociationSelector onSelect={() => {}} associations={associations} />;
};

const App: React.FC = () => {
  return (
    <SignInScreen>
      {(user) => {
        return (
          <BrowserRouter basename='/tvattpass'>
            <div className='App'>
              <div className='header'>
                <img src="/tvattpass/icon.png" alt="Tvattpass Icon" className='header-icon' />
                <h1 className='header-title'>Tvattpass</h1>
                <Menu user={user} />
              </div>

              <div className="content-container">
                <Routes>
                  <Route path="/" element={<AppContent user={user} />} />
                  <Route path="/association/:id" element={<AssociationPage />} />
                  <Route path="/association/:id/admin" element={<AssociationAdminRoute />} />
                  <Route path="/association/:id/join" element={<JoinAssociationPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
              </div>
            </div>
          </BrowserRouter>
        );
      }}
    </SignInScreen>
  );
};

export default App;
