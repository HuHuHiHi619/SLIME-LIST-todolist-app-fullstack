const express = require('express');
const authMiddleware = require('../middleware/auth');
const guestMiddleware = require('../middleware/guestId');
const { getNotifications } = require('../utils/notification');
const router = express.Router();

router.get('/notification',authMiddleware,guestMiddleware,getNotifications);

module.exports = router