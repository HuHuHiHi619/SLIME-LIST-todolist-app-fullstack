const express = require('express');
const router = express.Router();
const { createTag, removeTag, getTag } = require('../controllers/TagController');
const authMiddlewareOptional = require('../middleware/authOptional');
const guestMiddleware = require('../middleware/guestId');


router.get('/tags',guestMiddleware,authMiddlewareOptional,getTag);
router.post('/tags',guestMiddleware,authMiddlewareOptional,createTag);

router.delete('/tags',guestMiddleware,authMiddlewareOptional,removeTag);

module.exports = router