// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import api from './api';
import Dashboard from './Dashboard';
import Leaderboard from './Leaderboard';
import Navbar from './Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/api/user')
      .then(response => setUser(response.data))
      .catch(() => setUser(null));
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={
          user ? <Dashboard /> : (
            <div className="container mt-4">
              <h1>Bienvenue</h1>
              <a href="http://localhost:5000/auth/discord" className="btn btn-primary">
                <i className="fab fa-discord"></i> Se connecter avec Discord
              </a>
            </div>
          )
        } />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;
