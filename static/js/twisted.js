function parsePath(pd) {
	var pdSplit = pd.toUpperCase().split(/[\s,]+/);
	var points = [];
	var currentMove = 'M';
	var currentPoint = [];
	for (var i=0;i<pdSplit.length;i++){
		if (pdSplit[i] == 'M' || pdSplit[i] == 'C' || pdSplit[i] == 'Q' || pdSplit[i] == 'L' || pdSplit[i] == 'H' || pdSplit[i] == 'V' || pdSplit[i] == 'Z'){
			currentMove = pdSplit[i];
		}
		else if (currentPoint.length == 0) {
			currentPoint.push(Math.round(parseFloat(pdSplit[i])));
			if (currentMove == 'H' || currentMove == 'V') {
				if (currentMove == 'H'){
					points.push({'H':[currentPoint[0]]});
				}
				else if (currentMove == 'V'){
					points.push({'V':[currentPoint[0]]});
				}
				currentPoint = [];
				currentMove == 'L';
			}
		}
		else if (currentMove == 'M' || currentMove == 'L') {
			currentPoint.push(Math.round(parseFloat(pdSplit[i])));
			if (currentMove == 'M'){
					points.push({'M':currentPoint});
				}
				else if (currentMove == 'L'){
					points.push({'L':currentPoint});
				}
			currentPoint = [];
			currentMove == 'L';
		}
		else if (currentMove == 'Q') {
			currentPoint.push(Math.round(parseFloat(pdSplit[i])));
			if (currentPoint.length>=4){
				points.push({'Q':currentPoint});
				currentPoint = [];
				currentMove == 'L';
			}
		}
		else if (currentMove == 'C') {
			currentPoint.push(Math.round(parseFloat(pdSplit[i])));
			if (currentPoint.length>=6){
				points.push({'C':currentPoint});
				currentPoint = [];
				currentMove == 'L';
			}
		}
	}
	return points;
}

function toPath(points){
	var pd = "";
	for (var i=0;i<points.length;i++){
		var key = Object.keys(points[i])[0];
		pd += ' '+key;
		for (var ii=0;ii<points[i][key].length;ii++){
			pd += ' '+points[i][key][ii];
		}
	}
	return pd;
}

