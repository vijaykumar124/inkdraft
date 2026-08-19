const express = require('express');
const router = express.Router();
const { getHomePage, submitOrder, getCategoryGallery } = require('../controllers/publicController');

router.get('/', getHomePage);
router.get('/category/:slug', getCategoryGallery);
router.post('/api/order', submitOrder);

module.exports = router;
