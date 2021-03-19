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

function outline(pd,margin,direction){
	
	var points = parsePath(pd);
	var qPoints = toQuadratics(points);
	points = qPoints;



	var avgPoints = [];
	var pdPoints = [];
	var ll1 = {'M':[323.70555,578.32901]};
	var ll2 = {'L':[297.29747,550.86823]};
	
	ll1['M']=points[points.length-1][Object.keys(points[points.length-1])[0]];

	var ff2 = {'L':[220.86277,483.99412]};
	var ff3 = {'L':[91.719238,380.29088]};
	//ff['M']=points[0][Object.keys(points[0])[0]];
	points.splice(0,0,ll2);
	points.splice(0,0,ll1);
	points.push(ff2);
	points.push(ff3);
	
	for (var i=1;i<points.length-1;i++){
		var aPoint = {};

		var key = Object.keys(points[i])[0];
		
		var myPoint = points[i][key];
		var last = points[i-1];
		var lastKey = Object.keys(last)[0];
		var next = points[i+1];
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
		if (d1 == 0){
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
			ay *= -1;
			ax *= -1;
		}
		if (ay == 0 && ax == 0){
			console.log(i,thisPoint);
			points.splice(i,1);
			i--;
			continue;
		}
		var mul = Math.pow(margin,1)/Math.pow((Math.pow(ay,2)+Math.pow(ax,2)),.5);
		
		
		aPoint=[ay*mul,ax*mul];
		
		avgPoints.push(aPoint);
	}
	avgPoints.splice(0,0);
	points.splice(0,1);
	var topPoints = [];
	for (var i=1;i<points.length-2;i++){
		var aPoint = {};
		var cPoint = {};
		var key = Object.keys(points[i])[0];
		
		var myPoint = points[i][key];
		var last = points[i-1];
		var lastKey = Object.keys(last)[0];
		var next = points[i+1];
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
		var lastShift = [avgPoints[i-1][0],avgPoints[i-1][1]];
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
	
	for (var ji=0;ji<5;ji++){
		var problems = [];
		var problem  =[];
		for (var i=2;i<points.length-3;i++){
			var aPoint = {};
			var cPoint = {};
			var key = Object.keys(points[i])[0];
		
			var myPoint = points[i][key];
			var last = points[i-1];
			var lastKey = Object.keys(last)[0];
			var next = points[i+1];
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
			box['topLeft']=[topPoints[i-1][0][0],topPoints[i-1][0][1]];
			box['topRight']=[topPoints[i-1][1][0],topPoints[i-1][1][1]];
		
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
				console.log(i,id,box,intersect[0]);
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
				/*var d2 = Math.pow( Math.pow((box['bottomLeft'][1]-box['topRight'][1]),2) + Math.pow((box['bottomLeft'][0]-box['topRight'][0]),2) ,1);
			
				dy2 = margin*Math.pow(Math.pow((box['bottomLeft'][1]-box['topRight'][1]),2)/d2,0.5);
				dx2 = margin*Math.pow(Math.pow((box['bottomLeft'][0]-box['topRight'][0]),2)/d2,0.5);
				var newTopLeftY = 0;
				if (box['topRight'][1]>box['bottomLeft'][1]){
					newTopLeftY = box['bottomLeft'][1] + dy2;
				}
				else {
					newTopLeftY = box['bottomLeft'][1] - dy2;
				}
				var newTopLeftX = 0;
				if (box['topRight'][0]>box['bottomLeft'][0]){
					newTopLeftX = box['bottomLeft'][0] + dx2;
				}
				else {
					newTopLeftX = box['bottomLeft'][0] - dx2;
				}
			
				d2 = Math.pow( Math.pow((box['bottomRight'][1]-box['topLeft'][1]),2) + Math.pow((box['bottomRight'][0]-box['topLeft'][0]),2) ,1);
			
				dy2 = margin*Math.pow(Math.pow((box['bottomRight'][1]-box['topLeft'][1]),2)/d2,0.5);
				dx2 = margin*Math.pow(Math.pow((box['bottomRight'][0]-box['topLeft'][0]),2)/d2,0.5);
				var newTopRightY = 0;
				if (box['topLeft'][1]>box['bottomRight'][1]){
					newTopRightY = box['bottomRight'][1] + dy2;
				}
				else {
					newTopRightY = box['bottomRight'][1] - dy2;
				}
				var newTopRightX = 0;
				if (box['topLeft'][0]>box['bottomRight'][0]){
					newTopRightX = box['bottomRight'][0] + dx2;
				}
				else {
					newTopRightX = box['bottomRight'][0] - dx2;
				}*/
				
				/*
				var bottomMid = [(box['bottomLeft'][0]+box['bottomRight'][0])/2,(box['bottomLeft'][1]+box['bottomRight'][1])/2];
				var topMid = [(box['topLeft'][0]+box['topRight'][0])/2,(box['topLeft'][1]+box['topRight'][1])/2];
				var d2 = Math.pow( Math.pow((bottomMid[1]-topMid[1]),2) + Math.pow((bottomMid[0]-topMid[0]),2) ,1);
			
				dy2 = margin*Math.pow(Math.pow((bottomMid[1]-topMid[1]),2)/d2,0.5);
				dx2 = margin*Math.pow(Math.pow((bottomMid[0]-topMid[0]),2)/d2,0.5);
				var newTopMidY = 0;
				if (topMid[1]>bottomMid[1]){
					newTopMidY = bottomMid[1] + dy2;
				}
				else {
					newTopMidY = bottomMid[1] - dy2;
				}
				var newTopMidX = 0;
				if (topMid[0]>bottomMid[0]){
					newTopMidX = bottomMid[0] + dx2;
				}
				else {
					newTopMidX = bottomMid[0] - dx2;
				}
			
				topPoints[i-1][0] = [newTopMidX,newTopMidY];
				topPoints[i-1][1] = [newTopMidX,newTopMidY];
				topPoints[i-2][1] = [newTopMidX,newTopMidY];
				topPoints[i][0] = [newTopMidX,newTopMidY];
				*/
			}
		}
		if (problem.length > 0){
			problems.push(problem);
		}
		for (var i=0;i<problems.length;i++){
			topPoints = fixProblem(points,problems[i],topPoints,direction);
			console.log(problems[i]);
		}
		
	}
	/*for (var i=2;i<points.length-3;i++){
		var aPoint = {};
		var cPoint = {};
		var key = Object.keys(points[i])[0];
		
		var myPoint = points[i][key];
		var last = points[i-1];
		var lastKey = Object.keys(last)[0];
		var next = points[i+1];
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
		box['topLeft']=[topPoints[i-1][0][0],topPoints[i-1][0][1]];
		box['topRight']=[topPoints[i-1][1][0],topPoints[i-1][1][1]];
		
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
		if (intersect[0] < box['bottomLeft'][0] && intersect[0] > box['topLeft'][0]){
			isTriangle = true;
		}
		else if (intersect[0] > box['bottomLeft'][0] && intersect[0] < box['topLeft'][0]){
			isTriangle = true;
		}
		if (isTriangle){
			console.log(i,id,box);
			topPoints[i-1][0] = [box['topRight'][0],box['topRight'][1]];
			topPoints[i-1][1] = [box['topLeft'][0],box['topLeft'][1]];
			topPoints[i-2][1] = [box['topRight'][0],box['topRight'][1]];
			topPoints[i][0] = [box['topLeft'][0],box['topLeft'][1]];
		}
	}*/
	for (var i=1;i<points.length-2;i++){
		var aPoint = {};
		var cPoint = {};
		var key = Object.keys(points[i])[0];
		
		var myPoint = points[i][key];
		var last = points[i-1];
		var lastKey = Object.keys(last)[0];
		var next = points[i+1];
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
		box['topLeft']=[topPoints[i-1][0][0],topPoints[i-1][0][1]];
		box['topRight']=[topPoints[i-1][1][0],topPoints[i-1][1][1]];
		
		
		var zeroLast = [0,0];
		var zeroThis = [thisPoint[0]-lastPoint[0],thisPoint[1]-lastPoint[1]]; 
		var zeroLastNew = [0,0];
		var zeroThisNew = [topPoints[i-1][1][0]-topPoints[i-1][0][0],topPoints[i-1][1][1]-topPoints[i-1][0][1]]; 
		
		var oldTD = Math.pow(zeroThis[0],2)+Math.pow(zeroThis[1],2);
		var newTD = Math.pow(zeroThisNew[0],2)+Math.pow(zeroThisNew[1],2);
		var ratio = 1;
		if (oldTD != 0){
			ratio = Math.pow(newTD/oldTD,.5);
		}
		
		var fillPath = "M "+lastPoint[0] + " "+lastPoint[1];
		fillPath += " L "+(box['topLeft'][0]) + " "+(box['topLeft'][1]);
		
		var isTriangle = false;
		if (box['topLeft'][0] != box['topRight'][0] || box['topLeft'][1] != box['topRight'][1] ){
			fillPath += " "+key;
			for (var ii=0;ii<myPoint.length/2;ii++){
			
			
				var oldDistance = Math.pow(myPoint[2*ii]-lastPoint[0],2)+Math.pow(myPoint[2*ii+1]-lastPoint[1],2);
				var newDistance = Math.pow(myPoint[2*ii]-lastPoint[0],2)+Math.pow(myPoint[2*ii+1]-lastPoint[1],2);
				var oldD = [myPoint[2*ii]-lastPoint[0],myPoint[2*ii+1]-lastPoint[1]];
			
				var newD = [0,0];
				if (ii >= myPoint.length/2-1){
				
					pdPoint[key].push([box['topRight'][0],box['topRight'][1]]);
					fillPath += " "+(box['topRight'][0])+" "+(box['topRight'][1]);
				}
				else {
					newD[0] = oldD[0]*ratio;
					newD[1] = oldD[1]*ratio;
					pdPoint[key].push([newD[0]+box['topLeft'][0],newD[1]+box['topLeft'][1]]);
					fillPath += " "+(newD[0]+box['topLeft'][0])+" "+(newD[1]+box['topLeft'][1]);
				}
			
			
			}
		}
		else {
			isTriangle = true;
		}
		
		fillPath += " L "+(thisPoint[0]) + " "+(thisPoint[1]);
		fillPath += " "+key;
		for (var ii=myPoint.length/2-2;ii>=0;ii--){
			
			fillPath += " "+(myPoint[2*ii])+" "+(myPoint[2*ii+1]);
		}
		fillPath += " "+lastPoint[0] + " "+lastPoint[1];
		//console.log(fillPath);

		
		var linear = 1;
		if (isTriangle){
			linear = 6;
		}
		
		if (myPoint.length== 6 && !isTriangle){
			var t = 0.5;
			var curveCenterXTop = Math.pow(1-t,3)*(topPoints[i-1][1][0]);
			curveCenterXTop += 3*Math.pow(1-t,2)*t*pdPoint[key][0][0];
			curveCenterXTop += 3*Math.pow(t,2)*(1-t)*pdPoint[key][1][0];
			curveCenterXTop += Math.pow(t,3)*pdPoint[key][2][0];
			var curveCenterYTop = Math.pow(1-t,3)*(topPoints[i-1][0][1]);
			curveCenterYTop += 3*Math.pow(1-t,2)*t*pdPoint[key][0][1];
			curveCenterYTop += 3*Math.pow(t,2)*(1-t)*pdPoint[key][1][1];
			curveCenterYTop += Math.pow(t,3)*pdPoint[key][2][1];
			var curveCenterX = Math.pow(1-t,3)*lastPoint[0];
			curveCenterX += 3*Math.pow(1-t,2)*t*myPoint[0];
			curveCenterX += 3*Math.pow(t,2)*(1-t)*myPoint[2];
			curveCenterX += Math.pow(t,3)*myPoint[4];
			var curveCenterY = Math.pow(1-t,3)*lastPoint[1];
			curveCenterY += 3*Math.pow(1-t,2)*t*myPoint[1];
			curveCenterY += 3*Math.pow(t,2)*(1-t)*myPoint[3];
			curveCenterY += Math.pow(t,3)*myPoint[5];
			//var linearH = Math.pow((box['topLeft'][0]+box['topRight'][0])/2-curveCenterXTop,2)+Math.pow((box['topLeft'][1]+box['topRight'][1])/2-curveCenterYTop,2);
			//var linearV = Math.pow((box['topLeft'][0]+box['topRight'][0])/2-box['topLeft'][0],2)+Math.pow((box['topLeft'][1]+box['topRight'][1])/2-box['topLeft'][1],2);
			//var topSlope = ((box['topLeft'][1]+box['topRight'][1])/2-curveCenterYTop)/((box['topLeft'][0]+box['topRight'][0])/2-curveCenterXTop);
			//var bottomSlope = ((box['bottomLeft'][1]+box['bottomRight'][1])/2-curveCenterY)/((box['bottomLeft'][0]+box['bottomRight'][0])/2-curveCenterX);
			var underTop = false;
			if (box['topLeft'][0]>box['topRight'][0]){
				var topYatX = (curveCenterXTop-box['topRight'][0])/(box['topLeft'][0]-box['topRight'][0]) * (box['topLeft'][1]-box['topRight'][1]) + box['topRight'][1];
				if (curveCenterYTop<topYatX){
					underTop = true;
				}
			}
			else {
				var topYatX = (curveCenterXTop-box['topLeft'][0])/(box['topRight'][0]-box['topLeft'][0]) * (box['topRight'][1]-box['topLeft'][1]) + box['topLeft'][1];
				if (curveCenterYTop<topYatX){
					underTop = true;
				}
			}
			
			var underBottom = false;
			if (box['bottomLeft'][0]>box['bottomRight'][0]){
				var bottomYatX = (curveCenterX-box['bottomRight'][0])/(box['bottomLeft'][0]-box['bottomRight'][0]) * (box['bottomLeft'][1]-box['bottomRight'][1]) + box['bottomRight'][1];
				if (curveCenterY<bottomYatX){
					underBottom = true;
				}
			}
			else {
				var bottomYatX = (curveCenterXTop-box['bottomLeft'][0])/(box['bottomRight'][0]-box['bottomLeft'][0]) * (box['bottomRight'][1]-box['bottomLeft'][1]) + box['bottomLeft'][1];
				if (curveCenterY<bottomYatX){
					underBottom = true;
				}
			}
			
			
			if (underTop != underBottom){
				linear = true;
			}
			else {
				linear = false;
			}
			console.log(i,underTop,underBottom);
		}
		else if (myPoint.length== 4 && !isTriangle){
			var t = 0.5;
			var curveCenterXTop = Math.pow(1-t,2)*(box['topLeft'][0]);
			curveCenterXTop += 2*Math.pow(1-t,1)*t*pdPoint[key][0][0];
			curveCenterXTop += Math.pow(t,2)*pdPoint[key][1][0];
			var curveCenterYTop = Math.pow(1-t,2)*(box['topLeft'][1]);
			curveCenterYTop += 2*Math.pow(1-t,1)*t*pdPoint[key][0][1];
			curveCenterYTop += Math.pow(t,2)*pdPoint[key][1][1];
			var curveCenterX = Math.pow(1-t,2)*lastPoint[0];
			curveCenterX += 2*Math.pow(1-t,1)*t*myPoint[0];
			curveCenterX += Math.pow(t,2)*myPoint[2];
			var curveCenterY = Math.pow(1-t,2)*lastPoint[1];
			curveCenterY += 2*Math.pow(1-t,1)*t*myPoint[1];
			curveCenterY += Math.pow(t,2)*myPoint[3];
			//var linearH = Math.pow((box['topLeft'][0]+box['topRight'][0])/2-curveCenterXTop,2)+Math.pow((box['topLeft'][1]+box['topRight'][1])/2-curveCenterYTop,2);
			//var linearV = Math.pow((box['topLeft'][0]+box['topRight'][0])/2-box['topLeft'][0],2)+Math.pow((box['topLeft'][1]+box['topRight'][1])/2-box['topLeft'][1],2);
			//var topSlope = ((box['topLeft'][1]+box['topRight'][1])/2-curveCenterYTop)/((box['topLeft'][0]+box['topRight'][0])/2-curveCenterXTop);
			//var bottomSlope = ((box['bottomLeft'][1]+box['bottomRight'][1])/2-curveCenterY)/((box['bottomLeft'][0]+box['bottomRight'][0])/2-curveCenterX);
			var underTop = -1;
			if (box['topLeft'][0]>box['topRight'][0]){
				var topYatX = (curveCenterXTop-box['topRight'][0])/(box['topLeft'][0]-box['topRight'][0]) * (box['topLeft'][1]-box['topRight'][1]) + box['topRight'][1];
				if (curveCenterYTop<topYatX){
					underTop = 1;
				}
				else if (curveCenterYTop == topYatX){
					underTop = 0;
				}
			}
			else {
				var topYatX = (curveCenterXTop-box['topLeft'][0])/(box['topRight'][0]-box['topLeft'][0]) * (box['topRight'][1]-box['topLeft'][1]) + box['topLeft'][1];
				if (curveCenterYTop<topYatX){
					underTop = 1;
				}
				else if (curveCenterYTop == topYatX){
					underTop = 0;
				}
			}
			
			var underBottom = -1;
			if (box['bottomLeft'][0]>box['bottomRight'][0]){
				var bottomYatX = (curveCenterX-box['bottomRight'][0])/(box['bottomLeft'][0]-box['bottomRight'][0]) * (box['bottomLeft'][1]-box['bottomRight'][1]) + box['bottomRight'][1];
				if (curveCenterY<bottomYatX){
					underBottom = 1;
				}
				else if (curveCenterY == bottomYatX){
					underBottom = 0;
				}
			}
			else {
				var bottomYatX = (curveCenterXTop-box['bottomLeft'][0])/(box['bottomRight'][0]-box['bottomLeft'][0]) * (box['bottomRight'][1]-box['bottomLeft'][1]) + box['bottomLeft'][1];
				if (curveCenterY<bottomYatX){
					underBottom = 1;
				}
				else if (curveCenterY == bottomYatX){
					underBottom = 0;
				}
			}
			
			
			if (underTop != underBottom){
				linear = 2;
			}
			else if (underBottom == 0 ){
				linear = 3;
			}
			else if ( underTop == 0){
				linear = 4;
			}
			else {
				
				linear = false;
			}
			
		}
		
		if (i>2 && i < points.length-3){
			var id = direction;
			
			
	
			if (linear){
				linearGradient(i,id,box,linear,direction);
			}
			else {
				
				
				var isLinear = radialGradient(i,id,box,lastPoint,myPoint,pdPoint[key]);
				if (isLinear == 'linear'){
					linearGradient(i,id,box,5,direction);
				}
			}
			var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			newPath.setAttribute('d',fillPath);
			newPath.style.fill = "url(#box-grad-"+i+"-"+id+")";
		
			if (i%2 == 0){
				newPath.setAttribute('stroke-width','0.25');
				newPath.setAttribute('stroke',"url(#box-gradh-"+i+"-"+id+")");
			}
			else {
				newPath.setAttribute('stroke-width','0.25');
				newPath.setAttribute('stroke',"url(#box-gradh-"+i+"-"+id+")");
			}
		
			heartFill.appendChild(newPath);
		}
		
		
		
		pdPoints.push(pdPoint);
		
		
	}
	
	var newPd = toPath(pdPoints);
	

	return newPd;
}


