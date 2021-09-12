const {
    User,
    Bid,
    NFT
} = require('../../../models');
const validators = require("./validators");
const mongoose = require('mongoose');
const controllers = {};

const nodemailer = require('../../../utils/lib/nodemailer');
controllers.create = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.body.eBidStatus) return res.reply(messages.not_found("Bod Status"));
        if (!req.body.oRecipient) return res.reply(messages.not_found("Recipient"));
        if (!req.body.oNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.nBidPrice) return res.reply(messages.not_found("Bid Price"));
        if (!req.body.sTransactionHash) return res.reply(messages.not_found("Transaction Hash"));
        if (!req.body.nQuantity) return res.reply(messages.not_found("Quantity"));
        if (!req.body.nTokenID) return res.reply(messages.not_found("Token ID"));

        if (!validators.isValidTransactionHash(req.body.sTransactionHash)) return res.reply(messages.invalid("Transaction Hash"));
        if (!validators.isValidObjectID(req.body.oNFTId)) return res.reply(messages.invalid("NFT ID"));
        if (isNaN(req.body.nQuantity) || req.body.nQuantity <= 0) return res.reply(messages.invalid("Quantity"));
        if (isNaN(req.body.nTokenID) || req.body.nTokenID <= 0) return res.reply(messages.invalid("Token ID"));

        let oNFT = await NFT.findById(req.body.oNFTId, (error) => {
            if (error) throw error;
        });
        log.red(oNFT);
        if (!oNFT) return res.reply(messages.not_found('NFT'));

        if (oNFT.nQuantity < +req.body.nQuantity) return res.reply(messages.invalid("Quantity"));

        // TODO: check if this is required
        if (req.body.eBidStatus == "Sold" || req.body.eBidStatus == "Bid") {
            if (!req.body.oRecipient) return res.reply(messages.not_found("Recipient"));
            if (!validators.isValidObjectID(req.body.oRecipient)) return res.reply(messages.invalid("Recipient ID"));

            let oUser = await User.findById(req.body.oRecipient, (err, user) => {
                if (err) throw error;
                // if (!user) return res.reply(messages.not_found('User'));
            });
            if (!oUser) return res.reply(messages.not_found('OUser'));
        }

        // Check if the bidder has already placed bid earlier
        let aBids = await Bid.findOne({
            oBidder: req.userId,
            oNFTId: req.body.oNFTId,
            eBidStatus: "Bid"
        });

        // If previous bid found
        if (aBids) {
            if (req.body.nQuantity == aBids.nQuantity && req.body.nBidPrice < aBids.nBidPrice.toString())
                return res.reply(messages.bad_request("You already have a Bid with higher amount for same quantity!"));
            else if (req.body.nQuantity == aBids.nQuantity && req.body.nBidPrice == aBids.nBidPrice.toString())
                return res.reply(messages.bad_request("You already have a Bid with the same quantity and Price"));

            // Update The bid
            Bid.findOneAndUpdate({
                oBidder: req.userId,
                oNFTId: req.body.oNFTId,
                eBidStatus: "Bid"
            }, {
                nBidPrice: req.body.nBidPrice,
                sTransactionHash: req.body.sTransactionHash,
                nQuantity: req.body.nQuantity
            }, (err, bid) => {

                if (req.body.eBidStatus == "Bid" && req.body.sOwnerEmail != '') {

                    if (req.body.sOwnerEmail && req.body.sOwnerEmail != undefined && req.body.sOwnerEmail != '' && req.body.sOwnerEmail != '-') {

                        nodemailer.send('Bid_Place.html', {
                            SITE_NAME: 'Decrypt NFT',
                            USERNAME: req.body.sOwnerEmail,
                            ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`, //`${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                            TEXT: 'Someone Placed Bid on your NFT.'
                        }, {
                            from: process.env.SMTP_USERNAME,
                            to: req.body.sOwnerEmail,
                            subject: 'Bid Place'
                        });
                    }
                }

                if (err) return res.reply(messages.server_error());
                return res.reply(messages.successfully("Bid Placed"));
            });
        } else {
            let oRecipientID;
            if (req.body.eBidStatus == "Transfer") {
                let aUsers = await User.find({
                    sWalletAddress: req.body.oRecipient
                }, (error) => {
                    if (error) return res.reply(messages.server_error());
                });
                if (!aUsers.length) return res.reply(messages.bad_request("No Collaborator With Such Address is Registered!"));
                log.green(aUsers[0]);
                oRecipientID = aUsers[0]._id;
            }
            const bid = new Bid({
                oBidder: req.userId,
                oRecipient: (req.body.eBidStatus == "Transfer") ? oRecipientID : req.body.oRecipient,
                eBidStatus: req.body.eBidStatus,
                oNFTId: req.body.oNFTId,
                nBidPrice: req.body.nBidPrice,
                sTransactionHash: req.body.sTransactionHash,
                nQuantity: req.body.nQuantity,
                nTokenID: req.body.nTokenID
            });
            bid.save()
                .then(async (result) => {
                    if (req.body.eBidStatus == "Sold" || req.body.eBidStatus == "Transfer") {
                        let oNFTOfNewOwner = await NFT.findOne({
                            oCurrentOwner: (req.body.eBidStatus == "Sold") ? req.userId : oRecipientID,
                            nTokenID: oNFT.nTokenID
                        }).catch((error) => {
                            throw error;
                        });
                        if (req.body.nQuantity == oNFT.nQuantity) {
                            if (oNFTOfNewOwner) {
                                await NFT.findByIdAndUpdate(oNFTOfNewOwner._id, {
                                    nQuantity: oNFTOfNewOwner.nQuantity + +req.body.nQuantity
                                }).catch((error) => {
                                    throw error;
                                });
                                await NFT.findByIdAndDelete(req.body.oNFTId).catch((error) => {
                                    throw error;
                                });
                            } else {
                                await NFT.findByIdAndUpdate(req.body.oNFTId, {
                                    oCurrentOwner: (req.body.eBidStatus == "Sold") ? req.userId : oRecipientID
                                });
                            }
                        } else if (req.body.nQuantity < oNFT.nQuantity) {
                            if (oNFTOfNewOwner) {
                                await NFT.findByIdAndUpdate(oNFTOfNewOwner._id, {
                                    nQuantity: oNFTOfNewOwner.nQuantity + +req.body.nQuantity
                                }).catch((error) => {
                                    throw error;
                                });
                                await NFT.findByIdAndUpdate(req.body.oNFTId, {
                                    nQuantity: oNFT.nQuantity - +req.body.nQuantity
                                }).catch((error) => {
                                    throw error;
                                });
                            } else {
                                let newNFT = new NFT({
                                    sHash: oNFT.sHash,
                                    eType: oNFT.eType,
                                    sCreated: oNFT.sCreated,
                                    oPostedBy: oNFT.oPostedBy,
                                    sCollection: oNFT.sCollection,
                                    sName: oNFT.sName,
                                    sCollaborator: oNFT.sCollaborator,
                                    sNftdescription: oNFT.sNftdescription,
                                    nCollaboratorPercentage: oNFT.nCollaboratorPercentage,
                                    sSetRoyaltyPercentage: oNFT.sSetRoyaltyPercentage,
                                    nBasePrice: oNFT.nBasePrice,
                                    eAuctionType: oNFT.eAuctionType,
                                    nTokenID: oNFT.nTokenID,
                                    sTransactionHash: oNFT.sTransactionHash,
                                    sTransactionStatus: oNFT.sTransactionStatus,
                                    nQuantity: req.body.nQuantity,
                                    oCurrentOwner: (req.body.eBidStatus == "Sold") ? req.userId : oRecipientID
                                });
                                await newNFT.save().then(async () => {

                                    await NFT.findByIdAndUpdate(req.body.oNFTId, {
                                        nQuantity: oNFT.nQuantity - +req.body.nQuantity
                                    }).catch((error) => {
                                        throw error;
                                    });
                                }).catch((error) => {
                                    throw error;
                                    // if (error) return res.reply(messages.server_error());
                                });
                            }
                        } else {
                            return res.reply(messages.bad_request("Invalid Quantity"));
                        }
                    }
                    if (req.body.eBidStatus == "Bid") {
                        if (req.body.sOwnerEmail && req.body.sOwnerEmail != undefined && req.body.sOwnerEmail != '' && req.body.sOwnerEmail != '-') {

                            nodemailer.send('Bid_Place.html', {
                                SITE_NAME: 'Decrypt NFT',
                                USERNAME: req.body.sOwnerEmail,
                                ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`,// `${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                                TEXT: 'Someone Placed Bid on your NFT.'
                            }, {
                                from: process.env.SMTP_USERNAME,
                                to: req.body.sOwnerEmail,
                                subject: 'Bid Place'
                            })
                        }

                    }
                    // if (req.body.eBidStatus == "Sold")
                    //     await NFT.findByIdAndUpdate(req.body.oNFTId, {
                    //         oCurrentOwner: req.userId
                    //     });
                    // if (req.body.eBidStatus == "Transfer")
                    //     await NFT.findByIdAndUpdate(req.body.oNFTId, {
                    //         oCurrentOwner: oRecipientID
                    //     });
                    return res.reply(messages.successfully((req.body.eBidStatus == "Sold") ? "Bought" : (req.body.eBidStatus == "Transfer") ? "Transferred" : 'Bid Placed'), result);
                })
                .catch((error) => {
                    return res.reply(messages.server_error());
                });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.getBidHistoryOfItem = async (req, res, next) => {
    try {
        if (!req.params.nNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!validators.isValidObjectID(req.params.nNFTId)) return res.reply(messages.invalid("NFT ID"));

        // var nLimit = parseInt(req.body.length);
        // var nOffset = parseInt(req.body.start);
        let data = await Bid.aggregate([{
            '$match': {
                'oNFTId': mongoose.Types.ObjectId(req.params.nNFTId),
                "sTransactionStatus": 1
            }
        }, {
            '$project': {
                '_id': 1,
                'eBidStatus': 1,
                'oRecipient': 1,
                'oBidder': 1,
                'oNFTId': 1,
                'nBidPrice': 1,
                'sCreated': 1,
                "nQuantity": 1
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oRecipient',
                'foreignField': '_id',
                'as': 'oRecipient'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oBidder',
                'foreignField': '_id',
                'as': 'oBidder'
            }
        }, {
            '$sort': {
                'sCreated': -1
            }
        }, { $unwind: '$oBidder' }, { $unwind: '$oRecipient' }, {
            '$facet': {
                'bids': [{
                    "$skip": +0
                }],
                'totalCount': [{
                    '$count': 'count'
                }]
            }
        }]);
        let iFiltered = data[0].bids.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.no_prefix('Bid Details'), {
                data: [],
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": 0,
            });
        } else {
            return res.reply(messages.no_prefix('Bid Details'), {
                data: data[0].bids,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.toggleBidStatus = async (req, res, next) => {
    try {
        if (!req.body.eBidStatus) return res.reply(messages.not_found("Bid Status"));
        if (!req.body.oNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.oBidderId) return res.reply(messages.not_found("Bidder ID"));
        if (!req.body.sObjectId) return res.reply(messages.not_found("Object ID"));
        if (!req.body.sTransactionHash) return res.reply(messages.not_found("Transaction Hash"));

        if (!validators.isValidTransactionHash(req.body.sTransactionHash)) return res.reply(messages.invalid("Transaction Hash"));
        if (!validators.isValidObjectID(req.body.oNFTId)) return res.reply(messages.invalid("NFT ID"));
        if (!validators.isValidObjectID(req.body.oBidderId)) return res.reply(messages.invalid("Bidder ID"));
        if (!validators.isValidObjectID(req.body.sObjectId)) return res.reply(messages.invalid("Bid ID"));
        if (req.body.eBidStatus.trim() == "") return res.reply(messages.invalid("Bid Status"));

        if (req.body.eBidStatus == "Accepted") {

            let oNFT = await NFT.findById(req.body.oNFTId).catch((error) => {
                throw error;
            });
            if (!oNFT) return res.reply(messages.not_found('NFT'));

            let oBid = await Bid.findById(req.body.sObjectId).catch((error) => {
                throw error;
            });
            if (!oBid) return res.reply(messages.not_found('Bid'));

            let oNFTOfNewOwner = await NFT.findOne({
                nTokenID: oNFT.nTokenID,
                oCurrentOwner: req.body.oBidderId
            }, (error) => {
                if (error) throw error;
            });
            if (req.body.sCurrentUserEmail && req.body.sCurrentUserEmail != undefined && req.body.sCurrentUserEmail != '' && req.body.sCurrentUserEmail != '-') {
                console.log('----------------------------------send 1')
                let a = await nodemailer.send('Bid_Place.html', {
                    SITE_NAME: 'Decrypt NFT',
                    USERNAME: req.body.sCurrentUserEmail,
                    ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`, // `${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                    TEXT: 'Your Bid Has Been Accepted on NFT.'
                }, {
                    from: process.env.SMTP_USERNAME,
                    to: req.body.sCurrentUserEmail,
                    subject: 'Bid Accepted'
                });
                console.log('----------------------------------send 3', a);
            }
            console.log('====================================');
            console.log();
            console.log('====================================');

            if (oBid.nQuantity == oNFT.nQuantity) {
                // add quantity or transfer owner
                if (oNFTOfNewOwner) {
                    await NFT.findByIdAndUpdate(oNFTOfNewOwner._id, {
                        nQuantity: oNFTOfNewOwner.nQuantity + +oBid.nQuantity
                    }).catch((error) => {
                        throw error;
                    });
                    await NFT.findByIdAndDelete(oNFT._id).catch((error) => {
                        throw error;
                    });
                } else {
                    await NFT.findByIdAndUpdate(req.body.oNFTId, {
                        oCurrentOwner: req.body.oBidderId
                    });
                }
            } else if (oBid.nQuantity < oNFT.nQuantity) {
                // add and deduct quantity
                if (oNFTOfNewOwner) {
                    await NFT.findByIdAndUpdate(oNFTOfNewOwner._id, {
                        nQuantity: oNFTOfNewOwner.nQuantity + +oBid.nQuantity
                    }).catch((error) => {
                        throw error;
                    });
                    await NFT.findByIdAndUpdate(req.body.oNFTId, {
                        nQuantity: oNFT.nQuantity - +oBid.nQuantity
                    }).catch((error) => {
                        throw error;
                    });
                } else {
                    let newNFT = new NFT({
                        sHash: oNFT.sHash,
                        eType: oNFT.eType,
                        sCreated: oNFT.sCreated,
                        oPostedBy: oNFT.oPostedBy,
                        sCollection: oNFT.sCollection,
                        sName: oNFT.sName,
                        sCollaborator: oNFT.sCollaborator,
                        sNftdescription: oNFT.sNftdescription,
                        nCollaboratorPercentage: oNFT.nCollaboratorPercentage,
                        sSetRoyaltyPercentage: oNFT.sSetRoyaltyPercentage,
                        nBasePrice: oNFT.nBasePrice,
                        eAuctionType: oNFT.eAuctionType,
                        nTokenID: oNFT.nTokenID,
                        sTransactionHash: oNFT.sTransactionHash,
                        sTransactionStatus: oNFT.sTransactionStatus,
                        nQuantity: oBid.nQuantity,
                        oCurrentOwner: req.body.oBidderId
                    });
                    await newNFT.save().then(async () => {
                        await NFT.findByIdAndUpdate(req.body.oNFTId, {
                            nQuantity: oNFT.nQuantity - +oBid.nQuantity
                        }).catch((error) => {
                            throw error;
                        });
                    }).catch((error) => {
                        throw error;
                        // if (error) return res.reply(messages.server_error());
                    });
                }
            } else {
                return res.reply(messages.invalid("Quantity"));
            }
        }
        Bid.findByIdAndUpdate(req.body.sObjectId, {
            eBidStatus: req.body.eBidStatus,
            sTransactionStatus: 0,
            sTransactionHash: req.body.sTransactionHash
        },
            (err, bid) => {
                if (err) {
                    log.red(err);
                    throw err;
                }
                if (!bid) return res.reply(messages.not_found('Bid'));

                if (req.body.eBidStatus == "Rejected") {

                    if (req.body.sCurrentUserEmail && req.body.sCurrentUserEmail != undefined && req.body.sCurrentUserEmail != '' && req.body.sCurrentUserEmail != '-') {

                        nodemailer.send('Bid_Place.html', {
                            SITE_NAME: 'Decrypt NFT',
                            USERNAME: req.body.sCurrentUserEmail,
                            ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`,// `${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                            TEXT: 'Your Bid Has Been Rejected on NFT.'
                        }, {
                            from: process.env.SMTP_USERNAME,
                            to: req.body.sCurrentUserEmail,
                            subject: 'Bid Rejected'
                        });

                    }
                }

                // Reject all other bids if any one Bid is accepted
                if (req.body.eBidStatus == "Accepted") {
                    Bid.updateMany({
                        eBidStatus: {
                            $eq: "Bid"
                        },
                        oNFTId: {
                            $eq: req.body.oNFTId
                        }
                    }, {
                        eBidStatus: "Rejected"
                    }, (err, result) => {
                        if (err) throw err;
                    });
                }
                return res.reply(messages.updated('Bid Status'));
            });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}
controllers.bidByUser = async (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        var nLimit = req.body.length && req.body.length != undefined ? parseInt(req.body.length) : 5000;
        var nOffset = req.body.start && req.body.start != undefined ? parseInt(req.body.start) : 0;

        let data = await Bid.aggregate([{
            '$match': {
                $and: [{
                    'oBidder': mongoose.Types.ObjectId(req.userId),
                }, {
                    eBidStatus: {
                        $ne: "Sold"
                    }
                }, {
                    eBidStatus: {
                        $ne: "Transfer"
                    }
                }]
            }
        }, {
            '$project': {
                '_id': 1,
                'eBidStatus': 1,
                'oRecipient': 1,
                'oNFTId': 1,
                "sTransactionStatus": 1,
                nBidPrice: 1
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oRecipient',
                'foreignField': '_id',
                'as': 'oRecipient'
            }
        }, {
            '$lookup': {
                'from': 'nfts',
                'localField': 'oNFTId',
                'foreignField': '_id',
                'as': 'oNFT'
            }
        }, { $unwind: '$oNFT' }, { $unwind: '$oRecipient' }, {
            '$sort': {
                '_id': -1
            }
        }, {
            '$facet': {
                'nfts': [{
                    "$skip": +nOffset
                }, {
                    "$limit": +nLimit
                }],
                'totalCount': [{
                    '$count': 'count'
                }]
            }
        }]);
        console.log(data[0].nfts)

        let iFiltered = data[0].nfts.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.not_found('Data'))
        } else {
            return res.reply(messages.no_prefix('NFT Details'), {
                data: data[0].nfts,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}
module.exports = controllers;