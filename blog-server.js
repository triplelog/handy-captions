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


async function quickstart(filen) {


  // Performs label detection on the image file
  const [result] = await client.documentTextDetection(filen);
  const document = result.fullTextAnnotation;
  
  fs.writeFile('./blog/out/test.json', JSON.stringify(document), err => {
	  if (err) {
		console.error(err)
		return
	  }
	  //file written successfully
  });
  console.log(document.pages[0].blocks);
}

function bbToPath(bb){
	var pd = "M";
	for (var i=0;i<bb.length;i++){
		pd += " "+bb[i].x+" "+bb[i].y;
	}
	pd += "Z";
	return pd;
}
function readJson() {
	fs.readFile('./blog/out/test.json', 'utf8', (err, data) => {
	  if (err) {
		console.error(err)
		return
	  }
	  var document = JSON.parse(data);
	  for (var i=0;i<document.pages.length;i++){
	  	for (var ii=0;ii<Math.min(5,document.pages[i].blocks.length);ii++){//document.pages[i].blocks.length;ii++){
	  		for (var iii=0;iii<Math.min(5,document.pages[i].blocks[ii].paragraphs.length);iii++){
	  			for (var iiii=0;iiii<document.pages[i].blocks[ii].paragraphs[iii].words.length;iiii++){
	  				console.log(document.pages[i].blocks[ii].paragraphs[iii].words[iiii].boundingBox;
	  				var pd = bbToPath(document.pages[i].blocks[ii].paragraphs[iii].words[iiii].boundingBox.vertices);
	  				console.log(pd);
	  			}
	  			/*for (var iiii=0;iiii<document.pages[i].blocks[ii].paragraphs[iii].words[0].symbols.length;iiii++){
	  				console.log(document.pages[i].blocks[ii].paragraphs[iii].words[0].symbols[iiii].text);
	  				var pd = bbToPath(document.pages[i].blocks[ii].paragraphs[iii].words[0].symbols[iiii].boundingBox.vertices);
	  				console.log(pd);
	  			}*/
	  		}
	  	}
	  }
	  //file written successfully
  });
}

var express = require('express');



var app = express();



app.use('/',express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', 
	
	function(req, res) {
		//quickstart();
		readJson();
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
  		if (dm.type == "image"){
  			var base64Data = dm.image.substr(22,);
  			
  			/*require("fs").writeFile("out.png", base64Data, 'base64', function(err) {
			  console.log(err);
			  quickstart("./out.png");
			});*/
  		}
		
  	});
});


