// routes/challenges.js
const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/challenges
// @desc    Membuat challenge baru (Akses: Admin)
router.post('/', async (req, res) => {
  const { title, description, points, type, isActive } = req.body;
  try {
    const newChallenge = await Challenge.create({
      title,
      description,
      points,
      type,
      isActive,
    });
    res.status(201).json(newChallenge);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/challenges
// @desc    Mendapatkan semua challenge yang aktif (Akses: User)
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/challenges/:id
// @desc    Update sebuah challenge (Akses: Admin)
router.put('/:id', async (req, res) => {
    try {
        const challenge = await Challenge.findByPk(req.params.id);
        if (!challenge) {
            return res.status(404).json({ msg: 'Challenge tidak ditemukan' });
        }
        
        const updatedChallenge = await challenge.update(req.body);
        res.json(updatedChallenge);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/challenges/:id/accept
// @desc    User menerima sebuah challenge
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge tidak ditemukan' });
    }

    const user = await User.findByPk(req.user.id);
    await user.addChallenge(challenge, { through: { status: 'Diterima' } });

    res.json({ msg: 'Challenge berhasil diterima' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ msg: 'Anda sudah menerima challenge ini' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/challenges/:id/complete
// @desc    User menyelesaikan sebuah challenge
router.post('/:id/complete', auth, async (req, res) => {
    try {
        const UserChallenge = require('../models/UserChallenge');
        const userChallenge = await UserChallenge.findOne({
            where: {
                UserId: req.user.id,
                ChallengeId: req.params.id
            }
        });

        if (!userChallenge) {
            return res.status(404).json({ msg: 'Anda belum menerima challenge ini' });
        }

        userChallenge.status = 'Selesai';
        await userChallenge.save();

        res.json({ msg: 'Challenge ditandai sebagai selesai, menunggu verifikasi.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;