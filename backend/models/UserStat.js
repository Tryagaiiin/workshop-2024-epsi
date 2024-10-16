const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const UserStat = sequelize.define('UserStat', {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  username: DataTypes.STRING,
  avatar: DataTypes.STRING,
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  infractions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  kicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  muteUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  kickUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  roles: DataTypes.TEXT,
  badges: DataTypes.TEXT,
  punishments: DataTypes.TEXT, // Vous pouvez utiliser un type JSON si vous souhaitez stocker des objets
});

module.exports = UserStat;
