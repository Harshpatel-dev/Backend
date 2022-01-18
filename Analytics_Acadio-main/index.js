const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const AnalyticsRoute = require("./Routes/AnalyticsRoute");

const app = express();

dotenv.config({
  path: "./config.env",
});

const port = process.env.PORT;

const db = process.env.CONNECTION_URL.replace(
  "<password>",
  process.env.PASSWORD
);

mongoose.connect(db, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log("unable to connect to the database");
  }
  console.log("successfully connected");
});

app.use(express.json());

app.use(AnalyticsRoute);

app.get("/", (req, res) => {
  res.send("heyy analytics");
});

app.listen(port, () => {
  console.log("your server is running at ", port);
});
