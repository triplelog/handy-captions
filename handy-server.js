
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

function pathToPoints(path) {
	path = path.replace(/,/g," ");
	path = path.replace(/M /g,"M");
	path = path.replace(/ M/g,"M");
	path = path.replace(/M/g," M ");
	path = path.replace(/Z /g,"Z");
	path = path.replace(/ Z/g,"Z");
	path = path.replace(/Z/g," Z ");
	path = path.trim();
	var pSplit = path.split(" ").slice(1);
	if (pSplit[pSplit.length-1] == "Z" || pSplit[pSplit.length-1] == "z"){
		pSplit.splice(pSplit.length-1,1);
		pSplit.push(pSplit[0]);
		pSplit.push(pSplit[1]);
	}
	else if (pSplit[pSplit.length-2] != pSplit[0] || pSplit[pSplit.length-1] != pSplit[1]){
		pSplit.push(pSplit[0]);
		pSplit.push(pSplit[1]);
	}
	
	var points = [];
	var box = {top:0,bottom:0,left:0,right:0};
	var d = 0;
	var lp = [];
	for (var i=0;i<pSplit.length/2;i++){
		var point = [parseFloat(pSplit[2*i]),parseFloat(pSplit[2*i+1])];
		if (i==0){
			box.top=point[1];
			box.bottom=point[1];
			box.left=point[0];
			box.right=point[0];
		}
		else {
			d += Math.pow(Math.pow(point[0]-lp[0],2)+Math.pow(point[1]-lp[1],2),0.5);
			if (point[1]<box.bottom) {
				box.bottom=point[1];
			}
			if (point[1]>box.top) {
				box.top=point[1];
			}
			if (point[0]<box.left) {
				box.left=point[0];
			}
			if (point[0]>box.right) {
				box.right=point[0];
			}
		}
		points.push(point);
		lp = point;
	}
	var width = (box.right-box.left)/(box.top-box.bottom)*100;
	
	for (var i=0;i<points.length;i++){
		points[i][0]=(points[i][0]-box.left)/(box.right-box.left)*width;
		points[i][1]=(points[i][1]-box.bottom)/(box.top-box.bottom)*100;
	}
	return [points,width,d];
}

var jsonShapes = {'full':"M 0,0 0,100 100,100 100,0"};
var shapes = fs.readFileSync('./shapes/stateborders.csv', 'utf8').split("\r");
//console.log(shapes[0]);
for (var i=1;i<shapes.length;i++){
	var sp = shapes[i].split(",");
	if (sp.length < 4){continue;}

	var paths = [];
	var path = "";
	for (var ii=0;ii<sp[3].length;ii++){
		if (sp[3][ii]=="M"){
			if (path.length > 0){
				paths.push(path);
			}
			path = "M";
		}
		else {
			path += sp[3][ii];
		}
	}
	if (path.length > 0){
		paths.push(path);
	}
	var path = "";
	for (var ii=0;ii<paths.length;ii++){
		if (paths[ii].length > path.length){
			path = paths[ii];
		}
	}
	jsonShapes[sp[1]]=path;
}

