const Web3 = require("web3");
const mongoose = require('mongoose');
const config = require("dotenv").config();
const {
    NFT,
    Bid
} = require("./app/models");

// TODO: Change the URL to MainNet URL
var web3 = new Web3(process.env.NETWORK_RPC_URL);

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
};
mongoose
    .connect(process.env.DB_URL, options)
    .then(() => console.log('Database connected'))
    .catch((error) => {
        throw error;
    });

// let receipt = web3.eth.getTransactionReceipt().then((receipt) => {
//     console.log(receipt);
//     let oTokenCounterEvent = web3.eth.abi.decodeLog([{
//         type: 'uint256',
//         name: 'tokenID'
//     }], (receipt.logs[2] === undefined) ? receipt.logs[1].data : receipt.logs[2].data);
//     console.log(oTokenCounterEvent);
// });

async function mintChecker() {
    console.log("11 Mints...");

    try {
        console.log("Checking for pending Mints...");
        let aNFTs = await NFT.find({
            sTransactionStatus: 0
        });
        for (let index = 0; index < aNFTs.length; index++) {
            try {
                let receipt = await web3.eth.getTransactionReceipt(aNFTs[index].sTransactionHash);
                if (receipt === null)
                    return;
                if (receipt.status === true) {
                    let oTokenCounterEvent = web3.eth.abi.decodeLog([{
                        type: 'uint256',
                        name: 'tokenID'
                    }], (receipt.logs[2] === undefined) ? receipt.logs[1].data : receipt.logs[2].data); // log[1] for ERC1155 and log[2] for ERC721
                    await NFT.findByIdAndUpdate(aNFTs[index]._id, {
                        nTokenID: oTokenCounterEvent.tokenID,
                        sTransactionStatus: 1
                    });
                } else if (receipt.status === false) {
                    await NFT.findByIdAndUpdate(aNFTs[index]._id, {
                        sTransactionStatus: -1
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}
async function bidsChecker() {
    try {
        console.log("Checking for pending Bids...");
        let aBids = await Bid.find({
            sTransactionStatus: 0
        });
        for (let index = 0; index < aBids.length; index++) {
            try {
                web3.eth.getTransactionReceipt(aBids[index].sTransactionHash).then(async (receipt) => {
                    if (receipt === null)
                        return;
                    if (receipt.status === true) {
                        // If Transaction is successfully mined, toggle the status
                        await Bid.findByIdAndUpdate(aBids[index]._id, {
                            sTransactionStatus: 1
                        }, (err, bid) => {
                            if (err) console.log(err);
                            if (!bid) console.log("No Bid Found");
                        });
                    } else if (receipt.status === false) {
                        // If Transaction is failed, revert the transfer process

                        // If It Was a Transfer transaction
                        if (aBids[index].eBidStatus === "Transfer") {
                            // See if bidder has the same NFT
                            let nftOfBidder = await NFT.findOne({
                                nTokenID: aBids[index].nTokenID,
                                oCurrentOwner: aBids[index].oBidder
                            });
                            // Get the NFT of the recipient
                            let nftOfRecipient = await NFT.findOne({
                                nTokenID: aBids[index].nTokenID,
                                oCurrentOwner: aBids[index].oRecipient
                            });

                            // If bidder has the Same NFT
                            if (nftOfBidder) {
                                // Increase the quantity
                                await NFT.findByIdAndUpdate(nftOfBidder._id, {
                                    nQuantity: nftOfBidder.nQuantity + aBids[index].nQuantity
                                }, (err, nft) => {
                                    if (err) console.log(err);
                                    if (!nft) console.log("No NFT Found");
                                });
                                // If the recipient only has the transferred amount of NFT
                                if (nftOfRecipient.nQuantity === aBids[index].nQuantity) {
                                    // Delete the NFT document
                                    await NFT.findByIdAndDelete(nftOfRecipient._id, (err, nft) => {
                                        if (err) console.log(err);
                                        if (!nft) console.log("No NFT Found");
                                    })
                                } else {
                                    // Decrease the quantity
                                    await NFT.findByIdAndUpdate(nftOfRecipient._id, {
                                        nQuantity: nftOfRecipient.nQuantity - aBids[index].nQuantity
                                    }, (err, nft) => {
                                        if (err) console.log(err);
                                        if (!nft) console.log("No NFT Found");
                                    });
                                }

                            } else {
                                if (nftOfRecipient.nQuantity === aBids[index].nQuantity) {
                                    await NFT.findByIdAndUpdate(nftOfRecipient._id, {
                                        oCurrentOwner: aBids[index].oBidder
                                    }, (err, nft) => {
                                        if (err) console.log(err);
                                        if (!nft) console.log("No NFT Found");
                                    });
                                } else {
                                    let newNFT = new NFT({
                                        sHash: nftOfRecipient.sHash,
                                        eType: nftOfRecipient.eType,
                                        sCreated: nftOfRecipient.sCreated,
                                        oPostedBy: nftOfRecipient.oPostedBy,
                                        sCollection: nftOfRecipient.sCollection,
                                        sName: nftOfRecipient.sName,
                                        sCollaborator: nftOfRecipient.sCollaborator,
                                        sNftdescription: nftOfRecipient.sNftdescription,
                                        nCollaboratorPercentage: nftOfRecipient.nCollaboratorPercentage,
                                        sSetRoyaltyPercentage: nftOfRecipient.sSetRoyaltyPercentage,
                                        nBasePrice: nftOfRecipient.nBasePrice,
                                        eAuctionType: nftOfRecipient.eAuctionType,
                                        nTokenID: nftOfRecipient.nTokenID,
                                        sTransactionHash: nftOfRecipient.sTransactionHash,
                                        sTransactionStatus: nftOfRecipient.sTransactionStatus,
                                        nQuantity: req.body.nQuantity,
                                        oCurrentOwner: aBids[index].oBidder
                                    });
                                    await newNFT.save().then(async () => {
                                        await NFT.findByIdAndUpdate(nftOfRecipient._id, {
                                            nQuantity: nftOfRecipient.nQuantity - aBids[index].nQuantity
                                        }).catch((error) => {
                                            throw error;
                                        });
                                    }).catch((error) => {
                                        console.log(error);
                                        throw error;
                                        // if (error) return res.reply(messages.server_error());
                                    });
                                }
                            }
                        } else if (aBids[index].eBidStatus === "Sold" || aBids[index].eBidStatus === "Accepted") {
                            // Get NFT of the Bidder
                            let nftOfBidder = await NFT.findOne({
                                nTokenID: aBids[index].nTokenID,
                                oCurrentOwner: aBids[index].oBidder
                            });
                            // See if the recipient has the same NFT
                            let nftOfRecipient = await NFT.findOne({
                                nTokenID: aBids[index].nTokenID,
                                oCurrentOwner: aBids[index].oRecipient
                            });

                            // If recipient has the Same NFT
                            if (nftOfRecipient) {
                                // Increase the quantity
                                await NFT.findByIdAndUpdate(nftOfRecipient._id, {
                                    nQuantity: nftOfRecipient.nQuantity + aBids[index].nQuantity
                                }, (err, nft) => {
                                    if (err) console.log(err);
                                    if (!nft) console.log("No NFT Found");
                                });
                                // If the bidder only has the transferred amount of NFT
                                if (nftOfBidder.nQuantity === aBids[index].nQuantity) {
                                    // Delete the NFT document
                                    await NFT.findByIdAndDelete(nftOfBidder._id, (err, nft) => {
                                        if (err) console.log(err);
                                        if (!nft) console.log("No NFT Found");
                                    });
                                } else {
                                    // Decrease the quantity
                                    await NFT.findByIdAndUpdate(nftOfBidder._id, {
                                        nQuantity: +nftOfBidder.nQuantity - +aBids[index].nQuantity
                                    }, (err, nft) => {
                                        if (err) console.log(err);
                                        if (!nft) console.log("No NFT Found");
                                    });
                                }
                            } else {
                                if (nftOfBidder.nQuantity === aBids[index].nQuantity) {
                                    await NFT.findByIdAndUpdate(nftOfBidder._id, {
                                        oCurrentOwner: aBids[index].oRecipient
                                    }, (err, nft) => {
                                        if (err) console.log(err);
                                        if (!nft) console.log("No NFT Found");
                                    });
                                } else {
                                    let newNFT = new NFT({
                                        sHash: nftOfBidder.sHash,
                                        eType: nftOfBidder.eType,
                                        sCreated: nftOfBidder.sCreated,
                                        oPostedBy: nftOfBidder.oPostedBy,
                                        sCollection: nftOfBidder.sCollection,
                                        sName: nftOfBidder.sName,
                                        sCollaborator: nftOfBidder.sCollaborator,
                                        sNftdescription: nftOfBidder.sNftdescription,
                                        nCollaboratorPercentage: nftOfBidder.nCollaboratorPercentage,
                                        sSetRoyaltyPercentage: nftOfBidder.sSetRoyaltyPercentage,
                                        nBasePrice: nftOfBidder.nBasePrice,
                                        eAuctionType: nftOfBidder.eAuctionType,
                                        nTokenID: nftOfBidder.nTokenID,
                                        sTransactionHash: nftOfBidder.sTransactionHash,
                                        sTransactionStatus: nftOfBidder.sTransactionStatus,
                                        nQuantity: req.body.nQuantity,
                                        oCurrentOwner: aBids[index].oRecipient
                                    });
                                    await newNFT.save().then(async () => {
                                        await NFT.findByIdAndUpdate(nftOfBidder._id, {
                                            nQuantity: nftOfBidder.nQuantity - aBids[index].nQuantity
                                        }).catch((error) => {
                                            throw error;
                                        });
                                    }).catch((error) => {
                                        console.log(error);
                                        throw error;
                                        // if (error) return res.reply(messages.server_error());
                                    });
                                }
                            }
                        }
                        // Set the Transaction Status as Failed
                        await Bid.findByIdAndUpdate(aBids[index]._id, {
                            sTransactionStatus: -1
                        }, (err, bid) => {
                            if (err) console.log(err);
                            if (!bid) console.log("No Bid Found");
                        });
                    }
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}
// setInterval(() => {
//     mintChecker();
//     bidsChecker();
// }, 5000);