function outline(pd,margin,direction,under){
	
	var points = parsePath(pd);
	var qPoints = toQuadratics(points);
	points = qPoints;



	var avgPoints = [];
	var pdPoints = [];
	
	
	
	
	
	var underTwist = false;
	for (var i=0;i<points.length;i++){
		var aPoint = {};

		var key = Object.keys(points[i])[0];
		
		var myPoint = points[i][key];
		var last;
		if (i>0){
			last = points[i-1];
		}
		else {
			last = points[0];
		}
		var lastKey = Object.keys(last)[0];
		var next;
		if (i+i<points.length){
			next = points[i+1];
		}
		else {
			next = points[i];
		}
		console.log(i,points.length,next,points);
		var nextKey = Object.keys(next)[0];
		if (key == 'H' ){
			
			continue;
		}
		else if (key == 'V'){
			
			continue;
		}
		if (lastKey == 'H' ){
			
			continue;
		}
		else if (lastKey == 'V'){
			
			continue;
		}
		if (nextKey == 'H' ){
			
			continue;
		}
		else if (nextKey == 'V'){
			
			continue;
		}
		var lastPoint = [last[lastKey][last[lastKey].length - 2],last[lastKey][last[lastKey].length - 1]];
		var thisPoint = [myPoint[myPoint.length - 2],myPoint[myPoint.length - 1]];
		var nextPoint = [next[nextKey][next[nextKey].length - 2],next[nextKey][next[nextKey].length - 1]];
		
		var d1 = Math.pow( Math.pow((thisPoint[1]-lastPoint[1]),2) + Math.pow((thisPoint[0]-lastPoint[0]),2) ,1);
		if (d1 == 0 && i > 0 && i+1 <points.length){
			console.log(i,thisPoint);
			points.splice(i,1);
			i--;
			continue;
		}
		var dy1 = margin*Math.pow((thisPoint[1]-lastPoint[1]),2)/d1;
		var dx1 = margin*Math.pow((thisPoint[0]-lastPoint[0]),2)/d1;
		if (thisPoint[1]<lastPoint[1]){
			dy1 *= -1;
		}
		if (thisPoint[0]<lastPoint[0]){
			dx1 *= -1;
		}
			
		dx1 *= -1

		
		d2 = Math.pow( Math.pow((thisPoint[1]-nextPoint[1]),2) + Math.pow((thisPoint[0]-nextPoint[0]),2) ,1);
		if (d2 == 0){
			console.log(i,thisPoint);
			points.splice(i,1);
			i--;
			continue;
		}
		dy2 = margin*Math.pow((nextPoint[1]-thisPoint[1]),2)/d2;
		dx2 = margin*Math.pow((nextPoint[0]-thisPoint[0]),2)/d2;
		if (nextPoint[1]<thisPoint[1]){
			dy2 *= -1;
		}
		if (nextPoint[0]<thisPoint[0]){
			dx2 *= -1;
		}
		
		dx2 *= -1
		
		
		var ay = (dy1+dy2)/2;
		var ax = (dx1+dx2)/2;
		if (direction == 'in'){
			if (i%2 ==0 ){
				ay *= -1;
				ax *= -1;
				underTwist = true;
			}
			else {
				underTwist = false;
			}
		}
		if (direction == 'out'){
			if (i%2 ==1 ){
				ay *= -1;
				ax *= -1;
				underTwist = true;
			}
			else {
				underTwist = false;
			}
		}
		if (ay == 0 && ax == 0){
			points.splice(i,1);
			i--;
			continue;
		}
		var mul = Math.pow(margin,1)/Math.pow((Math.pow(ay,2)+Math.pow(ax,2)),.5);
		
		
		aPoint=[ay*mul,ax*mul,underTwist];
		
		avgPoints.push(aPoint);
	}
	avgPoints[0][0] = avgPoints[1][0];
	avgPoints[0][1] = avgPoints[1][1];
	
	console.log(avgPoints);
	var topPoints = [];
	for (var i=0;i<points.length;i++){
		var aPoint = {};
		var cPoint = {};
		var key = Object.keys(points[i])[0];
		
		var myPoint = points[i][key];
		var last;
		var lastShift
		if (i>0){
			last = points[i-1];
			lastShift = [avgPoints[i-1][0],avgPoints[i-1][1]];
		}
		else {
			last = points[0];
			lastShift = [avgPoints[i][0],avgPoints[i][1]];
			
		}
		var lastKey = Object.keys(last)[0];
		var next;
		if (i+i<points.length){
			next = points[i+1];
		}
		else {
			next = points[i];
		}
		var nextKey = Object.keys(next)[0];
		if (key == 'H' ){
			
			continue;
		}
		else if (key == 'V'){
			
			continue;
		}
		if (lastKey == 'H' ){
			
			continue;
		}
		else if (lastKey == 'V'){
			
			continue;
		}
		if (nextKey == 'H' ){
			
			continue;
		}
		else if (nextKey == 'V'){
			
			continue;
		}
		var thisShift = [avgPoints[i][0],avgPoints[i][1]];
		
		//lastShift = [0,0];
		//thisShift = [0,0];
		pdPoint = {};
		
		pdPoint[key]=[];
		
		var lastPoint = [last[lastKey][last[lastKey].length - 2],last[lastKey][last[lastKey].length - 1]];
		var thisPoint = [myPoint[myPoint.length - 2],myPoint[myPoint.length - 1]];
		
		
		
		
		var box = {'bottomLeft':[lastPoint[0],lastPoint[1]],'topLeft':[lastPoint[0]+lastShift[0],lastPoint[1]+lastShift[1]]};
		box['topRight']=[thisPoint[0]+thisShift[0],thisPoint[1]+thisShift[1]];
		box['bottomRight']=[thisPoint[0],thisPoint[1]];
		topPoints.push([[lastPoint[0]+lastShift[0],lastPoint[1]+lastShift[1]],[thisPoint[0]+thisShift[0],thisPoint[1]+thisShift[1]]]);
		
	}
	console.log(points);
	console.log(topPoints);
	var pathLength = 0;
	for (var ji=0;ji<5;ji++){
		var problems = [];
		var problem  =[];
		pathLength = 0;
		for (var i=1;i<points.length-1;i++){
			var aPoint = {};
			var cPoint = {};
			var key = Object.keys(points[i])[0];
		
			var myPoint = points[i][key];
			var last;
			if (i>0){
				last = points[i-1];
			}
			else {
				last = points[0];
			
			}
			var lastKey = Object.keys(last)[0];
			var next;
			if (i+i<points.length){
				next = points[i+1];
			}
			else {
				next = points[i];
			}
			var nextKey = Object.keys(next)[0];
			if (key == 'H' ){
			
				continue;
			}
			else if (key == 'V'){
			
				continue;
			}
			if (lastKey == 'H' ){
			
				continue;
			}
			else if (lastKey == 'V'){
			
				continue;
			}
			if (nextKey == 'H' ){
			
				continue;
			}
			else if (nextKey == 'V'){
			
				continue;
			}
		
		
			var lastPoint = [last[lastKey][last[lastKey].length - 2],last[lastKey][last[lastKey].length - 1]];
			var thisPoint = [myPoint[myPoint.length - 2],myPoint[myPoint.length - 1]];
		
		
			var box = {'bottomLeft':[lastPoint[0],lastPoint[1]],'bottomRight':[thisPoint[0],thisPoint[1]]};
			box['topLeft']=[topPoints[i][0][0],topPoints[i][0][1]];
			box['topRight']=[topPoints[i][1][0],topPoints[i][1][1]];
			
			var pathD = Math.pow((box['bottomLeft'][0]+box['topLeft'][0])/2-(box['bottomRight'][0]+box['topRight'][0])/2,2);
			pathD += Math.pow((box['bottomLeft'][1]+box['topLeft'][1])/2-(box['bottomRight'][1]+box['topRight'][1])/2,2);
			pathLength += Math.pow(pathD,0.5);
			var leftLine = {'m':0,'point':[0,0]};
			var rightLine = {'m':0,'point':[0,0]};
	
		
			if (box['topLeft'][0]!=box['bottomLeft'][0]){
				leftLine['m']=(box['topLeft'][1]-box['bottomLeft'][1])/(box['topLeft'][0]-box['bottomLeft'][0]);
			}
			else {
				leftLine['m']=1000;
			}
			if (box['bottomRight'][0]!=box['topRight'][0]){
				rightLine['m']=(box['bottomRight'][1]-box['topRight'][1])/(box['bottomRight'][0]-box['topRight'][0]);
			}
			else {
				rightLine['m']=1000;
			}
	
			leftLine['point']=box['bottomLeft'];
			rightLine['point']=box['bottomRight'];
	
		
			var intersect = lineIntersect(leftLine,rightLine);
			var isTriangle = false;
			if (intersect[0] <= box['bottomLeft'][0]*1 && intersect[0] >= box['topLeft'][0]*1){
				isTriangle = true;
			}
			else if (intersect[0] >= box['bottomLeft'][0]*1 && intersect[0] <= box['topLeft'][0]*1){
				isTriangle = true;
			}
			
			var actualTriangle = false;
			if (box['topLeft'][0] == box['topRight'][0] && box['topLeft'][1] == box['topRight'][1] ){
				actualTriangle = true;
			}
			
			if (intersect[0] < box['bottomLeft'][0]*1.02 && intersect[0] > box['topLeft'][0]*0.98){
				actualTriangle = true;
			}
			else if (intersect[0] > box['bottomLeft'][0]*0.98 && intersect[0] < box['topLeft'][0]*1.02){
				actualTriangle = true;
			}
			if (isTriangle || actualTriangle){
				if (problem.length == 0 && isTriangle){ //Start problem
					problem.push(i-1);
					problem.push(i);
					problem.push(i+1);
				}
				else if (problem[problem.length-1]==i){
					problem.push(i+1);
				}
				else if (isTriangle){ //Start problem
					problems.push(problem);
					problem = [];
					problem.push(i-1);
					problem.push(i);
					problem.push(i+1);
				}
				
			}
		}
		if (problem.length > 0){
			problems.push(problem);
		}
		for (var i=0;i<problems.length;i++){
			topPoints = fixProblem(points,problems[i],topPoints,direction);
		}
		
	}
	console.log(points);
	console.log(topPoints);
	var runningLength = 0;
	var outPaths = ['',''];
	for (var i=0;i<points.length;i++){
		var aPoint = {};
		var cPoint = {};
		var key = Object.keys(points[i])[0];
		var opi = 0;
		if (avgPoints[i][2]){
			opi = 1;
		}
		var myPoint = points[i][key];
		var last;
		if (i>0){
			last = points[i-1];
		}
		else {
			last = points[0];
		}
		var lastKey = Object.keys(last)[0];
		var next;
		if (i+i<points.length){
			next = points[i+1];
		}
		else {
			next = points[i];
		}
		var nextKey = Object.keys(next)[0];
		if (key == 'H' ){
			
			continue;
		}
		else if (key == 'V'){
			
			continue;
		}
		if (lastKey == 'H' ){
			
			continue;
		}
		else if (lastKey == 'V'){
			
			continue;
		}
		if (nextKey == 'H' ){
			
			continue;
		}
		else if (nextKey == 'V'){
			
			continue;
		}
		
		pdPoint = {};
		
		pdPoint[key]=[];
		
		var lastPoint = [last[lastKey][last[lastKey].length - 2],last[lastKey][last[lastKey].length - 1]];
		var thisPoint = [myPoint[myPoint.length - 2],myPoint[myPoint.length - 1]];

		
		var box = {'bottomLeft':[lastPoint[0],lastPoint[1]],'bottomRight':[thisPoint[0],thisPoint[1]]};
		box['topLeft']=[topPoints[i][0][0],topPoints[i][0][1]];
		box['topRight']=[topPoints[i][1][0],topPoints[i][1][1]];
		
		
		var zeroLast = [0,0];
		var zeroThis = [thisPoint[0]-lastPoint[0],thisPoint[1]-lastPoint[1]]; 
		var zeroLastNew = [0,0];
		var zeroThisNew = [topPoints[i][1][0]-topPoints[i][0][0],topPoints[i][1][1]-topPoints[i][0][1]]; 
		
		var oldTD = Math.pow(zeroThis[0],2)+Math.pow(zeroThis[1],2);
		var newTD = Math.pow(zeroThisNew[0],2)+Math.pow(zeroThisNew[1],2);
		var ratio = 1;
		if (oldTD != 0){
			ratio = Math.pow(newTD/oldTD,.5);
		}
		
		var fillPath = "M "+lastPoint[0] + " "+lastPoint[1];
		fillPath += " L "+(box['topLeft'][0]) + " "+(box['topLeft'][1]);
		if (outPaths[0].length == 0){
			outPaths[0] += 'M ' + box['topLeft'][0] + " "+box['topLeft'][1];
			
		}
		outPaths[0] += " "+key;
		if (under > 0 && opi > 0){
			outPaths[opi] += ' M ' + box['topLeft'][0] + " "+box['topLeft'][1];
			outPaths[opi] += " "+key;
		}
		
		
		
		
		
		for (var ii=0;ii<myPoint.length/2;ii++){
		
		
			var oldDistance = Math.pow(myPoint[2*ii]-lastPoint[0],2)+Math.pow(myPoint[2*ii+1]-lastPoint[1],2);
			var newDistance = Math.pow(myPoint[2*ii]-lastPoint[0],2)+Math.pow(myPoint[2*ii+1]-lastPoint[1],2);
			var oldD = [myPoint[2*ii]-lastPoint[0],myPoint[2*ii+1]-lastPoint[1]];
		
			var newD = [0,0];
			if (ii >= myPoint.length/2-1){
			
				pdPoint[key].push([box['topRight'][0],box['topRight'][1]]);
				outPaths[0] += " "+(box['topRight'][0])+" "+(box['topRight'][1]);
				if (under > 0 && opi > 0){
					outPaths[opi] += " "+(box['topRight'][0])+" "+(box['topRight'][1]);
				}
			}
			else {
				newD[0] = oldD[0]*ratio;
				newD[1] = oldD[1]*ratio;
				pdPoint[key].push([newD[0]+box['topLeft'][0],newD[1]+box['topLeft'][1]]);
				outPaths[0] += " "+(newD[0]+box['topLeft'][0])+" "+(newD[1]+box['topLeft'][1]);
				if (under > 0 && opi > 0){
					outPaths[opi] += " "+(newD[0]+box['topLeft'][0])+" "+(newD[1]+box['topLeft'][1]);
				}
			}
		
		
		}
		
		
		
		
		
		
		pdPoints.push(pdPoint);
		
		
	}
	if (under == 0){
		var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		newPath.setAttribute('d',outPaths[0]);
		newPath.style.fill = "none";

		newPath.setAttribute('stroke-width','3');
		if (direction == 'in'){
			newPath.setAttribute('stroke',"red");
		}
		else {
			newPath.setAttribute('stroke',"blue");
		}

		heartFill.appendChild(newPath);
	}
	else {
		for (var opi=1;opi<2;opi++){
		
			
			console.log(opi,under,direction);
			var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			newPath.setAttribute('d',outPaths[opi]);
			newPath.style.fill = "none";

			newPath.setAttribute('stroke-width','3');
			if (direction == 'in'){
				newPath.setAttribute('stroke',"red");
			}
			else {
				newPath.setAttribute('stroke',"blue");
			}

			heartFill.appendChild(newPath);
		}
	}
	var newPd = toPath(pdPoints);
	

	return newPd;
}


