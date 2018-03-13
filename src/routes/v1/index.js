const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');

/**
 * GET v1/status
 */
router.get('/health_check', (req, res) => res.send('OK'));
router.use('/users', userRoutes);

module.exports = router;
