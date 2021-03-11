
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
var Papa = require('papaparse');
var katex = require('katex');
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/martianmath.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/martianmath.com/fullchain.pem')
};
const { PerformanceObserver, performance } = require('perf_hooks');

/*const mongoose = require('mongoose');
mongoose.connect('mongodb://45.32.213.227:27017/triplelog', {useNewUrlParser: true});
const User = require('./models/user');
const UserData = require('./models/userdata');*/

var express = require('express');



var app = express();



app.use('/',express.static('static'));

app.get('/', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/csshole.html',{
		
		}));
		res.end();
	}
);
app.get('/index.html', 
	
	function(req, res) {
		res.write(nunjucks.render('templates/csshole.html',{
		
		}));
		res.end();
	}
);
console.log('aa',performance.now());
var puzzles = {}
var puzzleTypes = ['daily','easy','medium','hard','expert'];
for (var ii=0;ii<0;ii++ ){//max should be 5
	var daily;
	if (puzzleTypes[ii] == 'daily'){
		puzzles[puzzleTypes[ii]] = {};
		daily = [];
	}
	else {
		puzzles[puzzleTypes[ii]] = [];
	}
	const data = fs.readFileSync('./puzzles/sudoku'+puzzleTypes[ii]+'.txt', 'utf8');

	  var lines = data.split('\n');
	  for (var i=0;i<lines.length;i++){
		var line = lines[i];
		if (line.length == 81){
			if (puzzleTypes[ii] == 'daily'){
				daily.push(line);
			}
			else {
				puzzles[puzzleTypes[ii]].push(line);
				var puzz = makePuzzle(line);
				var gametype = puzzleTypes[ii];
				var id = puzzles[puzzleTypes[ii]].length-1;
				var htmlstr = nunjucks.render('templates/sudokubase.html',{
					puzzle: puzz,
					gametype: puzzleTypes[ii],
					gameid: id,
				});
				fs.writeFileSync("static/html/sudoku/"+gametype+"/"+id+".html", htmlstr);
				
					
				const gzip = createGzip();
				const source = createReadStream("static/html/sudoku/"+gametype+"/"+id+".html");
				const destination = createWriteStream("static/html/sudoku/"+gametype+"/"+id+".html.gz");

				pipeline(source, gzip, destination, (err) => {
				  if (err) {
					console.error('An error occurred:', err);
					process.exitCode = 1;
				  }
				});
				
				//create gzip
				//delete unzipped
			}
			
		}
	  }
	  if (puzzleTypes[ii] == 'daily'){
	  	var w = 0;
	  	for (var y=2020;y<2023;y++){
	  		for (var m=1;m<13;m++){
	  			for (var d=1;d<32;d++){
	  				var da = new Date(m+'/'+d+'/'+y);
	  				if (!isNaN(da.getDate())){
	  					var day = da.getDay();
	  					var puzzle = daily[200*day+(w%200)];
	  					if (day == 0){
	  						w++;
	  					}
	  					
	  					puzzles['daily'][m+'/'+d+'/'+y]=puzzle;
	  					var puzz = makePuzzle(puzzle);
						var gametype = 'daily';
						var id = m+'/'+d+'/'+y;
						var htmlstr = nunjucks.render('templates/sudokubase.html',{
							puzzle: puzz,
							gametype: puzzleTypes[ii],
							gameid: id,
						});
						fs.writeFileSync("static/html/sudoku/"+gametype+"/"+id.replace('/','_').replace('/','_')+".html", htmlstr);
				
					
						const gzip = createGzip();
						const source = createReadStream("static/html/sudoku/"+gametype+"/"+id.replace('/','_').replace('/','_')+".html");
						const destination = createWriteStream("static/html/sudoku/"+gametype+"/"+id.replace('/','_').replace('/','_')+".html.gz");

						pipeline(source, gzip, destination, (err) => {
						  if (err) {
							console.error('An error occurred:', err);
							process.exitCode = 1;
						  }
						});
	  					
	  				}
	  			}
	  		}
	  	}
	  }
}
console.log('bb',performance.now());
puzzles = {};

