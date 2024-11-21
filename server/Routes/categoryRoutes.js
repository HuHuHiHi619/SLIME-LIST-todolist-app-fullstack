const express = require('express');
const router = express.Router();
const { getCategory,createCategory, removedCategory } = require('../controllers/CategoryController');
const guestMiddleware = require('../middleware/guestId');
const authMiddlewareOptional = require('../middleware/authOptional');


router.get('/categories',authMiddlewareOptional(true),guestMiddleware,getCategory);
router.post('/categories',authMiddlewareOptional(true),guestMiddleware,createCategory);

router.delete('/categories/:id',authMiddlewareOptional(true),guestMiddleware,removedCategory);


module.exports = router