shapes = fs.readFileSync('./shapes/europeborders.csv', 'utf8').split("\r");
//console.log(shapes[0]);
for (var i=1;i<shapes.length;i++){
	var sp = shapes[i].split(",");
	if (sp.length < 6){continue;}

	var paths = [];
	
	for (var iii=5;iii<sp.length;iii++){
		var path = "";
		for (var ii=0;ii<sp[iii].length;ii++){
			if (sp[iii][ii]=="M"){
				if (path.length > 0){
					paths.push(path);
				}
				path = "M";
			}
			else {
				path += sp[iii][ii];
			}
		}
		if (path.length > 0){
			paths.push(path);
		}
	}
	
	var path = "";
	var maxD = 0;
	for (var ii=0;ii<paths.length;ii++){
		var d = pathToPoints(paths[ii])[2];
		if (d > maxD){
			path = paths[ii];
			maxD = d;
		}
	}
	jsonShapes[sp[1]]=path;
}
var def = "eJxVkttxBTEIQ1txBYzN0xSRBtJ/IZHwTWbytT4Gg9DytbRDolYd6QK4HF2l4glQ0ctIKQCfZmQ/0MOIHYDxrrbEnDVXtrQOnJVXfOriJkv6A3dlyvVJcmTNFesyzaVqwHn2GCmGgIm9ABSlSvD9/gDUEQKVj5wYgK7ccu9A9ooW1wGLFVfOq6YrSu6n8lmR4jY9H2SO5iyCfSD45rwBjOe2Z1+z8NiXMk2c7Uv2JXRPAL5BmOnYv4uS7wTQGLO4zxNtjnzee0yRyGWXlp2EtGV7i46zaEOIoOUQblv5L3OSCbAeP2nHAJ4CcGX70Ef+WJsI/l/ZS9v0HtDTEzVxnl24nJ8Be9Je5E2AXXJRm8nU/7J8wFmellFMsAtthimI5PP88HzfktlkTQBik3B0siC2puTbMsi/9btmhPt/sb9/AHrPjQw=";
app.get('/game', 
	function(req, res) {
		//var path = "M 188.05 123.86 187.66 123.67 187.54 123.5 187.54 123.27 187.47 123.02 187.24 122.59 187.08 122.47 186.97 122.18 186.86 121.68 186.69 121.36 186.46 121.22 186.3 121.06 186.22 120.87 186.14 120.75 186.05 120.69 186.01 120.59 186.0 120.45 185.87 120.27 185.48 119.93 185.38 119.73 185.2 119.51 184.74 119.08 184.74 119.08 184.3 118.24 184.3 118.24 184.25 118.07 184.15 118.0 184.0 117.98 183.85 117.89 183.63 117.68 183.63 117.68 183.27 117.42 183.34 117.19 183.62 116.88 183.72 116.72 183.73 116.71 183.77 116.71 184.07 116.61 184.38 116.51 184.45 116.52 184.62 116.41 184.98 116.29 185.12 116.21 185.19 116.23 185.5 116.25 185.8 116.26 186.11 116.27 186.41 116.29 186.72 116.3 187.02 116.32 187.33 116.33 187.63 116.34 187.69 116.37 187.71 116.4 187.7 116.5 187.71 116.56 187.93 116.44 188.03 116.58 188.2 116.81 188.21 116.94 188.22 117.13 188.49 117.14 188.76 117.15 189.03 117.16 189.3 117.17 189.58 117.18 189.85 117.19 190.12 117.2 190.39 117.21 190.65 117.48 190.91 117.76 191.17 118.03 191.43 118.31 191.69 118.58 191.95 118.85 192.21 119.13 192.49 119.42 192.46 119.43 191.95 119.79 191.8 119.94 191.38 120.55 191.28 120.94 191.19 120.78 191.21 120.65 191.21 120.55 191.11 120.77 191.21 121.08 191.12 121.2 190.84 121.43 190.69 121.46 190.52 121.53 190.47 121.75 190.23 121.95 190.1 122.04 189.85 121.99 189.93 122.18 189.84 122.33 189.68 122.44 189.49 122.52 189.38 122.51 189.28 122.55 189.21 122.64 189.03 122.73 188.84 122.68 188.62 122.65 188.5 122.7 188.7 122.79 188.81 122.92 188.79 123.09 188.74 123.15 188.61 123.24 188.55 123.23 188.52 123.15 188.48 122.98 188.42 123.02 188.41 123.09 188.36 123.12 188.18 122.86 188.19 123.06 188.25 123.22 188.31 123.3 188.37 123.34 188.39 123.41 188.27 123.59 188.2 123.63 188.09 123.66 188.03 123.77 188.05 123.86 Z";
		var shape = "full";
		var speed = ["__*__-_X+","15_rand_30_l_15"];
		var balls = ["__+","3_l"];
		var lives = ["__+_N","x_1_7"];
		var win = ["__-_X","75_l_50"];
		//1000*(pointData.c-pointData.v/2)/(pointData.r0+1)/Math.log(pointData.d+3)/Math.log(pointData.t+3)
		var pointFormula = ["___/-_*__+/__+L/__+L/","c_v_2_1000_r0_1_d_3_t_3"];
		//console.log(req.query);
		var path = jsonShapes[shape];
		if (req.query){
			if (req.query.n){
				shape = req.query.n;
				path = jsonShapes[shape];
			}
			else if (req.query.p){
				var p = req.query.p.replace(/ /g,"+");
				path = zlib.inflateSync(new Buffer.from(p, 'base64')).toString();
			
			}
			
			if (req.query.l){
				lives = decodeURIComponent(req.query.l).split("~");
			}
			if (req.query.x){
				//req.query.x;
			}
			if (req.query.b){
				balls = decodeURIComponent(req.query.b).split("~");
			}
			if (req.query.w){
				win = decodeURIComponent(req.query.w).split("~");
			}
			if (req.query.s){
				speed = decodeURIComponent(req.query.s).split("~");
			}
			if (req.query.f){
				pointFormula = decodeURIComponent(req.query.f).split("~");
			}
		}
		//var deflated = zlib.deflateSync(path).toString('base64');
		
		var retval = pathToPoints(path);
		res.write(nunjucks.render('templates/dtzfun.html',{
			//bigwall: {id:"wall-0",balls:[],v:[[0,0],[0,50],[0,100],[100,100],[190,20],[9,2],[0,0]]},
			bigwall: retval[0],
			width: retval[1],
			speed: speed,
			balls: balls,
			lives: lives,
			win: win,
			pointFormula: pointFormula,
		}));
		res.end();
	}
);

