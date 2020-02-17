var express3 = require("express");
var router3 = express3.Router();
var salthash = require("../utilities/salthash.js");
var mongoose = require("mongoose");
var userProfileModel = require("./../models/UserProfile.js");
var User = require("../models/user.js");
var UserConnectionDB = require("../utilities/UserConnectionDB.js");
var trackUser;

var userDB = require("./../utilities/UserDB.js");
var connectionDB = require("./../utilities/connectionDB.js");
var userConn = require("./../models/UserConnection.js");

const { check, validationResult } = require("express-validator");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var clicked;
var connID;
var rsvp;
var newUserConn;
var idArray;
var connArray;
var newProfile;
var initialUser;
var validUser;
var username;
var password;

mongoose.connect("mongodb://localhost/foodZone", { useNewUrlParser: true });
var db = mongoose.connection;

router3.post(
  "/savedConnection",
  urlencodedParser,
  [
    check("username")
      .isEmail()
      .withMessage("Enter your email")
      .normalizeEmail()
      .trim(),
    check("password")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Your password is not long enough(Min 4 charachters)")
  ],
  function(req, res) {
    const errors = validationResult(req);

    if (req.session.theUser) {
      console.log("session is already there");
      //if user is logged in show the savedConnection page
      res.redirect("savedConnection");
    } else {
      // get the email and password
      validUser = false;
      username = req.body.username;
      password = req.body.password;

      // get the users with the same email(username) and check the password
      userDB.getUserByEmail(username).then(function(u) {
        var saltU = u.salt;
        if (salthash.sha512(password, saltU).passwordHash === u.password) {
          userDB.getUsers().then(function(data) {
            data.forEach(function(d) {
              console.log("username", username);
              console.log("password", password);
              console.log("user", d.username);
              //   if both username and password match let them log in
              if (
                username === d.username &&
                salthash.sha512(password, saltU).passwordHash === d.password
              ) {
                console.log("oooooo");
                validUser = true;
                initialUser = d.userId;
                // if only username match the password is wrong
              } else if (username === d.username) {
                console.log("gggggggg");
                validUser = null;
              }
            });
            if (validUser) {
              //set them to empty at the beginning of each session
              idArray = [];
              connArray = [];

              console.log(
                " inja req.session.connections",
                req.session.connections
              );
              userDB
                .getUser(initialUser)
                .then(function(userlist) {
                  // console.log("inja",userlist);
                  req.session.theUser = userlist;
                  user = req.session.theUser;
                })
                .catch(function(err) {
                  console.error("err", err);
                });

              console.log("session started");

              UserConnectionDB.getUserProfile(initialUser)
                .then(function(u) {
                  u.forEach(function(data) {
                    idArray.push(data.connectionId);
                  });
                })
                .catch(function(err) {
                  console.error("err", err);
                });

              // display the logged in users connections, I call it the initial user
              UserConnectionDB.getUserConns(initialUser)
                .then(function(data) {
                  data.forEach(function(d) {
                    connArray.push({ connection: d[0], rsvp: d[1] });
                  });
                  console.log("ConnArray", connArray);
                  newProfile = new userProfileModel(
                    req.session.theUser.userId,
                    connArray
                  );
                  // get all connections of the profile
                  req.session.connections = newProfile.getConnections();
                  console.log("newProfile", newProfile);
                  console.log("session.connections", req.session.connections);
                  user =
                    // console.log("connArray",connArray);
                    res.render("savedConnection", {
                      user: req.session.theUser,
                      clicked: clicked,
                      connData: req.session.connections
                    });
                })
                .catch(function(err) {
                  console.error("err", err);
                });

              clicked = true;
              // check most of the logical errors here
              // password is wrong or username is not registered
            } else if (validUser === null) {
              console.log("to this point");
              clicked = false;
              if (!errors.isEmpty()) {
                console.log("this is buggy");
                res.render("login", {
                  clicked: clicked,
                  user: req.session.theUser,
                  details: errors
                });
              } else {
                res.render("login", {
                  clicked: clicked,
                  user: req.session.theUser,
                  details: {
                    errors: [{ msg: "Password is wrong", param: "Password" }]
                  }
                });
              }
            } else {
              clicked = false;
              if (!errors.isEmpty()) {
                res.render("login", {
                  clicked: clicked,
                  user: req.session.theUser,
                  details: errors
                });
              } else {
                res.render("login", {
                  clicked: clicked,
                  user: req.session.theUser,
                  details: {
                    errors: [
                      { msg: "Username is not registered", param: "Username" }
                    ]
                  }
                });
              }
            }
          });
        }
      });
    }
  }
);

