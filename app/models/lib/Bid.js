const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({

    oBidder: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    oRecipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    eBidStatus: {
        type: String,
        enum: ['Bid', 'Canceled', 'Accepted', 'Sold', 'Rejected', 'Transfer']
    },
    nBidPrice: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    oNFTId: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFT'
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    sTransactionHash: {
        type: String,
        unique: true
    },
    sTransactionStatus: {
        type: Number,
        default: 0,
        // -1: Transaction Failed
        //  0: Pending
        //  1: Mined
        enum: [-1, 0, 1]
    },
    nQuantity: Number,
    nTokenID: Number
});

module.exports = mongoose.model('Bid', bidSchema);