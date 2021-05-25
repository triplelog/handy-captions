'use strict';
const { PerformanceObserver, performance } = require('perf_hooks');
var fs = require("fs");
const assert = require('assert');
const binding = require.resolve(`./maps/build/Release/binding`);
const maincpp = require(binding);
//const postfix = require('./postfix.js');
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');




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

async function fromWS64(b64) {

  // Creates a client
  const client = new vision.ImageAnnotatorClient();


  var encoded = b64;
  const request = {
      "image": {
        "content": encoded
      },
      "features": [
        {
          "type": "DOCUMENT_TEXT_DETECTION"
        }
      ],
      "imageContext": {
        "languageHints": ["en-t-i0-handwrit"]
      }
    };
  client.annotateImage(request).then(response => {
    fs.writeFile('./blog/out/test3.json', JSON.stringify(response[0].fullTextAnnotation), err => {
	  if (err) {
		console.error(err)
		return
	  }
    });
  })
  .catch(err => {
    console.error(err);
  });

}

async function quickstart(filen) {

  // Creates a client
  const client = new vision.ImageAnnotatorClient();
  // Performs label detection on the image file
  //var b64 = "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";
  //let buff = new Buffer(b64, 'base64');
  var imageFile = fs.readFileSync(filen);

  // Convert the image data to a Buffer and base64 encode it.
  var encoded = Buffer.from(imageFile).toString('base64');
  console.log(encoded);
  const request = {
      "image": {
        "content": encoded
      },
      "features": [
        {
          "type": "DOCUMENT_TEXT_DETECTION"
        }
      ],
      "imageContext": {
        "languageHints": ["en-t-i0-handwrit"]
      }
    };
  client.annotateImage(request).then(response => {
    // doThingsWith(response);
    //console.log(JSON.stringify(response[0].textAnnotations));
    fs.writeFile('./blog/out/test2.json', JSON.stringify(response[0].fullTextAnnotation), err => {
	  if (err) {
		console.error(err)
		return
	  }
	  //file written successfully
    });
  })
  .catch(err => {
    console.error(err);
  });
  
 /* console.log(JSON.stringify(result));
  const document = result.fullTextAnnotation;
  
  fs.writeFile('./blog/out/test2.json', JSON.stringify(document), err => {
	  if (err) {
		console.error(err)
		return
	  }
	  //file written successfully
  });
  console.log(document.pages[0].blocks);*/
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
	fs.readFile('./blog/out/test3.json', 'utf8', (err, data) => {
	  if (err) {
		console.error(err)
		return
	  }
	  fs.readFile('./blog/out/strokes3.json', 'utf8', (err, dataStrokes) => {
		  if (err) {
			console.error(err)
			return
		  }
		  var svg = "";
		  var letterBoxes = [];
		  var strokeToLetter = {};
		  var document = JSON.parse(data);
		  for (var i=0;i<document.pages.length;i++){
			//console.log(JSON.stringify(document.pages[i]));
			for (var ii=0;ii<document.pages[i].blocks.length;ii++){//document.pages[i].blocks.length;ii++){
				for (var iii=0;iii<document.pages[i].blocks[ii].paragraphs.length;iii++){
					for (var iiii=0;iiii<document.pages[i].blocks[ii].paragraphs[iii].words.length;iiii++){
						//console.log(document.pages[i].blocks[ii].paragraphs[iii].words[iiii].boundingBox);
						var pd = bbToPath(document.pages[i].blocks[ii].paragraphs[iii].words[iiii].boundingBox.vertices);
						svg += '<path d="'+pd+'" fill="none" stroke="red" stroke-width="4" />';
						console.log(document.pages[i].blocks[ii].paragraphs[iii].words[iiii]);
						//console.log(pd);
						for (var iiiii=0;iiiii<document.pages[i].blocks[ii].paragraphs[iii].words[iiii].symbols.length;iiiii++){
							//console.log(document.pages[i].blocks[ii].paragraphs[iii].words[iiii].symbols[iiiii].text);
							var pd = bbToPath(document.pages[i].blocks[ii].paragraphs[iii].words[iiii].symbols[iiiii].boundingBox.vertices);
							svg += '<path d="'+pd+'" fill="none" stroke="green" stroke-width="2" />';
							letterBoxes.push(document.pages[i].blocks[ii].paragraphs[iii].words[iiii].symbols[iiiii].boundingBox.vertices);
							//console.log(pd);
						}
					}
				
				}
			}
		  }
		  
		  console.log(svg);
	  });	
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
		//quickstart("./static/img/test.jpg");
		
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
  			fromWS64(base64Data);
  			fs.writeFile("static/img/out3.jpg", base64Data, 'base64', function(err) {
			  console.log(err);
			});
			fs.writeFile("blog/out/strokes3.json", JSON.stringify(dm.strokes), function(err) {
			  console.log(err);
			});
  		}
		
  	});
});


