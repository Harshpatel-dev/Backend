const express = require("express");
const AnalyticsController = require("../Controller/analyticsController");

const route = express.Router();

route.post("/storeView", AnalyticsController.storeView);

module.exports = route;
