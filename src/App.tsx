import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { User } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="App">
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;