const express = require('express');
const router = express.Router();
const { getCategory,createCategory, removedCategory } = require('../controllers/CategoryController');
const guestMiddleware = require('../middleware/guestId');
const authMiddlewareOptional = require('../middleware/authOptional');


router.get('/categories',authMiddlewareOptional,guestMiddleware,getCategory);
router.post('/categories',authMiddlewareOptional,guestMiddleware,createCategory);

router.delete('/categories',authMiddlewareOptional,guestMiddleware,removedCategory);


module.exports = router