var recentPoints = [];
var myInterval;
onmessage = function(evt){
	if (evt.data.type == "move"){
		recentPoints.push([evt.data.x,evt.data.y]);
	}
	else if (evt.data.type == "down"){
		recentPoints.push([evt.data.x,evt.data.y]);
		myInterval = setInterval(sendPoints, 100);
	}
	else if (evt.data.type == "up"){
		recentPoints.push([evt.data.x,evt.data.y]);
		clearInterval(myInterval);
		sendPoints(false);
		createPD(evt.data.tab);
	}
	
}

function sendPoints(send=true) {
	var rlen = recentPoints.length;
	if (rlen == 0){return;}
	var points = [[0,0,0],[0,0,0],[0,0,0]];
	if (rlen > 3){
		
		for (var i=0;i<Math.floor(rlen/4);i++){
			points[0][0]+=recentPoints[i][0];
			points[0][1]+=recentPoints[i][1];
			points[0][2]++;
		}
		for (var i=Math.floor(rlen/4);i<Math.floor(rlen/2);i++){
			points[0][0]+=recentPoints[i][0];
			points[0][1]+=recentPoints[i][1];
			points[0][2]++;
			points[1][0]+=recentPoints[i][0];
			points[1][1]+=recentPoints[i][1];
			points[1][2]++;
		}
		for (var i=Math.floor(rlen/2);i<Math.floor(rlen*3/4);i++){
			points[2][0]+=recentPoints[i][0];
			points[2][1]+=recentPoints[i][1];
			points[2][2]++;
			points[1][0]+=recentPoints[i][0];
			points[1][1]+=recentPoints[i][1];
			points[1][2]++;
		}
		for (var i=Math.floor(rlen*3/4);i<rlen;i++){
			points[2][0]+=recentPoints[i][0];
			points[2][1]+=recentPoints[i][1];
			points[2][2]++;
		}
		points[0][0] /= points[0][2];
		points[0][1] /= points[0][2];
		points[1][0] /= points[1][2];
		points[1][1] /= points[1][2];
		points[2][0] /= points[2][2];
		points[2][1] /= points[2][2];
	}
	else {
		points = recentPoints;
	}
	for (var i=0;i<points.length;i++){
		currentCurve.push([points[i][0],points[i][1]]);
	}
	if (send){
		postMessage({'type':'inputCurve','points':points});
	}
	recentPoints = [];
}


var currentCurve = [];
var allCurves = {};
var isDown = false;
var isGroup = false;


function drawCurveIn(pt){
	
	/*for (var i=0;i<currentCurve.length;i++){
		var el = document.createElement('div');
		el.classList.add("pt");
		el.style.left = currentCurve[i][0]+"px";
		el.style.top = currentCurve[i][1]+"px";
		inputEl.appendChild(el);
	}*/
	var el = document.createElement('div');
	el.classList.add("pt");
	el.style.left = pt[0]+"px";
	el.style.top = pt[1]+"px";
	inputEl.appendChild(el);
}
function createPD(tab){
	if (currentCurve.length < 1){
		return;
	}
	var id = "curve-"+Math.random().toString(36).substr(3,12);
	var pd = "M"; 
	
	pd += " " + currentCurve[0][0];
	pd += " " + currentCurve[0][1];
	console.log(currentCurve.length);
	for (var i=1; i<currentCurve.length - 2; i++){
		var minD2 = nearestBezier(currentCurve[i-1][0],currentCurve[i][0],currentCurve[i+2][0],currentCurve[i-1][1],currentCurve[i][1],currentCurve[i+2][1], currentCurve[i+1][0], currentCurve[i+1][1]);
		console.log(minD2);
		if (minD2 < 1){
			currentCurve.splice(i+1,1);
			i--;
			continue;
		}
		pd += " Q " + currentCurve[i][0];
		pd += " " + currentCurve[i][1];
		var xc = (currentCurve[i][0] + currentCurve[i+1][0]) / 2;
		var yc = (currentCurve[i][1] + currentCurve[i+1][1]) / 2;
		pd += " " + xc;
		pd += " " + yc;
	}
	console.log(currentCurve.length);
	if (currentCurve.length > 1){
		pd += " Q " + currentCurve[currentCurve.length - 2][0];
		pd += " " + currentCurve[currentCurve.length - 2][1];
	}
	pd += " " + currentCurve[currentCurve.length - 1][0];
	pd += " " + currentCurve[currentCurve.length - 1][1];

	
	allCurves[id]= currentCurve;
	postMessage({'type':'outputCurve','id':id,'pd':pd,'startPoint':[currentCurve[0][0],currentCurve[0][1]],'endPoint':[currentCurve[currentCurve.length - 1][0],currentCurve[currentCurve.length - 1][1]],'tab':tab});
	convexHull(currentCurve);
	currentCurve = [];
	recentPoints = [];
}

