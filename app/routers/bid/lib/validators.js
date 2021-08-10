const Web3 = require('web3');
let _web3 = new Web3();

const validators = {};

validators.isValidObjectID = function (sObjectID) {
    return sObjectID.length == 24;
}

validators.isValidWalletAddress = function (sWalletAddress) {
    return _web3.utils.isAddress(sWalletAddress);
}

validators.isValidTransactionHash = function (sTransactionHash) {
    return /^0x([A-Fa-f0-9]{64})$/.test(sTransactionHash);
}

module.exports = validators;