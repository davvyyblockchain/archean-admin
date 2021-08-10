const router = require('express').Router();
const bidController = require('./lib/controllers');
const bidMiddleware = require('./lib/middleware');

router.post('/create', bidMiddleware.verifyToken, bidController.create);
router.post('/history/:nNFTId', bidController.getBidHistoryOfItem);
router.post('/toggleBidStatus', bidMiddleware.verifyToken, bidController.toggleBidStatus);
router.post('/bidByUser', bidMiddleware.verifyToken, bidController.bidByUser);

module.exports = router;
