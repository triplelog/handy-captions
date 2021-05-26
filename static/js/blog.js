var wordIds = {};
var boldWidth = "8";
var notBoldWidth = "5";
var defaultColor = "black";
function divideWords(strokes) {
	strokesInfo = {};
	wordMap = {};
	adjWords = {};
	wordIds = {};
	var xMul = 800/outputEl.getBoundingClientRect().width;
	var outEl = document.getElementById("finalOutput");
	outEl.innerHTML = "";
	
	for (var i=0;i<strokes.length;i++){
		sInfo = {};
		sumY = 0;
		nY = 0;
		minmaxX = [-1,-1];
		fminmaxX = [-1,-1];
		for (var ii=0;ii<strokes[i].length;ii++){
			sumY += strokes[i][ii].y;
			nY += 1;
			if (strokes[i][ii].y%100 > 0 && strokes[i][ii].y%100 < 100){
				if (minmaxX[0]==-1 || strokes[i][ii].x*xMul < minmaxX[0]){
					minmaxX[0] = strokes[i][ii].x*xMul;
				}
				if (minmaxX[1]==-1 || strokes[i][ii].x*xMul > minmaxX[1]){
					minmaxX[1] = strokes[i][ii].x*xMul;
				}
			}
			if (fminmaxX[0]==-1 || strokes[i][ii].x*xMul < fminmaxX[0]){
				fminmaxX[0] = strokes[i][ii].x*xMul;
			}
			if (fminmaxX[1]==-1 || strokes[i][ii].x*xMul > fminmaxX[1]){
				fminmaxX[1] = strokes[i][ii].x*xMul;
			}
		}
		if (nY >0){
			line = Math.floor((sumY/nY)/100);
			adjWords[line]={};
			wordMap[i]={avgX:(fminmaxX[0]+fminmaxX[1])/2,line:line};
			if (minmaxX[0] >= 0){
				if (strokesInfo[line]){
					strokesInfo[line].push(minmaxX);
				}
				else {
					strokesInfo[line]=[minmaxX];
				}
			}
		}
	}
	var spaceLength = 20;
	var lineInfo = {};
	var wordCount = 0;
	for (line in strokesInfo){
		//console.log(line,strokesInfo[line]);
		var minmaxArray = combineMinmax(strokesInfo[line]);
		
		
		for (var i=0;i<minmaxArray.length;i++){
			//console.log(minmaxArray[i]);
			mmStrokes = [{'x':minmaxArray[i][0],'y':line*100+20},{'x':minmaxArray[i][0],'y':line*100+60},{'x':minmaxArray[i][1],'y':line*100+60},{'x':minmaxArray[i][1],'y':line*100+20},{'x':minmaxArray[i][0],'y':line*100+20}];
			addStroke(mmStrokes,'gray');
			adjWords[line][i]={'left':minmaxArray[i][0],'width':minmaxArray[i][1]-minmaxArray[i][0],'top':line*100+20,minX:0,maxX:minmaxArray[i][1]-minmaxArray[i][0],minY:0,maxY:40,strokes:[]};
			wordCount++;
		}
		lineInfo[line]=minmaxArray;
		
	}
	console.log(lineInfo);
	
	for (var i=0;i<strokes.length;i++){
		var line = wordMap[i].line;
		var id = lineInfo[line].length-1;
		for (var ii=0;ii<lineInfo[line].length-1;ii++){
			var mmA = (lineInfo[line][ii][1]+lineInfo[line][ii+1][0])/2;
			if (wordMap[i].avgX <= mmA){
				id = ii;
				break;
			}
		}
		var adjStrokes = [];
		for (var ii=0;ii<strokes[i].length;ii++){
			var x = strokes[i][ii].x*xMul - adjWords[line][id]['left'];
			var y = strokes[i][ii].y - adjWords[line][id]['top'];
			if (x > adjWords[line][id]['maxX']){
				adjWords[line][id]['maxX'] = x;
			}
			if (x < adjWords[line][id]['minX']){
				adjWords[line][id]['minX'] = x;
			}
			if (y > adjWords[line][id]['maxY']){
				adjWords[line][id]['maxY'] = y;
			}
			if (y < adjWords[line][id]['minY']){
				adjWords[line][id]['minY'] = y;
			}
			adjStrokes.push({x:x,y:y});
		}
		console.log(adjStrokes);
		adjWords[line][id]['strokes'].push(adjStrokes);
		
		console.log(id);
		
		addStroke(strokes[i],'rgb('+(id*255/lineInfo[line].length)+',0,0)');
		
		
	}
	var idArray = new Uint32Array(wordCount);
	let cryptoObj = window.crypto || window.msCrypto;
	window.crypto.getRandomValues(idArray);
	var wordIdx = 0;
	for (var line=0;line<1000;line++){
		if (!adjWords[line]){
			var next = -1;
			for (var i=line+1;i<1000;i++){
				if (adjWords[i]){
					next = i;
					break;
				}
			}
			if (next == -1){
				var buffer = document.createElement("div");
				buffer.style.width = "1px";
				buffer.style.height = "80px";
				buffer.style.flexGrow = "100";
				buffer.style.border = "0px solid black";
				outEl.appendChild(buffer);
				
			
				break;
			}
			else {
				var buffer = document.createElement("div");
				buffer.style.width = "1px";
				buffer.style.height = "80px";
				buffer.style.flexGrow = "100";
				buffer.style.border = "0px solid black";
				outEl.appendChild(buffer);
				
				var newLine = document.createElement("div");
				newLine.style.width = "100%";
				newLine.style.height = "80px";
				newLine.style.flexGrow = "1";
				outEl.appendChild(newLine);
				line = next -1;
			}
			continue;
		}
		
		console.log(adjWords[line]);
		
		for (var wIdx in adjWords[line]){
			var word = adjWords[line][wIdx];
			
			var el = document.createElement("div");
			var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			var width = word['width']+44;
			var height = word['maxY'] - word['minY']+4;
			var viewBox = '';
			viewBox += (word['minX']-22)+" ";
			viewBox += (word['minY']-2)+" ";
			viewBox += (width)+" ";
			viewBox += (height);
			svg.setAttribute('width', width);
			svg.setAttribute('height', height);
			svg.setAttribute('viewBox', viewBox);
			//svg.setAttribute('style', 'border: 1px solid black');
			svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			
			for (var i=0;i<word['strokes'].length;i++) {
				var s = word['strokes'][i];
				if (s.length > 1){
					var pd = "M"+s[0].x+" "+s[0].y;
					for (var ii=1;ii<s.length;ii++) {
						pd += " L"+s[ii].x+" "+s[ii].y;
					}
					var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
					path.setAttributeNS(null,"d",pd);
					path.setAttributeNS(null,"fill","none");
					svg.appendChild(path);
				}
				
			}
			var pd = "M"+word['minX']+" 40 L"+word['maxX']+" 40";
			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttributeNS(null,"d",pd);
			path.setAttributeNS(null,"fill","none");
			path.classList.add("underline");
			path.style.display = "none";
			svg.appendChild(path);
			
			el.style.height = "80px";
			el.setAttribute('id','word-'+idArray[wordIdx]);
			el.style.strokeWidth=notBoldWidth;
			el.style.stroke=defaultColor;
			wordIds[idArray[wordIdx]]=word;
			wordIdx++;
			el.appendChild(svg);
			
			
			outEl.appendChild(el);
			var buffer = document.createElement("div");
			buffer.style.width = "1px";
			buffer.style.height = "80px";
			buffer.style.flexGrow = "1";
			buffer.style.border = "0px solid black";
			outEl.appendChild(buffer);
		}    
		
	}
	
	
}

