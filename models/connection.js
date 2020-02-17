var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// connection schema to connect to the connections collection
var connectionSchema = new Schema({
  id: { type: String },
  userId: { type: String },
  name: { type: String },
  topic: { type: String },
  details: { type: String },
  location: { type: String },
  dt: { type: [] }
});

module.exports = mongoose.model("Connections", connectionSchema, "Connections");
