function divideWords(strokes) {
	strokesInfo = {};
	spaces = {};
	for (var i=0;i<strokes.length;i++){
		sInfo = {};
		sumY = 0;
		nY = 0;
		minmaxX = [-1,-1];
		for (var ii=0;ii<strokes[i].length;ii++){
			sumY += strokes[i][ii].y;
			nY += 1;
			if (strokes[i][ii].y%400 > 120 && strokes[i][ii].y%400 < 280){
				if (minmaxX[0]==-1 || strokes[i][ii].x < minmaxX[0]){
					minmaxX[0] = strokes[i][ii].x;
				}
				if (minmaxX[1]==-1 || strokes[i][ii].x > minmaxX[1]){
					minmaxX[1] = strokes[i][ii].x;
				}
			}
		}
		if (nY >0){
			line = Math.floor((sumY/nY)/400);
			console.log(line,sumY,nY);
			if (line == 0){
				addStroke(strokes[i],'blue');
			}
			else if (line == 1){
				addStroke(strokes[i],'green');
			}
		}
		
	}
}