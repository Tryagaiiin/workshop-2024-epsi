const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: console.log, // Affiche les requêtes SQL dans la console
});

module.exports = sequelize;
