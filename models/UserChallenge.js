// models/UserChallenge.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserChallenge = sequelize.define('UserChallenge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('Diterima', 'Selesai', 'Diverifikasi'),
    defaultValue: 'Diterima'
  },
});

module.exports = UserChallenge;