function fixProblem(points,problem,topPoints,direction) {
	var sum = [0,0];
	var n = [0,0];
	for (var i=0;i<problem.length;i++){
		sum[0] += topPoints[problem[i]-1][0][0];
		sum[0] += topPoints[problem[i]-1][1][0];
		sum[1] += topPoints[problem[i]-1][0][1];
		sum[1] += topPoints[problem[i]-1][1][1];
		n[0]+=2;
		n[1]+=2;
	}
	/*var mid = Math.floor(problem.length/2);
	var key = Object.keys(points[problem[mid]])[0];
	var midPoint = points[problem[mid]][key];
	var midLeft = {'x':midPoint[midPoint.length-2],'y':midPoint[midPoint.length-1]};
	key = Object.keys(points[problem[mid+1]])[0];
	var midPoint2 = points[problem[mid+1]][key];
	var midRight = {'x':midPoint2[midPoint2.length-2],'y':midPoint2[midPoint2.length-1]};
	var d= Math.pow(midRight.x-midLeft.x,2)+Math.pow(midRight.y-midLeft.y,2);
	if (d>Math.pow(49,2)){
		var mid = Math.floor(problem.length/2);
		var problemLeft = problem.slice(0,mid+1);
		problemLeft.push(problem[mid+1]);
		var problemRight = problem.slice(mid+1);
		console.log(problemLeft,problemRight);
		topPoints = fixProblem(points,problemLeft,topPoints,direction);
		topPoints = fixProblem(points,problemRight,topPoints,direction);
		return topPoints;
	}
	console.log(midLeft, midRight);
	var c = circleFrom2Points(midLeft,midRight,25,direction);*/
	var c = [sum[0]/n[0],sum[1]/n[1]];
	console.log(c);
	topPoints[problem[0]-1][1] = [c[0],c[1]];
	for (var ip=1;ip<problem.length-1;ip++){
		topPoints[problem[ip]-1][0] = [c[0],c[1]];
		topPoints[problem[ip]-1][1] = [c[0],c[1]];
	}
	topPoints[problem[problem.length-1]-1][0] = [c[0],c[1]];
	return topPoints;
	/*
	var key = Object.keys(points[problem[0]])[0];
	var lastGood = points[problem[0]][key];
	var bottomFirst = {'x':lastGood[lastGood.length-2],'y':lastGood[lastGood.length-1]};
	key = Object.keys(points[problem[problem.length-2]])[0];
	var lastBad = points[problem[problem.length-2]][key];
	var bottomLast = {'x':lastBad[lastBad.length-2],'y':lastBad[lastBad.length-1]};
	var d= Math.pow(bottomLast.x-bottomFirst.x,2)+Math.pow(bottomLast.y-bottomFirst.y,2);
	if (d>Math.pow(49,2)){
		var mid = Math.floor(problem.length/2);
		var problemLeft = problem.slice(0,mid+1);
		problemLeft.push(problem[mid+1]);
		var problemRight = problem.slice(mid+1);
		console.log(problemLeft,problemRight);
		topPoints = fixProblem(points,problemLeft,topPoints,direction);
		topPoints = fixProblem(points,problemRight,topPoints,direction);
		return topPoints;
	}
	console.log(bottomFirst, bottomLast);
	var c = circleFrom2Points(bottomFirst,bottomLast,25,direction);
	console.log(c);
	topPoints[problem[0]-1][1] = [c[0],c[1]];
	for (var ip=1;ip<problem.length-1;ip++){
		topPoints[problem[ip]-1][0] = [c[0],c[1]];
		topPoints[problem[ip]-1][1] = [c[0],c[1]];
	}
	topPoints[problem[problem.length-1]-1][0] = [c[0],c[1]];
	*/
	return topPoints;
	for (var ip=0;ip<problem.length*0;ip++){
		var i = problem[ip];
		var aPoint = {};
		var cPoint = {};
		var key = Object.keys(points[i])[0];
	
		var myPoint = points[i][key];
		var last = points[i-1];
		var lastKey = Object.keys(last)[0];
		var next = points[i+1];
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
		box['topLeft']=[topPoints[i-1][0][0],topPoints[i-1][0][1]];
		box['topRight']=[topPoints[i-1][1][0],topPoints[i-1][1][1]];
	
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
		if (intersect[0] < box['bottomLeft'][0]*.97 && intersect[0] > box['topLeft'][0]*1.03){
			isTriangle = true;
		}
		else if (intersect[0] > box['bottomLeft'][0]*1.03 && intersect[0] < box['topLeft'][0]*.97){
			isTriangle = true;
		}
		if (isTriangle){
			console.log(i,id,box,intersect[0]);
			if (problem.length == 0){
				problem.push(i-1);
				problem.push(i);
				problem.push(i+1);
			}
			else if (problem[problem.length-1]==i){
				problem.push(i+1);
			}
			else {
				console.log(problem);
				break;
			}
			
			var bottomMid = [(box['bottomLeft'][0]+box['bottomRight'][0])/2,(box['bottomLeft'][1]+box['bottomRight'][1])/2];
			var topMid = [(box['topLeft'][0]+box['topRight'][0])/2,(box['topLeft'][1]+box['topRight'][1])/2];
			var d2 = Math.pow( Math.pow((bottomMid[1]-topMid[1]),2) + Math.pow((bottomMid[0]-topMid[0]),2) ,1);
		
			dy2 = margin*Math.pow(Math.pow((bottomMid[1]-topMid[1]),2)/d2,0.5);
			dx2 = margin*Math.pow(Math.pow((bottomMid[0]-topMid[0]),2)/d2,0.5);
			var newTopMidY = 0;
			if (topMid[1]>bottomMid[1]){
				newTopMidY = bottomMid[1] + dy2;
			}
			else {
				newTopMidY = bottomMid[1] - dy2;
			}
			var newTopMidX = 0;
			if (topMid[0]>bottomMid[0]){
				newTopMidX = bottomMid[0] + dx2;
			}
			else {
				newTopMidX = bottomMid[0] - dx2;
			}
		
			topPoints[i-1][0] = [newTopMidX,newTopMidY];
			topPoints[i-1][1] = [newTopMidX,newTopMidY];
			topPoints[i-2][1] = [newTopMidX,newTopMidY];
			topPoints[i][0] = [newTopMidX,newTopMidY];
		}
	}
}

