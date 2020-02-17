var connections = require("../models/connection.js");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/foodZone", { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var Connections = require("../models/connection.js");
// var  = mongoose.connection;
// var connectionsList = [];
var connectionsData = [];
var topics;

// conect to the database
var dbConnection = mongoose.connection;
dbConnection.on("error", console.error.bind(console, "connection error:"));
dbConnection.once("open", function() {
  console.log("Connected to the database from userConnectionDB!");

  dbConnection.db.collection("Connections", function(err, collection) {
    collection.find({}).toArray(async function(err, data) {
      console.log("connections", data);
    });
  });
});

// get the list of connection objects from the database
var getConnections = async function() {
  topics = new Set();
  connectionsData = await connections.find({});
  // add a list of topics to be able to categorize them in connections page
  connectionsData.forEach(function(item) {
    topics.add(item.topic);
  });

  return [connectionsData, Array.from(topics)];
};

// get a connection by an ID returns null if the id doesn't exist
var getConnection = async function(ID) {
  d = await connections.find({ id: ID });

  return d;
};

// add a connection to userConnection
var addConnection = async function(c) {
  await Connections.findOneAndUpdate(
    {
      userId: c.userId,
      name: c.name,
      topic: c.topic
    },
    {
      id: c.id,
      details: c.details,
      location: c.location,
      dt: c.dt
    },
    { new: true, upsert: true }
  ).catch(function() {
    if (err) {
      console.log(error);
    }
  });
};

module.exports.getConnections = getConnections;
module.exports.getConnection = getConnection;
module.exports.addConnection = addConnection;
