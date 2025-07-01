// models/Challenge.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Judul tantangan, cth: Menangkan 5 Ranked Match'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Deskripsi detail tantangan'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Poin yang didapat setelah menyelesaikan'
  },
  type: {
    type: DataTypes.ENUM('Harian', 'Mingguan', 'Event'),
    allowNull: false,
    defaultValue: 'Harian'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Apakah challenge ini sedang aktif atau tidak'
  },
});

module.exports = Challenge;