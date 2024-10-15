import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Enregistrer les composants nécessaires
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function StatsChart({ stats }) {
  const data = {
    labels: ['Points', 'Infractions'],
    datasets: [
      {
        label: 'Statistiques',
        data: [stats.points, stats.infractions],
        backgroundColor: ['#4caf50', '#f44336'],
      },
    ],
  };

  return <Bar data={data} />;
}

export default StatsChart;
