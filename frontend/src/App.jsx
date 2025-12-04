import { useState } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (email, password) => {
    const mockUser = { email, name: email.split('@')[0] };
    setUser(mockUser);
  };

  const handleSignup = (name, email, password) => {
    const mockUser = { email, name };
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} onSignup={handleSignup} />
      )}
    </>
  );
}

export default App;
