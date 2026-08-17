const express = require('express');
const router = express.Router();
const { getHomePage, submitOrder } = require('../controllers/publicController');

router.get('/', getHomePage);
router.post('/api/order', submitOrder);

module.exports = router;