router3.get("/savedConnection", function(req, res) {
  connID = req.query.connID;
  // console.log
  clicked = true;
  rsvp = req.query.rsvp;
  delConnID = req.query.delConnID;

  if (req.session.theUser) {
    console.log("session is already there");
    console.log("delConnID", delConnID);
    // console.log("connID",connID);
    console.log("idArray", idArray);

    if (connID != null) {
      console.log("hello");

      connectionDB
        .getConnection(connID)
        .then(function(connData) {
          console.log("connID", connID);
          console.log("idArray.indexOf(connID)", idArray.indexOf(connID));
          // console.log("at the beginning",connData);
          if (idArray.indexOf(connID) === -1) {
            console.log("cannot find", connID, "in the idArray");
            console.log("adding a connection");
            console.log("idArray before", idArray);
            idArray.push(connID);
            console.log("idArray after ", idArray);

            // console.log("****",newProfile);
            newProfile.addConnection(connData, rsvp);

            req.session.connections = newProfile.getConnections();
            // console.log("ok?", req.session.connections);
            res.render("savedConnection", {
              user: req.session.theUser,
              clicked: clicked,
              connData: req.session.connections
            });
          } else {
            console.log("similar ids updating a connection");
            console.log("database updated", connData);
            newProfile.updateConnection(connData, rsvp);
            // console.log("newProfile updated",newProfile);

            req.session.connections = newProfile.getConnections();
            // console.log("ok?", req.session.connections);
            res.render("savedConnection", {
              user: req.session.theUser,
              clicked: clicked,
              connData: req.session.connections
            });
          }
        })
        .catch(function(err) {
          console.error("err", err);
        });
    }

    //deleting connection objects from user connections
    if (delConnID != null) {
      // get the id to delete a connection
      var iconnID = idArray.indexOf(delConnID);
      idArray.splice(iconnID, 1);
      // remove the connection from database
      newProfile.removeConnection(delConnID);
      req.session.connections = newProfile.getConnections();

      res.render("savedConnection", {
        user: req.session.theUser,
        clicked: clicked,
        connData: req.session.connections
      });
    } else if (delConnID === undefined) {
      if (connID === undefined) {
        console.log("do we come here?");
        res.render("savedConnection", {
          user: req.session.theUser,
          clicked: clicked,
          connData: req.session.connections
        });
      }
    }
  } else {
    res.redirect("/login");
  }
});

//code from public fortune
//destroy the session
router3.get("/savedConnection/clearSession", function(req, res) {
  console.log("before deleteing session", req.session);
  req.session.destroy(function(err) {
    if (err) {
      console.log("error deleting session");
    }
    console.log(
      "UserConnectionDB.connectionList",
      UserConnectionDB.connectionList
    );

    UserConnectionDB.connectionList = [];
    console.log(
      "UserConnectionDB.connectionList",
      UserConnectionDB.connectionList
    );
  });
  console.log("session deleted");
  res.redirect("../index");
});

router3.get("", function(req, res) {
  var errors = undefined;
  console.log("I am in login get");
  res.render("login", {
    user: req.session.theUser,
    clicked: clicked,
    details: errors
  });
});

module.exports = router3;
