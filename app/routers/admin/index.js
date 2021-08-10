const router = require('express').Router();
const adminController = require('./lib/controllers');
const adminMiddleware = require('./lib/middleware');

// Dashboard API
router.get('/getDashboardData', adminMiddleware.verifyToken, adminController.getDashboardData);

// Profile API
router.put('/updateProfile', adminMiddleware.verifyToken, adminController.updateProfile);

// NFT APIs
router.post('/nfts', adminMiddleware.verifyToken, adminController.nfts);

// User APIs
router.post('/users', adminMiddleware.verifyToken, adminController.users);
router.post('/toggleUserStatus', adminMiddleware.verifyToken, adminController.toggleUserStatus);

// Newsletter APIs
router.post('/sendNewsLetterEmail', adminMiddleware.verifyToken, adminController.sendNewsLetterEmail);
router.post('/getNewsLetterEmailsLists', adminMiddleware.verifyToken, adminController.getNewsLetterEmailsLists);
router.delete('/deleteNewsLetterEmail', adminMiddleware.verifyToken, adminController.deleteNewsLetterEmail);

// Category APIs
router.post("/addCategory", adminMiddleware.verifyToken, adminController.addCategory);
router.post("/getCategories", adminMiddleware.verifyToken, adminController.getCategories);
router.put("/toggleCategory/:sName", adminMiddleware.verifyToken, adminController.toggleCategory);
router.delete("/deleteCategory/:sName", adminMiddleware.verifyToken, adminController.deleteCategory);
router.put("/editCategory", adminMiddleware.verifyToken, adminController.editCategory);

//CMS APIs
router.post("/updateAboutus", adminMiddleware.verifyToken, adminController.updateAboutus);
router.post("/updateTerms", adminMiddleware.verifyToken, adminController.updateTerms);
router.post("/updateFAQs", adminMiddleware.verifyToken, adminController.updateFAQs);

module.exports = router;