function fixProblem(points,problem,topPoints,direction) {
	var sum = [0,0];
	var n = [0,0];
	for (var i=0;i<problem.length;i++){
		sum[0] += topPoints[problem[i]][0][0];
		sum[0] += topPoints[problem[i]][1][0];
		sum[1] += topPoints[problem[i]][0][1];
		sum[1] += topPoints[problem[i]][1][1];
		n[0]+=2;
		n[1]+=2;
	}

	var c = [sum[0]/n[0],sum[1]/n[1]];
	topPoints[problem[0]-1][1] = [c[0],c[1]];
	for (var ip=1;ip<problem.length-1;ip++){
		topPoints[problem[ip]][0] = [c[0],c[1]];
		topPoints[problem[ip]][1] = [c[0],c[1]];
	}
	topPoints[problem[problem.length-1]][0] = [c[0],c[1]];
	return topPoints;
	
}

function toQuadratics(points) {
	var qPoints = [];
	var lastPoint = [];
	for(var i=0;i<points.length;i++){
		var key = Object.keys(points[i])[0];
		if (key != 'C'){
			qPoints.push(points[i]);
			lastPoint[0]=points[i][key][points[i][key].length-2];
			lastPoint[1]=points[i][key][points[i][key].length-1];
			continue;
		}
		var t1 = 0.5;
		var t2 = 0.75;
		
		var myPoint = points[i][key];
		var lx = (lastPoint[0]-3*myPoint[0]+3*myPoint[2]-myPoint[4])/16;
		var mx = (3*lastPoint[0]+9*myPoint[0]-3*myPoint[2]-myPoint[4])/16;
		var nx = (-3*lastPoint[0]+3*myPoint[0]+3*myPoint[2]+5*myPoint[4])/16;
		var ly = (lastPoint[1]-3*myPoint[1]+3*myPoint[3]-myPoint[5])/16;
		var my = (3*lastPoint[1]+9*myPoint[1]-3*myPoint[3]-myPoint[5])/16;
		var ny = (-3*lastPoint[1]+3*myPoint[1]+3*myPoint[3]+5*myPoint[5])/16;
		var t = 0.5;
		var curveCenterX = Math.pow(1-t,3)*lastPoint[0];
		curveCenterX += 3*Math.pow(1-t,2)*t*myPoint[0];
		curveCenterX += 3*Math.pow(t,2)*(1-t)*myPoint[2];
		curveCenterX += Math.pow(t,3)*myPoint[4];
		var curveCenterY = Math.pow(1-t,3)*lastPoint[1];
		curveCenterY += 3*Math.pow(1-t,2)*t*myPoint[1];
		curveCenterY += 3*Math.pow(t,2)*(1-t)*myPoint[3];
		curveCenterY += Math.pow(t,3)*myPoint[5];
			
		var firstPoint = {'Q':[0,0,0,0]};
		var secondPoint = {'Q':[0,0,0,0]};
		firstPoint['Q'][2] = curveCenterX;
		firstPoint['Q'][0] = lx*t1+mx-t1/(2*(t1-1))*firstPoint['Q'][2];
		firstPoint['Q'][3] = curveCenterY;
		firstPoint['Q'][1] = ly*t1+my-t1/(2*(t1-1))*firstPoint['Q'][3];
		
		secondPoint['Q'][2] = myPoint[4];
		//secondPoint['Q'][0] = lx*(t2*2)+nx+(t2-1)/(2*(t2)-1)*firstPoint['Q'][2];
		secondPoint['Q'][3] = myPoint[5];
		//secondPoint['Q'][1] = ly*(t2*2)+ny+(t2-1)/(2*(t2)-1)*firstPoint['Q'][3];
		
		secondPoint['Q'][0] = (1/8)*(lastPoint[0]*(t2-1)+myPoint[0]*3*(1-t2)+myPoint[2]*3*(1+t2)+myPoint[4]*(3-t2));
		secondPoint['Q'][1] = (1/8)*(lastPoint[1]*(t2-1)+myPoint[1]*3*(1-t2)+myPoint[3]*3*(1+t2)+myPoint[5]*(3-t2));
		
		
		if (i==13){
			console.log(lastPoint,lx,ly,mx,my,nx,ny,t1,t2,firstPoint['Q'],secondPoint['Q'],myPoint);
		}
		qPoints.push(firstPoint);
		qPoints.push(secondPoint);
		
		lastPoint[0]=points[i][key][points[i][key].length-2];
		lastPoint[1]=points[i][key][points[i][key].length-1];
	}
	return qPoints;
}

function lineIntersect(line1,line2) {
	var xTop = line1['m']*line1['point'][0] - line2['m']*line2['point'][0] + line2['point'][1]-line1['point'][1];
	var xBottom = line1['m']-line2['m'];
	if (xBottom != 0){
		var x = xTop/xBottom;
		var y = line1['m']*(x-line1['point'][0])+line1['point'][1];
		return [x,y];
	}
	else {
		var x = line1['point'][0];
		var y = line1['m']*(x-line1['point'][0])+line1['point'][1];
		return [x,y];
	}
}