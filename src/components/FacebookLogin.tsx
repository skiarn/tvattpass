import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    FB: any;
  }
}

interface FacebookLoginProps {
  appId: string;
  groupId: string;
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ appId, groupId }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      window.fbAsyncInit = initializeFacebookSDK;
      
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs?.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  }, []);

  const initializeFacebookSDK = () => {
    window.FB.init({
      appId,
      cookie: true,
      xfbml: true,
      version: 'v18.0'
    });
  };

  const handleLogin = () => {
    window.FB.login((response: any) => {
      if (response.authResponse) {
        setIsLoggedIn(true);
      } else {
        setError('Facebook login failed');
      }
    }, { scope: '' }); // Removed deprecated permissions
  };

  //publish_to_groups
  //Deprecated for v19.0. Will be removed for all version April 22, 2024.
  const postToGroup = async (message: string) => {
    try {
      window.FB.api(
        `/${groupId}/feed`,
        'POST',
        { message },
        (response: any) => {
          if (response.error) {
            setError(response.error.message);
          } else {
            console.log('Posted to group successfully:', response);
          }
        }
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <button onClick={handleLogin}>Login with Facebook</button>
      ) : (
        <button onClick={() => postToGroup('Test post to group')}>
          Post to Facebook Group
        </button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default FacebookLogin;
