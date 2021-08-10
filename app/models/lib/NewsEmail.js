const mongoose = require('mongoose');

const NewsEmailSchema = mongoose.Schema({
    sName : {
        type: String,
        require: true
    },
    sEmail : {
        type: String,
        unique: true,
        require: true
    }
});

module.exports = mongoose.model('NewsEmail', NewsEmailSchema);
