const mongoose = require("mongoose");

const AboutusSchema = mongoose.Schema(
  {
    sAboutus_data: { type: String, required: true },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("aboutus", AboutusSchema);
