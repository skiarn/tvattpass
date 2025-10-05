import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../components/firebaseClient';
import { Association, JoinRequest } from '../types/association';
import { QRCodeSVG } from 'qrcode.react';
import WashingLoader from '../components/WashingLoader';

const JoinAssociationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const firebase = useFirebase();
  const navigate = useNavigate();
  const [association, setAssociation] = useState<Association | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [requested, setRequested] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const qrcodeURL = window.location.href; // Current page URL for QR code

  useEffect(() => {
    const fetchAssoc = async () => {
      if (!firebase || !id) return;
      setLoading(true);
      const doc = await firebase.firestore().collection('condominiumAssociations').doc(id).get();
      if (doc.exists) setAssociation({ id: doc.id, ...doc.data() } as Association);
      else setAssociation(null);
      setLoading(false);
    };
    fetchAssoc();
  }, [firebase, id]);

  const handleJoin = async () => {
    if (!firebase) return;
    const user = firebase.auth().currentUser;
    if (!user) {
      // If not logged in, redirect to root where SignInScreen will prompt for sign-in
      navigate('/');
      return;
    }
    if (!association) return;
    setSending(true);
    const requestObj = {
      userId: user.uid,
      name: user.displayName || null,
      email: user.email || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
      // add to association joinRequests array
      await firebase.firestore().collection('condominiumAssociations').doc(association.id).update({
        joinRequests: firebase.firestore.FieldValue.arrayUnion(requestObj),
      });
      // also create a top-level joinRequests document for easy querying
      await firebase.firestore().collection('joinRequests').add({
        associationId: association.id,
        associationName: association.name || null,
        userId: user.uid,
        name: user.displayName || null,
        email: user.email || null,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setRequested(true);
      setToast('Request sent — waiting for admin approval');
      setSending(false);
      // keep user on the join page so they see the confirmation
      // auto-dismiss toast after 4s
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error('Join request failed', err);
      setToast('Request failed — please try again');
      setSending(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (loading) return <WashingLoader />;
  if (!association) return <div>Association not found</div>;

  const user = firebase?.auth().currentUser;

  const alreadyRequested = requested || association.joinRequests?.some((r: JoinRequest) => r.userId === user?.uid);
  const isMember = association.members?.includes(user?.uid || '') || association.admins?.includes(user?.uid || '');

  return (
    <div>
      <h2>Join {association.name}</h2>
      <QRCodeSVG value={qrcodeURL} />

      {isMember && <div>You are already a member of this association.</div>}
      {!isMember && alreadyRequested && (
        <div>Invitation in progress — you've requested to join and are waiting for an admin to approve.</div>
      )}
      {!isMember && !alreadyRequested && (
        <div>
          <p>Click the button below to request to join this association. An admin will need to approve your request.</p>
          <button onClick={handleJoin} disabled={sending || requested}>{sending || requested ? 'Sending…' : 'Request to join'}</button>
        </div>
      )}
      {toast && <div style={{ marginTop: 12, padding: 8, background: '#222', color: 'white', borderRadius: 4 }}>{toast}</div>}
    </div>
  );
};

export default JoinAssociationPage;
