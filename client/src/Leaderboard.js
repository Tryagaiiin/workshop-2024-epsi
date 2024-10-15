import React, { useEffect, useState } from 'react';
import api from './api';
import { motion } from 'framer-motion';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get('/api/leaderboard')
      .then(response => setLeaderboard(response.data))
      .catch(() => setLeaderboard([]));
  }, []);

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Classement des utilisateurs</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Utilisateur</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, index) => {
            // Construire l'URL de l'avatar
            const avatarUrl = user.avatar
              ? `https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
              : 'https://cdn.discordapp.com/embed/avatars/0.png';

            return (
              <tr key={user.userId}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    width="32"
                    height="32"
                    className="rounded-circle mr-2"
                  />
                  {user.username}
                </td>
                <td>{user.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}

export default Leaderboard;
