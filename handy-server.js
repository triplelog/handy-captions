
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
	if (width < 100){
		var leftOffset = Math.round((100-width)/2*10)/10;
		for (var i=0;i<points.length;i++){
			points[i][0]=leftOffset + Math.round((points[i][0]-box.left)/(box.right-box.left)*width*10)/10;
			points[i][1]=Math.round((points[i][1]-box.bottom)/(box.top-box.bottom)*100*10)/10;
		}
	}
	else {
		var height = (box.top-box.bottom)/(box.right-box.left)*100;
		var botOffset = Math.round((100-height)/2*10)/10;
		for (var i=0;i<points.length;i++){
			points[i][0]=Math.round((points[i][0]-box.left)/(box.right-box.left)*100*10)/10;
			points[i][1]=botOffset + Math.round((points[i][1]-box.bottom)/(box.top-box.bottom)*height*10)/10;
		}
	}
	width = 100;
	return [points,width,d];
}
function pathToPointsBH(path) {
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
	if (width < 100){
		var leftOffset = Math.round((100-width)/2*10)/10;
		for (var i=0;i<points.length;i++){
			points[i][0]=leftOffset + Math.round((points[i][0]-box.left)/(box.right-box.left)*width*10)/10;
			points[i][1]=Math.round((points[i][1]-box.bottom)/(box.top-box.bottom)*100*10)/10;
		}
	}
	else {
		var height = (box.top-box.bottom)/(box.right-box.left)*100;
		var botOffset = Math.round((100-height)/2*10)/10;
		for (var i=0;i<points.length;i++){
			points[i][0]=Math.round((points[i][0]-box.left)/(box.right-box.left)*100*10)/10;
			points[i][1]=botOffset + Math.round((points[i][1]-box.bottom)/(box.top-box.bottom)*height*10)/10;
		}
	}
	width = 100;
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
		var speed = ["__*__-_X+","15_?_30_l_15"];
		var balls = ["__+","3_l"];
		var lives = ["__+_N","x_1_7"];
		var win = ["__-_X","75_l_50"];
		//1000*(pointData.c-pointData.v/2)/(pointData.r0+1)/Math.log(pointData.d+3)/Math.log(pointData.t+3)
		var pointFormula = ["___/-_*__+/__+L/__+L/","c_v_2_1000_r0_1_d_3_t_3"];
		console.log(req.query);
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
				console.log(lives);
			}
			if (req.query.x){
				//req.query.x;
			}
			if (req.query.b){
				balls = decodeURIComponent(req.query.b).split("~");
				console.log(balls);
			}
			if (req.query.w){
				win = decodeURIComponent(req.query.w).split("~");
				console.log(win);
			}
			if (req.query.s){
				speed = decodeURIComponent(req.query.s).split("~");
				console.log(speed);
			}
			if (req.query.f){
				pointFormula = decodeURIComponent(req.query.f).split("~");
				console.log(pointFormula);
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

var golfHoles = [];
function addHoles() {
	golfHoles.push({path:"M-9787165.0,-5143361.0 -9771681.0,-5149222.0 -9758271.0,-5144510.0 -9756307.0,-5148473.0 -9751421.0,-5144844.0 -9753397.0,-5141361.0 -9749594.0,-5133319.0 -9754511.0,-5137879.0 -9753356.0,-5129749.0 -9760335.0,-5125806.0 -9763350.0,-5128465.0 -9755577.0,-5132418.0 -9755428.0,-5140021.0 -9763529.0,-5136622.0 -9761654.0,-5138288.0 -9762247.0,-5140228.0 -9773446.0,-5140795.0 -9780982.0,-5136771.0 -9787165.0,-5143361.0 ",ball: {x:76,y:38,d:5,a:1,s:20,el:null},hole: {x:22,y:43},cd: 1707});
	golfHoles.push({path:"M-13188119.0,-4034354.0 -13182942.0,-4037945.0 -13180898.0,-4035876.0 -13171086.0,-4037090.0 -13171064.0,-4033716.0 -13164643.0,-4032983.0 -13166862.0,-4030291.0 -13166949.0,-4024489.0 -13171071.0,-4023167.0 -13173013.0,-4026353.0 -13184990.0,-4026922.0 -13186488.0,-4030126.0 -13185411.0,-4033199.0 -13188119.0,-4034354.0 ",ball: {x:76,y:76,d:5,a:1,s:20,el:null},hole: {x:31,y:44},cd: 0637});
	golfHoles.push({path:"M-13592766.0,-4427571.0 -13577766.0,-4451072.0 -13574039.0,-4445305.0 -13565980.0,-4449860.0 -13553774.0,-4445953.0 -13551890.0,-4437712.0 -13533738.0,-4424200.0 -13530998.0,-4433796.0 -13536161.0,-4444058.0 -13530656.0,-4446447.0 -13525484.0,-4435190.0 -13493540.0,-4433707.0 -13495744.0,-4428818.0 -13485413.0,-4416363.0 -13462276.0,-4404580.0 -13424814.0,-4368011.0 -13424748.0,-4345915.0 -13434352.0,-4341188.0 -13428126.0,-4328621.0 -13432650.0,-4319634.0 -13387582.0,-4286333.0 -13382159.0,-4271665.0 -13518436.0,-4272677.0 -13550678.0,-4318387.0 -13576420.0,-4340199.0 -13585921.0,-4380788.0 -13581103.0,-4390114.0 -13592766.0,-4427571.0 ",ball: {x:86,y:85,d:5,a:1,s:20,el:null},hole: {x:52,y:41},cd: 0620});
	golfHoles.push({path:"M-10221676.0,-3614329.0 -10206221.0,-3634955.0 -10203162.0,-3613418.0 -10187468.0,-3616550.0 -10196159.0,-3600214.0 -10164589.0,-3587890.0 -10135425.0,-3615734.0 -10081891.0,-3610018.0 -10072836.0,-3539205.0 -10036149.0,-3527946.0 -10056013.0,-3495078.0 -10085679.0,-3531537.0 -10124937.0,-3517450.0 -10132358.0,-3544887.0 -10156738.0,-3548823.0 -10139572.0,-3568548.0 -10152560.0,-3582575.0 -10165839.0,-3537543.0 -10150994.0,-3538672.0 -10160829.0,-3519807.0 -10140103.0,-3521701.0 -10145483.0,-3496675.0 -10070856.0,-3478313.0 -10079100.0,-3462135.0 -10099004.0,-3471803.0 -10110266.0,-3433239.0 -10153322.0,-3428532.0 -10140390.0,-3478051.0 -10214253.0,-3567691.0 -10221676.0,-3614329.0 ",ball: {x:55,y:17,d:5,a:1,s:20,el:null},hole: {x:20,y:35},cd: 2206});
	golfHoles.push({path:"M-13116619.0,-4033887.0 -13107874.0,-4043931.0 -13105421.0,-4039479.0 -13082715.0,-4039170.0 -13078748.0,-4047928.0 -13063668.0,-4043151.0 -13065599.0,-4031503.0 -13086531.0,-4033295.0 -13092391.0,-4018751.0 -13097336.0,-4018648.0 -13107240.0,-4031468.0 -13116619.0,-4033887.0 ",ball: {x:65,y:47,d:5,a:1,s:20,el:null},hole: {x:42,y:62},cd: 0635});
	golfHoles.push({path:"M-13109824.0,-3955233.0 -13100823.0,-3960138.0 -13094862.0,-3974656.0 -13088952.0,-3969531.0 -13085885.0,-3981031.0 -13081370.0,-3974184.0 -13075358.0,-3975510.0 -13081122.0,-3962530.0 -13053246.0,-3955790.0 -13053332.0,-3938103.0 -13045521.0,-3922133.0 -13049958.0,-3910390.0 -13048999.0,-3907911.0 -13047139.0,-3907723.0 -13047204.0,-3906267.0 -13046629.0,-3906002.0 -13037936.0,-3912123.0 -13035459.0,-3895081.0 -13041416.0,-3898517.0 -13043290.0,-3891353.0 -13052908.0,-3892930.0 -13049326.0,-3882160.0 -13053842.0,-3875274.0 -13061289.0,-3879820.0 -13072867.0,-3918889.0 -13109824.0,-3955233.0 ",ball: {x:78,y:74,d:5,a:1,s:20,el:null},hole: {x:64,y:58},cd: 0649});
	golfHoles.push({path:"M-13524023.0,-4640351.0 -13514388.0,-4641455.0 -13519315.0,-4649748.0 -13510038.0,-4652286.0 -13514345.0,-4665350.0 -13507718.0,-4671431.0 -13504037.0,-4682041.0 -13482863.0,-4681232.0 -13472711.0,-4651460.0 -13472673.0,-4621929.0 -13501080.0,-4614780.0 -13501140.0,-4620660.0 -13504524.0,-4620623.0 -13509563.0,-4632212.0 -13519770.0,-4632154.0 -13524023.0,-4640351.0 ",ball: {x:27,y:51,d:5,a:1,s:20,el:null},hole: {x:43,y:12},cd: 0607});
	golfHoles.push({path:"M-12950296.0,-5413422.0 -12942381.0,-5433586.0 -12894060.0,-5404616.0 -12827404.0,-5480739.0 -12800715.0,-5457665.0 -12835699.0,-5555578.0 -12770939.0,-5604406.0 -12756471.0,-5668477.0 -12778785.0,-5701902.0 -12727163.0,-5694188.0 -12683475.0,-5731704.0 -12629761.0,-5600360.0 -12593736.0,-5585818.0 -12562880.0,-5521259.0 -12499684.0,-5553854.0 -12408561.0,-5549228.0 -12399302.0,-5583026.0 -12361915.0,-5539101.0 -12361664.0,-5161234.0 -12805989.0,-5160422.0 -12805938.0,-5276788.0 -12935519.0,-5319422.0 -12910684.0,-5329253.0 -12910265.0,-5367698.0 -12950296.0,-5413422.0 ",ball: {x:22,y:53,d:5,a:1,s:20,el:null},hole: {x:40,y:28},cd: 1602});
	golfHoles.push({path:"M-13881935.0,-5277085.0 -13836653.0,-5401590.0 -13824479.0,-5508389.0 -13778637.0,-5509427.0 -13772455.0,-5532755.0 -13758830.0,-5532713.0 -13759379.0,-5577729.0 -13704075.0,-5564891.0 -13708310.0,-5582079.0 -13692268.0,-5572369.0 -13668143.0,-5589219.0 -13558716.0,-5571820.0 -13555271.0,-5481176.0 -13578238.0,-5443325.0 -13577073.0,-5407907.0 -13597624.0,-5391565.0 -13578106.0,-5351889.0 -13589467.0,-5322289.0 -13717860.0,-5267928.0 -13717850.0,-5235513.0 -13743244.0,-5219590.0 -13717890.0,-5204642.0 -13718025.0,-5161570.0 -13841316.0,-5161467.0 -13867014.0,-5229319.0 -13856333.0,-5253513.0 -13881935.0,-5277085.0 ",ball: {x:40,y:87,d:5,a:1,s:20,el:null},hole: {x:72,y:54},cd: 4104});
	golfHoles.push({path:"M-9229378.0,-3235123.0 -9226803.0,-3251206.0 -9220149.0,-3251375.0 -9218908.0,-3248631.0 -9213143.0,-3247713.0 -9209414.0,-3247819.0 -9209648.0,-3250202.0 -9208076.0,-3250502.0 -9207107.0,-3250507.0 -9207102.0,-3246322.0 -9200424.0,-3246349.0 -9200369.0,-3242343.0 -9194680.0,-3240806.0 -9192031.0,-3237506.0 -9190940.0,-3224650.0 -9188380.0,-3221895.0 -9195673.0,-3204119.0 -9205746.0,-3204253.0 -9210139.0,-3199927.0 -9211333.0,-3204362.0 -9218741.0,-3204384.0 -9217888.0,-3212383.0 -9227722.0,-3226852.0 -9229378.0,-3235123.0 ",ball: {x:35,y:88,d:5,a:1,s:20,el:null},hole: {x:29,y:19},cd: 1213});
	golfHoles.push({path:"M-10342621.0,-4412584.0 -10341945.0,-4448959.0 -10317744.0,-4448457.0 -10317833.0,-4506442.0 -10244650.0,-4523429.0 -10243749.0,-4580929.0 -10200476.0,-4586626.0 -10189667.0,-4609272.0 -10105604.0,-4608300.0 -10099047.0,-4632878.0 -9964952.0,-4536114.0 -9950174.0,-4445582.0 -9918453.0,-4433285.0 -9931818.0,-4380040.0 -9948155.0,-4386982.0 -9959135.0,-4363791.0 -9970553.0,-4378652.0 -9966955.0,-4335458.0 -9985561.0,-4334524.0 -9973295.0,-4320197.0 -9986130.0,-4300756.0 -10060821.0,-4300027.0 -10025897.0,-4342329.0 -10035706.0,-4369357.0 -10327370.0,-4369317.0 -10326538.0,-4412114.0 -10342621.0,-4412584.0 ",ball: {x:20,y:58,d:5,a:1,s:20,el:null},hole: {x:79,y:82},cd: 2908});
	golfHoles.push({path:"M-10023272.0,-3670323.0 -10023261.0,-3684112.0 -9951871.0,-3689245.0 -9952099.0,-3736675.0 -9886192.0,-3741396.0 -9886190.0,-3752876.0 -9872722.0,-3747754.0 -9864846.0,-3752944.0 -9868960.0,-3756761.0 -9863351.0,-3770218.0 -9846587.0,-3770276.0 -9838910.0,-3523945.0 -9887552.0,-3531521.0 -9895082.0,-3521538.0 -9927881.0,-3530850.0 -9971644.0,-3527124.0 -9983511.0,-3561724.0 -9996927.0,-3574361.0 -10002301.0,-3588890.0 -9988492.0,-3633065.0 -10000488.0,-3633015.0 -10000484.0,-3642484.0 -10019415.0,-3649943.0 -10023272.0,-3670323.0 ",ball: {x:20,y:41,d:5,a:1,s:20,el:null},hole: {x:51,y:20},cd: 2804});
	golfHoles.push({path:"M-9129533.0,-3966122.0 -9080496.0,-4012329.0 -9052157.0,-4061001.0 -9036726.0,-4052264.0 -8997500.0,-4064947.0 -9002354.0,-4053303.0 -8982700.0,-4039721.0 -8984140.0,-4029946.0 -9012089.0,-4022727.0 -9018965.0,-4028237.0 -9007052.0,-4037939.0 -9008872.0,-4051149.0 -9032258.0,-4047704.0 -9017853.0,-4015933.0 -9023393.0,-3994888.0 -9008486.0,-3996212.0 -9021649.0,-3989544.0 -9014918.0,-3978923.0 -9025142.0,-3964999.0 -9001097.0,-3950566.0 -9004603.0,-3930031.0 -9041667.0,-3953853.0 -9038374.0,-3911066.0 -9095318.0,-3910771.0 -9121490.0,-3941179.0 -9118573.0,-3954023.0 -9129533.0,-3966122.0 ",ball: {x:47,y:95,d:5,a:1,s:20,el:null},hole: {x:68,y:55},cd: 4502});
	

}
addHoles();
app.get('/golf', 
	function(req, res) {
		//var path = "M 188.05 123.86 187.66 123.67 187.54 123.5 187.54 123.27 187.47 123.02 187.24 122.59 187.08 122.47 186.97 122.18 186.86 121.68 186.69 121.36 186.46 121.22 186.3 121.06 186.22 120.87 186.14 120.75 186.05 120.69 186.01 120.59 186.0 120.45 185.87 120.27 185.48 119.93 185.38 119.73 185.2 119.51 184.74 119.08 184.74 119.08 184.3 118.24 184.3 118.24 184.25 118.07 184.15 118.0 184.0 117.98 183.85 117.89 183.63 117.68 183.63 117.68 183.27 117.42 183.34 117.19 183.62 116.88 183.72 116.72 183.73 116.71 183.77 116.71 184.07 116.61 184.38 116.51 184.45 116.52 184.62 116.41 184.98 116.29 185.12 116.21 185.19 116.23 185.5 116.25 185.8 116.26 186.11 116.27 186.41 116.29 186.72 116.3 187.02 116.32 187.33 116.33 187.63 116.34 187.69 116.37 187.71 116.4 187.7 116.5 187.71 116.56 187.93 116.44 188.03 116.58 188.2 116.81 188.21 116.94 188.22 117.13 188.49 117.14 188.76 117.15 189.03 117.16 189.3 117.17 189.58 117.18 189.85 117.19 190.12 117.2 190.39 117.21 190.65 117.48 190.91 117.76 191.17 118.03 191.43 118.31 191.69 118.58 191.95 118.85 192.21 119.13 192.49 119.42 192.46 119.43 191.95 119.79 191.8 119.94 191.38 120.55 191.28 120.94 191.19 120.78 191.21 120.65 191.21 120.55 191.11 120.77 191.21 121.08 191.12 121.2 190.84 121.43 190.69 121.46 190.52 121.53 190.47 121.75 190.23 121.95 190.1 122.04 189.85 121.99 189.93 122.18 189.84 122.33 189.68 122.44 189.49 122.52 189.38 122.51 189.28 122.55 189.21 122.64 189.03 122.73 188.84 122.68 188.62 122.65 188.5 122.7 188.7 122.79 188.81 122.92 188.79 123.09 188.74 123.15 188.61 123.24 188.55 123.23 188.52 123.15 188.48 122.98 188.42 123.02 188.41 123.09 188.36 123.12 188.18 122.86 188.19 123.06 188.25 123.22 188.31 123.3 188.37 123.34 188.39 123.41 188.27 123.59 188.2 123.63 188.09 123.66 188.03 123.77 188.05 123.86 Z";
		var shape = "FL";
		
		//var path = jsonShapes[shape];
		//console.log(path);
		
		
		var allHoles = [];
		for (var i=0;i<golfHoles.length;i++){
			var retval = pathToPointsBH(golfHoles[i].path);
			var ball = golfHoles[i].ball;
			var hole = golfHoles[i].hole;
			var cd = golfHoles[i].cd;
			allHoles.push({bigwall:retval[0],width:retval[1],ball:ball,hole:hole,cd:cd});
		}
		
		res.write(nunjucks.render('templates/golf.html',{
			//bigwall: {id:"wall-0",balls:[],v:[[0,0],[0,50],[0,100],[100,100],[190,20],[9,2],[0,0]]},
			//bigwall: retval[0],
			//width: retval[1],
			//ball: ball,
			//hole: hole,
			allHoles: allHoles,
		}));
		res.end();
	}
);
function replaceNegatives(istr){
	dindex = istr.indexOf('-')
	while (dindex >-1){
		if (dindex == 0){
			if ("0123456789".indexOf(istr[1]) == -1) {
				istr = '-1*'+istr.substring(1,);
			}
			dindex = istr.indexOf('-',1);
		}
		else{
			if ("><=![]&|(".indexOf(istr[dindex-1])> -1) {
				if ("0123456789".indexOf(istr[dindex-1])== -1){
					istr = istr.substring(0,dindex)+'-1*'+istr.substring(dindex+1,);
				}
				dindex = istr.indexOf('-',dindex+1);
			}
			else{
				istr = istr.substring(0,dindex)+'~'+istr.substring(dindex+1,);
				dindex = istr.indexOf('-',dindex+1);
			}
		}
	}
				
	return istr
}
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
	var foundComma = false;
	for (var iii=i;iii<ii;iii++){
		if (str[iii]== "("){
			openPar++;
		}
		else if (str[iii]== ")"){
			openPar--;
		}
		
		if (openPar == 0 && str[iii]==","){
			inside = "("+inside+")"+rep+"(";
			foundComma = true;
		}
		else {
			inside += str[iii];
		}
	}
	if (!foundComma){
		return false;
	}
	return inside+")";
}
function replaceFunctions(str){
	for (var i=0;i<str.length-1;i++){
		if (str[i+1]=="("){
			if (str[i] == "X" || str[i] == "N"){
				var ii = closePar(str,i+1);
				console.log(str,i,ii);
				var inside = findComma(str,i+2,ii+1,str[i]);
				if (!inside){
					continue;
				}
				if (ii+1 < str.length){
					str = str.substr(0,i)+"("+inside+str.substr(ii+1);
				}
				else {
					str = str.substr(0,i)+"("+inside;
				}
				console.log(str);
			}
			else if (str[i] == "A" || str[i] == "L" || str[i] == "R" || str[i] == "F" ){
				var ii = closePar(str,i+1);
				console.log(str,i,ii);
				if (ii+1 < str.length){
					str = str.substr(0,i)+str.substr(i+1,ii-i)+str[i]+str.substr(ii+1);
				}
				else {
					str = str.substr(0,i)+str.substr(i+1,ii-i)+str[i];
				}
				console.log(str);
			}
		}
	}
	return str;
}
function makePostfix(infixexpr) {
	infixexpr = infixexpr.replace(/ /g,"");
	infixexpr = infixexpr.replace(/max/gi,"X");
	infixexpr = infixexpr.replace(/min/gi,"N");
	infixexpr = infixexpr.replace(/abs/gi,"A");
	infixexpr = infixexpr.replace(/log/gi,"L");
	infixexpr = infixexpr.replace(/ln/gi,"L");
	infixexpr = infixexpr.replace(/round/gi,"R");
	infixexpr = infixexpr.replace(/floor/gi,"F");
	infixexpr = infixexpr.replace(/rand/gi,"?");
	infixexpr = replaceNegatives(infixexpr);
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
	console.log(sout.substr(0,sout.length-1));
	return encodeURIComponent(sout.substr(0,sout.length-1));

}


app.post('/makegame.html', 
	function(req, res) {
		//var content = req.body;
		console.log(req.body);
		var lives = makePostfix(req.body.lives);
		var pointFormula = makePostfix(req.body.pointFormula);
		var balls = makePostfix(req.body.balls);
		var win = makePostfix(req.body.win);
		var speed = makePostfix(req.body.speed);
		console.log(lives);
		console.log(pointFormula);
		console.log(balls);
		console.log(win);
		console.log(speed);
		res.redirect("../game?n=SC&l="+lives+"&f="+pointFormula+"&b="+balls+"&w="+win+"&s="+speed);
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









