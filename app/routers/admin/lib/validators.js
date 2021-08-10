const validators = {};

validators.isValidObjectID = function (sObjectID) {
    return sObjectID.length == 24;
}

validators.isValidUserStatus = function (sUserStatus) {
    const aUserStatuses = ["active", "blocked", "deactivated"];
    return aUserStatuses.includes(sUserStatus);
}

validators.isValidCategoryStatus = function (sUserStatus) {
    const aCategoryStatuses = ["Active", "Deactivated"];
    return aCategoryStatuses.includes(sUserStatus);
}

validators.isValidName = function (sName) {
    const reName = /^[a-zA-Z](( )?[a-zA-Z]+)*$/;
    return reName.test(sName);
}

module.exports = validators;