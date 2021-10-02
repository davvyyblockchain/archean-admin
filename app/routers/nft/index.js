const router = require('express').Router();
const nftController = require('./lib/controllers');
const nftMiddleware = require('./lib/middleware');

router.post('/create', nftMiddleware.verifyToken, nftController.create);
// router.post('/list', nftMiddleware.verifyToken, nftController.list);
router.post('/mynftlist', nftMiddleware.verifyToken, nftController.mynftlist);
router.post('/createCollection', nftMiddleware.verifyToken, nftController.createCollection);
router.get('/collectionList', nftMiddleware.verifyToken, nftController.collectionlist);
router.post('/nftListing',nftMiddleware.verifyWithoutToken, nftController.nftListing);
router.get('/viewnft/:nNFTId',nftMiddleware.verifyWithoutToken, nftController.nftID);
router.post('/setTransactionHash', nftMiddleware.verifyToken, nftController.setTransactionHash);
router.get('/landing',nftMiddleware.verifyWithoutToken, nftController.landing);

router.get("/deleteNFT/:nNFTId", nftMiddleware.verifyToken, nftController.deleteNFT);
router.post('/allCollectionWiseList',nftMiddleware.verifyWithoutToken, nftController.allCollectionWiselist);

router.put('/updateBasePrice', nftMiddleware.verifyToken, nftController.updateBasePrice);

router.put('/toggleSellingType', nftMiddleware.verifyToken, nftController.toggleSellingType);
router.post('/myCollectionList', nftMiddleware.verifyToken, nftController.collectionlistMy);

router.post("/like", nftMiddleware.verifyToken, nftController.likeNFT);


// nNFTId: 6120eba598b61743cf49a43f
// nBasePrice: 1
//https://decryptnft.io/api/v1/nft/updateBasePrice
module.exports = router;