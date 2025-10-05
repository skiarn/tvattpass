import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useFirebase } from '../components/firebaseClient';
import AssociationAdminPage from '../components/AssociationAdminPage';
import WashingLoader from '../components/WashingLoader';
import { Association } from '../types/association';

const AssociationAdminRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const firebase = useFirebase();
  const [association, setAssociation] = useState<Association | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = firebase?.auth().currentUser;

  useEffect(() => {
    const fetchAssoc = async () => {
      if (!firebase || !id) return;
      setLoading(true);
      const doc = await firebase.firestore().collection('condominiumAssociations').doc(id).get();
      if (doc.exists) {
        setAssociation({ id: doc.id, ...doc.data() });
      } else {
        setAssociation(null);
      }
      setLoading(false);
    };
    fetchAssoc();
  }, [firebase, id]);

  if (loading) return <WashingLoader />;
  if (!association) return <div>Association not found</div>;

  // Only allow admins to view admin page
  const isAdmin = association.admins?.includes(currentUser?.uid);
  if (!isAdmin) return <Navigate to={`/association/${id}`} replace />;

  return <AssociationAdminPage association={association} />;
};

export default AssociationAdminRoute;