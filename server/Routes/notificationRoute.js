const express = require('express');
const { getNotifications } = require('../utils/notification');
const authMiddlewareOptional = require('../middleware/authOptional');
const router = express.Router();

router.get('/notification',authMiddlewareOptional(true),getNotifications);

module.exports = router