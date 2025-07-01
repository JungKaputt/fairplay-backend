// server.js
const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// 1. Impor semua model
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const UserChallenge = require('./models/UserChallenge');

// 2. Definisikan semua hubungan di sini
User.belongsToMany(Challenge, { through: UserChallenge });
Challenge.belongsToMany(User, { through: UserChallenge });
User.hasMany(UserChallenge);
UserChallenge.belongsTo(User);
Challenge.hasMany(UserChallenge);
UserChallenge.belongsTo(Challenge);


const app = express();

connectDB();

sequelize.sync({ alter: true })
  .then(() => console.log('Database tables synced.'))
  .catch(err => console.error('Failed to sync database tables:', err));

app.use(cors());
app.use(express.json({ extended: false }));
app.use('/uploads', express.static('uploads'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.send('FairPlay API is running...'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));