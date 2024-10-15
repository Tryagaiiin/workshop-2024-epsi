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
  roles: DataTypes.TEXT,
  badges: DataTypes.TEXT,
  punishments: DataTypes.TEXT,
});

module.exports = UserStat;
