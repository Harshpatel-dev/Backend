//--------

exports.storeViews = (req, res) => {
  Analytics.find({ uid: req.params.uid })
    .exec()
    .then(async (result) => {
      let screenName = req.params.screen;
      var date = new Date();
      var dayOfMonth = date.getDate();
      var day = date.getDay();
      var month = date.getMonth();
      var year = date.getFullYear();
      var week = Math.ceil(dayOfMonth / 7);
      console.log("HERE : " + (month + 1) + "  " + year + "  " + week);

      if (result.length <= 0) {
        console.log("NEW ENTRY");
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
        let saveObj = {};
        saveObj["_id"] = mongoose.Types.ObjectId();
        saveObj["uid"] = req.params.uid;
        saveObj[screenName] = data;
        const analytics = new Analytics(saveObj);

        // console.log("HERE 2");
        analytics
          .save()
          .then((result) => {
            res.status(200).json({
              message: "DONE",
            });
          })
          .catch((err) => {
            res.status(500).json({
              message: "Error in storing views",
              reason: err._message,
            });
          });
      } else {
        console.log("EXISTS");
        console.log(result[0][screenName] === undefined);
        if (
          result[0][screenName] !== undefined &&
          result[0][screenName].length > 0
        ) {
          console.log(result[0][screenName].length);
          let found = false;
          let monthData = {};
          for (i = 0; i < result[0][screenName].length; i++) {
            if (result[0][screenName][i]["month"] === month + 1 + "/" + year) {
              monthData = result[0][screenName][i];
              console.log("FOUND");
              found = true;
              break;
            }
          }

          console.log("FOUND : " + found);
          if (found === true) {
            // console.log("MONTH FOUND : "+monthData);
            // console.log("WEEK FOUND : "+monthData["week"]["3"]);
            // console.log("DAY FOUND : "+monthData["day"]["6"]);

            let txt = screenName + ".$.monthViews";
            let txt2 = screenName + ".month";
            let txtWeek = screenName + ".$.week." + week;
            let txtDay = screenName + ".$.day." + day;
            let obj = {},
              input = {};
            input["uid"] = req.params.uid;
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
            console.log(obj);

            Analytics.findOneAndUpdate(
              input,
              { $set: obj },
              function (error, success) {
                if (error) {
                  console.log(error);
                } else {
                  res.status(200).json({
                    message: "DONE",
                  });
                  //  res.status(200).json({
                  //     message : "UPDATED"
                  // });
                }
              }
            );
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

            Analytics.findOneAndUpdate(
              { uid: req.params.uid },
              { $push: inputObj },
              function (error, success) {
                if (error) {
                  console.log(error);
                } else {
                  res.status(200).json({
                    message: "DONE",
                  });
                }
              }
            );
          }
        } else {
          console.log("NO");
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
          Analytics.update({ uid: req.params.uid }, { $set: editObj })
            .exec()
            .then((result) => {
              res.status(200).json({
                message: "DONE",
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: "ERROR",
              });
            });
        }
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
