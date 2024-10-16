// Dashboard.js
import React, { useEffect, useState } from 'react';
import api from './api';
import StatsChart from './StatsChart';
import { motion } from 'framer-motion';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/stats')
      .then(response => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors de la récupération des données');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  const avatarUrl = stats.avatar
    ? `https://cdn.discordapp.com/avatars/${stats.userId}/${stats.avatar}.${stats.avatar.startsWith('a_') ? 'gif' : 'png'}`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const handleRedeemInfraction = () => {
    api.post('/api/redeem/infraction')
      .then(response => {
        alert(response.data.message);
        // Rafraîchir les stats
        setStats(response.data.stats);
      })
      .catch(err => {
        alert(err.response.data.message || 'Erreur lors de l\'échange de points.');
      });
  };

  const handleRedeemKick = () => {
    api.post('/api/redeem/kick')
      .then(response => {
        alert(response.data.message);
        // Rafraîchir les stats
        setStats(response.data.stats);
      })
      .catch(err => {
        alert(err.response.data.message || 'Erreur lors de l\'échange de points.');
      });
  };

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <img
          src={avatarUrl}
          alt="Avatar"
          width="128"
          height="128"
          className="rounded-circle"
        />
        <h1>Bonjour, {stats.username}</h1>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h3><i className="fas fa-user"></i> Informations personnelles</h3>
          <p><strong>Points :</strong> {stats.points}</p>
          <p><strong>Infractions :</strong> {stats.infractions}</p>
          <p><strong>Kicks :</strong> {stats.kicks}</p>
          <button className="btn btn-primary mr-2 mt-2" onClick={handleRedeemInfraction}>
            Échanger 100 points contre 1 infraction
          </button>
          <button className="btn btn-danger mt-2" onClick={handleRedeemKick}>
            Échanger 500 points contre 1 kick
          </button>
          {/* ... autres informations ... */}
        </div>
        <div className="col-md-6">
          <h3><i className="fas fa-chart-bar"></i> Vos statistiques</h3>
          <StatsChart stats={stats} />
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
