// routes/admin.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const auth = require('../middleware/auth');

// Middleware sederhana untuk mengecek peran admin
const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ msg: 'Akses ditolak, butuh peran admin' });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/submissions
// @desc    Melihat semua submission yang butuh verifikasi (status 'Selesai')
// @access  Admin
router.get('/submissions', [auth, adminAuth], async (req, res) => {
    try {
        const submissions = await UserChallenge.findAll({
            where: { status: 'Selesai' },
            include: [
                { model: User, attributes: ['id', 'username', 'inGameId'] },
                { model: Challenge, attributes: ['id', 'title', 'points'] }
            ],
            order: [['updatedAt', 'ASC']] // Proses yang paling lama menunggu dulu
        });
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/submissions/:id/verify
// @desc    Memverifikasi submission dan memberikan poin
// @access  Admin
router.post('/submissions/:id/verify', [auth, adminAuth], async (req, res) => {
    const t = await sequelize.transaction(); // Mulai transaksi database

    try {
        const submissionId = req.params.id;
        const submission = await UserChallenge.findByPk(submissionId, { transaction: t });

        if (!submission || submission.status !== 'Selesai') {
            await t.rollback();
            return res.status(404).json({ msg: 'Submission tidak ditemukan atau statusnya salah.' });
        }

        // 1. Ubah status submission menjadi 'Diverifikasi'
        submission.status = 'Diverifikasi';
        await submission.save({ transaction: t });

        // 2. Dapatkan data user dan challenge
        const user = await User.findByPk(submission.UserId, { transaction: t });
        const challenge = await Challenge.findByPk(submission.ChallengeId, { transaction: t });

        // 3. Tambahkan poin ke user
        user.points += challenge.points;
        await user.save({ transaction: t });

        // Jika semua berhasil, konfirmasi transaksi
        await t.commit();
        res.json({ msg: `Submission diverifikasi. ${challenge.points} poin diberikan kepada ${user.username}.` });

    } catch (err) {
        // Jika ada satu saja error, batalkan semua perubahan
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;