app.get('/sudoku.html', 
	
	function(req, res) {
		console.log('sudoku',performance.now());
		var puzzle;
		var gametype = 'easy';
		var gameid = 1;
		if (req.query && req.query.l){
			if (req.query.l.substring(0,4) == 'easy'){
				gametype = 'easy';
				gameid = parseInt(req.query.l.substring(4));
				if (isNaN(gameid) || gameid<1){
					res.redirect('../sudoku.html?l=easy1');
					return;
				}
				else if (gameid>81){
					res.redirect('../sudoku.html?l=easy81');
					return;
				}
				console.log('found it',performance.now());
				var raw = fs.createReadStream("static/html/sudoku/easy/"+gameid+".html.gz");
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
			else if (req.query.l.substring(0,6) == 'medium'){
				gametype = 'medium';
				gameid = parseInt(req.query.l.substring(6));
				if (isNaN(gameid) || gameid<1){
					res.redirect('../sudoku.html?l=medium1');
					return;
				}
				else if (gameid>81){
					res.redirect('../sudoku.html?l=medium81');
					return;
				}
				console.log('found it',performance.now());
				var raw = fs.createReadStream("static/html/sudoku/medium/"+gameid+".html.gz");
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
			else if (req.query.l.substring(0,4) == 'hard'){
				gametype = 'hard';
				gameid = parseInt(req.query.l.substring(4));
				if (isNaN(gameid) || gameid<1){
					res.redirect('../sudoku.html?l=hard1');
					return;
				}
				else if (gameid>81){
					res.redirect('../sudoku.html?l=hard81');
					return;
				}
				console.log('found it',performance.now());
				var raw = fs.createReadStream("static/html/sudoku/hard/"+gameid+".html.gz");
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
			else if (req.query.l.substring(0,6) == 'expert'){
				gametype = 'expert';
				gameid = parseInt(req.query.l.substring(6));
				if (isNaN(gameid) || gameid<1){
					res.redirect('../sudoku.html?l=expert1');
					return;
				}
				else if (gameid>81){
					res.redirect('../sudoku.html?l=expert81');
					return;
				}
				console.log('found it',performance.now());
				var raw = fs.createReadStream("static/html/sudoku/expert/"+gameid+".html.gz");
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		}
		else if (req.query && req.query.d){
			gametype = 'daily';
			var d = new Date(req.query.d);
			if (!isNaN(d.getDate())){
				var month = d.getMonth()+1;
				var date = d.getDate();
				var year = d.getYear()+1900;
				d.setDate(d.getDate()-1);
				month = d.getMonth()+1;
				date = d.getDate();
				year = d.getYear()+1900;
				gameid = month+'/'+date+'/'+year;
			}
			else {
				var d = new Date();
				var month = d.getMonth()+1;
				var date = d.getDate();
				var year = d.getYear()+1900;
				d.setDate(d.getDate()-1);
				month = d.getMonth()+1;
				date = d.getDate();
				year = d.getYear()+1900;
				gameid = month+'/'+date+'/'+year;
			}
			
			var raw = fs.createReadStream("static/html/sudoku/daily/"+gameid.replace('/','_').replace('/','_')+".html.gz");
			res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
			raw.pipe(res);
			console.log('sent it',performance.now());
				
			
		}
		else if (req.query && req.query.p){
			var puzzleRaw = req.query.p;
			puzzle = makePuzzle(puzzleRaw);
			res.write(nunjucks.render('templates/sudokubase.html',{
				puzzle: puzzle,
				gametype: gametype,
				gameid: gameid,
			}));
			console.log('sudoku rendered',performance.now());
			res.end();
		}
		else {
			gametype = 'daily';
			var d = new Date();
			var month = d.getMonth()+1;
			var date = d.getDate();
			var year = d.getYear()+1900;
			d.setDate(d.getDate()-1);
			month = d.getMonth()+1;
			date = d.getDate();
			year = d.getYear()+1900;
			gameid = month+'/'+date+'/'+year;
			var raw = fs.createReadStream("static/html/sudoku/daily/"+gameid.replace('/','_').replace('/','_')+".html.gz");
			res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
			raw.pipe(res);
			console.log('sent it',performance.now());
		}
		
	}
);
app.get('/css/sudoku.css', 
	function(req, res) {
		console.log('getting css from server');
		fs.readFile("static/css/sudokucss.css.gz", 'utf8', function(err, fileData) {
			if (err){
				
				const gzip = createGzip();
				const source = createReadStream('static/css/sudokucss.css');
				const destination = createWriteStream('static/css/sudokucss.css.gz');

				pipeline(source, gzip, destination, (err) => {
				  if (err) {
					console.error('An error occurred:', err);
					process.exitCode = 1;
				  }
				    console.log('made css',performance.now());
					var raw = fs.createReadStream("static/css/sudokucss.css.gz");
					res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
					raw.pipe(res);
					console.log('sent it',performance.now());
				});
				
			}
			else {
				console.log('found css',performance.now());
				var raw = fs.createReadStream("static/css/sudokucss.css.gz");
				res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
	}
);

app.get('/city.html', 
	function(req, res) {
		var zi = [ [[1,2,2,4],[1,2,3,6],[3,1,6,2],[3,1,9,3]], [[1,3,2,6],[1,3,3,9],[2,1,4,2],[2,1,6,3]], [[1,2,3,6],[2,4,1,2],[3,1,9,3],[6,2,3,1]], [[1,3,3,9],[2,6,1,3],[2,1,6,3],[4,2,2,1]] ];
		var ziSum = [ [[1,2,2,4],[1,2,3,6],[3,1,6,2],[3,1,9,3]], [[1,3,2,6],[1,3,3,9],[2,1,4,2],[2,1,6,3]], [[1,2,3,6],[2,4,1,2],[3,1,9,3],[6,2,3,1]], [[1,3,3,9],[2,6,1,3],[2,1,6,3],[4,2,2,1]] ];
		var s = 0;
		for (var zii=0; zii<4;zii++){
			for (var ziii=0; ziii<4;ziii++){
				for (var ziiii=0; ziiii<4;ziiii++){
					ziSum[zii][ziii][ziiii] = s;
					s += zi[zii][ziii][ziiii];
				}
			}
		}
		

		res.write(nunjucks.render('templates/cells.html',{
			zi: zi,
			ziSum: ziSum
		}));
		res.end();
	}
);

app.get('/emap.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/emap.html',{
		
		}));
		res.end();
	}
);
app.get('/home.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/basehome.html',{
		
		}));
		res.end();
	}
);
app.get('/tloghome.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/tloghome.html',{
		
		}));
		res.end();
	}
);
app.get('/handy.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/handy.html',{
		
		}));
		res.end();
	}
);

