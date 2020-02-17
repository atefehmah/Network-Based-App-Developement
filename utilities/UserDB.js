var userConnectionModel = require("../models/UserConnection.js");
var User = require("../models/user.js");
var connDB = require("../utilities/connectionDB.js");

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/foodZone", { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;

var userDataList = [];
var userConnectionList = [];
var connData = [];

// database
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Connected to the database!");
});

// get all the user connections
var getUserConnections = function() {
  return userConnectionList;
};

// get all the users in the users collection
var getUsers = function() {
  return User.find({})
    .exec()
    .then(function(u) {
      console.log("u", u);
      // req.render()
      return u;
    })
    .catch(function() {
      if (err) {
        console.log(error);
      }
    });
};

// get a user based on a user id
var getUser = function(id) {
  return User.findOne({ userId: id })
    .exec()
    .then(function(user) {
      return user;
    })
    .catch(function() {
      if (err) {
        console.log(error);
      }
    });
};

// get a user based on email
var getUserByEmail = function(id) {
  return User.findOne({ username: id })
    .exec()
    .then(function(user) {
      return user;
    })
    .catch(function() {
      if (err) {
        console.log(error);
      }
    });
};

// add a new user to the collection
var addUser = async function(newUser) {
  var obj = new User({
    userId: newUser.userId,
    firstName: newUser.firstname,
    lastName: newUser.lastname,
    email: newUser.email,
    username: newUser.email,
    password: newUser.password,
    salt: newUser.salt
  });
  // console.log("connection######",c);
  await obj.save(function(err) {
    console.log("we have a new user", obj);
    if (err) return console.error(err);
  });
};

module.exports.getUsers = getUsers;
module.exports.getUser = getUser;
module.exports.getUserConnections = getUserConnections;
module.exports.addUser = addUser;
module.exports.getUserByEmail = getUserByEmail;
