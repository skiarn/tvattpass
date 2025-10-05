import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFirebase } from '../components/firebaseClient';
import CalendarComponent from '../components/Calendar';
import WashingLoader from '../components/WashingLoader';
import { Association } from '../types/association';

const AssociationPage: React.FC = () => {
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
        setAssociation({ id: doc.id, ...(doc.data() as unknown) } as Association);
      } else {
        setAssociation(null);
      }
      setLoading(false);
    };
    fetchAssoc();
  }, [firebase, id]);

  if (loading) return <WashingLoader />;
  if (!association) return <div>Association not found</div>;

  return (
    <div>
      <h2>{association.name}</h2>
      {/* Calendar expects associations array; pass the single association */}
  <CalendarComponent user={currentUser!} associations={[association]} />
    </div>
  );
};

export default AssociationPage;