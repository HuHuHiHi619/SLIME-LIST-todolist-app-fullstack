const express = require('express');
const router = express.Router();
const { createTag, removeTag, getTag } = require('../controllers/TagController');
const authMiddlewareOptional = require('../middleware/authOptional');
const guestMiddleware = require('../middleware/guestId');


router.get('/tags',authMiddlewareOptional(true),guestMiddleware,getTag);
router.post('/tags',authMiddlewareOptional(true),guestMiddleware,createTag);

router.delete('/tags',authMiddlewareOptional(true),guestMiddleware,removeTag);

module.exports = router