const fs = require('fs');
const {
    NFT,
    Collection,
    User,
    Bid
} = require('../../../models');
const pinataSDK = require('@pinata/sdk');
const multer = require('multer');
const pinata = pinataSDK(process.env.PINATAAPIKEY, process.env.PINATASECRETAPIKEY);
const mongoose = require('mongoose');
const validators = require('./validators');
var jwt = require('jsonwebtoken');
const controllers = {};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.cwd() + '/nft');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().getTime() + '_' + file.originalname);
    }
});
var allowedMimes;
var errAllowed;

let fileFilter = function (req, file, cb) {
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb({
            success: false,
            message: `Invalid file type! Only ${errAllowed}  files are allowed.`
        }, false);
    }
};

let oMulterObj = {
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15mb
    },
    fileFilter: fileFilter
};

const upload = multer(oMulterObj).single('nftFile');

controllers.create = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        allowedMimes = ['image/jpeg', "video/mp4", 'image/jpg', 'image/png', 'image/gif', 'audio/mp3', 'audio/mpeg'];
        errAllowed = "JPG, JPEG, PNG, GIF, MP3 & MPEG";

        upload(req, res, function (error) {
            if (error) { //instanceof multer.MulterError
                log.red(error)
                fs.unlinkSync(req.file.path);
                return res.reply(messages.bad_request(error.message));
            } else {

                log.green(req.body);

                if (!req.body.sName) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('Title'));
                }
                if (!req.body.nQuantity) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('Quantity'));
                }
                if (!req.body.sCollaborator) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('Collaborators'));
                }
                if (!req.body.nCollaboratorPercentage) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('Collaborator Percentages'));
                }
                if (!req.body.sSetRoyaltyPercentage) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('Royalty Percentages'));
                }
                if (!req.body.eAuctionType) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('Auction Type'));
                }
                if (!req.body.nBasePrice) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('Base Price'));
                }

                if (!validators.isValidString(req.body.sName)) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Title"));
                }
                if (!validators.isValidString(req.body.eAuctionType)) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Auction Type"));
                }
                if (!validators.isValidString(req.body.sName)) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Title"));
                }
                if (!validators.isValidSellingType(req.body.eAuctionType)) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Auction Type"));
                }
                if (req.body.eAuctionType != "Unlockable" && req.body.nBasePrice <= 0) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Base Price"));
                }
                if (req.body.sNftdescription.trim().length > 1000) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Description"));
                }
                if (isNaN(req.body.nQuantity) || !req.body.nQuantity > 0) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Quantity"));
                }
                if (isNaN(req.body.sSetRoyaltyPercentage)) {
                    log.red("NaN");
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Royalty Percentages"));
                }
                if (req.body.sSetRoyaltyPercentage < 0) {
                    log.red("Greater Than 0");
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Royalty Percentages"));
                }
                if (!(req.body.sSetRoyaltyPercentage <= 100)) {
                    log.red("Less Than 100");
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Royalty Percentages"));
                }

                if (!req.file) {
                    return res.reply(messages.not_found('File'));
                }

                // Check for duplicate Collaborator address
                if (new Set(req.body.sCollaborator.split(",")).size !== req.body.sCollaborator.split(",").length) {
                    return res.reply(messages.bad_request("You Can't select same collaborator multiple times"));
                }

                const oOptions = {
                    pinataMetadata: {
                        name: req.file.originalname,
                    },
                    pinataOptions: {
                        cidVersion: 0
                    }
                };
                const readableStreamForFile = fs.createReadStream(req.file.path);

                pinata.pinFileToIPFS(readableStreamForFile, oOptions).then(async (result) => {

                    fs.unlinkSync(req.file.path);
                    let oNFTData = await NFT.findOne({
                        sHash: result.IpfsHash,
                        $and: [{
                            sTransactionStatus: {
                                $ne: -1
                            },
                            sTransactionStatus: {
                                $ne: -99
                            }
                        }]
                    })

                    if (oNFTData) {
                        if (result.IpfsHash === oNFTData.sHash)
                            return res.reply(messages.already_exists('NFT'));
                    }

                    const nft = new NFT({
                        sName: req.body.sName,
                        sCollection: req.body.sCollection && req.body.sCollection != undefined ? req.body.sCollection : '',
                        sHash: result.IpfsHash,
                        eType: req.body.eType,
                        nQuantity: req.body.nQuantity,
                        sCollaborator: req.body.sCollaborator.split(","),
                        nCollaboratorPercentage: req.body.nCollaboratorPercentage.split(",").map(percentage => +percentage),
                        sSetRroyalityPercentage: req.body.sSetRoyaltyPercentage,
                        sNftdescription: req.body.sNftdescription,
                        eAuctionType: req.body.eAuctionType,
                        nBasePrice: req.body.nBasePrice,
                        oPostedBy: req.userId,
                        oCurrentOwner: req.userId
                    });

                    nft.save()
                        .then((result) => {
                            return res.reply(messages.created('NFT'), result);
                        })
                        .catch((error) => {
                            return res.reply(messages.already_exists('NFT Address'));
                        })

                }).catch((err) => {
                    //handle error here
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.error());
                });
            }
        })
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

