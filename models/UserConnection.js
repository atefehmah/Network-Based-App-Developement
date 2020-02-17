var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userConnectionSchema = new Schema({
	connectionId: String,
		rsvp: String,
		userId: String
});
// var UserConnection = function(c, r, i){
// 	var UserConnectionModel = {
// 		connection: c,
// 		rsvp: r,
// 		id: i
// 	};

// 	return UserConnectionModel;
// };

module.exports = mongoose.model('userConnection', userConnectionSchema, 'userConnections');

