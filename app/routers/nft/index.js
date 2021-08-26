const router = require('express').Router();
const nftController = require('./lib/controllers');
const nftMiddleware = require('./lib/middleware');

router.post('/create', nftMiddleware.verifyToken, nftController.create);
// router.post('/list', nftMiddleware.verifyToken, nftController.list);
router.post('/mynftlist', nftMiddleware.verifyToken, nftController.mynftlist);
router.post('/createCollection', nftMiddleware.verifyToken, nftController.createCollection);
router.get('/collectionList', nftMiddleware.verifyToken, nftController.collectionlist);
router.post('/nftListing', nftController.nftListing);
router.get('/viewnft/:nNFTId', nftController.nftID);
router.post('/setTransactionHash', nftMiddleware.verifyToken, nftController.setTransactionHash);
router.get('/landing', nftController.landing);
router.put('/toggleSellingType', nftMiddleware.verifyToken, nftController.toggleSellingType);

router.get("/deleteNFT/:nNFTId", nftMiddleware.verifyToken, nftController.deleteNFT);
router.post('/allCollectionWiseList', nftController.allCollectionWiselist);

module.exports = router;