// controllers.list = async (req, res) => {
//     try {
//         if (!req.userId) return res.reply(messages.unauthorized());

//         var nLimit = parseInt(req.body.length);
//         var nOffset = parseInt(req.body.start);
//         let oTypeQuery;
//         let oTtextQuery = {
//             "sName": new RegExp(req.body.sTextsearch, 'i')
//         }
//         if (req.body.eType == 'All')
//             oTypeQuery = {
//                 "$or": [{
//                     "eType": "Image"
//                 }, {
//                     "eType": "GIF"
//                 }, {
//                     "eType": "Audio"
//                 }]
//             }
//         else
//             oTypeQuery = {
//                 "$or": [{
//                     "eType": req.body.eType
//                 }]
//             }
//         let data = await NFT.aggregate([{
//                 "$match": oTypeQuery
//             },
//             {
//                 "$project": {
//                     "_id": 1,
//                     "sName": 1,
//                     "eType": 1,
//                     "nBasePrice": 1,
//                     "sArtistName": 1,
//                     "sHash": 1
//                 }
//             },
//             {
//                 "$sort": {
//                     "_id": -1
//                 }
//             },
//             {
//                 "$facet": {
//                     "nfts": [{
//                         "$skip": +nOffset
//                     }, {
//                         "$limit": +nLimit
//                     }],
//                     "totalCount": [{
//                         "$count": 'count'
//                     }]
//                 }
//             }
//         ]);
//         let iFiltered = data[0].nfts.length;
//         if (data[0].totalCount[0] == undefined) {
//             return res.reply(messages.not_found('Data'))
//         } else {
//             return res.reply(messages.no_prefix('NFT Details'), {
//                 data: data[0].nfts,
//                 "draw": req.body.draw,
//                 "recordsTotal": data[0].totalCount[0].count,
//                 "recordsFiltered": iFiltered,
//             });
//         }
//     } catch (error) {
//         return res.reply(messages.server_error());
//     }
// };

