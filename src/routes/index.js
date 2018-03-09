
const express = require('express');
const healthRoute = require('./health.route');

const router = express.Router();

/**
 * GET v1/status
 */
// router.get('/status', (req, res) => res.send('OK'));

router.use('/health_check', healthRoute);

module.exports = router;