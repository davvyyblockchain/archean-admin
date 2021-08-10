const mongoose = require("mongoose");

const TermsSchema = mongoose.Schema(
  {
    sTerms_data: {type: String, required: true},
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Terms", TermsSchema);
