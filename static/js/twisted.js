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

function twist(path,strands,type,d,l){
	if (type == 'closed'){
		for (var i=0;i<strands.length;i++){
			strand(path,i,strands[i],strands.length,-1,d,l);
		}
		for (var i=0;i<strands.length;i++){
			strand(path,i,strands[i],strands.length,1,d,l);
		}
	}
	else {
	
		for (var i=0;i<strands.length;i++){
			strand(path,i,strands[i],strands.length,-1,d,l);
		}
		for (var i=0;i<strands.length-1;i++){
			strand(path,i,strands[i],strands.length,0,d,l);
		}
	}
	
}
function strand(pathEl,start,color,n,bottom,d,l) {
	
	var len = pathEl.getTotalLength();
	console.log(len);
	var points = [];
	var pointsMid = [''];
	var lastPoint;
	for (var i=0;i<len;i+=l){
		var pt = pathEl.getPointAtLength(i);
		points.push(pt);
		if (i > 0){
			var ptMid = pathEl.getPointAtLength(i-l/2);
			pointsMid.push(ptMid);
		}
		if (i>0){
			var m = (pt.y-lastPoint.y)/(pt.x-lastPoint.x);
			var dxy = slopeToD(m,d,pt,lastPoint);
			lastPoint.nextDX = dxy[0];
			lastPoint.nextDY = dxy[1];
			lastPoint.next = m;
			pt.lastDX = dxy[0];
			pt.lastDY = dxy[1];
			pt.last = m;
		}
		lastPoint = pt;
	}
	var pt = pathEl.getPointAtLength(len-0.1);
	points.push(pt);

	var ptMid = pathEl.getPointAtLength(i-l/2);
	pointsMid.push(ptMid);

	var m = (pt.y-lastPoint.y)/(pt.x-lastPoint.x);
	var dxy = slopeToD(m,d,pt,lastPoint);
	lastPoint.nextDX = dxy[0];
	lastPoint.nextDY = dxy[1];
	lastPoint.next = m;
	pt.lastDX = dxy[0];
	pt.lastDY = dxy[1];
	pt.last = m;

	if (points.length > 1){
		points[0].lastDX = points[0].nextDX;
		points[0].lastDY = points[0].nextDY;
		points[0].last = points[0].next;
		points[points.length-1].nextDX = points[points.length-1].lastDX;
		points[points.length-1].nextDY = points[points.length-1].lastDY;
		points[points.length-1].next = points[points.length-1].last;
	}
	
	
	var outPath = '';
	var maxShift = (n/2-0.5);
	var shifts = [];
	for (var i=0;i<n;i++){
		shifts.push(maxShift-i);
	}
	for (var i=0;i<points.length;i++){
		var m = (points[i].last + points[i].next)/2;
		var dx = (points[i].nextDX + points[i].lastDX)/2;
		var dy = (points[i].nextDY + points[i].lastDY)/2;
		
		var mul = Math.pow(d,1)/Math.pow((Math.pow(dy,2)+Math.pow(dx,2)),.5);
		if (bottom == 0){
			if ( (i%n ==start || i%n == (n+start-1)%n) && i > start) {
				var offset = (n+i-start)%n;
				if (i%n == start ){
					var offsetL = (n+i-1-start)%n;
					var avgShift = (shifts[offset]+shifts[offsetL])/2;
					outPath += ' Q ';
					outPath += (pointsMid[i].x+dy*mul*avgShift)+' '+(pointsMid[i].y+dx*mul*avgShift)+' ';
					outPath += (points[i].x+dy*mul*shifts[offset])+' '+(points[i].y+dx*mul*shifts[offset]);
				}
				else {
					outPath += ' M ';
					outPath += (points[i].x+dy*mul*shifts[offset])+' '+(points[i].y+dx*mul*shifts[offset]);
				}
			}
			
		}
		else if (bottom == 1){
			if ( (i%n ==start || i%n == (n+start-1)%n) && i >= start) {
				var offset = (n+i-start)%n;
				if (i%n == start ){
					
					outPath += ' M ';
					outPath += (points[i].x+dy*mul*shifts[offset])+' '+(points[i].y+dx*mul*shifts[offset]);
				}
				
				continue;
			}
			
			
			if (i == 0){
				outPath += 'M ';
			}
			else {
				outPath += ' Q ';
			}
			
			var offset = (n+i-start)%n;
			if (i>0){
				var offsetL = (n+i-1-start)%n;
				var avgShift = (shifts[offset]+shifts[offsetL])/2;
				outPath += (pointsMid[i].x+dy*mul*avgShift)+' '+(pointsMid[i].y+dx*mul*avgShift)+' ';
			}
			outPath += (points[i].x+dy*mul*shifts[offset])+' '+(points[i].y+dx*mul*shifts[offset]);
			
		}
		else if (bottom == -1){
			
			
			if (i == 0){
				outPath += 'M ';
			}
			else {
				outPath += ' Q ';
			}
			
			var offset = (n+i-start)%n;
			if (i>0){
				var offsetL = (n+i-1-start)%n;
				var avgShift = (shifts[offset]+shifts[offsetL])/2;
				outPath += (pointsMid[i].x+dy*mul*avgShift)+' '+(pointsMid[i].y+dx*mul*avgShift)+' ';
			}
			outPath += (points[i].x+dy*mul*shifts[offset])+' '+(points[i].y+dx*mul*shifts[offset]);
			
		}
		
		
		
	}
	
	var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	newPath.setAttribute('d',outPath);
	newPath.style.fill = "none";

	newPath.setAttribute('stroke-width',d);
	
	newPath.setAttribute('stroke',color);


	heartFill.appendChild(newPath);
}

