import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function StatsChart({ stats }) {
  const data = {
    labels: ['Points', 'Infractions', 'Kicks'],
    datasets: [
      {
        label: 'Statistiques',
        data: [stats.points, stats.infractions, stats.kicks],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
      },
    ],
  };

  return <Bar data={data} />;
}

export default StatsChart;
