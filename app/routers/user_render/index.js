const router = require('express').Router();
const userRenderController = require('./lib/controllers');
const userRenderMiddleware = require('./lib/middleware');

/********** Commond File Render **************/
router.get('/', userRenderMiddleware.checkAuth, userRenderController.landing);
router.get('/profile', userRenderMiddleware.checkAuthUser, userRenderController.profile);
router.get('/createOption', userRenderMiddleware.checkAuthUser, userRenderController.createOption);
router.get('/createNFT', userRenderMiddleware.checkAuthUser, userRenderController.createNFT);
router.get('/mynft', userRenderMiddleware.checkAuthUser, userRenderController.mynft);
router.get('/addCollaborator', userRenderMiddleware.checkAuthUser, userRenderController.addCollaborator);
router.get('/collaboratorList', userRenderMiddleware.checkAuthUser, userRenderController.collaboratorList);
router.get('/createCollection', userRenderMiddleware.checkAuthUser, userRenderController.createCollection);
router.get('/collectionList', userRenderMiddleware.checkAuthUser, userRenderController.collectionList);
router.get('/manageBid', userRenderMiddleware.checkAuthUser, userRenderController.manageBid);
router.get('/listing', userRenderMiddleware.checkAuth, userRenderController.listing);
router.get('/viewNFT/:nNFTId', userRenderMiddleware.checkAuth, userRenderController.viewNFT);
router.get('/transferNFT', userRenderMiddleware.checkAuthUser, userRenderController.transferNFT);
router.get('/editCollaborator/:sCollaboratorAddress', userRenderMiddleware.checkAuthUser, userRenderController.editCollaborator);
router.get('/aboutus', userRenderController.aboutus);
router.get('/terms', userRenderController.terms);
router.get('/faqs', userRenderController.faqs);

module.exports = router;