function sunburst(path,strands){
	var len = path.getTotalLength();
	var centerPoint = {'x':0,'y':0};
	var s = strands.length;
	var n = Math.round(50/s)*s;
	for (var i=0;i<n;i++){
		var pt = path.getPointAtLength(len*i/n);
		centerPoint.x += pt.x/n;
		centerPoint.y += pt.y/n;
	}
	
	var halfPaths = [];
	for (var i=0;i<s;i++){
		halfPaths.push('M '+centerPoint.x+' '+centerPoint.y);
	}

	for (var i=0;i<n;i++){

		var pt1 = path.getPointAtLength(len*(i)/n);
		var pt2 = path.getPointAtLength(len*(i+0.5)/n);
		var pt3 = path.getPointAtLength(len*(i+1)/n);
	
		halfPaths[i%s] += ' L '+pt1.x+' '+pt1.y;
		halfPaths[i%s] += ' Q '+pt2.x+' '+pt2.y+' '+pt3.x+' '+pt3.y;
		halfPaths[i%s] += ' L '+centerPoint.x+' '+centerPoint.y;

	}

	var pt1 = path.getPointAtLength(len*n/n);
	var pt3 = path.getPointAtLength(len*(0)/n);

	halfPaths[s-1] += ' L '+pt1.x+' '+pt1.y;
	halfPaths[s-1] += ' L '+pt3.x+' '+pt3.y;
	halfPaths[s-1] += ' L '+centerPoint.x+' '+centerPoint.y;
	
	for (var ii=0;ii<s;ii++){
		var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		newPath.setAttribute('d',halfPaths[ii]);
		newPath.style.fill = strands[ii];

		newPath.setAttribute('stroke',strands[ii]);
		newPath.setAttribute('stroke-width','0.5');

		heartFill.appendChild(newPath);
	}
	
}

function slopeToD(m,d,point2,point1){
	var dx = Math.pow(Math.pow(d,2)/(1+Math.pow(m,2)),0.5);
	var dy = Math.pow(Math.pow(m,2)*Math.pow(d,2)/(1+Math.pow(m,2)),0.5);
	
	
	if (point2.x < point1.x){
		dx *= -1;
	}
	if (point2.y < point1.y){
		dy *= -1;
	}
	dx *= -1;
	return [dx,dy];
}
