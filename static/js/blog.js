function divideWords(strokes) {
	strokesInfo = {};
	words = {};
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
			if (line == 0){
				addStroke(strokes[i],'blue');
			}
			else if (line == 1){
				addStroke(strokes[i],'green');
			}
			words[line]={};
			if (strokesInfo[line]){
				strokesInfo[line].push(minmaxX);
			}
			else {
				strokesInfo[line]=[minmaxX];
			}
		}
	}
	var spaceLength = 80;
	for (line in strokesInfo){
		console.log(line,strokesInfo[line]);
		var minmaxArray = combineMinmax(strokesInfo[line]);
		
		
		for (var i=0;i<minmaxArray.length;i++){
			console.log(minmaxArray[i]);
			mmStrokes = [{'x':minmaxArray[i][0],'y':line*400+80},{'x':minmaxArray[i][0],'y':line*400+240},{'x':minmaxArray[i][1],'y':line*400+240},{'x':minmaxArray[i][1],'y':line*400+80},{'x':minmaxArray[i][0],'y':line*400+80}];
			addStroke(mmStrokes,'gray');
		}
		
	}
	
}

function combineMinmax(minmaxArray) {
	var spaceLength = 100;
	var finished = false;
	while (!finished){
		finished = true;
		for (var i=0;i<minmaxArray.length;i++){
			var mm1 = minmaxArray[i];
			for (var ii=i+1;ii<minmaxArray.length;ii++){
				var mm2 = minmaxArray[ii];
				
				if (mm1[1] >= mm2[0] - spaceLength && mm1[0] <= mm2[1] + spaceLength){
					var newA = [Math.min(mm1[0],mm2[0]),Math.max(mm1[1],mm2[1])];
					minmaxArray.splice(ii,1);
					minmaxArray.splice(i,1);
					minmaxArray.push(newA);
					finished = false;
					i = minmaxArray.length + 10;
					break;
				}
			}
		}
	}
	return minmaxArray;
}


