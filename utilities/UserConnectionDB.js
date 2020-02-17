var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/foodZone", { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
var ObjectID = require("mongodb").ObjectID;

var userDB = require("./../utilities/UserDB.js");
var userConnection = require("../models/UserConnection.js");
var Connections = require("../models/connection.js");
var connDB = require("../utilities/connectionDB.js");
var connectionList = [];

var userConns = [];

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Reading data from userConnectionDB!");
  userConnection.find(async function(err, userConnections) {
    //     if (err) return console.error(err);
    console.log("userConnections", userConnections);
  });
});

var getUserConns = async function(userId) {
  connectionList = [];
  userConns = [];
  // console.log("connectionList1",connectionList);
  connectionList = await userConnection.find({ userId: userId });
  // console.log("connectionList2",connectionList);
  await asyncForEach(connectionList, async function(d) {
    var connection = await connDB.getConnection(d.connectionId);
    await userConns.push([connection, d.rsvp]);
  });
  console.log("userConns", userConns);
  return userConns;
};

var getUserProfile = async function(userID) {
  connectionList = await userConnection.find({ userId: userID });
  return connectionList;
};

// add a new connection to user connections list
var addRSVP = async function(connectionID, userID, rsvp) {
  var obj = new userConnection({
    userId: userID,
    connectionId: connectionID,
    rsvp: rsvp
  });
  await obj.save(function(err) {
    console.log("we have obj", obj);
    if (err) return console.error(err);
  });
};

// update the rsvp for a previously added user profile
var updateRSVP = async function(connectionID, userID, rsvp) {
  console.log("change rsvp to ", rsvp);
  console.log("connectionID ", connectionID);
  console.log("userID ", userID);
  await userConnection.findOneAndUpdate(
    { userId: userID, connectionId: connectionID },
    { rsvp: rsvp },
    { new: true }
  );
};

var deleteConnection = async function(connectionID, userID) {
  await userConnection.deleteOne(
    { connectionId: connectionID, userId: userID },
    function(err) {
      if (err) return console.error(err);
    }
  );
};

//source: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports.getUserProfile = getUserProfile;
module.exports.getUserConns = getUserConns;
module.exports.updateRSVP = updateRSVP;
module.exports.addRSVP = addRSVP;
module.exports.deleteConnection = deleteConnection;
