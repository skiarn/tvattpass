// Import FirebaseAuth and firebase.
import React, { useEffect, useState, createContext, useContext } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import './firebase.css';

// Configure Firebase.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
// Only initialize if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

// Connect to Auth emulator if running locally
//if (window.location.hostname === 'localhost') {
//  firebase.auth().useEmulator('http://localhost:9099/');
//}

const FirebaseContext = createContext<typeof firebase | null>(null);

const useFirebase = () => useContext(FirebaseContext);

type SignInScreenProps = {
  children?: (user: firebase.User) => React.ReactNode;
};

const SignInScreen: React.FC<SignInScreenProps> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unregisterAuthObserver();
  }, []);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  };

  const signInWithFacebook = () => {
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider);
  };

  if (!user) {
    return (
      <FirebaseContext.Provider value={firebase}>
        <div className="firebase-signin-outer">
          <div className="firebase-signin-inner">
            <p className="firebase-signin-title">Please sign-in:</p>
            <button
              onClick={signInWithGoogle}
              className="firebase-signin-btn google"
            >
              Sign in with Google
            </button>
            <button
              onClick={signInWithFacebook}
              className="firebase-signin-btn facebook"
            >
              Sign in with Facebook
            </button>
          </div>
        </div>
      </FirebaseContext.Provider>
    );
  }
  return (
    <FirebaseContext.Provider value={firebase}>
      <div>
        <p>
          Welcome {user.displayName ?? ''}! You are now signed-in!
        </p>
        {children ? children(user) : null}
      </div>
    </FirebaseContext.Provider>
  );
}

export { FirebaseContext, useFirebase };
export default SignInScreen;