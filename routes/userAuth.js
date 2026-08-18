const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userAuthController');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/me', userCtrl.getMe);

module.exports = router;