controllers.mynftlist = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        var nLimit = parseInt(req.body.length);
        var nOffset = parseInt(req.body.start);
        let oTypeQuery = {},
            oSellingTypeQuery = {},
            oSortingOrder = {};
        log.red(req.body);
        if (req.body.eType[0] != 'All' && req.body.eType[0] != "") {
            oTypeQuery = {
                "$or": []
            };
            req.body.eType.forEach((element) => {
                oTypeQuery["$or"].push({
                    "eType": element
                });
            });
        }

        let oCollectionQuery = {};
        if (req.body.sCollection != "All" && req.body.sCollection != "") {
            oCollectionQuery = {
                "sCollection": req.body.sCollection
            }
        }

        if (req.body.sSellingType != "") {
            oSellingTypeQuery = {
                "eAuctionType": req.body.sSellingType
            }
        }

        if (req.body.sSortingType == "Recently Added") {
            oSortingOrder["sCreated"] = -1;
        } else if (req.body.sSortingType == "Most Viewed") {
            oSortingOrder["nView"] = -1;
        } else if (req.body.sSortingType == "Price Low to High") {
            oSortingOrder["nBasePrice"] = 1;
        } else if (req.body.sSortingType == "Price High to Low") {
            oSortingOrder["nBasePrice"] = -1;
        } else {
            oSortingOrder["_id"] = -1;
        }

        let data = await NFT.aggregate([{
            '$match': {
                '$and': [oTypeQuery, oCollectionQuery, oSellingTypeQuery, {
                    '$or': [{
                        'oCurrentOwner': mongoose.Types.ObjectId(req.userId)
                    }]
                }]
            }
        }, {
            '$sort': oSortingOrder
        }, {
            '$project': {
                '_id': 1,
                'sName': 1,
                'eType': 1,
                'nBasePrice': 1,
                'sHash': 1,
                'nQuantity': 1,
                'nTokenID': 1,
                'oCurrentOwner': 1,
                "sTransactionStatus": 1,
                eAuctionType: 1,
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oCurrentOwner',
                'foreignField': '_id',
                'as': 'oUser'
            }
        }, { $unwind: '$oUser' }, {
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
        let iFiltered = data[0].nfts.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.success('Data'), {
                data: 0,
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": iFiltered,
            });
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
};

controllers.createCollection = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        errAllowed = "JPG, JPEG, PNG";

        upload(req, res, function (error) {
            if (error) { //instanceof multer.MulterError
                fs.unlinkSync(req.file.path);
                return res.reply(messages.bad_request(error.message));
            } else {
                if (!req.body.sName) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found("Collection Name"));
                }
                if (!req.file) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found('File'));
                }

                if (!validators.isValidString(req.body.sName)) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Collection Name"));
                }
                if (req.body.sDescription.trim().length > 1000) {
                    fs.unlinkSync(req.file.path);
                    return res.reply(messages.invalid("Description"));
                }

                const oOptions = {
                    pinataMetadata: {
                        name: req.file.originalname,
                    },
                    pinataOptions: {
                        cidVersion: 0
                    }
                };
                const readableStreamForFile = fs.createReadStream(req.file.path);

                pinata.pinFileToIPFS(readableStreamForFile, oOptions).then(async (result) => {

                    fs.unlinkSync(req.file.path);

                    const collection = new Collection({
                        sHash: result.IpfsHash,
                        sName: req.body.sName,
                        sDescription: req.body.sDescription,
                        oCreatedBy: req.userId,
                    });
                    collection.save()
                        .then((result) => {
                            return res.reply(messages.created('Collection'), result);
                        })
                        .catch((error) => {
                            return res.reply(messages.already_exists('Collection'));
                        })
                }).catch((err) => {
                    //handle error here
                    return res.reply(messages.error());
                });
            }
        })
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.collectionlist = async (req, res) => {
    try {
        if (!req.userId)
            return res.reply(messages.unauthorized());

        let aCollections = await Collection.aggregate([{
            '$match': {
                'oCreatedBy': mongoose.Types.ObjectId(req.userId)
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oCreatedBy',
                'foreignField': '_id',
                'as': 'oUser'
            }
        }, {
            '$sort': {
                'sCreated': -1
            }
        }]);

        if (!aCollections) {
            return res.reply(messages.not_found('collection'));
        }

        return res.reply(messages.no_prefix('Collection Details'), aCollections);

    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.collectionlistMy = async (req, res) => {
    try {
        if (!req.userId)
            return res.reply(messages.unauthorized());


        var nLimit = parseInt(req.body.length);
        var nOffset = parseInt(req.body.start);

        let query = {
            'oCreatedBy': mongoose.Types.ObjectId(req.userId)
        };
        if (req && req.body.sTextsearch && req.body.sTextsearch != undefined) {
            query['sName'] = new RegExp(req.body.sTextsearch, 'i');
        }

        let aCollections = await Collection.aggregate([{
            '$match': query
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oCreatedBy',
                'foreignField': '_id',
                'as': 'oUser'
            }
        }, {
            $unwind: { preserveNullAndEmptyArrays: true, path: "$oUser" }
        }, {
            '$sort': {
                'sCreated': -1
            }
        }, {
            '$facet': {
                'collections': [{
                    "$skip": +nOffset
                }, {
                    "$limit": +nLimit
                }],
                'totalCount': [{
                    '$count': 'count'
                }]
            }
        }]);


        let iFiltered = aCollections[0].collections.length;
        if (aCollections[0].totalCount[0] == undefined) {
            return res.reply(messages.success('Data'), {
                aCollections: 0,
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": iFiltered,
            });
        } else {
            return res.reply(messages.no_prefix('Collection Details'), {
                data: aCollections[0].collections,
                "draw": req.body.draw,
                "recordsTotal": aCollections[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }

    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.nftListing = async (req, res) => {
    try {

        var nLimit = parseInt(req.body.length);
        var nOffset = parseInt(req.body.start);
        let oTypeQuery = {},
            oSellingTypeQuery = {},
            oSortingOrder = {};
        let oTtextQuery = {
            "sName": new RegExp(req.body.sTextsearch, 'i')
        }
        if (req.body.eType[0] != 'All' && req.body.eType[0] != "") {
            oTypeQuery = {
                "$or": []
            };
            req.body.eType.forEach((element) => {
                oTypeQuery["$or"].push({
                    "eType": element
                });
            });
        }

        if (req.body.sSortingType == "Recently Added") {
            oSortingOrder["sCreated"] = -1;
        } else if (req.body.sSortingType == "Most Viewed") {
            oSortingOrder["nView"] = -1;
        } else if (req.body.sSortingType == "Price Low to High") {
            oSortingOrder["nBasePrice"] = 1;
        } else if (req.body.sSortingType == "Price High to Low") {
            oSortingOrder["nBasePrice"] = -1;
        } else {
            oSortingOrder["_id"] = -1;
        }

        if (req.body.sSellingType != "") {
            oSellingTypeQuery = {
                "$or": [{
                    "eAuctionType": req.body.sSellingType
                }]
            }
        }

        let data = await NFT.aggregate([{
            '$match': {
                '$and': [{
                    sTransactionStatus: {
                        $eq: 1
                    }
                },
                {
                    eAuctionType: {
                        $ne: "Unlockable"
                    }
                },
                    oTypeQuery, oTtextQuery, oSellingTypeQuery
                ]
            }
        }, {
            '$sort': oSortingOrder
        }, {
            '$project': {
                '_id': 1,
                'sName': 1,
                'eType': 1,
                'nBasePrice': 1,
                'sHash': 1,
                'oCurrentOwner': 1,
                'eAuctionType': 1,
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oCurrentOwner',
                'foreignField': '_id',
                'as': 'oUser'
            }
        }, { $unwind: '$oUser' }, {
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
        let iFiltered = data[0].nfts.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.success('Data'), {
                data: 0,
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": iFiltered,
            });
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
};
controllers.nftID = async (req, res) => {
    try {
        if (!req.params.nNFTId)
            return res.reply(messages.not_found("NFT ID"));

        if (!validators.isValidObjectID(req.params.nNFTId)) res.reply(messages.invalid("NFT ID"));

        let aNFT = await NFT.findById(req.params.nNFTId).populate('oPostedBy oCurrentOwner');

        if (!aNFT) return res.reply(messages.not_found("NFT"));
        aNFT = aNFT.toObject();
        aNFT.sCollectionDetail = {};

        aNFT.sCollectionDetail = await Collection.findOne({ sName: aNFT.sCollection && aNFT.sCollection != undefined ? aNFT.sCollection : '-' })

        var token = req.headers.authorization;
        if (token) {
            token = token.replace('Bearer ', '');
            jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                if (decoded)
                    req.userId = decoded.id;
            })

            if (aNFT.oCurrentOwner._id != req.userId)

                await NFT.findByIdAndUpdate(req.params.nNFTId, {
                    $inc: {
                        nView: 1
                    }
                });
        }
        console.log('---------------------------8')

        if (!aNFT) {
            console.log('---------------------------9')

            return res.reply(messages.not_found("NFT"));
        }
        console.log('---------------------------10')

        return res.reply(messages.success(), aNFT);
    } catch (error) {
        return res.reply(messages.server_error());
    }
};
controllers.deleteNFT = async (req, res) => {
    try {
        if (!req.params.nNFTId)
            return res.reply(messages.not_found("NFT ID"));

        if (!validators.isValidObjectID(req.params.nNFTId)) res.reply(messages.invalid("NFT ID"));

        await NFT.findByIdAndDelete(req.params.nNFTId);
        return res.reply(messages.success("NFT deleted"));
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.setTransactionHash = async (req, res) => {
    try {
        // if (!req.body.nTokenID) return res.reply(messages.not_found("Token ID"));
        if (!req.body.nNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.sTransactionHash) return res.reply(messages.not_found("Transaction Hash"));

        if (!validators.isValidObjectID(req.body.nNFTId)) res.reply(messages.invalid("NFT ID"));
        // if (req.body.nTokenID <= 0) res.reply(messages.invalid("Token ID"));
        if (!validators.isValidTransactionHash(req.body.sTransactionHash)) res.reply(messages.invalid("Transaction Hash"));

        NFT.findByIdAndUpdate(req.body.nNFTId, {
            // nTokenID: req.body.nTokenID,
            sTransactionHash: req.body.sTransactionHash,
            sTransactionStatus: 0
        }, (err, nft) => {
            if (err) return res.reply(messages.server_error());
            if (!nft) return res.reply(messages.not_found('NFT'));

            return res.reply(messages.updated("NFT Details"));
        });

    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.landing = async (req, res) => {
    try {
        const data = await NFT.aggregate([{
            '$facet': {
                'recentlyAdded': [{
                    '$match': {
                        'sTransactionStatus': {
                            '$eq': 1
                        },
                        'eAuctionType': {
                            '$ne': 'Unlockable'
                        }
                    }
                }, {
                    '$sort': {
                        '_id': -1
                    }
                }, {
                    '$limit': 10
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'oCurrentOwner',
                        'foreignField': '_id',
                        'as': 'aCurrentOwner'
                    }
                }, { $unwind: '$aCurrentOwner' }],
                'onSale': [{
                    '$match': {
                        'sTransactionStatus': {
                            '$eq': 1
                        },
                        'eAuctionType': {
                            '$eq': 'Fixed Sale'
                        }
                    }
                }, {
                    '$sort': {
                        '_id': -1
                    }
                }, {
                    '$limit': 10
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'oCurrentOwner',
                        'foreignField': '_id',
                        'as': 'aCurrentOwner'
                    }
                }, { $unwind: '$aCurrentOwner' }],
                'onAuction': [{
                    '$match': {
                        'sTransactionStatus': {
                            '$eq': 1
                        },
                        'eAuctionType': {
                            '$eq': 'Auction'
                        }
                    }
                }, {
                    '$sort': {
                        '_id': -1
                    }
                }, {
                    '$limit': 10
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'oCurrentOwner',
                        'foreignField': '_id',
                        'as': 'aCurrentOwner'
                    }
                }, { $unwind: '$aCurrentOwner' }]
            }
        }]);
        data[0].users = [];
        data[0].users = await User.find({ "sRole": "user" });


        let agQuery = [{
            '$lookup': {
                'from': 'users',
                'localField': 'oCreatedBy',
                'foreignField': '_id',
                'as': 'oUser'
            }
        }, {
            '$sort': {
                'sCreated': -1
            }
        }, { $unwind: '$oUser' }]

        data[0].collections = [];
        data[0].collections = await Collection.aggregate(agQuery);
        return res.reply(messages.success(), data[0]);
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.toggleSellingType = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        if (!req.body.nNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.sSellingType) return res.reply(messages.not_found("Selling Type"));

        if (!validators.isValidObjectID(req.body.nNFTId)) return res.reply(messages.invalid("NFT ID"));
        if (!validators.isValidSellingType(req.body.sSellingType)) return res.reply(messages.invalid("Selling Type"));

        let oNFT = await NFT.findById(req.body.nNFTId);

        if (!oNFT) return res.reply(messages.not_found("NFT"));
        if (oNFT.oCurrentOwner != req.userId) return res.reply(message.bad_request("Only NFT Owner Can Set Selling Type"));

        let BIdsExist = await Bid.find({ oNFTId: mongoose.Types.ObjectId(req.body.nNFTId), "sTransactionStatus": 1, "eBidStatus": "Bid" });

        if (BIdsExist && BIdsExist != undefined && BIdsExist.length) {
            return res.reply(messages.bad_request("Please Cancel Active bids on this NFT."));
        } else {

            NFT.findByIdAndUpdate(req.body.nNFTId, {
                eAuctionType: req.body.sSellingType
            }, (err, nft) => {
                if (err) return res.reply(messages.server_error());
                if (!nft) return res.reply(messages.not_found('NFT'));

                return res.reply(messages.updated("NFT Details"));
            });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}


controllers.allCollectionWiselist = async (req, res) => {

    console.log('------data--------', req.body)
    //    let agQuery = [ {
    //         '$lookup': {
    //             'from': 'users',
    //             'localField': 'oCreatedBy',
    //             'foreignField': '_id',
    //             'as': 'oUser'
    //         }
    //     }, {
    //         '$sort': {
    //             'sCreated': -1
    //         }
    //     }]

    try {

        //         let aCollections = await Collection.aggregate(agQuery);

        //         if (!aCollections) {
        //             return res.reply(messages.not_found('collection'));
        //         }

        //         return res.reply(messages.no_prefix('Collection Details'), aCollections);

        //     } catch (error) {
        //         return res.reply(messages.server_error());
        //     }




        var nLimit = parseInt(req.body.length);
        var nOffset = parseInt(req.body.start);
        let oTypeQuery = {},
            oSellingTypeQuery = {},
            oCollectionQuery = {},
            oSortingOrder = {};
        let oTtextQuery = {
            "sName": new RegExp(req.body.sTextsearch, 'i')
        }
        if (req.body.eType[0] != 'All' && req.body.eType[0] != "") {
            oTypeQuery = {
                "$or": []
            };
            req.body.eType.forEach((element) => {
                oTypeQuery["$or"].push({
                    "eType": element
                });
            });
        }
        if (req.body.sCollection != 'All' && req.body.sCollection != "") {
            oCollectionQuery = {
                "$or": []
            };
            oCollectionQuery["$or"].push({
                "sCollection": req.body.sCollection
            });

        }

        if (req.body.sSortingType == "Recently Added") {
            oSortingOrder["sCreated"] = -1;
        } else if (req.body.sSortingType == "Most Viewed") {
            oSortingOrder["nView"] = -1;
        } else if (req.body.sSortingType == "Price Low to High") {
            oSortingOrder["nBasePrice"] = 1;
        } else if (req.body.sSortingType == "Price High to Low") {
            oSortingOrder["nBasePrice"] = -1;
        } else {
            oSortingOrder["_id"] = -1;
        }

        if (req.body.sSellingType != "") {
            oSellingTypeQuery = {
                "$or": [{
                    "eAuctionType": req.body.sSellingType
                }]
            }
        }

        let data = await NFT.aggregate([{
            '$match': {
                '$and': [{
                    sTransactionStatus: {
                        $eq: 1
                    }
                },
                {
                    eAuctionType: {
                        $ne: "Unlockable"
                    }
                },
                    oTypeQuery, oCollectionQuery, oTtextQuery, oSellingTypeQuery
                ]
            }
        }, {
            '$sort': oSortingOrder
        }, {
            '$project': {
                '_id': 1,
                'sName': 1,
                'eType': 1,
                'nBasePrice': 1,
                'sHash': 1,
                'oCurrentOwner': 1,
                'eAuctionType': 1,
                sCollection: 1,
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oCurrentOwner',
                'foreignField': '_id',
                'as': 'oUser'
            }
        }, { $unwind: '$oUser' }, {
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
        let iFiltered = data[0].nfts.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.success('Data'), {
                data: 0,
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": iFiltered,
            });
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


controllers.updateBasePrice = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        console.log(req.body);
        if (!req.body.nNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.nBasePrice) return res.reply(messages.not_found("Base Price"));

        if (!validators.isValidObjectID(req.body.nNFTId)) return res.reply(messages.invalid("NFT ID"));
        if (isNaN(req.body.nBasePrice) || parseFloat(req.body.nBasePrice) <= 0 || parseFloat(req.body.nBasePrice) <= 0.000001) return res.reply(messages.invalid("Base Price"));

        let oNFT = await NFT.findById(req.body.nNFTId);

        if (!oNFT) return res.reply(messages.not_found("NFT"));
        if (oNFT.oCurrentOwner != req.userId) return res.reply(message.bad_request("Only NFT Owner Can Set Base Price"));

        let BIdsExist = await Bid.find({ oNFTId: mongoose.Types.ObjectId(req.body.nNFTId), "sTransactionStatus": 1, "eBidStatus": "Bid" });

        if (BIdsExist && BIdsExist != undefined && BIdsExist.length) {
            return res.reply(messages.bad_request("Please Cancel Active bids on this NFT."));
        } else {

            NFT.findByIdAndUpdate(req.body.nNFTId, {
                nBasePrice: req.body.nBasePrice
            }, (err, nft) => {
                if (err) return res.reply(messages.server_error());
                if (!nft) return res.reply(messages.not_found('NFT'));

                return res.reply(messages.updated("Price"));
            });
        }
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
}

module.exports = controllers;