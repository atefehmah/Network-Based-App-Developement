var UserConnectionDB = require('../utilities/UserConnectionDB.js');

class UserProfile{

	constructor(id, connections){
		this.id= id;
		this.connections= connections;
	};

	addConnection(connection, rsvp){
		console.log(" we areee here");
		this.connections.push({connection: connection, rsvp: rsvp});
		console.log("connection.id", connection.id);
		UserConnectionDB.addRSVP(connection[0].id ,this.id, rsvp);

	};

	removeConnection(delConnID){
	var i = this.connections.indexOf(delConnID);
    this.connections.splice(i,1);
    UserConnectionDB.deleteConnection(delConnID, this.id);
	};

	updateConnection(connection, rsvp){
		this.connections.forEach(function(data){
			console.log("data.connection.id",data);
			console.log("connection id",connection[0].id );
			if(data.connection[0].id === connection[0].id){
				console.log("we came here");
			  data.rsvp = rsvp
			}
		  });
		  console.log("connection",connection);
		  UserConnectionDB.updateRSVP(connection[0].id, this.id, rsvp);
	};

	getConnections(){
		return this.connections;

	};

	emptyProfile(){
		this.connections = [];
	};

}

module.exports = UserProfile;