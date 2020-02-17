var express = require("express");
var salthash = require("../utilities/salthash.js");
var router = express.Router();
var userConnectionDB = require("../utilities/UserConnectionDB.js");
var connectionDB = require("../utilities/connectionDB.js");
var userDB = require("../utilities/UserDB.js");
var Connection = require("../models/connection.js");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var checker;

//handling routing for all pages except connection and connections
router.get("/", function(req, res) {
  res.render("index", { clicked: false });
});

router.get("/index", function(req, res) {
  res.render("index", { clicked: false });
});

// set the clicked to true to display the savedConnection differently
router.get("/contact", function(req, res) {
  res.render("contact", { clicked: false });
});

router.get("/about", function(req, res) {
  res.render("about", { clicked: false });
});

router.get("/register", function(req, res) {
  var errors = undefined;
  res.render("register", { clicked: false, details: errors });
});

router.post(
  "/register",
  urlencodedParser,
  [
    // validation for registeration page
    // source: https://stackoverflow.com/questions/58027033/white-space-issue-in-isalpha-function-of-express-validator
    check("firstname")
      .isAlpha()
      .withMessage("first name should be alphabets only")
      .not()
      .isEmpty()
      .withMessage("first name is required")
      .isLength({ min: 1 })
      .withMessage("name of your choice is not long enough"),
    check("lastname")
      .isAlpha()
      .withMessage("last name should be alphabets only")
      .not()
      .isEmpty()
      .withMessage("Name is required")
      .isLength({ min: 1 })
      .withMessage("last name can't be one letter"),
    check("address").isAlphanumeric(),
    check("email")
      .isEmail()
      .withMessage("email is not valid")
      .normalizeEmail()
      .trim()
      .custom((value, { req }) => {
        userDB.getUsers().then(function(data) {
          data.forEach(function(d) {
            console.log("username", d.username);
            console.log("value", value);
            if (d.username === value) {
              console.log("oooooo");
              checker = false;
            } else {
              checker = true;
              console.log("email is fine");
              //   return true;
            }
          });
        });
        if (checker) {
          return true;
        } else {
          console.log("are we hereeee???/");
          throw new Error("you are already registered");
        }
      }),

    check("password")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Your password is not long enough(Min 4 charachters)")
  ],
  function(req, res) {
    console.log("we are in POST register page");
    clicked = false;
    const errors = validationResult(req);
    console.log("errors", errors);
    if (!errors.isEmpty()) {
      res.render("register", {
        clicked: clicked,
        details: errors
      });
    } else {
      console.log("req.body", req.body);

      var salt = salthash.genRandomString(16);
      var passwordData = salthash.sha512(req.body.password, salt);
      //   console.log(salt);
      console.log("passwordData!!!!!", passwordData);
      var firstname = req.body.firstname;
      var lastname = req.body.lastname;
      var address = req.body.address;
      var email = req.body.email;
      //   var password = passwordData.passwordHash;
      clicked = false;
      // make a new user with the data from submitted form
      var id = mongoose.Types.ObjectId().toString();
      var newUser = {
        userId: id,
        firstName: firstname,
        lastName: lastname,
        email: email,
        username: email,
        password: passwordData.passwordHash,
        salt: passwordData.salt
      };

      console.log(newUser);

      // add the new user to the users collection
      userDB.addUser(newUser).then(function() {
        console.log("newUser", newUser);
        error = undefined;
        res.render("login", { clicked: false, details: error });
      });
    }
  }
);

router.post(
  "/newConnection",
  urlencodedParser,
  [
    // source: https://stackoverflow.com/questions/58027033/white-space-issue-in-isalpha-function-of-express-validator
    check("topic")
      .custom((value, { req }) => {
        if (isNaN(value)) {
          return true;
        } else {
          throw new Error("Must be only alphabetical chars");
        }
      })
      .not()
      .isEmpty()
      .withMessage("Topic is required")
      .isLength({ min: 4 })
      .withMessage("topic name of your choice is not long enough"),
    check("name")
      .custom((value, { req }) => {
        if (isNaN(value)) {
          return true;
        } else {
          throw new Error("Must be only alphabetical chars");
        }
      })
      .not()
      .isEmpty()
      .withMessage("Name is required")
      .isLength({ min: 4 })
      .withMessage("event name of your choice is not long enough"),
    check("details")
      .isAlpha()
      .withMessage("Must be only alphabetical chars")
      .not()
      .isEmpty()
      .withMessage("You should enter the neccessary details")
      .isLength({ min: 3 }),
    check("where")
      .isAlpha()
      .withMessage("Must be only alphabetical chars")
      .not()
      .isEmpty()
      .withMessage("Location is required")
      .isLength({ min: 4 }),
    check("when")
      .not()
      .isEmpty()
      .withMessage("Date is required")
      .toDate()
      .isAfter()
      .withMessage("Enter a future date"),
    check("time")
      .not()
      .isEmpty()
      .withMessage("Time is required")
  ],
  function(req, res) {
    console.log("we are in POST new connection page");

    const errors = validationResult(req);
    console.log("errors", errors);
    // if there is an error display it on the page
    if (!errors.isEmpty()) {
      res.render("newConnection", {
        clicked: clicked,
        user: user,
        details: errors
      });
    } else {
      console.log("USER", req.session.theUser);
      if (req.session.theUser) {
        clicked = true;
        user = req.session.theUser;
      } else {
        clicked = false;
      }
      // get the input values
      console.log("req.body", req.body);
      var topic = req.body.topic;
      var name = req.body.name;
      var details = req.body.details;
      var location = req.body.where;
      var when = req.body.when;
      var time = req.body.time;
      console.log("when", when);
      console.log("location", location);
      // make a new connection
      var id = mongoose.Types.ObjectId();
      var newConn = {
        id: id,
        userId: req.session.theUser.userId,
        name: name,
        topic: topic,
        details: details,
        location: location,
        dt: [when, time]
      };

      // Add the new connection to the connections collection

      connectionDB.addConnection(newConn).then(function() {
        console.log("newConn", newConn);
        res.redirect("connections");
      });
    }
  }
);

// get request for new connection page
router.get("/newConnection", function(req, res) {
  console.log("we are in get new connection page");
  console.log("in new connection", req.session.theUser);
  if (req.session.theUser) {
    clicked = true;
    user = req.session.theUser;
  } else {
    clicked = false;
  }

  res.render("newConnection", {
    clicked: clicked,
    user: user,
    details: undefined
  });
});

// router.get("/*", function(req, res) {
//   res.render("404", { clicked: false });
// });

module.exports = router;
