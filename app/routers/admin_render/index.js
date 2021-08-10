const router = require('express').Router();
const adminRenderController = require('./lib/controller');
const adminRenderMiddleware = require('./lib/middleware');

router.get('/signin', adminRenderMiddleware.checkAuth, adminRenderController.signin);
router.get('/forgotPassword', adminRenderMiddleware.checkAuth, adminRenderController.forgotPassword);
router.get('/dashboard', adminRenderMiddleware.checkAuthAdmin, adminRenderController.dashboard);
router.get('/profile', adminRenderMiddleware.checkAuthAdmin, adminRenderController.profile);
router.get('/users', adminRenderMiddleware.checkAuthAdmin, adminRenderController.users);
router.get('/nfts', adminRenderMiddleware.checkAuthAdmin, adminRenderController.nfts);
router.get('/commission', adminRenderMiddleware.checkAuthAdmin, adminRenderController.commission);
router.get('/NewsLetterPage', adminRenderMiddleware.checkAuthAdmin, adminRenderController.newsLetterPage);
router.get("/categories", adminRenderMiddleware.checkAuthAdmin, adminRenderController.categories);
router.get("/aboutus", adminRenderMiddleware.checkAuthAdmin, adminRenderController.aboutus);
router.get("/terms", adminRenderMiddleware.checkAuthAdmin, adminRenderController.terms);
router.get("/faqs", adminRenderMiddleware.checkAuthAdmin, adminRenderController.faqs);
router.get("/composeMail", adminRenderMiddleware.checkAuthAdmin, adminRenderController.composeMail);
module.exports = router;