const express = require('express');
const { getNotifications } = require('../utils/notification');
const authMiddlewareOptional = require('../middleware/authOptional');
const router = express.Router();

router.get('/notification',authMiddlewareOptional(false),getNotifications);

module.exports = router