function closePar(str,i){
	var openPar = 0;
	for (var ii=i;ii<str.length;ii++){
		if (str[ii]== "("){
			openPar++;
		}
		else if (str[ii]== ")"){
			openPar--;
		}
		
		if (openPar == 0){
			return ii;
		}
	}
	return str.length;
}
function findComma(str,i,ii,rep){
	var openPar = 0;
	inside = "";
	for (var ii=i;ii<str.length;ii++){
		if (str[ii]== "("){
			openPar++;
		}
		else if (str[ii]== ")"){
			openPar--;
		}
		
		if (openPar == 0 && str[ii]==","){
			inside += rep;
		}
		else {
			inside += str[ii];
		}
	}
	return inside;
}
function replaceFunctions(str){
	for (var i=0;i<str.length-1;i++){
		if (str[i+1]=="("){
			if (str[i] == "X" || str[i] == "N"){
				var ii = closePar(str,i+1);
				var inside = findComma(str,i+2,ii,str[i]);
				str = str.substr(0,i)+"("+inside+str.substr(ii+1);
			}
			else if (str[i] == "A" || str[i] == "L" || str[i] == "R" || str[i] == "F" ){
				var ii = closePar(str,i+1);
				str = str.substr(0,i)+str.substr(i+1,ii-i)+str[i]+str.substr(ii+1);
			}
		}
	}
	return str;
}
function makePostfix(infixexpr) {
	infixexpr = infixexpr.replace(/max/gi,"X");
	infixexpr = infixexpr.replace(/min/gi,"N");
	infixexpr = infixexpr.replace(/abs/gi,"A");
	infixexpr = infixexpr.replace(/log/gi,"L");
	infixexpr = infixexpr.replace(/ln/gi,"L");
	infixexpr = infixexpr.replace(/round/gi,"R");
	infixexpr = infixexpr.replace(/floor/gi,"F");
	infixexpr = infixexpr.replace(/rand/gi,"?");
	infixexpr = replaceFunctions(infixexpr);
	console.log(infixexpr);
	prec = {}
	prec["X"] = 5
	prec["N"] = 5
	prec["A"] = 5
	prec["L"] = 5
	prec["R"] = 5
	prec["F"] = 5
	prec["*"] = 4
	prec["/"] = 4
	prec["+"] = 3
	prec["~"] = 3
	/*prec[">"] = 2
	prec["<"] = 2
	prec["="] = 2
	prec["!"] = 2
	prec["["] = 2
	prec["]"] = 2
	prec["&"] = 1
	prec["|"] = 0*/
	prec["("] = -1
	opStack = []
	postfixList = []
	intstr = []
	expstr = []
	tokenList = []
	temptoken = ''
	for (var i=0;i<infixexpr.length;i++){
		var ie = infixexpr[i];
		if ("-0123456789.?abcdefghijklmnopqrstuvwxyz".indexOf(ie) > -1){
			temptoken += ie
		}
		else{
			if (temptoken != ''){
				tokenList.push(temptoken)
			}
			tokenList.push(ie)
			temptoken = ''
		}
	}
	if (temptoken != ''){
		tokenList.push(temptoken)
	}
	
	for (var i=0;i<tokenList.length;i++){
		var token = tokenList[i];
		if ("*/+~><=![]&|()AFLNRX".indexOf(token) == -1){
			postfixList.push(token)
		}
		else if (token == '('){
			opStack.push(token)
		}
		else if (token == ')'){
			topToken = opStack.pop()
			while (topToken != '('){
				postfixList.push(topToken)
				topToken = opStack.pop()
			}
		}
		else {
			while ((opStack.length > 0) && (prec[opStack[opStack.length-1]] >= prec[token])){
				postfixList.push(opStack.pop())
			}
			opStack.push(token)
		}
	}
	while (opStack.length > 0){
		postfixList.push(opStack.pop())
	}
	for (var i=0;i<postfixList.length;i++){
		var ci = postfixList[i];
		if ("*/+~><=![]&|AFLNRX".indexOf(ci) == -1){
			intstr.push(ci);
			expstr.push('_');
		}
		else if (ci == '~'){
			expstr.push('-');
		}
		else{
			expstr.push(ci);
		}
	}
	var sout = "";
	for (var i=0;i<expstr.length;i++){
		sout += expstr[i];
	}
	sout += "~";
	for (var i=0;i<intstr.length;i++){
		sout += intstr[i];
		sout += "_";
	}
	//sout = sout.substr(0,sout.length-1);
	console.log(sout);
	return encodeURIComponent(expstr+"~"+intstr);

}


app.post('/makegame.html', 
	function(req, res) {
		//var content = req.body;
		console.log(req.body);
		var lives = makePostfix(req.body.lives);
		console.log(lives);
		res.redirect("../game?n=SC&l="+lives);
	}
);

app.get('/landing.html', 
	function(req, res) {
		res.write(nunjucks.render('templates/landing.html',{
		
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









