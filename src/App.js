import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Upload from './components/Upload';
import ChatHistory from './components/ChatHistory';
import AdminRegister from './components/AdminRegister';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Protected routes */}
          <Route
            path="/chat"
            element={isLoggedIn ? <Chat handleLogout={handleLogout} userRole={userRole} /> : <Navigate to="/login" />}
          />
          <Route
            path="/upload"
            element={isLoggedIn ? <Upload handleLogout={handleLogout} userRole={userRole}/> : <Navigate to="/login" />}
          />
          <Route
            path="/chat-history"
            element={isLoggedIn ? <ChatHistory handleLogout={handleLogout} userRole={userRole}/> : <Navigate to="/login" />}
          />

          {/* Redirect to login if not logged in */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