function circleFrom2Points(p1,p2,r,direction){
	var q = Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
	var x3 = (p1.x+p2.x)/2;
	var y3 = (p1.y+p2.y)/2;
	var x0; var y0;
	if (direction == 'out'){
		x0 = x3 - Math.sqrt(Math.pow(r,2)-Math.pow(q/2,2))*(p1.y-p2.y)/q;
		y0 = y3 - Math.sqrt(Math.pow(r,2)-Math.pow(q/2,2))*(p2.x-p1.x)/q;
	}
	else if (direction == 'in'){
		x0 = x3 + Math.sqrt(Math.pow(r,2)-Math.pow(q/2,2))*(p1.y-p2.y)/q;
		y0 = y3 + Math.sqrt(Math.pow(r,2)-Math.pow(q/2,2))*(p2.x-p1.x)/q;
	}
	return [x0,y0];
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

function linearGradient(i,id,box,type,direction){
	var myColor = 'rgb(0,0,0)';
	if (type == 1){
		myColor = 'rgb(0,0,255)';
	}
	else if (type == 2){
		myColor = 'rgb(0,255,0)';
	}
	else if (type == 3){
		myColor = 'rgb(255,0,0)';
	}
	else if (type == 4){
		myColor = 'rgb(255,0,255)';
	}
	else if (type == 5){
		myColor = 'rgb(255,255,0)';
	}
	else if (type == 6){
		myColor = 'rgb(0,255,255)';
		var p1 = {'x':box['bottomLeft'][0],'y':box['bottomLeft'][1]};
		var p2 = {'x':box['bottomRight'][0],'y':box['bottomRight'][1]};
		var c = circleFrom2Points(p1,p2,25*2,direction);
		var d2 = Math.pow(box['topLeft'][0]-c[0],2)+Math.pow(box['topLeft'][1]-c[1],2);
		var d = Math.pow(d2,0.5);
		var newDef = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
		var lG = document.createElementNS("http://www.w3.org/2000/svg", 'radialGradient');
		lG.id="box-grad-"+i+"-"+id;
		lG.setAttribute('cx',c[0]);
		lG.setAttribute('cy',c[1]);
		lG.setAttribute('fx',box['topLeft'][0]);
		lG.setAttribute('fy',box['topLeft'][1]);
		lG.setAttribute('r',0.25);
		lG.setAttribute('fr',d);
		lG.setAttribute('gradientUnits','userSpaceOnUse');
		var newStop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
		newStop.setAttribute('offset','0%');
		newStop.setAttribute('stop-color','white');
		newStop.setAttribute('stop-opacity','0.0');
		lG.appendChild(newStop);
		var newStopT = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
		newStopT.setAttribute('offset','100%');
		newStopT.setAttribute('stop-color','white');
		newStopT.setAttribute('stop-opacity','0.7');
		lG.appendChild(newStopT);
		newDef.appendChild(lG);
	
		var strokeGrad = lG.cloneNode(true);
		strokeGrad.id = "box-gradh-"+i+"-"+id;
		strokeGrad.querySelectorAll('stop')[1].setAttribute('stop-opacity','0.2');
		newDef.appendChild(strokeGrad);
	
		heartFill.appendChild(newDef);
		return;
		
	}
	var newDef = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
	var lG = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
	lG.id="box-grad-"+i+"-"+id;
	
	
	lG.setAttribute('x1',(box['bottomLeft'][0]+box['bottomRight'][0])/2);
	lG.setAttribute('y1',(box['bottomLeft'][1]+box['bottomRight'][1])/2);
	lG.setAttribute('x2',(box['topLeft'][0]+box['topRight'][0])/2);
	lG.setAttribute('y2',(box['topLeft'][1]+box['topRight'][1])/2);
	
	var d = Math.pow(Math.pow((box['bottomLeft'][0]+box['bottomRight'][0])/2-(box['topLeft'][0]+box['topRight'][0])/2,2)+Math.pow((box['bottomLeft'][1]+box['bottomRight'][1])/2-(box['topLeft'][1]+box['topRight'][1])/2,2),0.5);
	var stopOpacity = 0.7*(1.0 - d/25);
	lG.setAttribute('gradientUnits','userSpaceOnUse');
	var newStop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	newStop.setAttribute('offset','0%');
	newStop.setAttribute('stop-color',myColor);
	newStop.setAttribute('stop-opacity','0.7');
	lG.appendChild(newStop);
	var newStopT = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	newStopT.setAttribute('offset','100%');
	newStopT.setAttribute('stop-color',myColor);
	newStopT.setAttribute('stop-opacity',stopOpacity);
	lG.appendChild(newStopT);
	newDef.appendChild(lG);
	
	
	var strokeGrad = lG.cloneNode(true);
	strokeGrad.id = "box-gradh-"+i+"-"+id;
	strokeGrad.querySelector('stop').setAttribute('stop-opacity','0.2');
	newDef.appendChild(strokeGrad);
	
	heartFill.appendChild(newDef);
}

function radialGradient(i,id,box,lastPoint,myPoint,newPoint){
	var newDef = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
	var lG = document.createElementNS("http://www.w3.org/2000/svg", 'radialGradient');
	lG.id="box-grad-"+i+"-"+id;
	var bottomLine = {'m':0,'point':[0,0]};
	var leftLine = {'m':0,'point':[0,0]};
	var rightLine = {'m':0,'point':[0,0]};
	
	if (box['bottomRight'][0]!=box['bottomLeft'][0]){
		bottomLine['m']=(box['bottomRight'][1]-box['bottomLeft'][1])/(box['bottomRight'][0]-box['bottomLeft'][0]);
	}
	else {
		bottomLine['m']=1000;
	}
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
	
	bottomLine['point']=[(box['bottomRight'][0]+box['bottomLeft'][0])/2,(box['bottomRight'][1]+box['bottomLeft'][1])/2];
	
	if (bottomLine['m'] != 0){
		bottomLine['m']=-1/bottomLine['m'];
	}
	else {
		bottomLine['m']=1000;
	}
	
	
	var centerF = lineIntersect(bottomLine,leftLine);

	var t = 0.5;
	var curveCenterXTop = Math.pow(1-t,2)*(box['topLeft'][0]);
	curveCenterXTop += 2*Math.pow(1-t,1)*t*newPoint[0][0];
	curveCenterXTop += Math.pow(t,2)*newPoint[1][0];
	var curveCenterYTop = Math.pow(1-t,2)*(box['topLeft'][1]);
	curveCenterYTop += 2*Math.pow(1-t,1)*t*newPoint[0][1];
	curveCenterYTop += Math.pow(t,2)*newPoint[1][1];
	var curveCenterX = Math.pow(1-t,2)*lastPoint[0];
	curveCenterX += 2*Math.pow(1-t,1)*t*myPoint[0];
	curveCenterX += Math.pow(t,2)*myPoint[2];
	var curveCenterY = Math.pow(1-t,2)*lastPoint[1];
	curveCenterY += 2*Math.pow(1-t,1)*t*myPoint[1];
	curveCenterY += Math.pow(t,2)*myPoint[3];
	
	var bigR2 = Math.pow(box['topLeft'][0]-centerF[0],2)+Math.pow(box['topLeft'][1]-centerF[1],2);
	var smallR2 = Math.pow(box['bottomLeft'][0]-centerF[0],2)+Math.pow(box['bottomLeft'][1]-centerF[1],2);
	
	var circleVals = {};
	circleVals.cx = centerF[0];
	circleVals.cy = centerF[1];
	circleVals.fx = centerF[0];
	circleVals.fy = centerF[1];
	circleVals.r = Math.pow(bigR2,.5);
	circleVals.fr = Math.pow(smallR2,.5);

	
	if (myPoint.length== 4){
		var p1 = {};
		var p2 = {};
		var p3 = {};
		p1.x = box['bottomLeft'][0];
		p1.y = box['bottomLeft'][1];
		p2.x = curveCenterX;
		p2.y = curveCenterY;
		p3.x = box['bottomRight'][0];
		p3.y = box['bottomRight'][1];
		
		var circle = circleFromThreePoints(p1,p2,p3);
		if (!isFinite(circle.r)){
			return 'linear';
		}
		
		circleVals.fx = circle.x;
		circleVals.fy = circle.y;
		circleVals.fr = circle.r;
		
		
		var pp1 = {};
		var pp2 = {};
		var pp3 = {};
		pp1.x = box['topLeft'][0];
		pp1.y = box['topLeft'][1];
		pp2.x = curveCenterXTop;
		pp2.y = curveCenterYTop;
		pp3.x = box['topRight'][0];
		pp3.y = box['topRight'][1];
		var circle2 = circleFromThreePoints(pp1,pp2,pp3);
		if (!isFinite(circle2.r)){
			return 'linear';
		}
		circleVals.cx = circle2.x;
		circleVals.cy = circle2.y;
		circleVals.r = circle2.r;
		
		var z = 1.0;
		var ci = circleIntersect(circle,circle2,i);
		var flipZ = false;
		var count = 0;
		while ( ci && ci != 0 && count < 20){
			
			var pp1 = {};
			var pp2 = {};
			var pp3 = {};
			if (flipZ){
				z+= 0.1;
			}
			else {
				z -= 0.1;
			}
			
			pp1.x = box['topLeft'][0];
			pp1.y = box['topLeft'][1];
			pp2.x = curveCenterXTop*z+(box['topLeft'][0]+box['topRight'][0])/2*(1-z);
			pp2.y = curveCenterYTop*z+(box['topLeft'][1]+box['topRight'][1])/2*(1-z);
			pp3.x = box['topRight'][0];
			pp3.y = box['topRight'][1];
			var circle2 = circleFromThreePoints(pp1,pp2,pp3);
			if (!isFinite(circle2.r)){
				return 'linear';
			}
			ci = circleIntersect(circle,circle2,i);
			
			cii = ci;
			circleVals.cx = circle2.x;
			circleVals.cy = circle2.y;
			circleVals.r = circle2.r;
			if (z<0.2){
				flipZ = true;
				z = 1.0;
			}
			count++;
			if (count > 18){
				return 'linear';
			}
		}
		//console.log(bottomLine,leftLine,centerF,curveCenterX,curveCenterY,curveCenterXTop,curveCenterYTop,circle,circle2,pp1,pp2,pp3);
	}
	
	lG.setAttribute('cx',circleVals.cx);
	lG.setAttribute('cy',circleVals.cy);
	lG.setAttribute('fx',circleVals.fx);
	lG.setAttribute('fy',circleVals.fy);
	lG.setAttribute('r',circleVals.r);
	lG.setAttribute('fr',circleVals.fr);
	lG.setAttribute('gradientUnits','userSpaceOnUse');
	var newStop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	newStop.setAttribute('offset','0%');
	newStop.setAttribute('stop-color','white');
	newStop.setAttribute('stop-opacity','0.7');
	lG.appendChild(newStop);
	var newStopT = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
	newStopT.setAttribute('offset','100%');
	newStopT.setAttribute('stop-color','white');
	newStopT.setAttribute('stop-opacity','0.0');
	lG.appendChild(newStopT);
	newDef.appendChild(lG);
	
	var strokeGrad = lG.cloneNode(true);
	strokeGrad.id = "box-gradh-"+i+"-"+id;
	strokeGrad.querySelector('stop').setAttribute('stop-opacity','0.2');
	newDef.appendChild(strokeGrad);
	
	heartFill.appendChild(newDef);
	
	
}

function circleIntersect(circle,circle2,i) {
	if (circle.r > circle2.r){
		return 'linear';
	}
	var dc = Math.pow(circle.x-circle2.x,2)+Math.pow(circle.y-circle2.y,2);
	var dr = Math.abs(circle.r-circle2.r);
	var drp = Math.abs(circle.r+circle2.r);
	if (dr <= Math.pow(dc,.5) && Math.pow(dc,.5) <= drp){
		return circle.r-circle2.r;
	}
	else if (Math.pow(dc,.5) > drp){
		return 'linear';
	}
	else {
		return false;
	}
	//y*(2*circle2.y-2*circle.y)
	//=
	//Math.pow((x-circle2.x),2)-Math.pow((x-circle.x),2)-Math.pow(circle2.r,2)+Math.pow(circle.r,2)+Math.pow(circle2.y,2)-Math.pow(circle.y,2);
}

function circleFromThreePoints(p1, p2, p3) {

  var x1 = p1.x;
  var y1 = p1.y;
  var x2 = p2.x;
  var y2 = p2.y;
  var x3 = p3.x;
  var y3 = p3.y;

  var a = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;

  var b = (x1 * x1 + y1 * y1) * (y3 - y2) 
        + (x2 * x2 + y2 * y2) * (y1 - y3)
        + (x3 * x3 + y3 * y3) * (y2 - y1);
 
  var c = (x1 * x1 + y1 * y1) * (x2 - x3) 
        + (x2 * x2 + y2 * y2) * (x3 - x1) 
        + (x3 * x3 + y3 * y3) * (x1 - x2);
 
  var x = -b / (2 * a);
  var y = -c / (2 * a);

  return {
    x: x,
    y: y,
    r: Math.hypot(x - x1, y - y1)
  };
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