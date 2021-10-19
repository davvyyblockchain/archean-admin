const mongoose = require('mongoose');

const nftSchema = mongoose.Schema({
    sHash: {
        type: String,
        require: true
    },
    eType: {
        type: String,
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    oCurrentOwner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    oPostedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    sCollection: String,
    sName: String,
    sCollaborator: Array,
    sNftdescription: String,
    nCollaboratorPercentage: Array,
    sSetRroyalityPercentage: Number,
    nQuantity: Number,
    nView: Number,
    nBasePrice: mongoose.Types.Decimal128,
    eAuctionType: {
        type: String,
        enum: ['Auction', 'Fixed Sale', 'Unlockable']
    },
    nTokenID: {
        type: Number
    },
    sTransactionHash: {
        type: String
    },
    sTransactionStatus: {
        type: Number,
        default: -99,
        // -99: Transaction not submitted to Blockchain
        // -1:  Transaction Failed
        //  0:  Pending
        //  1:  Mined
        enum: [-99, -1, 0, 1]
    },
    user_likes: [{
        type: mongoose.Schema.ObjectId
    }],
    auction_end_date: {type :Date},
});

module.exports = mongoose.model('NFT', nftSchema);