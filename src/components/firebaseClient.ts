import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { createContext, useContext } from 'react';

// Configure Firebase.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
// Only initialize if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export const FirebaseContext = createContext<typeof firebase | null>(null);
export const useFirebase = () => useContext(FirebaseContext);
export default firebase;
