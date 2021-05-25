function divideWords(strokes) {
	strokesInfo = {};
	wordMap = {};
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
			
			words[line]={};
			wordMap[i]={minX:minmaxX[0],line:line};
			if (strokesInfo[line]){
				strokesInfo[line].push(minmaxX);
			}
			else {
				strokesInfo[line]=[minmaxX];
			}
		}
	}
	var spaceLength = 80;
	var lineInfo = {};
	for (line in strokesInfo){
		console.log(line,strokesInfo[line]);
		var minmaxArray = combineMinmax(strokesInfo[line]);
		
		
		for (var i=0;i<minmaxArray.length;i++){
			console.log(minmaxArray[i]);
			mmStrokes = [{'x':minmaxArray[i][0],'y':line*400+80},{'x':minmaxArray[i][0],'y':line*400+240},{'x':minmaxArray[i][1],'y':line*400+240},{'x':minmaxArray[i][1],'y':line*400+80},{'x':minmaxArray[i][0],'y':line*400+80}];
			addStroke(mmStrokes,'gray');
		}
		lineInfo[line]=minmaxArray;
		
	}
	for (var i=0;i<strokes.length;i++){
		
		var line = wordMap[i].line;
		var id = lineInfo[line].length-1;
		for (var ii=0;ii<lineInfo[line].length;ii++){
			var mmA = lineInfo[line][ii][0];
			if (wordMap[i].minX <= mmA){
				id = ii;
				break;
			}
		}
		
		addStroke(strokes[i],'rgb('+(id*255/lineInfo[line].length)+',0,0)');
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
	minmaxArray.sort(function(a,b){return a[0] - b[0];});
	return minmaxArray;
}


