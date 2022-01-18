const mongoose = require("mongoose");

const analyticsModel = mongoose.Schema({
  uid: {
    type: Number,
    required: true,
    unique: true,
    dropDups: true,
  },
  poolsMain: [
    {
      month: { type: String },
      monthViews: { type: Number },
      week: { type: mongoose.Schema.Types.Mixed },
      day: { type: mongoose.Schema.Types.Mixed },
    },
  ],
  challegeMain: [
    {
      month: { type: String },
      monthViews: { type: Number },
      week: { type: mongoose.Schema.Types.Mixed },
      day: { type: mongoose.Schema.Types.Mixed },
    },
  ],
  levels: [
    {
      month: { type: String },
      monthViews: { type: Number },
      week: { type: mongoose.Schema.Types.Mixed },
      day: { type: mongoose.Schema.Types.Mixed },
    },
  ],
  profile: [
    {
      month: { type: String },
      monthViews: { type: Number },
      week: { type: mongoose.Schema.Types.Mixed },
      day: { type: mongoose.Schema.Types.Mixed },
    },
  ],
});

module.exports = mongoose.model("Analytics", analyticsModel);
