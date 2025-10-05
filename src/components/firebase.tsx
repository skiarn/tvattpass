// Import FirebaseAuth and firebase.
import React, { useEffect, useState } from 'react';
import './firebase.css';
import firebase, { FirebaseContext } from './firebaseClient';

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
        {children ? children(user) : null}
      </div>
    </FirebaseContext.Provider>
  );
}

export default SignInScreen;