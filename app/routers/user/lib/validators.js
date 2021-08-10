const Web3 = require('web3');
let _web3 = new Web3();

const validators = {};

validators.isValidObjectID = function (sObjectID) {
    return sObjectID.length == 24;
}

validators.isValidString = function (sString) {
    return sString.trim().length > 0 && sString.trim().length <= 100;
}

validators.isValidName = function (sName) {
    const reName = /^[a-zA-Z](( )?[a-zA-Z]+)*$/;
    return reName.test(sName);
}

validators.isValidWalletAddress = function (sWalletAddress) {
    return _web3.utils.isAddress(sWalletAddress);
}

module.exports = validators;