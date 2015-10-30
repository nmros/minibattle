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


    console.log(req.session.sess_data);


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


    init_god(req, res);
    init_russia(req, res);
    init_china(req, res);

};

app.get('/api/player/:name', function(req, res){


    if (req.params.name == "init"){
        init_players(req, res);
        res.send("game initiated");
        sendUrgentMessage(req, res, players_data); 

    }else if (req.params.name == "god"){
        init_god(req, res);
        res.send("god initiated");
        sendUrgentMessage(req, res, players_data); 
        

    }else if (req.params.name == "china"){
        init_china(req, res);
        res.send("china initiated");

        console.log("res.cookie");
        console.log(res.cookie);

        sendUrgentMessage(req, res, players_data); 

    }else if (req.params.name == "russia"){
        init_russia(req, res);
        res.send("russia initiated");
        sendUrgentMessage(req, res, players_data); 

    };

    // chrome, opera
    // connect.sid, sessionid

    // chrome private, dziwnie odswieza button
    // connect.sid






});



app.get('/', function(req, res) {
	res.sendfile('./public/index.html');
});


function sendUrgentMessage(req, res, players_data){
    // var target_client_csrf = req.cookies['csrftoken'];
    var target_client_csrf = req.session.sess_data['sess_id'];

    console.log("target_client_csrf");
    console.log(target_client_csrf);

    var final_data = {};

    final_data['owner_id'] = target_client_csrf;
    final_data['players'] = players_data;

    eventConnections.forEach(function(resp){
        // var current_csrf = resp.req.cookies['csrftoken'];

        // if ( god.get_player_id()  == current_csrf ){
        //     god_data['god_status'] = 'you_are_god';
        // }else {
        //     god_data['god_status'] = 'you_are_nobody';

        // }
        console.log("final_data");
        console.log(final_data);

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

function resetCookies(){
    eventConnections.forEach(function(resp) {
        // console.log( resp.res.cookies ) ;
    });

};

resetCookies();

http.createServer(app).listen(app.get('port'), function(){
	console.log("app listening on port ");
	console.log(app.get('port'));

});
