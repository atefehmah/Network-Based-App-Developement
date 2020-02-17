var express2 = require('express');
var router2 = express2.Router();
var util = require('./../utilities/connectionDB.js');
var result;
var connectionsObj;
var topics;
var clicked;
var connID;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/foodZone', { useNewUrlParser: true });
var db = mongoose.connection;

// render the connection page recieve a valid ID otherwise show the connections page
router2.get('/connection', function(req, res) {
    if (req.session.theUser){clicked = true ; user = req.session.theUser;}
    else {clicked = false; user = ""}

    connID = req.query.connID;
    console.log("connID",connID)
    util.getConnection(connID).then(function(isValid){
        // console.log("isValid",isValid);
        if (isValid == null) {
            console.log("Stuck here!!!! rendering connections!!")
            util.getConnections().then(function(result){
                // console.log('result', result);
                connectionsObj = result[0];
                topics = result[1];
    
                res.render('connections', {
                    clicked: clicked,
                    connectionsObj: connectionsObj,
                    topics: topics
                });
            });
    
        } else {
            console.log("we are here!");
            info = isValid;
            // console.log("darim ya na?", info);
            res.render('connection', {
                user: user,
                clicked: clicked,
                info: info[0],
                connID: connID
            });
        }
    });

    

});

router2.post('/connection', function(req, res) {
    connID = req.query.id;

    if (req.session.theUser){clicked = true ; user = req.session.theUser;}
    else {clicked = false; user = ""}
    // console.log(connectionID);
    util.getConnection(connID).then(function(isValid){
        if (isValid == null) {

            util.getConnections().then(function(result){
                // console.log("connections",result);
                connectionsObj = result[0];
                topics = result[1];
        
                res.render('connections', {
                    clicked: clicked,
                    connectionsObj: connectionsObj,
                    topics: topics
                });
            });
            
    
        } else {
            info = isValid;
            res.render('connection', {
                user: user,
                clicked: clicked,
                info: info[0],
                connID: connID
            });
    
        }
    });

    

});

// displays a list of connections based on the hard coded data
router2.get('/connections', function(req, res) {
    // result = util.getConnections();
    // // console.log("result",result);
    // connectionsObj = result[0];
    // topics = result[1];

    // if (req.session.theUser){clicked = true ; user = req.session.theUser;}
    // else {clicked = false;}

    // res.render('connections', {
    //     clicked: clicked,
    //     connectionsObj: connectionsObj,
    //     topics: topics
    // });
    if (req.session.theUser){clicked = true ; user = req.session.theUser;}
    else {clicked = false;}

    util.getConnections().then(function(result){
        connectionsObj = result[0];
        topics = result[1];

        res.render('connections', {
            clicked: clicked,
            connectionsObj: connectionsObj,
            topics: topics
        });
    });
    // console.log("result",result);
    

    

    
});


module.exports = router2;