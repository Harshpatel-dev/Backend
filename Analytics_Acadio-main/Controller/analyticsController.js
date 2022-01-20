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

exports.dataByUid = async (req, res) => {
  try {
    const uid = req.body.uid * 1;
    // const month = req.body.month + "/2022";
    const screen = "$" + req.body.screenName;

    const screenName = req.body.screenName;

    const matchScreen = req.body.screenName + ".month";

    const month = req.body.month;

    let data;

    if (screenName.toUpperCase() !== "ALL") {
      data = await Analytics.aggregate([
        {
          $match: { uid: uid },
        },
        {
          $unwind: screen,
        },
        {
          $match: {
            [matchScreen]: month,
          },
        },
        {
          $project: {
            _id: 0,
            [screenName]: { month: 1, monthViews: 1, week: 1, day: 1 },
          },
        },
      ]);
    } else {
      data = await Analytics.aggregate([
        {
          $match: { uid: uid },
        },
        {
          $project: {
            _id: 0,
            pools: {
              $filter: {
                input: "$poolsMain",
                as: "item",
                cond: { $eq: ["$$item.month", month] },
              },
            },
            challenge: {
              $filter: {
                input: "$challegeMain",
                as: "item",
                cond: { $eq: ["$$item.month", month] },
              },
            },
            levels: {
              $filter: {
                input: "$levels",
                as: "item",
                cond: { $eq: ["$$item.month", month] },
              },
            },
            profile: {
              $filter: {
                input: "$profile",
                as: "item",
                cond: { $eq: ["$$item.month", month] },
              },
            },
          },
        },
      ]);
    }

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "Failed",
      data: err,
    });
  }
};

exports.getByField = async (req, res) => {
  try {
    const month = req.body.month;
    const week = req.body?.week;
    const day = req.body?.day;
    const SLICE_NUMBER = 20;

    let result;
    if (week === undefined && day === undefined) {
      result = await getByMonth(month);
    } else if (day === undefined) {
      console.log("week");
      result = await getByWeek(month, week);
    } else if (week === undefined) {
      console.log("day");
      result = await getByDay(month, day);
    }

    res.status(200).json({
      status: "Success",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "Failed",
      data: err,
    });
  }
};

const getByMonth = async (month) => {
  const result = await Analytics.aggregate([
    {
      $project: {
        _id: 0,
        uid: 1,
        pools: {
          $filter: {
            input: "$poolsMain",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        challenge: {
          $filter: {
            input: "$challegeMain",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        levels: {
          $filter: {
            input: "$levels",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        profile: {
          $filter: {
            input: "$profile",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        profile: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: ["$profile.monthViews", 0] }, 0] },
              {
                uid: "$uid",
                monthViews: { $arrayElemAt: ["$profile.monthViews", 0] },
              },
              null,
            ],
          },
        },
        pools: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: ["$pools.monthViews", 0] }, 0] },
              {
                uid: "$uid",
                monthViews: { $arrayElemAt: ["$pools.monthViews", 0] },
              },
              null,
            ],
          },
        },
        challenge: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: ["$challenge.monthViews", 0] }, 0] },
              {
                uid: "$uid",
                monthViews: { $arrayElemAt: ["$challenge.monthViews", 0] },
              },
              null,
            ],
          },
        },
        levels: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: ["$levels.monthViews", 0] }, 0] },
              {
                uid: "$uid",
                monthViews: { $arrayElemAt: ["$levels.monthViews", 0] },
              },
              null,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        month: month,
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        profile: { $setDifference: ["$profile", [null]] },
        challenge: { $setDifference: ["$challenge", [null]] },
        levels: { $setDifference: ["$levels", [null]] },
        pools: { $setDifference: ["$pools", [null]] },
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "profile.monthViews": -1,
      },
    },
    {
      $group: {
        _id: "$month",
        profile: { $push: "$profile" },
        challenge: { $first: "$challenge" },
        levels: { $first: "$levels" },
        pools: { $first: "$pools" },
      },
    },
    {
      $unwind: {
        path: "$pools",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "pools.monthViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        pools: { $push: "$pools" },
        challenge: { $first: "$challenge" },
        levels: { $first: "$levels" },
        profile: { $first: "$profile" },
      },
    },
    {
      $unwind: {
        path: "$challenge",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "challenge.monthViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        challenge: { $push: "$challenge" },
        pools: { $first: "$pools" },
        levels: { $first: "$levels" },
        profile: { $first: "$profile" },
      },
    },
    {
      $unwind: {
        path: "$levels",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "levels.monthViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        levels: { $push: "$levels" },
        pools: { $first: "$pools" },
        challenge: { $first: "$challenge" },
        profile: { $first: "$profile" },
      },
    },
    {
      $project: {
        pools: { $slice: ["$pools", 10] },
        challenge: { $slice: ["$challenge", 10] },
        levels: { $slice: ["$levels", 10] },
        profile: { $slice: ["$profile", 10] },
      },
    },
  ]);
  return result;
};

