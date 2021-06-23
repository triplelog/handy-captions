
const https = require('https');
var fs = require("fs");
const zlib = require('zlib');
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const {
  createReadStream,
  createWriteStream
} = require('fs');
var qs = require('querystring');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var crypto = require("crypto");
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/digitizer.fun/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/digitizer.fun/fullchain.pem')
};
const { PerformanceObserver, performance } = require('perf_hooks');

/*const mongoose = require('mongoose');
mongoose.connect('mongodb://45.32.213.227:27017/triplelog', {useNewUrlParser: true});
const User = require('./models/user');
const UserData = require('./models/userdata');*/

var express = require('express');



var app = express();



app.use('/',express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/index.html',{
		
		}));
		res.end();
	}
);
app.get('/index.html', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/index.html',{
		
		}));
		res.end();
	}
);
app.get('/magic.html', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/magic.html',{
		
		}));
		res.end();
	}
);
app.get('/magicmaker', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/magicemoji.html',{
		
		}));
		res.end();
	}
);
app.get('/game', 
	function(req, res) {
		res.write(nunjucks.render('templates/dtzfun.html',{
		
		}));
		res.end();
	}
);


app.post('/save.html', 
	function(req, res) {
		var content = req.body.svg;
		fs.writeFile('saved/'+req.body.name+'.svg', content, err => {
		  if (err) {
			console.error(err)
			return
		  }
		  //file written successfully
		});
		var curves = req.body.curves;
		fs.writeFile('saved/'+req.body.name+'.txt', curves, err => {
		  if (err) {
			console.error(err)
			return
		  }
		  //file written successfully
		});
		res.redirect('/text.html');
	}
);

app.get('/home.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/index.html',{
		
		}));
		res.end();
	}
);

app.get('/memes.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/memes.html',{
		
		}));
		res.end();
	}
);
app.get('/scrims.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/scrims.html',{
		
		}));
		res.end();
	}
);
app.get('/images.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/images.html',{
		
		}));
		res.end();
	}
);
app.get('/text.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/text.html',{
		
		}));
		res.end();
	}
);
app.get('/code.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/code.html',{
		
		}));
		res.end();
	}
);
app.get('/writing.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/writing.html',{
		
		}));
		res.end();
	}
);
app.get('/tooltips.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/tooltips.html',{
		
		}));
		res.end();
	}
);

const server1 = https.createServer(options, app);
server1.listen(12312);









