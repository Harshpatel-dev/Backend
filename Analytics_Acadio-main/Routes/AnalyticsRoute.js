const express = require("express");
const AnalyticsController = require("../Controller/analyticsController");

const route = express.Router();

route.post("/storeView", AnalyticsController.storeView);

route.post("/getData", AnalyticsController.dataByUid);

module.exports = route;
