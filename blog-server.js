'use strict';
const { PerformanceObserver, performance } = require('perf_hooks');
var fs = require("fs");
const assert = require('assert');
const binding = require.resolve(`./maps/build/Release/binding`);
const maincpp = require(binding);
//const postfix = require('./postfix.js');
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();


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


async function quickstart() {


  // Performs label detection on the image file
  const [result] = await client.labelDetection('./static/img/lincoln.jpg');
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
}


var express = require('express');



var app = express();



app.use('/',express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', 
	
	function(req, res) {
		quickstart();
		res.write(nunjucks.render('templates/blog-input.html',{
			
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
		if (dm.type == 'stations'){
			var s = dm.stations;
			
			
			var stations = [];
			for (var i=0;i<s.length;i++){
				console.log(cityList[s[i][0]]);
				stations.push(parseInt(s[i][0]));
			}
			var retStations = maincpp.getStations(stations,10,50);//stationList,max # stations, radius for pop
			console.log(retStations);
			
			
			
			var jsonmessage = {'type':'test'};
			ws.send(JSON.stringify(jsonmessage));
		}
		
  	});
});


