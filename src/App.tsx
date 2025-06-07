import React, { useState } from 'react';
//import Login from './components/Login';
import CalendarComponent from './components/Calendar';
import './App.css';
//import FacebookLogin from './components/FacebookLogin';

const App: React.FC = () => {
  const [user, _setUser] = useState<any>(null);

  // const handleLogin = (userData: any) => {
  //   const apartment = prompt("Please enter your apartment number:");
  //   setUser({ ...userData, apartment });
  // };

  //if (!user) {
  //  return <FacebookLogin 
  //    groupId={import.meta.env.VITE_FACEBOOK_GROUP_ID} 
  //    appId={import.meta.env.VITE_FACEBOOK_APP_ID} 
  //  ></FacebookLogin> //onLogin={handleLogin} /> 
  //}

  const anonymous = { name: 'Anonymous', apartment: 'A1', email: 'anonyomous@anonymous' };

  return (
    <div className='App'>
      <div className='header'>
        <img src="./icon.png" alt="Tvättpass Icon" className='header-icon' />
        <h1 className='header-title'>Tvättpass</h1>
      </div>
      <div className='content-container'>
        <CalendarComponent user={user || anonymous} />
      </div>
    </div>
  );
};

export default App;
