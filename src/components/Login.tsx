import React from 'react';
import FacebookLogin from 'react-facebook-login';

interface LoginProps {
  onLogin: (response: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const responseFacebook = (response: any) => {
    if (response.accessToken) {
      onLogin(response);
    }
  };

  return (
    <div>
      <h2>Login with Facebook</h2>
      <FacebookLogin
        appId={import.meta.env.VITE_FACEBOOK_APP_ID}
        //autoLoad={true}
        fields="name,picture"
        //scope='groups_access_member_info,publish_to_groups'
        callback={responseFacebook}
      />
    </div>
  );
};

export default Login;