function nearestBezier(a,b,c,d,e,f,x,y){
	//a,b,c are x-coordinates of 3 bezierpoints
	//d,e,f are y-coordinates
	//x,y are coordinates of point to match
	/*var aa = 4*a^2-16*a*b+8*a*c + 16*b^2 - 16*b*c + 4*c^2 + 4*d^2 - 16*d*e + 8*d*f + 16*e^2 - 16*e*f + 4*f^2;
	var bb = -12*a^2 + 36*a*b - 12*a*c - 24*b^2 + 12*b*c - 12*d^2 + 36*d*e - 12*d*f - 24*e^2 + 12*e*f;
	var cc = 12*a^2 - 24*a*b + 4*a*c - 4*a*x + 8*b^2 + 8*b*x - 4*c*x + 12*d^2 - 24*d*e + 4*d*f - 4*d*y + 8*e^2 +8*e*y - 4*f*y;
	var dd = -4*a^2  + 4*a*b + 4*a*x - 4*b*x  - 4*d^2 + 4*d*e + 4*d*y - 4*e*y;
	
	var p = -1*bb/(3*aa);
	var q = p^3 + (bb*cc - 3*aa*dd)/(6*aa^2);
	var r = cc/(3*aa);
	
	var t = Math.pow(q+(q^2+(r-p^2)^3)^.5,.3333) + Math.pow(q-(q^2+(r-p^2)^3)^.5,.3333) + p;*/
	var min = [0,0];
	for (var i=0;i<9;i++){
		var t = 0.125*i;
		var d2 = Math.pow(Math.pow(1-t,2)*a+2*t*(1-t)*b+t*t*c - x,2) + Math.pow(Math.pow(1-t,2)*d+2*t*(1-t)*e+t*t*f - y,2);
		if (i==0){
			min[1] = d2;
		}
		else if (d2 < min[1]){
			min[1] = d2;
			min[0] = i;
		}
	}
	return d2;
	
}
function selectGroup(){
	isGroup = true;
}

function groupDown() {

}
function groupMove() {

}
function groupUp() {
	isGroup = false;
}

function convexHull(points){
	var points = [];
	for (var i of Object.values(allCurves)){
		for (var ii=0;ii<i.length;ii++){
			points.push(i[ii]);
		}
	}
	var minX = points[0][0]+1;
	var len = points.length;
	var hullPoints = [[0,0]];
	var currentPoint = 0;
	var cx = 0;
	var cy = 0;
	var idx = 0;
	var pdArray = [];
	var n = 10;
	for (var i=0;i<n;i++){
		pdArray.push("M");
	}
	console.log(points.length);
	const t0 = performance.now();
	for (var i=0;i<len;i++){
		if (points[i][0] < minX) {
			minX = points[i][0];
			currentPoint = i;
		}
	}
	
	var margin = 5;
	cx = points[currentPoint][0];
	cy = points[currentPoint][1];
	hullPoints[0] = [cx,cy];
	for (var i=0;i<n;i++){
		pdArray[i] += " "+(cx - margin*i)+" "+cy;;
	}
	var ppd = [-10000,-1];
	points.splice(currentPoint,1);
	len--;
	
	var toRight = true;
	while (toRight && len>0){
		var maxAngle = -10;
		toRight = false;
		currentPoint = -1;
		for (var i=0;i<len;i++){
			var a = -11;
			if (points[i][0]>cx){
				a = Math.atan(-1*(points[i][1]-cy)/(points[i][0]-cx));
				toRight = true;
			}
			else {
				continue;
			}
			if (a > maxAngle) {
				maxAngle = a;
				currentPoint = i;
			}
		}
		if (currentPoint == -1){
			break;
		}
		
		var d= Math.pow(Math.pow(points[currentPoint][1]-cy,2)+Math.pow(points[currentPoint][0]-cx,2),.5);
		var adj = margin/d;
		var mx = -1*(points[currentPoint][1]-cy)*adj;
		var my = 1*(points[currentPoint][0]-cx)*adj;
		if (ppd[0] == -10000){
			ppd = [mx,my];
		}
		else {
			ppd[0] += mx;
			ppd[1] += my;
			for (var i=0;i<n;i++){
				pdArray[i] += " "+(cx - ppd[0]/2*i)+" "+(cy-ppd[1]/2*i);
			}
			ppd = [mx,my];
		}
		cx = points[currentPoint][0];
		cy = points[currentPoint][1];
		hullPoints.push([cx,cy]);
		
		
		points.splice(currentPoint,1);
		len--;
		
	}
	ppd[0] -= margin/2;
	while (len>0){
		var maxAngle = -10;
		currentPoint = -1;
		for (var i=0;i<len;i++){
			var a = -11;
			if (points[i][0]<=cx){
				a = Math.atan(-1*(points[i][1]-cy)/(points[i][0]-cx));
				toRight = true;
			}
			else {
				continue;
			}
			if (a > maxAngle) {
				maxAngle = a;
				currentPoint = i;
			}
		}
		if (currentPoint == -1){
			break;
		}
		var d= Math.pow(Math.pow(points[currentPoint][1]-cy,2)+Math.pow(points[currentPoint][0]-cx,2),.5);
		var adj = margin/d;
		var mx = -1*(points[currentPoint][1]-cy)*adj;
		var my = 1*(points[currentPoint][0]-cx)*adj;
		if (ppd[0] == -10000){
			ppd = [mx,my];
		}
		else {
			ppd[0] += mx;
			ppd[1] += my;
			for (var i=0;i<n;i++){
				pdArray[i] += " "+(cx - ppd[0]/2*i)+" "+(cy-ppd[1]/2*i);
			}
			ppd = [mx,my];
		}
		cx = points[currentPoint][0];
		cy = points[currentPoint][1];
		hullPoints.push([cx,cy]);
		points.splice(currentPoint,1);
		len--;
		
	}
	if (ppd[0] != -10000){
		for (var i=0;i<n;i++){
			pdArray[i] += " "+(cx - ppd[0]*i)+" "+(cy-ppd[1]*i);
		}
	}

	for (var i=0;i<n;i++){
		pdArray[i] += "Z";
	}
	const t1 = performance.now();
	console.log(`Convex Hull took ${t1 - t0} milliseconds.`);
	console.log(hullPoints.length);
	postMessage({'type':'convexHull','pdArray':pdArray});
	
}





