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
  
  // Construire l'URL de l'avatar
  const avatarUrl = stats.avatar
    ? `https://cdn.discordapp.com/avatars/${stats.userId}/${stats.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

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
			<h4>Rôles :</h4>
        <div>
            {stats.roles ? (
              stats.roles.split(',').map((role, index) => (
                <span key={index} className="badge badge-secondary mr-2">{role}</span>
              ))
            ) : (
              <p>Aucun rôle assigné</p>
            )}
          </div>
          <h4>Badges :</h4>
          <div>
            {stats.badges ? (
              stats.badges.split(',').map((badge, index) => (
                <span key={index} className="badge badge-info mr-2">{badge}</span>
              ))
            ) : (
              <p>Aucun badge obtenu</p>
            )}
          </div>
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
