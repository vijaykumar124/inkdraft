const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Auth
router.get('/login', adminCtrl.getLogin);
router.post('/login', adminCtrl.postLogin);
router.get('/logout', adminCtrl.logout);

// Protected routes
router.get('/dashboard', protect, adminCtrl.getDashboard);

// Artists
router.get('/artists', protect, adminCtrl.getArtists);
router.post('/artists', protect, adminCtrl.createArtist);
router.put('/artists/:id', protect, adminCtrl.updateArtist);
router.delete('/artists/:id', protect, adminCtrl.deleteArtist);

// Designs
router.get('/designs', protect, adminCtrl.getDesigns);
router.post('/designs', protect, adminCtrl.createDesign);
router.put('/designs/:id', protect, adminCtrl.updateDesign);
router.delete('/designs/:id', protect, adminCtrl.deleteDesign);

// Categories
router.get('/categories', protect, adminCtrl.getCategories);
router.post('/categories', protect, adminCtrl.createCategory);
router.put('/categories/:id', protect, adminCtrl.updateCategory);
router.delete('/categories/:id', protect, adminCtrl.deleteCategory);

// Orders
router.get('/orders', protect, adminCtrl.getOrders);
router.get('/orders/:id', protect, adminCtrl.getOrder);
router.put('/orders/:id', protect, adminCtrl.updateOrder);

// Testimonials
router.get('/testimonials', protect, adminCtrl.getTestimonials);
router.post('/testimonials', protect, adminCtrl.createTestimonial);
router.put('/testimonials/:id', protect, adminCtrl.updateTestimonial);
router.delete('/testimonials/:id', protect, adminCtrl.deleteTestimonial);

// Pricing
router.get('/pricing', protect, adminCtrl.getPricing);
router.post('/pricing', protect, adminCtrl.createPricing);
router.put('/pricing/:id', protect, adminCtrl.updatePricing);
router.delete('/pricing/:id', protect, adminCtrl.deletePricing);

// Settings
router.get('/settings', protect, adminCtrl.getSettings);
router.post('/settings', protect, adminCtrl.updateSettings);

module.exports = router;
