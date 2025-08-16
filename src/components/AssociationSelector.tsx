import React, { useState, useEffect } from 'react';
import { useFirebase } from './firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface Association {
  id: string;
  name: string;
  admins: string[];
  members: string[];
}

interface AssociationSelectorProps {
  onSelect: (association: Association) => void;
  associations: Association[];
}

const AssociationSelector: React.FC<AssociationSelectorProps> = ({ onSelect, associations }) => {
  const [selectedId, setSelectedId] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firebaseInstance = useFirebase();
  const user = firebaseInstance?.auth().currentUser;

  // Associations are now passed as a prop, no need to fetch here

  const handleCreate = async () => {
    setError(null);
    if (!user) {
      setError('You must be logged in to create an association.');
      return;
    }
    if (!newName) {
      setError('Please enter a name for the association.');
      return;
    }
    if (!firebaseInstance) {
      setError('Firebase is not initialized.');
      return;
    }
    setLoading(true);
    try {
      const docRef = await firebaseInstance.firestore().collection('condominiumAssociations').add({
        name: newName,
        admins: [user.uid],
        members: [user.uid],
      });
      setLoading(false);
      onSelect({ id: docRef.id, name: newName, admins: [user.uid], members: [user.uid] });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create association.');
    }
  };

  const handleJoin = async () => {
    setError(null);
    if (!user) {
      setError('You must be logged in to join an association.');
      return;
    }
    if (!selectedId) {
      setError('Please select an association to join.');
      return;
    }
    if (!firebaseInstance) {
      setError('Firebase is not initialized.');
      return;
    }
    setLoading(true);
    try {
      const assocRef = firebaseInstance.firestore().collection('condominiumAssociations').doc(selectedId);
      await assocRef.update({
        members: firebase.firestore.FieldValue.arrayUnion(user.uid),
      });
      const assoc = associations.find(a => a.id === selectedId);
      setLoading(false);
      if (assoc) onSelect({ ...assoc, members: [...assoc.members, user.uid] });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to join association.');
    }
  };

  return (
    <div>
      <h2>Select or Create Association</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <div>
        <input
          type="text"
          placeholder="New association name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button onClick={handleCreate} disabled={loading || !newName}>{loading ? 'Creating...' : 'Create'}</button>
      </div>
      <div>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">Select existing...</option>
          {associations.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button onClick={handleJoin} disabled={loading || !selectedId}>{loading ? 'Joining...' : 'Join'}</button>
      </div>
    </div>
  );
};

export default AssociationSelector;