const getByWeek = async (month, week) => {
  const result = await Analytics.aggregate([
    {
      $project: {
        _id: 0,
        uid: 1,
        pools: {
          $filter: {
            input: "$poolsMain",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        challenge: {
          $filter: {
            input: "$challegeMain",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        levels: {
          $filter: {
            input: "$levels",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        profile: {
          $filter: {
            input: "$profile",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        profile: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$profile.week.${week}`, 0] }, 0] },
              {
                uid: "$uid",
                weekViews: { $arrayElemAt: [`$profile.week.${week}`, 0] },
              },
              null,
            ],
          },
        },
        pools: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$pools.week.${week}`, 0] }, 0] },
              {
                uid: "$uid",
                weekViews: { $arrayElemAt: [`$pools.week.${week}`, 0] },
              },
              null,
            ],
          },
        },
        challenge: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$challenge.week.${week}`, 0] }, 0] },
              {
                uid: "$uid",
                weekViews: { $arrayElemAt: [`$challenge.week.${week}`, 0] },
              },
              null,
            ],
          },
        },
        levels: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$levels.week.${week}`, 0] }, 0] },
              {
                uid: "$uid",
                weekViews: { $arrayElemAt: [`$levels.week.${week}`, 0] },
              },
              null,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        month: month,
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        profile: { $setDifference: ["$profile", [null]] },
        challenge: { $setDifference: ["$challenge", [null]] },
        levels: { $setDifference: ["$levels", [null]] },
        pools: { $setDifference: ["$pools", [null]] },
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "profile.weekViews": -1,
      },
    },
    {
      $group: {
        _id: "$month",
        profile: { $push: "$profile" },
        challenge: { $first: "$challenge" },
        levels: { $first: "$levels" },
        pools: { $first: "$pools" },
      },
    },
    {
      $unwind: {
        path: "$pools",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "pools.weekViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        pools: { $push: "$pools" },
        challenge: { $first: "$challenge" },
        levels: { $first: "$levels" },
        profile: { $first: "$profile" },
      },
    },
    {
      $unwind: {
        path: "$challenge",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "challenge.weekViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        challenge: { $push: "$challenge" },
        pools: { $first: "$pools" },
        levels: { $first: "$levels" },
        profile: { $first: "$profile" },
      },
    },
    {
      $unwind: {
        path: "$levels",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "levels.weekViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        levels: { $push: "$levels" },
        pools: { $first: "$pools" },
        challenge: { $first: "$challenge" },
        profile: { $first: "$profile" },
      },
    },
    {
      $project: {
        pools: { $slice: ["$pools", 10] },
        challenge: { $slice: ["$challenge", 10] },
        levels: { $slice: ["$levels", 10] },
        profile: { $slice: ["$profile", 10] },
      },
    },
  ]);

  return result;
};

const getByDay = async (month, day) => {
  const result = await Analytics.aggregate([
    {
      $project: {
        _id: 0,
        uid: 1,
        pools: {
          $filter: {
            input: "$poolsMain",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        challenge: {
          $filter: {
            input: "$challegeMain",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        levels: {
          $filter: {
            input: "$levels",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
        profile: {
          $filter: {
            input: "$profile",
            as: "item",
            cond: { $eq: ["$$item.month", month] },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        profile: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$profile.day.${day}`, 0] }, 0] },
              {
                uid: "$uid",
                dayViews: { $arrayElemAt: [`$profile.day.${day}`, 0] },
              },
              null,
            ],
          },
        },
        pools: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$pools.day.${day}`, 0] }, 0] },
              {
                uid: "$uid",
                dayViews: { $arrayElemAt: [`$pools.day.${day}`, 0] },
              },
              null,
            ],
          },
        },
        challenge: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$challenge.day.${day}`, 0] }, 0] },
              {
                uid: "$uid",
                dayViews: { $arrayElemAt: [`$challenge.day.${day}`, 0] },
              },
              null,
            ],
          },
        },
        levels: {
          $push: {
            $cond: [
              { $gt: [{ $arrayElemAt: [`$levels.day.${day}`, 0] }, 0] },
              {
                uid: "$uid",
                dayViews: { $arrayElemAt: [`$levels.day.${day}`, 0] },
              },
              null,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        month: month,
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        profile: { $setDifference: ["$profile", [null]] },
        challenge: { $setDifference: ["$challenge", [null]] },
        levels: { $setDifference: ["$levels", [null]] },
        pools: { $setDifference: ["$pools", [null]] },
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "profile.dayViews": -1,
      },
    },
    {
      $group: {
        _id: "$month",
        profile: { $push: "$profile" },
        challenge: { $first: "$challenge" },
        levels: { $first: "$levels" },
        pools: { $first: "$pools" },
      },
    },
    {
      $unwind: {
        path: "$pools",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "pools.dayViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        pools: { $push: "$pools" },
        challenge: { $first: "$challenge" },
        levels: { $first: "$levels" },
        profile: { $first: "$profile" },
      },
    },
    {
      $unwind: {
        path: "$challenge",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "challenge.dayViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        challenge: { $push: "$challenge" },
        pools: { $first: "$pools" },
        levels: { $first: "$levels" },
        profile: { $first: "$profile" },
      },
    },
    {
      $unwind: {
        path: "$levels",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "levels.dayViews": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        levels: { $push: "$levels" },
        pools: { $first: "$pools" },
        challenge: { $first: "$challenge" },
        profile: { $first: "$profile" },
      },
    },
    {
      $project: {
        pools: { $slice: ["$pools", 10] },
        challenge: { $slice: ["$challenge", 10] },
        levels: { $slice: ["$levels", 10] },
        profile: { $slice: ["$profile", 10] },
      },
    },
  ]);

  return result;
};
