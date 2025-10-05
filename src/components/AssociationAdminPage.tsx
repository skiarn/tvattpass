import React, { useEffect, useState } from 'react';
import { useFirebase } from './firebaseClient';
import WashingLoader from './WashingLoader';
import { Association, JoinRequest } from '../types/association';

const AssociationAdminPage: React.FC<{ association: Association; }> = ({ association }) => {
  const firebase = useFirebase();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [members, setMembers] = useState<string[]>(association.members);
  const [admins, setAdmins] = useState<string[]>(association.admins);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apartments, setApartments] = useState<{ [userId: string]: string }>({});
  const currentUser = firebase?.auth().currentUser;

  type ApartmentInputs = {
    [userId: string]: string;
  };

  const [apartmentInputs, setApartmentInputs] = useState<ApartmentInputs>({});



  useEffect(() => {
    const fetchJoinRequests = async () => {
      if (!firebase) return;
      setLoading(true);
      try {
        const snapshot = await firebase.firestore()
          .collection('condominiumAssociations')
          .doc(association.id)
          .collection('joinRequests')
          .get();
        const requests = snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() } as JoinRequest));
        setJoinRequests(requests);
      } catch (err) {
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message?: string }).message || 'Failed to fetch join requests'
            : 'Failed to fetch join requests'
        );
      }
      // Fetch apartments for all members
      try {
        const apartmentsData: { [userId: string]: string } = {};
        for (const userId of members) {
          const userDoc = await firebase.firestore().collection('users').doc(userId).get();
          apartmentsData[userId] = userDoc.exists ? userDoc.data()?.apartment || '' : '';
        }
        setApartments(apartmentsData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch apartments');
        } else {
          setError('Failed to fetch apartments');
        }
      }
      setLoading(false);
    };
    fetchJoinRequests();
  }, [firebase, association.id, members]);

  const handleApprove = async (userId: string, role: string) => {
    if (!firebase) {
      setError('Firebase is not available');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Add to members and optionally admins
      const assocRef = firebase.firestore().collection('condominiumAssociations').doc(association.id);
      await assocRef.update({
        members: firebase.firestore.FieldValue.arrayUnion(userId),
        admins: role === 'admin' ? firebase.firestore.FieldValue.arrayUnion(userId) : admins,
      });
      // Remove join request
      await assocRef.collection('joinRequests').doc(userId).delete();
      setMembers(prev => [...prev, userId]);
      if (role === 'admin') setAdmins(prev => [...prev, userId]);
      setJoinRequests(prev => prev.filter(r => r.userId !== userId));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to approve invite');
      } else {
        setError('Failed to approve invite');
      }
    }
    setLoading(false);
  };

  

  const handleApartmentChange = async (userId: string, value: string) => {
    if (!firebase || !admins.includes(currentUser?.uid || '')) return;
    setLoading(true);
    try {
      await firebase.firestore().collection('users').doc(userId).update({ apartment: value });
      setApartments(prev => ({ ...prev, [userId]: value }));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to update apartment');
      } else {
        setError('Failed to update apartment');
      }
    }
    setLoading(false);
  };

  const appartmentInputsChange = (userId: string, value: string) => {
    console.log('Apartment input change:', userId, value);
    setApartmentInputs(prev => ({ ...prev, [userId]: value }));
};

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin: {association.name}</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3>Members</h3>
      <ul>
        {members.map(uid => (
          <li key={uid}>
            {uid}{admins.includes(uid) ? ' (admin)' : ' (user)'}
            {' | Apartment: '}
            {admins.includes(currentUser?.uid || '') ? (
              <>  
                <input
                    type="text"
                    value={apartments[uid]}
                    onChange={e => appartmentInputsChange(uid, e.target.value)}
                    style={{ marginLeft: 8 }}
                />
                <button onClick={() => handleApartmentChange(uid, apartmentInputs[uid] || '')} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                </button>
                {loading && <WashingLoader />}
              </>
            ) : (
              <span style={{ marginLeft: 8 }}>{apartments[uid] || ''}</span>
            )}
          </li>
        ))}
      </ul>
      <h3>Invited Users</h3>
      {loading && <WashingLoader />}
      <ul>
        {joinRequests.map(r => (
          <li key={r.userId}>
            {r.name || r.email || r.userId}
            <select defaultValue={r.role || 'user'} id={`role-${r.userId}`}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={() => handleApprove(r.userId, (document.getElementById(`role-${r.userId}`) as HTMLSelectElement).value)} disabled={loading}>
              Approve
            </button>
            {loading && <WashingLoader />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssociationAdminPage;
