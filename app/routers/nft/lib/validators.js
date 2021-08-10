const validators = {};

validators.isValidObjectID = function (sObjectID) {
    return sObjectID.length == 24;
}

validators.isValidString = function (sString) {
    return sString.trim().length > 0 && sString.trim().length <= 100;
}

validators.isValidTransactionHash = (sTransactionHash) => {
    const reTransactionHash = /^(0x)?([A-Fa-f0-9]{64})$/;
    return reTransactionHash.test(sTransactionHash);
}

validators.isValidSellingType = (sSellingType) => {
    const aSellingTypes = ['Auction', 'Fixed Sale', 'Unlockable'];
    return aSellingTypes.includes(sSellingType);
}

module.exports = validators;