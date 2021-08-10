const mongoose = require('mongoose');

const collectionSchema = mongoose.Schema({
    sHash: {
        type: String,
        unique: true,
        require: true
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    oCreatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    sName: String,
    sDescription: String,
});

module.exports = mongoose.model('Collection', collectionSchema);