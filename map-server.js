'use strict';
const { PerformanceObserver, performance } = require('perf_hooks');
var fs = require("fs");
const assert = require('assert');
const binding = require.resolve(`./maps/build/Release/binding`);
const maincpp = require(binding);
//const postfix = require('./postfix.js');



const https = require('https');
var fs = require("fs");
var bodyParser = require("body-parser");
var qs = require('querystring');
const { exec } = require('child_process');
var nunjucks = require('nunjucks');
var crypto = require("crypto");

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/martianmath.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/martianmath.com/fullchain.pem')
};


/*const mongoose = require('mongoose');
mongoose.connect('mongodb://45.32.213.227:27017/triplelog', {useNewUrlParser: true});
const User = require('./models/user');
const UserData = require('./models/userdata');*/


var retHello = maincpp.hello(3);
console.log(retHello);



var express = require('express');



var app = express();



app.use('/',express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/map.html',{
		
		}));
		res.end();
	}
);

const server1 = https.createServer(options, app);

server1.listen(1338);

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('\n');
}).listen(8081);

const WebSocket = require('ws');
//const wss = new WebSocket.Server({ port: 8080 , origin: 'http://tabdn.com'});
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
  	console.log("ws connected");
  	ws.on('message', function incoming(message) {
		var dm = JSON.parse(message);
		if (dm.type == 'path'){
			
		}
		
  	});
});


