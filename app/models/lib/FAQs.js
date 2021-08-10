const mongoose = require("mongoose");

const FAQsSchema = mongoose.Schema(
    {
        oFAQs_data: {
            sQuestion: String,
            sAnswer: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("FAQs", FAQsSchema);
