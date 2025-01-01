const express = require('express');
const router = express.Router();
const { createTag } = require('../controllers/TagController');
const authMiddlewareOptional = require('../middleware/authOptional');
const guestMiddleware = require('../middleware/guestId');

router.post('/tags',authMiddlewareOptional(true),guestMiddleware,createTag);

module.exports = router