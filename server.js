var express = require('express');

var app = express();
var http = require('http');
var os = require('os');

var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');

var god = require('./god');
var russia = require('./russia');
var china = require('./china');

var _ = require('lodash-node');

mongoose.connect('mongodb://localhost/test');


app.set('port', process.env.PORT || 8080);
app.use(express.static(__dirname + "/public") );
app.use(morgan('dev'));

app.use(session(
    {   secret: 'dsaynofiuynsaoiufnoyudsan',
        resave: false,
        saveUninitialized: true

    }
 ));
app.use(cookieParser('dsaynofiuynsaoiufnoyudsan'));

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.app+json'}));
app.use(methodOverride());


var Todo = mongoose.model('Todo',{
	text: String
});

var players_data = {};

function init_china(req, res){
    var is_china_present = china.check_china();
    var player_id = req.session.sess_data.sess_id;

    if ( is_china_present == false ){
        china.create(player_id);
        players_data['china_id'] = player_id;
    };

};

function init_russia(req, res){
    var is_russia_present = russia.check_russia();
    var player_id = req.session.sess_data.sess_id;

    if ( is_russia_present == false ){
        russia.create(player_id);
        players_data['russia_id'] = player_id;
    };
};

function init_god(req, res){
    var is_god_present = god.check_god();
    var player_id = req.session.sess_data.sess_id;


    if ( is_god_present == false ){
        god.create(player_id);
        players_data['god_id'] = player_id;
    };

    //     // res.send(god_data);
    //     // res.write("data: " + JSON.stringify(data) + "\n\n" );
    //     // return JSON.stringify(0);

};

function init_players(req, res){
    var sess_data = {};
    var session = req.session;
    var sess_id = req.sessionID;

    sess_data['sess_id'] = sess_id;

    if (session.sess_data == undefined){
        session.sess_data = sess_data;
        var minute = 60 * 1000;
        var hour = 60 * minute;
        res.cookie('sess_id', sess_data['sess_id'], { maxAge: hour })
    }

};

app.post('/api/player/:name/setplayer', function(req, res){
    if (req.params.name == "init"){
        init_players(req, res);
        res.send("game initiated");
        publishUrgentMessage(req, res); 

    }else if (req.params.name == "god"){
        init_god(req, res);
        res.send("god initiated");
        publishUrgentMessage(req, res); 
        

    }else if (req.params.name == "china"){
        init_china(req, res);
        res.send("china initiated");
        publishUrgentMessage(req, res); 

    }else if (req.params.name == "russia"){
        init_russia(req, res);
        res.send("russia initiated");
        publishUrgentMessage(req, res); 

    };


});

app.post('/api/player/:name/addequipment/:equip', function(req, res){
    switch (req.params.name){
        case "russia" :
            russia.storeEquipment(req.params.equip);
            var msg = { "player" : "russia" , "equipment" :  russia.getEquipments() } ;
            res.send( msg );
            publishEquipmentStateMessage(req, res, msg);

        break; 
        case "china" :
            china.storeEquipment(req.params.equip);
            var msg =  { "player" : "china" , "equipment" :  china.getEquipments() };
            res.send( msg );
            publishEquipmentStateMessage(req, res, msg);

        break; 
    };



});


app.post('/api/player/:name/startbattle', function(req, res){
    if (req.params.name == "god"){
        console.log("startubg battle");
        var battle_res = calculateForces();
        res.send(battle_res);
        publishBattleMessage(req, res, battle_res);
    }

});

function getRandomForces(force_item_value){
    var min_value = force_item_value;

    // even without given force type, we still have 10% good luck
    if (min_value === 0){
        min_value = 0.1;
    }

    var max_value = min_value * 1.33;
    var final_value = _.random(min_value, max_value, true);

    return final_value ; 

};

