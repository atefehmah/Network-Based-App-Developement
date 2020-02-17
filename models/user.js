var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// user schema to connect to the users collection
var userSchema = new Schema({
  userId: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  username: { type: String },
  password: { type: String },
  salt: { type: String }
});

module.exports = mongoose.model("User", userSchema, "Users");
