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


var retHello = maincpp.hello();//array is 2310 columns and 995 rows
console.log(retHello);

//var ptArray = [[-122.490402, 37.786453,10],[-122.490402, 47.786453,20],[-102.490402, 37.786453,5]];
var ptArray = [];

/*double yToLat(double y){
	double lat = -0.02499999989999999*y + 71.38708322329654;
}

double xToLng(double x){
	double lng = 0.0249999999*x - 179.14708263665557;
}*/

for (var i=0;i<995;i++){
	for (var ii=0;ii<2310;ii++){
		var retGLV = maincpp.getLandValue(i,ii);
		if (i%200 == 0 && ii%500 == 0){
			console.log(i,ii,retGLV);
		}
		if (i%50 == 0 && ii%100 == 0){
			ptArray.push([0.0249999999*(ii+6534/3) - 179.14708263665557,-0.02499999989999999*(i+2643/3) + 71.38708322329654,retGLV/10]);
		}
	}
}


var express = require('express');



var app = express();



app.use('/',express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/map.html',{
			points: ptArray,
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