function makePuzzle(puzzleRaw) {
	var puzzle = [];
	for (var i=0;i<9;i++){
		var row = [];
		for (var ii=0;ii<9;ii++){
			if ('123456789'.indexOf(puzzleRaw[i*9+ii]) == -1){
				row.push(0);
			}
			else {
				row.push(parseInt(puzzleRaw[i*9+ii]));
			}
		}
		puzzle.push(row);
	}
	return puzzle;
}
app.get('/sudokufarm.html', 
	
	function(req, res) {
		console.log('bsfarm',performance.now());
		var rand = Math.floor(Math.random()*100);
		rand = 9;
		fs.readFile("static/html/sudokufarm/"+rand+".html.gz", 'utf8', function(err, fileData) {
			if (err){
				itemPerThing = [[0,0,0,0,0,0,0,0,0],[21,16,3,0,0,10,30,15,6],[0,0,0,30,0,0,0,0,0],[0,0,0,0,0,3,0,15,24],[10,10,10,0,0,0,0,0,0],[0,0,0,0,15,2,0,0,0],[5,0,13,0,0,0,0,0,0]]
				spendPerThing = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[1,1,1,0,0,0,5,5,5],[20,10,10,0,0,0,0,0,0],[0,0,0,0,0,0,10,10,10],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]]
				var params = {
					startFood: 200,
					startWater: 200,
					startFeed: 200,
					startPoop: 200,
					startFire: 200,
					startClothes: 200,

					startPeople:  12,
					maxTurns:  45,
					puzzle:  [[0, 0, 4, 0, 0, 0, 7, 8, 0], [8, 9, 3, 6, 2, 0, 0, 1, 0], [7, 0, 0, 0, 0, 4, 0, 9, 2], [0, 0, 6, 0, 8, 0, 0, 5, 0], [0, 8, 0, 5, 0, 1, 0, 3, 0], [0, 5, 0, 0, 7, 0, 9, 0, 0], [6, 0, 0, 2, 0, 0, 0, 4, 1], [0, 3, 0, 0, 6, 5, 0, 7, 9], [0, 1, 8, 0, 4, 0, 2, 0, 0]],
					existingPlots:  [4, 4, 3, 4, 4, 4, 4, 5, 4],
					maxPlots:  [5, 5, 6, 5, 5, 5, 5, 4, 5],
					winpuzzle:  [[1, 2, 4, 9, 5, 3, 7, 8, 6], [8, 9, 3, 6, 2, 7, 4, 1, 5], [7, 6, 5, 8, 1, 4, 3, 9, 2], [9, 4, 6, 3, 8, 2, 1, 5, 7], [2, 8, 7, 5, 9, 1, 6, 3, 4], [3, 5, 1, 4, 7, 6, 9, 2, 8], [6, 7, 9, 2, 3, 8, 5, 4, 1], [4, 3, 2, 1, 6, 5, 8, 7, 9], [5, 1, 8, 7, 4, 9, 2, 6, 3]],

				}
				params.itemPerThing = [[0,0,0,0,0,0,0,0,0],[21,16,3,0,0,10,30,15,6],[0,0,0,30,0,0,0,0,0],[0,0,0,0,0,3,0,15,24],[10,10,10,0,0,0,0,0,0],[0,0,0,0,15,2,0,0,0],[5,0,13,0,0,0,0,0,0]];
				params.spendPerThing = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[1,1,1,0,0,0,5,5,5],[20,10,10,0,0,0,0,0,0],[0,0,0,0,0,0,10,10,10],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]];
				params.spendPerPerson = [0,30,3,0,0,5,5];
				params.initFood = 0;
				for (var i=0;i<9;i++){
					params.initFood += itemPerThing[1][i]*params.existingPlots[i]-spendPerThing[1][i]*params.existingPlots[i];
				}
				params.initWater = 0;
				for (var i=0;i<9;i++){
					params.initWater += itemPerThing[2][i]*params.existingPlots[i]-spendPerThing[2][i]*params.existingPlots[i];
				}
				params.initFeed = 0;
				for (var i=0;i<9;i++){
					params.initFeed += itemPerThing[3][i]*params.existingPlots[i]-spendPerThing[3][i]*params.existingPlots[i];
				}
				params.initPoop = 0;
				for (var i=0;i<9;i++){
					params.initPoop += itemPerThing[4][i]*params.existingPlots[i]-spendPerThing[4][i]*params.existingPlots[i];
				}
				params.initFire = 0;
				for (var i=0;i<9;i++){
					params.initFire += itemPerThing[5][i]*params.existingPlots[i]-spendPerThing[5][i]*params.existingPlots[i];
				}
				params.initClothes = 0;
				for (var i=0;i<9;i++){
					params.initClothes += itemPerThing[6][i]*params.existingPlots[i]-spendPerThing[6][i]*params.existingPlots[i];
				}
				var htmlstr = nunjucks.render('templates/sudokufarmmin.html', params);
				
				console.log('rendered it',performance.now());
				fs.writeFile("static/html/sudokufarm/"+rand+".html", htmlstr, function(err, fileData) {
					console.log('wrote it',performance.now(), err);
					const gzip = createGzip();
					const source = createReadStream("static/html/sudokufarm/"+rand+".html");
					const destination = createWriteStream("static/html/sudokufarm/"+rand+".html.gz");

					pipeline(source, gzip, destination, (err) => {
					  if (err) {
						console.error('An error occurred:', err);
						process.exitCode = 1;
					  }
					});
				});
				res.write(htmlstr);
				console.log('sent it',performance.now());
				res.end();
			}
			else {
				
				console.log('found it',performance.now());
				var raw = fs.createReadStream("static/html/sudokufarm/"+rand+".html.gz");
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
			
	}
);
app.get('/css/sudokufarm.css', 
	function(req, res) {
		console.log('getting css from server');
		fs.readFile("static/css/sudokufarmcss.css.gz", 'utf8', function(err, fileData) {
			if (err){
				
				const gzip = createGzip();
				const source = createReadStream('static/css/sudokufarmcss.css');
				const destination = createWriteStream('static/css/sudokufarmcss.css.gz');

				pipeline(source, gzip, destination, (err) => {
				  if (err) {
					console.error('An error occurred:', err);
					process.exitCode = 1;
				  }
				    console.log('made css',performance.now());
					var raw = fs.createReadStream("static/css/sudokufarmcss.css.gz");
					res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
					raw.pipe(res);
					console.log('sent it',performance.now());
				});
				
			}
			else {
				console.log('found css',performance.now());
				var raw = fs.createReadStream("static/css/sudokufarmcss.css.gz");
				res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
	}
);

app.get('/mathquiz.html', 
	
	function(req, res) {
		console.log('bkatex',performance.now());
		var rand = Math.floor(Math.random()*100);
		rand = 7;
		fs.readFile("static/html/mathquiz/"+rand+".html.gz", 'utf8', function(err, fileData) {
			if (err){
				var nlevels = 16;
				var denoms = [1,2,3,4,6];
				var questions = [];
				for (var id=1;id<11;id++){
					var funcs = [];
					if (Math.random() < .5){funcs.push('sin'); funcs.push('cos'); funcs.push('tan');}
					else {funcs.push('cos'); funcs.push('sin'); funcs.push('tan');}
			
					if (Math.random() < .5){funcs.push('sin'); funcs.push('cos'); funcs.push('tan');}
					else {funcs.push('cos'); funcs.push('sin'); funcs.push('tan');}
			
					if (Math.random() < .34){funcs.push('sec'); funcs.push('csc'); funcs.push('cot');}
					else if (Math.random() < .5){funcs.push('csc'); funcs.push('sec'); funcs.push('cot');}
					else {funcs.push('cot'); funcs.push('sec'); funcs.push('csc');}
			
					if (Math.random() < .34){funcs.push('sin'); funcs.push('cos'); funcs.push('tan');}
					else if (Math.random() < .5){funcs.push('cos'); funcs.push('sin'); funcs.push('tan');}
					else {funcs.push('tan'); funcs.push('sin'); funcs.push('cos');}
			
					if (Math.random() < .34){funcs.push('sec'); funcs.push('csc'); funcs.push('cot');}
					else if (Math.random() < .5){funcs.push('csc'); funcs.push('sec'); funcs.push('cot');}
					else {funcs.push('cot'); funcs.push('sec'); funcs.push('csc');}
			
					if (Math.random() < .5){funcs.push('sin'); funcs.push('cos');}
					else {funcs.push('cos'); funcs.push('sin');}
			
					var hturns = [0,0,0,1,1,1];
					if (Math.random() < .34){hturns.push(0); hturns.push(1); hturns.push(1);}
					else if (Math.random() < .5){hturns.push(1); hturns.push(0); hturns.push(1);}
					else {hturns.push(0); hturns.push(1); hturns.push(0);}
			
					if (Math.random() < .34){hturns.push(2); hturns.push(4); hturns.push(-1);}
					else if (Math.random() < .5){hturns.push(5); hturns.push(2); hturns.push(-2);}
					else {hturns.push(-1); hturns.push(3); hturns.push(4);}
			
					if (Math.random() < .34){hturns.push(4); hturns.push(-3); hturns.push(7);}
					else if (Math.random() < .5){hturns.push(6); hturns.push(5); hturns.push(-4);}
					else {hturns.push(-6); hturns.push(-3); hturns.push(7);}
			
					if (Math.random() < .34){hturns.push(9); hturns.push(-8);}
					else if (Math.random() < .5){hturns.push(-9); hturns.push(8);}
					else {hturns.push(8); hturns.push(-9);}
			
					for (var level=0;level<nlevels+1;level++){
						var question = {'id':id,'level':level};
						var f = funcs[level];
						var d = denoms[Math.floor(Math.random()*5)];
						var n = 1;
						if (d == 1 || d==3 || d ==4 || d==6){
							if (Math.random()<.5){n = d-1;}
						}
						n = n + d*hturns[level];
						//move a to different quadrant
				
						var q = katex.renderToString("\\text{What is }\\"+f+"{\\left(\\frac{"+n+"\\pi}{"+d+"}\\right)}\\text{?}", {throwOnError: false});
						if (n == 0){
							q = katex.renderToString("\\text{What is }\\"+f+"{(0)}\\text{?}", {throwOnError: false});
						}
						else if (d == 1){
							if (n == 1){
								q = katex.renderToString("\\text{What is }\\"+f+"{(\\pi)}\\text{?}", {throwOnError: false});
							}
							else if (n == -1){
								q = katex.renderToString("\\text{What is }\\"+f+"{(-\\pi)}\\text{?}", {throwOnError: false});
							}
							else {
								q = katex.renderToString("\\text{What is }\\"+f+"{("+n+"\\pi)}\\text{?}", {throwOnError: false});
							}
						}
						else {
							if (n == 1){
								q = katex.renderToString("\\text{What is }\\"+f+"{\\left(\\frac{\\pi}{"+d+"}\\right)}\\text{?}", {throwOnError: false});
							}
							if (n == -1){
								q = katex.renderToString("\\text{What is }\\"+f+"{\\left(\\frac{-\\pi}{"+d+"}\\right)}\\text{?}", {throwOnError: false});
							}
						}
				
						var a = '1/2';
						var s = 1;
						if (f == 'sin'){
							if (d == 1){a = '0';}
							else {
								if (d == 6){a = '1/2';}
								if (d == 4){a = 'sqrt2/2';}
								if (d == 3){a = 'sqrt3/2';}
								if (d == 2){a = '1';}
					
								if (n < 0){n *= -1; s = -1;}
								n = n % (2 * d);
								if (n > d){s *= -1;}
								if (s<0){a = '-'+a;}
							}
						}
						else if (f == 'cos'){
							if (d == 2){a = '0';}
							else {
								if (d == 3){a = '1/2';}
								if (d == 4){a = 'sqrt2/2';}
								if (d == 6){a = 'sqrt3/2';}
								if (d == 1){a = '1';}
					
								if (n < 0){n *= -1;}
								n = n % (2 * d);
								if (n > d/2 && n < 3*d/2){s *= -1;}
								if (s<0){a = '-'+a;}
							}
						}
						else if (f == 'tan'){
							if (d == 1){a = '0';}
							else if (d == 2){a = 'und';}
							else {
								if (d == 3){a = 'sqrt3';}
								if (d == 4){a = '1';}
								if (d == 6){a = '1/sqrt3';}
					
								if (n < 0){n *= -1; s = -1;}
								n = n % (2 * d);
								if (n > d/2 && n < d){s *= -1;}
								else if (n > 3*d/2 && n < 2*d){s *= -1;}
								if (s<0){a = '-'+a;}
							}
						}
						else if (f == 'cot'){
							if (d == 1){a = 'und';}
							else if (d == 2){a = '0';}
							else {
								if (d == 3){a = '1/sqrt3';}
								if (d == 4){a = '1';}
								if (d == 6){a = 'sqrt3';}
					
								if (n < 0){n *= -1; s = -1;}
								n = n % (2 * d);
								if (n > d/2 && n < d){s *= -1;}
								else if (n > 3*d/2 && n < 2*d){s *= -1;}
								if (s<0){a = '-'+a;}
							}
						}
						else if (f == 'sec'){
							if (d == 2){a = 'und';}
							else {
								if (d == 3){a = '2';}
								if (d == 4){a = 'sqrt2';}
								if (d == 6){a = '2/sqrt3';}
								if (d == 1){a = '1';}
					
								if (n < 0){n *= -1;}
								n = n % (2 * d);
								if (n > d/2 && n < 3*d/2){s *= -1;}
								if (s<0){a = '-'+a;}
							}
						}
						else if (f == 'csc'){
							if (d == 1){a = 'und';}
							else {
								if (d == 6){a = '2';}
								if (d == 4){a = 'sqrt2';}
								if (d == 3){a = '2/sqrt3';}
								if (d == 2){a = '1';}
					
								if (n < 0){n *= -1; s = -1;}
								n = n % (2 * d);
								if (n > d){s *= -1;}
								if (s<0){a = '-'+a;}
							}
						}
						if (a == 'sqrt3/2'){a = 'sqrt\\(3\\)/2|sqrt3/2|root\\(3\\)/2|root3/2';}
						if (a == 'sqrt2/2'){a = 'sqrt\\(2\\)/2|sqrt2/2|root\\(2\\)/2|root2/2';}
						if (a == '-sqrt3/2'){a = '-sqrt\\(3\\)/2|-sqrt3/2|-root\\(3\\)/2|-root3/2';}
						if (a == '-sqrt2/2'){a = '-sqrt\\(2\\)/2|-sqrt2/2|-root\\(2\\)/2|-root2/2';}
						if (a == '1/sqrt3'){a = '1/sqrt\\(3\\)|1/sqrt3|1/root3|1/root\\(3\\)|sqrt(3)/3|sqrt3/3|root\\(3\\)/3|root3/3';}
						if (a == 'sqrt3'){a = 'sqrt\\(3\\)|sqrt3|root3|root\\(3\\)';}
						if (a == '-1/sqrt3'){a = '-1/sqrt\\(3\\)|-1/sqrt3|-1/root3|-1/root\\(3\\)|-sqrt(3)/3|-sqrt3/3|-root\\(3\\)/3|-root3/3';}
						if (a == '-sqrt3'){a = '-sqrt\\(3\\)|-sqrt3|-root3|-root\\(3\\)';}
						if (a == '2/sqrt3'){a = '2/sqrt\\(3\\)|2/sqrt3|2/root3|2/root\\(3\\)|2sqrt(3)/3|2sqrt3/3|2root\\(3\\)/3|2root3/3|2\*sqrt(3)/3|2\*sqrt3/3|2\*root\\(3\\)/3|2\*root3/3';}
						if (a == 'sqrt2'){a = 'sqrt\\(2\\)|sqrt2|root2|root\\(2\\)';}
						if (a == '-2/sqrt3'){a = '-2/sqrt\\(3\\)|-2/sqrt3|-2/root3|-2/root\\(3\\)|-2sqrt(3)/3|-2sqrt3/3|-2root\\(3\\)/3|-2root3/3|-2\*sqrt(3)/3|-2\*sqrt3/3|-2\*root\\(3\\)/3|-2\*root3/3';}
						if (a == '-sqrt2'){a = '-sqrt\\(2\\)|-sqrt2|-root2|-root\\(2\\)';}
						if (a == 'und'){a = 'undefined|und';}
						if (a == '2'){a = '2|two';}
						if (a == '1'){a = '1|one';}
						if (a == '0'){a = '0|zero';}
				
						question['question'] = q;
						question['answer'] = a;
						questions.push(question);
					}
				}
				console.log('akatex',performance.now());
				var nturns= 16;
				var halfnturns = 8;
				var nangles = 16;
				var angles= [{"points": "184,76 184,-76", "numer": 0, "denom": 1, "needle": "200,0"},{"points": "199,-17 147,-135", "numer": 1, "denom": 6, "needle": "179,-88"},{"points": "173,-99 100,-173", "numer": 1, "denom": 4, "needle": "141,-141"},{"points": "135,-147 17,-199", "numer": 1, "denom": 3, "needle": "88,-179"},{"points": "76,-184 -76,-184", "numer": 1, "denom": 2, "needle": "0,-199"},{"points": "-17,-199 -135,-147", "numer": 2, "denom": 3, "needle": "-88,-179"},{"points": "-99,-173 -173,-100", "numer": 3, "denom": 4, "needle": "-141,-141"},{"points": "-147,-135 -199,-17", "numer": 5, "denom": 6, "needle": "-179,-88"},{"points": "-184,-76 -184,76", "numer": 1, "denom": 1, "needle": "-199,0"},{"points": "-199,17 -147,135", "numer": 7, "denom": 6, "needle": "-179,88"},{"points": "-173,99 -100,173", "numer": 5, "denom": 4, "needle": "-141,141"},{"points": "-135,147 -17,199", "numer": 4, "denom": 3, "needle": "-88,179"},{"points": "-76,184 76,184", "numer": 3, "denom": 2, "needle": "0,199"},{"points": "17,199 135,147", "numer": 5, "denom": 3, "needle": "88,179"},{"points": "99,173 173,100", "numer": 7, "denom": 4, "needle": "141,141"},{"points": "147,135 199,17", "numer": 11, "denom": 6, "needle": "179,88"}]
				var katexangles = {};
				for(var angle=0;angle<angles.length;angle++){
			
					var d = angles[angle].denom;
					for (var turn=1;turn<nturns+1;turn++){
						var n = angles[angle].numer + (turn - halfnturns) * (2*d);
						var q = katex.renderToString("\\frac{"+n+"\\pi}{"+d+"}", {throwOnError: false});
						if (n == 0){
							q = katex.renderToString("0", {throwOnError: false});
						}
						else if (d == 1){
							if (n == 1){
								q = katex.renderToString("\\pi", {throwOnError: false});
							}
							else if (n == -1){
								q = katex.renderToString("-\\pi", {throwOnError: false});
							}
							else {
								q = katex.renderToString(n+"\\pi", {throwOnError: false});
							}
						}
						else {
							if (n == 1){
								q = katex.renderToString("\\frac{\\pi}{"+d+"}", {throwOnError: false});
							}
							if (n == -1){
								q = katex.renderToString("\\frac{-\\pi}{"+d+"}", {throwOnError: false});
							}
						}
						if (katexangles[n]){
							katexangles[n][d]=q;
						}
						else {
							katexangles[n]= {};
							katexangles[n][d]=q;
						}
				
					}
			
				}

				var htmlstr = nunjucks.render('templates/mathquizbase.html',{
					nlevels: nlevels,
					questions: questions,
					type: "trig",
					nturns:nturns,
					nangles:nangles,
					angles:angles,
					katexangles:katexangles,
				});
					
				console.log('rendered it',performance.now());
				fs.writeFile("static/html/mathquiz/"+rand+".html", htmlstr, function(err, fileData) {
					console.log('wrote it',performance.now(), err);
					const gzip = createGzip();
					const source = createReadStream("static/html/mathquiz/"+rand+".html");
					const destination = createWriteStream("static/html/mathquiz/"+rand+".html.gz");

					pipeline(source, gzip, destination, (err) => {
					  if (err) {
						console.error('An error occurred:', err);
						process.exitCode = 1;
					  }
					});
				});
				res.write(htmlstr);
				console.log('sent it',performance.now());
				res.end();
			}
			else {
				
				console.log('found it',performance.now());
				var raw = fs.createReadStream("static/html/mathquiz/"+rand+".html.gz");
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
			
	}
);
app.get('/css/mathquiz.css', 
	function(req, res) {
		console.log('getting css from server');
		fs.readFile("static/css/mathquizcss.css.gz", 'utf8', function(err, fileData) {
			if (err){
				var nlevels = 16;
				var denoms = [1,2,3,4,6];
				var questions = [];
				for (var id=1;id<11;id++){
			
					for (var level=0;level<nlevels+1;level++){
						var question = {'id':id,'level':level};
						questions.push(question);
					}
				}
				var nturns= 16;
				var halfnturns = 8;
				var nangles = 16;
				var angles= [{"points": "184,76 184,-76", "numer": 0, "denom": 1, "needle": "200,0"},{"points": "199,-17 147,-135", "numer": 1, "denom": 6, "needle": "179,-88"},{"points": "173,-99 100,-173", "numer": 1, "denom": 4, "needle": "141,-141"},{"points": "135,-147 17,-199", "numer": 1, "denom": 3, "needle": "88,-179"},{"points": "76,-184 -76,-184", "numer": 1, "denom": 2, "needle": "0,-199"},{"points": "-17,-199 -135,-147", "numer": 2, "denom": 3, "needle": "-88,-179"},{"points": "-99,-173 -173,-100", "numer": 3, "denom": 4, "needle": "-141,-141"},{"points": "-147,-135 -199,-17", "numer": 5, "denom": 6, "needle": "-179,-88"},{"points": "-184,-76 -184,76", "numer": 1, "denom": 1, "needle": "-199,0"},{"points": "-199,17 -147,135", "numer": 7, "denom": 6, "needle": "-179,88"},{"points": "-173,99 -100,173", "numer": 5, "denom": 4, "needle": "-141,141"},{"points": "-135,147 -17,199", "numer": 4, "denom": 3, "needle": "-88,179"},{"points": "-76,184 76,184", "numer": 3, "denom": 2, "needle": "0,199"},{"points": "17,199 135,147", "numer": 5, "denom": 3, "needle": "88,179"},{"points": "99,173 173,100", "numer": 7, "denom": 4, "needle": "141,141"},{"points": "147,135 199,17", "numer": 11, "denom": 6, "needle": "179,88"}]
				var katexangles = {};
				for(var angle=0;angle<angles.length;angle++){
			
					var d = angles[angle].denom;
					for (var turn=1;turn<nturns+1;turn++){
						var n = angles[angle].numer + (turn - halfnturns) * (2*d);
						var q = katex.renderToString("\\frac{"+n+"\\pi}{"+d+"}", {throwOnError: false});
						if (n == 0){
							q = katex.renderToString("0", {throwOnError: false});
						}
						else if (d == 1){
							if (n == 1){
								q = katex.renderToString("\\pi", {throwOnError: false});
							}
							else if (n == -1){
								q = katex.renderToString("-\\pi", {throwOnError: false});
							}
							else {
								q = katex.renderToString(n+"\\pi", {throwOnError: false});
							}
						}
						else {
							if (n == 1){
								q = katex.renderToString("\\frac{\\pi}{"+d+"}", {throwOnError: false});
							}
							if (n == -1){
								q = katex.renderToString("\\frac{-\\pi}{"+d+"}", {throwOnError: false});
							}
						}
						if (katexangles[n]){
							katexangles[n][d]=q;
						}
						else {
							katexangles[n]= {};
							katexangles[n][d]=q;
						}
				
					}
			
				}

				
				var cssstr = nunjucks.render('templates/mathquizcss.html',{
					nlevels: nlevels,
					questions: questions,
					type: "trig",
					nturns:nturns,
					nangles:nangles,
					angles:angles,
					katexangles:katexangles,
					
				});
				fs.writeFile("static/css/mathquizcss.css", cssstr, function(err, fileData) {
					const gzip = createGzip();
					const source = createReadStream('static/css/mathquizcss.css');
					const destination = createWriteStream('static/css/mathquizcss.css.gz');

					pipeline(source, gzip, destination, (err) => {
					  if (err) {
						console.error('An error occurred:', err);
						process.exitCode = 1;
					  }
					});
					
				});
				res.writeHead(200, {'Content-Type': 'text/css'});
				res.write(cssstr);
				res.end();
			}
			else {
				console.log('found css',performance.now());
				var raw = fs.createReadStream("static/css/mathquizcss.css.gz");
				res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
	}
);

/*
app.get('/chart.html', 
	
	function(req, res) {
		console.log(performance.now());
		const file = fs.createReadStream("static/data/Batting.csv");
		var pid = 'suzukic01';
		fs.readFile("static/data/Batting.csv", 'utf8', function(err, fileData) {
			var results = Papa.parse(fileData, {
				delimiter: ",",
				skipEmptyLines: true,
			});
			var years = [];
			for (var i=0;i<results.data.length;i++){
				if (results.data[i][0] == pid && parseInt(results.data[i][2]) == 1){
					years.push({'year':parseInt(results.data[i][1]),'outs':parseInt(results.data[i][6])-parseInt(results.data[i][8]),'hits':parseInt(results.data[i][8])})
				}
			}
			res.write(nunjucks.render('templates/division.html',{
				years: years,
			}));
			res.end();
		});
	}
);*/

app.get('/sortable.html', 
	
	function(req, res) {
		console.log(performance.now());
		var dataset = 'yearsBatters/2019.csv';
		var widecols = [13,14,15,16,17,18];
		var isPitchers = false;
		var minstat = 'PA';
		if (req.query){
			if (req.query.p === true || req.query.p == 't' || req.query.p == 'true'){
				dataset = 'yearsPitchers/';
				widecols = [3,13,14,15,16,17];
				isPitchers = true;
				minstat = 'IP';
			}
			else {
				dataset = 'yearsBatters/';
			}
			if (req.query.y && req.query.y >1870 && req.query.y<2020){
				dataset += req.query.y;
			}
			else if (req.query.y && req.query.y <=1870){
				dataset += 1871;
			}
			else{
				dataset += 2019;
			}
			dataset += '.csv';
		}
		var htmlname = dataset.replace('.csv','.html');
		console.log(htmlname);
		fs.readFile("static/html/"+htmlname+'.gz', 'utf8', function(err, fileData) {
			if (err){
				console.log('no file',performance.now());
				fs.readFile("static/data/"+dataset, 'utf8', function(err, fileData) {
					var results = Papa.parse(fileData, {
						delimiter: ",",
						skipEmptyLines: true,
					});
					var nrows = results.data.length-1;
					//var nrows = 1000;
					var header = results.data[0];
					if (isPitchers){header[14]='<span style="white-space:nowrap"><input type="checkbox" id="footnote" style="display:none;"></input><label for="footnote" id="footnoteLabel">~</label><div id="footnoteDiv">~FIP has the same formula as FIP but uses expected IP instead of actual IP. Expected IP is based on batters faced, balls in play, and strikeouts.</div>FIP</span>';}
					var ncols = results.data[0].length;
					var content = results.data.slice(1,nrows+1);
					content = content.slice().sort(function(a,b) { return sortContent(a,b,3,isPitchers);})
					var minList = [];
					for (var i=0;i<content.length;i++){
				
				
						if (isPitchers){
							var IPouts = parseInt(content[i][3]);
							if (IPouts%3 == 0) { content[i][3] = Math.floor(IPouts/3); }
							else if (IPouts%3 == 1) { content[i][3] = Math.floor(IPouts/3) + '<span class="frac">&frac13;</span>'; }
							else if (IPouts%3 == 2) { content[i][3] = Math.floor(IPouts/3) + '<span class="frac">&frac23;</span>'; }
							var x = Math.floor(IPouts/3);
							if (x< 10){
								minList.push('min-100 min-10 min-'+(x+1))
							}
							else if (x<100){
								minList.push('min-100 min-'+(parseInt(x/10)+1)+'0 min-'+(x+1))
							}
							else if (x<1000){
								minList.push('min-'+(parseInt(x/100)+1)+'00 min-'+(parseInt(x/10)+1)+'0 min-'+(x+1))
							}
						}
						else {
							var x = parseInt(content[i][3]);
							if (x< 10){
								minList.push('min-100 min-10 min-'+(x+1))
							}
							else if (x<100){
								minList.push('min-100 min-'+(parseInt(x/10)+1)+'0 min-'+(x+1))
							}
							else if (x<1000){
								minList.push('min-'+(parseInt(x/100)+1)+'00 min-'+(parseInt(x/10)+1)+'0 min-'+(x+1))
							}
						}
				
						content[i].push(i);
					}
			
				
					console.log(performance.now());
					var showrows = nrows;
					//sort content
					var order = [];
					for (var i=0;i<ncols;i++){
						var thiscol= [];
						var sorted = content.slice().sort(function(a,b) { return sortContent(a,b,i,isPitchers);})
						for (var ii=0;ii<content.length;ii++){
							for (var iii=0;iii<showrows;iii++){
								if ( sorted[iii][ncols] == ii){
									thiscol.push(iii+1);
									break;
								}
								if ( sorted[content.length-1-iii][ncols] == ii){
									thiscol.push(content.length-1-iii+1);
									break;
								}
								if (iii==showrows*5-1){ //no match in top x rows
									thiscol.push(-1);
								}
							}
						}
						order.push(thiscol);
					}
			
					console.log('ordered it',performance.now());
					var htmlstr = nunjucks.render('templates/sortable.html',{
						title: "Sortable Table",
						ncols: ncols,
						nrows: nrows,
						order: order,
						content: content,
						header: header,
						minList: minList,
						isPitchers: isPitchers,
						minstat: minstat,
					});
					console.log('rendered it',performance.now());
					fs.writeFile("static/html/"+htmlname, htmlstr, function(err, fileData) {
						console.log('wrote it',performance.now(), err);
						const gzip = createGzip();
						const source = createReadStream("static/html/"+htmlname);
						const destination = createWriteStream("static/html/"+htmlname+'.gz');

						pipeline(source, gzip, destination, (err) => {
						  if (err) {
							console.error('An error occurred:', err);
							process.exitCode = 1;
						  }
						});
					});
					res.write(htmlstr);
					console.log('sent it',performance.now());
					res.end();
				});
			}
			else {
				console.log('found it',performance.now());
				var raw = fs.createReadStream("static/html/"+htmlname+'.gz');
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
		
		
	}
);
app.get('/css/sortablePitchers.css', 
	function(req, res) {
		console.log('getting css from server');
		fs.readFile("static/css/sortableP.css.gz", 'utf8', function(err, fileData) {
			if (err){
				var widecols = [3,13,14,15,16,17];
				var ncols = 18;
				var cssstr = nunjucks.render('templates/sortablecss.html',{
					ncols: ncols,
					widecols: widecols,
				});
				fs.writeFile("static/css/sortableP.css", cssstr, function(err, fileData) {
					const gzip = createGzip();
					const source = createReadStream('static/css/sortableP.css');
					const destination = createWriteStream('static/css/sortableP.css.gz');

					pipeline(source, gzip, destination, (err) => {
					  if (err) {
						console.error('An error occurred:', err);
						process.exitCode = 1;
					  }
					});
					
				});
				res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
				res.write(cssstr);
				res.end();
			}
			else {
				console.log('found css',performance.now());
				var raw = fs.createReadStream("static/css/sortableP.css.gz");
				res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
	}
);
app.get('/css/sortableBatters.css', 
	function(req, res) {
		console.log('getting css from server');
		fs.readFile("static/css/sortableB.css.gz", 'utf8', function(err, fileData) {
			if (err){
				var widecols = [13,14,15,16,17,18];
				var ncols = 19;
				var cssstr = nunjucks.render('templates/sortablecss.html',{
					ncols: ncols,
					widecols: widecols,
				});
				fs.writeFile("static/css/sortableB.css", cssstr, function(err, fileData) {
					const gzip = createGzip();
					const source = createReadStream('static/css/sortableB.css');
					const destination = createWriteStream('static/css/sortableB.css.gz');

					pipeline(source, gzip, destination, (err) => {
					  if (err) {
						console.error('An error occurred:', err);
						process.exitCode = 1;
					  }
					});
					
				});
				res.writeHead(200, {'Content-Type': 'text/css'});
				res.write(cssstr);
				res.end();
			}
			else {
				console.log('found css',performance.now());
				var raw = fs.createReadStream("static/css/sortableB.css.gz");
				res.writeHead(200, {'Content-Type': 'text/css', 'Content-Encoding': 'gzip'});
				raw.pipe(res);
				console.log('sent it',performance.now());
			}
		});
	}
);
function sortContent(a,b,i,p=false) {
	if (p && i==3){
		var ai = parseInt(a[i]);
		var bi = parseInt(b[i]);
		if (a[i] != ai && a[i].indexOf('&frac13;') > -1){
			ai+=.3
		}
		else if (a[i] != ai){
			ai+=.6
		}
		if (b[i] != bi && b[i].indexOf('&frac13;') > -1){
			bi+=.3
		}
		else if (b[i] != bi){
			bi+=.6
		}
		return bi - ai;
	}
	else if (i < 2) {
		return b[i].localeCompare(a[i]);
	}
	else {
		return b[i] - a[i];
	}
	
}
console.log('cc',performance.now());
const server1 = https.createServer(options, app);
console.log('dd',performance.now());
server1.listen(1337);
console.log('ee',performance.now());









