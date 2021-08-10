const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    sName: {
        type: String,
        unique: true
    },
    sStatus: {
        type: String,
        default: 'Active',
        enum: ['Active', 'Deactivated']
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Category', categorySchema);