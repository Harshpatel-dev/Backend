const mongoose = require("mongoose");

const Analytics = require("../Models/AnalyticsModel");

exports.createOne = async (req, res) => {
  try {
    // To convert data into Number bcz all coming data is in the form od string.
    const uid = req.body.uid * 1;
    const NewUser = await Analytics.create({ uid: uid });

    // var objectId = mongoose.Types.ObjectId("1");
    // console.log("objectId : ", objectId);

    res.status(200).json({
      status: "sucess",
      data: NewUser,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "Failed",
      data: err,
    });
  }
};

exports.storeView = async (req, res) => {
  try {
    const uid = req.body.uid * 1;
    const result = await Analytics.find({ uid: uid });

    let screenName = req.body.screen;
    const date = new Date();
    const dayOfMonth = date.getDate();
    const day = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const week = Math.ceil(dayOfMonth / 7);
    console.log("HERE : " + (month + 1) + "  " + year + "  " + week);

    if (result.length == 0) {
      console.log("NEW ENTRY");
      let weekData = {},
        dayData = {};
      weekData[week] = 1;
      dayData[day] = 1;

      var data = [];
      let m = month + 1 + "/" + year;
      var obj = {
        month: m,
        monthViews: 1,
        week: weekData,
        day: dayData,
      };

      data.push(obj);
      console.log(data);

      let saveObj = {};
      // saveObj["_id"] = mongoose.Types.ObjectId();
      saveObj["uid"] = req.body.uid;
      saveObj[screenName] = data;

      const NewUser = await Analytics.create(saveObj);

      res.status(200).json({
        status: "success",
        data: NewUser,
      });
    } else {
      console.log("USER EXISTS");

      let foundedUser = result[0];
      console.log(foundedUser);
      let found = false;
      let monthData = {};

      if (foundedUser[screenName].length > 0) {
        const length = foundedUser[screenName].length;
        if (foundedUser[screenName][0]["month"] === month + 1 + "/" + year) {
          monthData = foundedUser[screenName][length - 1];
          console.log("MonthData --> ", monthData);

          let txt = screenName + ".$.monthViews";
          let txt2 = screenName + ".month";
          let txtWeek = screenName + ".$.week." + week;
          let txtDay = screenName + ".$.day." + day;
          let obj = {},
            input = {};
          input["uid"] = req.body.uid;
          input[txt2] = month + 1 + "/" + year;

          if (
            monthData["week"][week] === undefined ||
            monthData["week"][week] === null
          ) {
            obj[txtWeek] = 1;
          } else {
            obj[txtWeek] = monthData["week"][week] + 1;
          }

          if (
            monthData["day"][day] === undefined ||
            monthData["day"][day] === null
          ) {
            obj[txtDay] = 1;
          } else {
            obj[txtDay] = monthData["day"][day] + 1;
          }

          obj[txt] = monthData["monthViews"] + 1;

          const updatedUser = await Analytics.updateOne(input, {
            $set: obj,
          });

          res.status(200).json({
            status: "success",
            message: "Month Founded",
            result: updatedUser,
          });

          console.log("Month Founded");
        } else {
          console.log("MONTH NOT FOUND");

          var weekData = {},
            dayData = {};
          weekData[week] = 1;
          dayData[day] = 1;
          // let m = (month+1)+"/"+year;
          let m = month + 1 + "/" + year;
          var obj = {
            month: m,
            monthViews: 1,
            week: weekData,
            day: dayData,
          };

          let temp = { $each: [obj], $position: 0 };
          let inputObj = {};
          inputObj[screenName] = temp;

          const updatedUser = await Analytics.updateOne(
            { uid: req.body.uid },
            { $push: inputObj }
          );

          res.status(200).json({
            status: "success",
            message: "Month Not Founded",
            result: updatedUser,
          });
        }
      } else {
        console.log("Screen doen't have any data");

        var weekData = {},
          dayData = {};
        weekData[week] = 1;
        dayData[day] = 1;
        // console.log(weekData);
        var data = [];
        let m = month + 1 + "/" + year;
        var obj = {
          month: m,
          monthViews: 1,
          week: weekData,
          day: dayData,
        };

        data.push(obj);

        console.log(data);
        let editObj = {};
        editObj[screenName] = data;
        const updatedUser = await Analytics.updateOne(
          {
            uid: req.body.uid,
          },
          { $push: { [screenName]: obj } }
        );

        res.status(200).json({
          status: "success",
          message: "Screen doen't have any data",
          result: updatedUser,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "Failed",
      data: err,
    });
  }
};
