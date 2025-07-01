// routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Challenge = require('../models/Challenge'); // Impor Challenge
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @route   GET api/profile/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile
router.put('/', auth, async (req, res) => {
    const { inGameId } = req.body;
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User tidak ditemukan' });
        }
        user.inGameId = inGameId || user.inGameId;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile/verify-upload
router.post('/verify-upload', [auth, upload.single('screenshot')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'File tidak terunggah' });
        }
        const user = await User.findByPk(req.user.id);
        user.inGameScreenshotUrl = req.file.path;
        await user.save();
        res.json({ 
            msg: 'Screenshot berhasil diunggah, menunggu verifikasi admin.',
            filePath: req.file.path,
            user: user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/me/challenges
router.get('/me/challenges', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: {
                model: Challenge,
                through: {
                    attributes: ['status']
                }
            },
            attributes: { exclude: ['password'] }
        });

        res.json(user.Challenges);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;