function calculateForces(){
    var forces = {
        "russia" : russia.getEquipments(),
        "china" : china.getEquipments()
    };

    var russia_tank_ratio = getRandomForces(forces.russia.tank);
    var china_tank_ratio = getRandomForces(forces.china.tank);

    var russia_soldier_ratio = getRandomForces(forces.russia.soldier);
    var china_soldier_ratio = getRandomForces(forces.china.soldier);

    var russia_plane_ratio = getRandomForces(forces.russia.plane);
    var china_plane_ratio = getRandomForces(forces.china.plane);

    var battle_result = { 
        tank : {} ,
        soldier : {} , 
        plane : {} 
    };

    if (russia_tank_ratio > china_tank_ratio){
        var ratio = russia_tank_ratio / china_tank_ratio;
        battle_result.tank = { "won" : "russia", "ratio" : ratio}; 
    }else {
        var ratio = china_tank_ratio /  russia_tank_ratio ;
        battle_result.tank = { "won" : "china", "ratio" : ratio}; 

    }



    if (russia_soldier_ratio > china_soldier_ratio){
        var ratio = russia_soldier_ratio / china_soldier_ratio;
        battle_result.soldier = { "won" : "russia", "ratio" : ratio}; 
    }else {
        var ratio = china_soldier_ratio /  russia_soldier_ratio ;
        battle_result.soldier = { "won" : "china", "ratio" : ratio}; 

    }


    if (russia_plane_ratio > china_plane_ratio){
        var ratio = russia_plane_ratio / china_plane_ratio;
        battle_result.plane = { "won" : "russia", "ratio" : ratio}; 
    }else {
        var ratio = china_plane_ratio /  russia_plane_ratio ;
        battle_result.plane = { "won" : "china", "ratio" : ratio}; 

    }

    return battle_result;

};


app.get('/', function(req, res) {
	res.sendfile('./public/index.html');
});


function publishEquipmentStateMessage(req, res, msg){
    var target_id = req.session.sess_data['sess_id'];

    var final_data = {};

    final_data['owner_id'] = target_id;
    final_data['content'] = msg;

    eventConnections.forEach(function(resp){
        var d = new Date();
        resp.write('id: ' + d.getMilliseconds() + '\n');
        resp.write('event: ' + "equipmentStateMessage" + '\n');
        resp.write('data:' + JSON.stringify(msg) +   '\n\n'); // Note the extra newline

    });

};




function publishBattleMessage(req, res, msg){
    var target_id = req.session.sess_data['sess_id'];

    var final_data = {};

    final_data['owner_id'] = target_id;
    final_data['content'] = msg;

    eventConnections.forEach(function(resp){
        var d = new Date();
        resp.write('id: ' + d.getMilliseconds() + '\n');
        resp.write('event: ' + "battleMessage" + '\n');
        resp.write('data:' + JSON.stringify(msg) +   '\n\n'); // Note the extra newline

    });

};


function publishUrgentMessage(req, res){
    var target_id = req.session.sess_data['sess_id'];

    var final_data = {};

    final_data['owner_id'] = target_id;
    final_data['players'] = players_data;

    console.log("players_data");
    console.log(players_data);

    eventConnections.forEach(function(resp){
        var d = new Date();
        resp.write('id: ' + d.getMilliseconds() + '\n');
        resp.write('event: ' + "urgentMessage" + '\n');
        resp.write('data:' + JSON.stringify(final_data) +   '\n\n'); // Note the extra newline

    });

};

var eventConnections = [];

app.get('/events', function(req, res) {
    req.socket.setTimeout(8888);
 
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
 
    eventConnections.push(res);



    req.on("close", function() {
        console.log(" events on close ");

        var toRemove;
        for (var j =0 ; j < eventConnections.length ; j++) {
            if (eventConnections[j] == res) {
                toRemove =j;
                break;
            }
        }
        eventConnections.splice(j,1);
        console.log(eventConnections.length);
    });


    req.on("connect", function() {
        console.log(" events on connect ");

    });

    req.on("message", function() {
        console.log(" events on message ");

    });



});
 


setInterval(function() {
    eventConnections.forEach(function(resp) {
        var d = new Date();
        resp.write('id: ' + d.getMilliseconds() + '\n');
        resp.write('event: ' + "intervalMessage" + '\n');
        resp.write('data:' + createMsg() +   '\n\n'); // Note the extra newline
    });
 
}, 1000);



function createMsg() {
    msg = {};
 
    msg.hostname = os.hostname();
    msg.type = os.type();
    msg.platform = os.platform();
    msg.arch = os.arch();
    msg.release = os.release();
    msg.uptime = os.uptime();
    msg.loadaverage = os.loadavg();
    msg.totalmem = os.totalmem();
    msg.freemem = os.freemem();
 
    return JSON.stringify(msg);
}



http.createServer(app).listen(app.get('port'), function(){
	console.log("app listening on port ");
	console.log(app.get('port'));

});