function combineMinmax(minmaxArray) {
	var spaceLength = 20;
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

function makeBold(id,addBold=true) {
	var el = document.getElementById('word-'+id);
	if (!el){return;}
	if (addBold){
		el.style.strokeWidth=boldWidth;
	}
	else{
		el.style.strokeWidth=notBoldWidth;
	}
}

function makeItalics(id,addItalics=true) {
	var el = document.getElementById('word-'+id);
	if (!el){return;}
	if (addItalics){
		el.style.transform="skewX(-36deg)";
	}
	else{
		el.style.transform="none";
	}
}

function makeLink(id,addLink=false) {
	var el = document.getElementById('word-'+id);
	if (!el){return;}
	if (addLink){
		makeUnderline(id);
		var svg = el.querySelector('svg').cloneNode(true);
		el.removeChild(el.querySelector('svg'));
		var a = document.createElement('a');
		a.setAttribute('href',addLink);
		a.appendChild(svg);
		el.appendChild(a);
	}
	else{
		makeUnderline(id,false);
		var a = el.querySelector('a');
		var svg = el.querySelector('svg').cloneNode(true);
		el.removeChild(el.querySelector('a'));
		el.appendChild(svg);
	}
}

function makeUnderline(id,addUnderline=true) {
	var el = document.getElementById('word-'+id);
	if (!el){return;}
	if (addUnderline){
		el.querySelector(".underline").style.display="inline-block";
	}
	else{
		el.querySelector(".underline").style.display="none";
	}
}

function makeColor(id,addColor=false) {
	var el = document.getElementById('word-'+id);
	if (!el){return;}
	if (addColor){
		el.style.stroke=addColor;
	}
	else{
		el.style.stroke=defaultColor;
	}
}

function editMode(){
	if (isEdit){
		isEdit = false;
		outputEl.style.pointerEvents = "none";
	}
	else {
		isEdit = true;
		outputEl.style.pointerEvents = "all";
	}
}

var selectedWords = {};
function editUp(evt){
	if (!isEdit){
		return;
	}
	var bcr = evt.currentTarget.getBoundingClientRect();
	var x = (evt.clientX-bcr.left);
	var y = (evt.clientY-bcr.top);
	for (key in wordIds){
		var bb = wordIds[key]['minX']
		if (x < wordIds[key]['left'] || x > wordIds[key]['left']+wordIds[key]['width']){
			continue;
		}
		if (y < wordIds[key]['top'] || y > wordIds[key]['top']+40){
			continue;
		}
		mmStrokes = [{'x':wordIds[key]['left'],'y':wordIds[key]['top']},{'x':wordIds[key]['left'],'y':wordIds[key]['top']+40},{'x':wordIds[key]['left']+wordIds[key]['width'],'y':wordIds[key]['top']+40},{'x':wordIds[key]['left']+wordIds[key]['width'],'y':wordIds[key]['top']},{'x':wordIds[key]['left'],'y':wordIds[key]['top']}];
			
		if (selectedWords[key]){
			addStroke(mmStrokes,'gray');
			delete selectedWords[key];
		}
		else {
			addStroke(mmStrokes,'red');
			selectedWords[key]=true;
		}
		break;

	}
	
	
}
function boldButton() {
	for (key in selectedWords){
		if (key){
			makeBold(key);
		}
	}
}
function italicsButton() {
	for (key in selectedWords){
		if (key){
			makeItalics(key);
		}
		
	}
}
function underlineButton() {
	for (key in selectedWords){
		
		if (key){
			makeUnderline(key);
		}
	}
}
function linkButton() {
	var linkURL = document.getElementById('linkURL').value;
	for (key in selectedWords){
		
		if (key){
			makeLink(key,linkURL);
		}
	}
}
function colorButton() {
	var color = document.getElementById('colorName').value;
	for (key in selectedWords){
		
		if (key){
			makeColor(key,color);
		}
	}
}

