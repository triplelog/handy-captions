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

function twist(pathEl,start,color) {
	
	var len = pathEl.getTotalLength();
	console.log(len);
	var points = [];
	var lastPoint;
	var d = 2;
	for (var i=0;i<len;i+=10){
		var pt = pathEl.getPointAtLength(i);
		points.push(pt);
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
	if (points.length > 1){
		points[0].lastDX = points[0].nextDX;
		points[0].lastDY = points[0].nextDY;
		points[0].last = points[0].next;
		points[points.length-1].nextDX = points[points.length-1].lastDX;
		points[points.length-1].nextDY = points[points.length-1].lastDY;
		points[points.length-1].next = points[points.length-1].last;
	}
	console.log(points);
	
	
	var outPath = '';
	for (var i=0;i<points.length;i++){
		var m = (points[i].last + points[i].next)/2;
		var dx = (points[i].nextDX + points[i].lastDX)/2;
		var dy = (points[i].nextDY + points[i].lastDY)/2;
		
		var mul = Math.pow(d,1)/Math.pow((Math.pow(dy,2)+Math.pow(dx,2)),.5);
		if (i == 0){
			outPath += 'M ';
		}
		else {
			outPath += ' L ';
		}
		if (i%3 == start) {
			outPath += (points[i].x+dy*mul)+' '+(points[i].y+dx*mul);
		}
		else if (i%3 == (start +1)%3 ) {
			outPath += (points[i].x+0*dy*mul)+' '+(points[i].y+0*dx*mul);
		}
		else {
			outPath += (points[i].x-dy*mul)+' '+(points[i].y-dx*mul);
		}
		
		
	}
	
	var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	newPath.setAttribute('d',outPath);
	newPath.style.fill = "none";

	newPath.setAttribute('stroke-width','2');
	
	newPath.setAttribute('stroke',color);


	heartFill.appendChild(newPath);
	console.log(outPath);
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
