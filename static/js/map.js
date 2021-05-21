function createPD(currentCurve){
	if (currentCurve.length < 1){
		return;
	}
	var id = "curve-"+Math.random().toString(36).substr(3,12);
	var pd = "M"; 
	var curvedPath = [];
	pd += " " + curveRound(currentCurve[0][0]);
	pd += " " + curveRound(currentCurve[0][1]);
	curvedPath.push([curveRound(currentCurve[0][0]),curveRound(currentCurve[0][1])]);
	console.log(currentCurve.length);
	var initialCL = currentCurve.length;
	var maxminD2 = 0.01;
	while (currentCurve.length > initialCL / 3 + 2){
		for (var i=1; i<currentCurve.length - 2; i++){
			var minD2 = nearestBezier(currentCurve[i-1][0],currentCurve[i][0],currentCurve[i+2][0],currentCurve[i-1][1],currentCurve[i][1],currentCurve[i+2][1], currentCurve[i+1][0], currentCurve[i+1][1]);
			if (minD2 < maxminD2){
				currentCurve.splice(i+1,1);
				i--;
				continue;
			}
		}
		maxminD2 += 0.01;
		console.log(maxminD2, currentCurve.length);
	}
	for (var i=1; i<currentCurve.length - 2; i++){
		pd += " Q " + curveRound(currentCurve[i][0]);
		pd += " " + curveRound(currentCurve[i][1]);
		curvedPath.push([curveRound(currentCurve[i][0]),curveRound(currentCurve[i][1])]);
		var xc = (currentCurve[i][0] + currentCurve[i+1][0]) / 2;
		var yc = (currentCurve[i][1] + currentCurve[i+1][1]) / 2;
		pd += " " + curveRound(xc);
		pd += " " + curveRound(yc);
		curvedPath.push([curveRound(xc),curveRound(yc)]);
	}
	console.log(currentCurve.length);
	if (currentCurve.length > 1){
		pd += " Q " + curveRound(currentCurve[currentCurve.length - 2][0]);
		pd += " " + curveRound(currentCurve[currentCurve.length - 2][1]);
		curvedPath.push([curveRound(currentCurve[currentCurve.length - 2][0]),curveRound(currentCurve[currentCurve.length - 2][1])]);
	}
	pd += " " + curveRound(currentCurve[currentCurve.length - 1][0]);
	pd += " " + curveRound(currentCurve[currentCurve.length - 1][1]);
	curvedPath.push([curveRound(currentCurve[currentCurve.length - 1][0]),curveRound(currentCurve[currentCurve.length - 1][1])]);

	return curvedPath;
}

function curvature(p0,p1,p2){
	var d01 = Math.pow(Math.pow(p0[0]-p1[0],2)+Math.pow(p0[1]-p1[1],2),0.5);
	var d02 = Math.pow(Math.pow(p0[0]-p2[0],2)+Math.pow(p0[1]-p2[1],2),0.5);
	var d12 = Math.pow(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2),0.5);
	var d1m = Math.pow(Math.pow(p1[0]-(p2[0]+p0[0])/2,2)+Math.pow(p1[1]-(p2[1]+p0[1])/2,2),0.5);
	var a = Math.abs(p0[0]*(p1[1]-p2[1])+p1[0]*(p2[1]-p0[1])+p2[0]*(p0[1]-p1[1]))/2;
	if (a == 0 || d01 == 0 || d02 == 0 || d12 == 0 || d1m == 0){
		return [p0,p1,p2];//"inf";
	}
	var k = 0;
	if (d01 > d02/2 && d12 > d02/2){
		k = Math.pow(d1m,3)/Math.pow(a,2);
	}
	else {
		k = Math.max(a/Math.pow(d01,3),a/Math.pow(d12,3));
	}
	return 1/k;
}

function curveRound(x){
	var xx = x*10;
	return Math.round(xx)/10;
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