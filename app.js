var express = require("express");

var app = express();
var session = require("express-session");
var helmet = require("helmet");
app.use(helmet());

app.set("view engine", "ejs");
app.use(
  "/assets/stylesheets",
  express.static(__dirname + "/assets/stylesheets")
);
app.use("/assets/images", express.static(__dirname + "/assets/images"));
// handles routing
var index = require("./routes/routing.js");
var indexC = require("./routes/connectionController.js");
var indexU = require("./routes/ProfileController.js");

app.use(session({ secret: "secret" }));
app.use("/", index);
app.use("/newConnection", index);
app.use("/", indexC);
app.use("/", indexU);
app.use("/contact", index);
app.use("/about", index);

app.use("/register", index);

app.use("/login", indexU);

app.listen(8080);
