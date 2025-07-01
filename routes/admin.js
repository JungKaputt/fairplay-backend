const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const auth = require('../middleware/auth');

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

router.get('/submissions', [auth, adminAuth], async (req, res) => {
    try {
        const submissions = await UserChallenge.findAll({
            where: { status: 'Selesai' },
            include: [
                { model: User, attributes: ['id', 'username', 'inGameId'] },
                { model: Challenge, attributes: ['id', 'title', 'points'] }
            ],
            order: [['updatedAt', 'ASC']]
        });
        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/submissions/:id/verify', [auth, adminAuth], async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const submissionId = req.params.id;
        const submission = await UserChallenge.findByPk(submissionId, { transaction: t });

        if (!submission || submission.status !== 'Selesai') {
            await t.rollback();
            return res.status(404).json({ msg: 'Submission tidak ditemukan atau statusnya salah.' });
        }

        submission.status = 'Diverifikasi';
        await submission.save({ transaction: t });

        const user = await User.findByPk(submission.UserId, { transaction: t });
        const challenge = await Challenge.findByPk(submission.ChallengeId, { transaction: t });

        user.points += challenge.points;
        await user.save({ transaction: t });

        await t.commit();
        res.json({ msg: `Submission diverifikasi. ${challenge.points} poin diberikan kepada ${user.username}.` });

    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
