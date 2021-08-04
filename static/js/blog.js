var wordIds = {};

var borders = {};
function divideWords(strokes) {
	strokesInfo = {};
	wordMap = {};
	adjWords = {};
	wordIds = {};
	selectedWords = {};
	var xMul = 800/outputEl.getBoundingClientRect().width;
	var outEl = document.getElementById("finalOutput");
	outEl.innerHTML = "";
	clearBorders();
	var parIdx = 0;
	var pEl = document.createElement("p");
	pEl.id = "par-"+parIdx; parIdx++;
	for (var i=0;i<strokes.length;i++){
		if (strokes[i].length==0){
			continue;
		}
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
	var ulEl = [false,document.createElement("ul"),document.createElement("ul"),document.createElement("ul"),document.createElement("ul")];
	for (line in strokesInfo){
		//console.log(line,strokesInfo[line]);
		var minmaxArray = combineMinmax(strokesInfo[line]);
		
		
		for (var i=0;i<minmaxArray.length;i++){
			//console.log(minmaxArray[i]);
			mmStrokes = [{'x':minmaxArray[i][0],'y':line*100+20},{'x':minmaxArray[i][0],'y':line*100+60},{'x':minmaxArray[i][1],'y':line*100+60},{'x':minmaxArray[i][1],'y':line*100+20},{'x':minmaxArray[i][0],'y':line*100+20}];
			addBorder(mmStrokes,line+"-"+i,line+"-"+i,'gray');
			borders[line+"-"+i]=mmStrokes;
			adjWords[line][i]={'borderKey':line+"-"+i,'left':minmaxArray[i][0],'width':minmaxArray[i][1]-minmaxArray[i][0],'top':line*100+20,minX:0,maxX:minmaxArray[i][1]-minmaxArray[i][0],minY:0,maxY:40,strokes:[],ids:[]};
			wordCount++;
		}
		lineInfo[line]=minmaxArray;
		
	}
	console.log(lineInfo);
	
	for (var i=0;i<strokes.length;i++){
		if (strokes[i].length==0){
			continue;
		}
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
		adjWords[line][id]['strokes'].push(adjStrokes);
		adjWords[line][id]['ids'].push(i);
		
	}
	//var idArray = new Uint32Array(wordCount);
	//let cryptoObj = window.crypto || window.msCrypto;
	//window.crypto.getRandomValues(idArray);
	var wordIdx = 0;
	var currentList = 0;
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
				if (currentList > 0){//kill list
					ulEl[currentList].appendChild(pEl);
					while (currentList > 0){
						currentList--;
						if (currentList == 0){
							outEl.appendChild(ulEl[1]);
						}
						else {
							ulEl[currentList].appendChild(ulEl[currentList+1]);
						}
					}
				}
				else {
					outEl.appendChild(pEl);
				}
				
			
				break;
			}
			else {
				if (currentList > 0){//kill list
					ulEl[currentList].appendChild(pEl);
					while (currentList > 0){
						currentList--;
						if (currentList == 0){
							outEl.appendChild(ulEl[1]);
						}
						else {
							ulEl[currentList].appendChild(ulEl[currentList+1]);
						}
					}
				}
				else {
					outEl.appendChild(pEl);
				}
				pEl = document.createElement("p");
				pEl.id = "par-"+parIdx; parIdx++;
				line = next -1;
				
			}
			continue;
		}
		else if (currentList > 0 || displaySettings.listList[line]==1){
			console.log(line,currentList,displaySettings.listList[line]);
			if (displaySettings.listList[line]==1 && currentList == 0){//start of new list
				outEl.appendChild(pEl);
				pEl = document.createElement("li");
				ulEl[1]=document.createElement("ul");
				currentList++;
			}
			else if (displaySettings.listList[line]==1 && currentList > 0){//new nesting
				ulEl[currentList].appendChild(pEl);
				currentList++;
				ulEl[currentList]=document.createElement("ul");
				pEl = document.createElement("li");
				
			}
			else if (displaySettings.listList[line]<0 && currentList > 1){//nesting ends
				ulEl[currentList].appendChild(pEl);
				for (var ii=0;ii<-1*displaySettings.listList[line];ii++){
					currentList--;
					if (currentList == 0){
						outEl.appendChild(ulEl[1]);
					}
					else {
						ulEl[currentList].appendChild(ulEl[currentList+1]);
					}
				}
				if (currentList == 0){
					pEl = document.createElement("p");
					pEl.id = "par-"+parIdx; parIdx++;
				}
				else {
					pEl = document.createElement("li");
				}
			}
			else if (displaySettings.listList[line]<0 && currentList == 1){//List ends
				ulEl[1].appendChild(pEl);
				outEl.appendChild(ulEl[1]);
				pEl = document.createElement("p");
				pEl.id = "par-"+parIdx; parIdx++;
				currentList--;
			}
			else if (displaySettings.listList[line]==2 && currentList > 0){//continuation of last line
				
			}
			else if (currentList > 0){//new item
				ulEl[currentList].appendChild(pEl);
				pEl = document.createElement("li");
			}
		}
		else if (displaySettings['paragraphs'][line-1]) {
			
			outEl.appendChild(pEl);
			pEl = document.createElement("p");
			pEl.id = "par-"+parIdx; parIdx++;
		}
		
		//console.log(adjWords[line]);
		
		for (var wIdx in adjWords[line]){
			var word = adjWords[line][wIdx];
			
			var hash = hashStrokes(word['strokes']);
			
			if (wordsHashed[hash] && Object.keys(wordsHashed[hash].el).length > 0){
				
				var el = wordsHashed[hash].el;
				if (wordsHashed[hash].delete){
					el.parentElement.removeChild(el);
					delete wordsHashed[hash];
					
					var ss = word['ids'];
					ss.sort(function(a,b){return a-b;});
					console.log(ss);
					for (var si=0;si<ss.length;si++){
						delete strokes[ss[si]];
					}
					continue;
					
				}
				wordIds[hash]=word;
				el.setAttribute('id','word-'+hash);
				wordIdx++;
				pEl.appendChild(el);
			}
			else {
			
				var el = document.createElement("div");
				var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				var width = word['width']+4;
				var height = word['maxY'] - word['minY']+4;
				var viewBox = '';
				viewBox += (word['minX']-2)+" ";
				viewBox += (word['minY']-2)+" ";
				viewBox += (width)+" ";
				viewBox += (height);
				svg.setAttribute('width', width);
				svg.setAttribute('height', height);
				svg.setAttribute('data-blp', (40-word['minY']+2)/(height));
				svg.setAttribute('data-top', 20+word['minY']-2);
				svg.style.top = (20+word['minY']-2)+"px";
				svg.style.position = "relative";
				svg.setAttribute('viewBox', viewBox);
				//svg.setAttribute('style', 'border: 1px solid black');
				svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			
			
				for (var i=0;i<word['strokes'].length;i++) {
					var s = word['strokes'][i];
					if (s.length > 1){
						var pd = createPD(s);
						/*var pd = "M"+s[0].x+" "+s[0].y;
						for (var ii=1;ii<s.length;ii++) {
							pd += " L"+s[ii].x+" "+s[ii].y;
						}*/
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
				el.setAttribute('id','word-'+hash);
				el.setAttribute('data-hash',hash);
				el.style.strokeWidth=displaySettings.notBoldWidth;
				el.style.stroke=displaySettings.defaultColor;
				el.style.display = "inline-block";
				el.style.marginRight = "25px";
				wordIds[hash]=word;
				wordIdx++;
				el.appendChild(svg);
			
			
				//outEl.appendChild(el);
				pEl.appendChild(el);
				if (wordsHashed[hash]){
					wordsHashed[hash].el=el.cloneNode(true);
					if (wordsHashed[hash].data.bold){makeBold(el,hash);}
					if (wordsHashed[hash].data.italics){makeItalics(el,hash);}
					if (wordsHashed[hash].data.link){makeLink(el,hash,wordsHashed[hash].data.link);}
					if (wordsHashed[hash].data.underline){makeUnderline(el,hash);}
					if (wordsHashed[hash].data.color){makeColor(el,hash,wordsHashed[hash].data.color);}
					if (wordsHashed[hash].data.size){makeFontSize(el,hash,wordsHashed[hash].data.size);}
				}
				else {
					wordsHashed[hash]={el:el.cloneNode(true),data:{}};
				}
				
			}
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

function deleteWord(el,id) {
	if (!el){
		el = document.getElementById('word-'+id);
	}
	if (!el){return;}
	var hash = el.getAttribute('data-hash');
	wordsHashed[hash]['delete']=true;
	divideWords();
	
	
}

function makeBold(el,id,addBold=true) {
	if (!el){
		el = document.getElementById('word-'+id);
	}
	if (!el){return;}
	var hash = el.getAttribute('data-hash');
	if (addBold){
		el.style.strokeWidth=displaySettings.boldWidth;
		wordsHashed[hash].data.bold=true;
	}
	else{
		el.style.strokeWidth=displaySettings.notBoldWidth;
		wordsHashed[hash].data.bold=false;
	}
	wordsHashed[hash].el=el.cloneNode(true);
	
}

function makeItalics(el,id,addItalics=true) {
	if (!el){
		el = document.getElementById('word-'+id);
	}
	if (!el){return;}
	var hash = el.getAttribute('data-hash');
	if (addItalics){
		el.style.transform="skewX(-36deg)";
		wordsHashed[hash].data.italics=true;
	}
	else{
		el.style.transform="none";
		wordsHashed[hash].data.italics=false;
	}
	wordsHashed[hash].el=el.cloneNode(true);
}

function makeLink(el,id,addLink=false) {
	if (!el){
		el = document.getElementById('word-'+id);
	}
	if (!el){return;}
	var hash = el.getAttribute('data-hash');
	if (addLink){
		makeUnderline(el,id);
		var svg = el.querySelector('svg').cloneNode(true);
		el.removeChild(el.querySelector('svg'));
		var a = document.createElement('a');
		a.setAttribute('href',addLink);
		a.appendChild(svg);
		el.appendChild(a);
		wordsHashed[hash].data.link=addLink;
	}
	else{
		makeUnderline(el,id,false);
		var a = el.querySelector('a');
		var svg = el.querySelector('svg').cloneNode(true);
		el.removeChild(el.querySelector('a'));
		el.appendChild(svg);
		wordsHashed[hash].data.link=false;
	}
	wordsHashed[hash].el=el.cloneNode(true);
}

function makeUnderline(el,id,addUnderline=true) {
	if (!el){
		el = document.getElementById('word-'+id);
	}
	if (!el){return;}
	var hash = el.getAttribute('data-hash');
	if (addUnderline){
		el.querySelector(".underline").style.display="inline-block";
		wordsHashed[hash].data.underline=true;
	}
	else{
		el.querySelector(".underline").style.display="none";
		wordsHashed[hash].data.underline=false;
	}
	wordsHashed[hash].el=el.cloneNode(true);
}

function makeColor(el,id,addColor=false) {
	if (!el){
		el = document.getElementById('word-'+id);
	}
	if (!el){return;}
	var hash = el.getAttribute('data-hash');
	if (addColor){
		el.style.stroke=addColor;
		wordsHashed[hash].data.color=addColor;
	}
	else{
		el.style.stroke=displaySettings.defaultColor;
		wordsHashed[hash].data.color=false;
	}
	
	wordsHashed[hash].el=el.cloneNode(true);
}

function makeFontSize(el,id,size=false) {
	if (!el){
		el = document.getElementById('word-'+id);
	}
	var svg = el.querySelector("svg");
	if (!svg){return;}
	var hash = el.getAttribute('data-hash');
	if (size){
		var w = parseFloat(svg.getAttribute('data-width')) || parseFloat(svg.getAttribute('width'));
		var h = parseFloat(svg.getAttribute('data-height')) || parseFloat(svg.getAttribute('height'));
		svg.setAttribute('width', w*parseFloat(size));
		svg.setAttribute('height', h*parseFloat(size));
		svg.setAttribute('data-width', w);
		svg.setAttribute('data-height', h);
		var blHO = h*parseFloat(svg.getAttribute('data-blp'));
		var blHN = h*parseFloat(size)*parseFloat(svg.getAttribute('data-blp'));
		var topDiff = blHO-blHN;
		svg.style.top = (topDiff+parseFloat(svg.getAttribute('data-top')))+"px";
		wordsHashed[hash].data.size=size;
	}
	else{
		wordsHashed[hash].data.size=false;
	}

	wordsHashed[hash].el=el.cloneNode(true);
}

function makeQuotes(quotes) {
	var quoteEls = document.querySelectorAll('blockquote');
	for (var i=0;i<quoteEls.length;i++){
		var deleteQuote = true;
		for (key in quotes){
			if (quoteEls[i].getAttribute('data-start')==quotes[key]['start'] && quoteEls[i].getAttribute('data-end')==quotes[key]['end']){
				deleteQuote = false;
				break;
			}
		}
		if (deleteQuote){
			var els = quoteEls[i].querySelectorAll('div');
			for (var ii=0;ii<els.length;ii++){
				if (els[ii].id && els[ii].id.substr(0,5) == "word-"){
					var el = els[ii].cloneNode(true);
					quoteEls[i].parentNode.insertBefore(el,quoteEls[i]);
				}
			}
			quoteEls[i].parentNode.removeChild(quoteEls[i]);
		}
	}
	for (key in quotes){
		var skipQuote = false;
		for (var i=0;i<quoteEls.length;i++){
			if (quoteEls[i].getAttribute('data-start')==quotes[key]['start'] && quoteEls[i].getAttribute('data-end')==quotes[key]['end']){
				skipQuote = true;
				break;
			}
		}
		if (skipQuote){
			continue;
		}
		var quoteEl = document.createElement("blockquote");
		quoteEl.setAttribute('data-start',quotes[key]['start']);
		quoteEl.setAttribute('data-end',quotes[key]['end']);
		var startEl = document.getElementById('word-'+quotes[key]['start']);
		startEl.parentNode.insertBefore(quoteEl,startEl);
		var notEnd = true;
		if (quotes[key]['start'] == quotes[key]['end']){
			notEnd = false;
		}
		var el = startEl;
		while (notEnd){
			var oldEl = el;
			var el = el.nextSibling;
			var el2 = oldEl.cloneNode(true);
			oldEl.parentNode.removeChild(oldEl);
			quoteEl.appendChild(el2);
			if (!el || el.id == 'word-'+quotes[key]['end']){
				notEnd = false;
			}
		}
		if (el){
			var el2 = el.cloneNode(true);
			el.parentNode.removeChild(el);
			quoteEl.appendChild(el2);
		}
		
	}
	
}

function makeNotes(notes) {
	
	for (key in notes){
		var skipNote = false;
		for (var i=0;i<noteEls.length;i++){
			if (noteEls[i].getAttribute('data-start')==notes[key]['start'] && noteEls[i].getAttribute('data-end')==notes[key]['end']){
				skipNote = true;
				break;
			}
		}
		if (skipNote){
			continue;
		}
		notes[key]["type"] = "side";
		var noteType = notes[key]["type"];
		var noteEl = document.createElement("span");
		noteEl.classList.add(noteType+'container');
		var subEl = document.createElement("span");
		subEl.classList.add(noteType+"note");
		var subsubEl = document.createElement("span");
		subsubEl.classList.add(noteType+"text");
		
		noteEl.setAttribute('data-start',notes[key]['start']);
		noteEl.setAttribute('data-end',notes[key]['end']);
		var elIds = ['word-'+notes[key]['start']];
		var startEl = document.getElementById('word-'+notes[key]['start']);
		var notEnd = true;
		if (notes[key]['start'] == notes[key]['end']){
			notEnd = false;
		}
		var el = startEl;
		while (notEnd){
			var oldEl = el;
			var el = el.nextSibling;
			var el2 = oldEl.cloneNode(true);
			elIds.push(el.id);
			if (!el || el.id == 'word-'+notes[key]['end']){
				notEnd = false;
			}
		}
		for (var i=0;i<elIds.length;i++){
			console.log(elIds[i]);
			var el = document.getElementById(elIds[i]);
			console.log(el);
			el.parentNode.removeChild(el);
			subsubEl.appendChild(el);
			
		}
		subEl.appendChild(subsubEl);
		noteEl.appendChild(subEl);
		
		notes[key]['par-start']=1;
		notes[key]['par-end']=1;
		var pStart = notes[key['par-start']];
		var parEl = document.getElementById('par-'+pStart);
		parEl.parentNode.insertBefore(noteEl,parEl);
		parEl.parentNode.removeChild(parEl);
		noteEl.appendChild(parEl);
		var notEnd = true;
		if (notes[key]['par-start'] != notes[key]['par-end']){
			var pEnd = notes[key['par-end']];
			for (var i=pStart+1;i<pEnd+1;i++){
				var parEl = document.getElementById('par-'+i);
				parEl.parentNode.removeChild(parEl);
				noteEl.appendChild(parEl);
			}
		}
		
		
		
		
	}
	
}






var selectedWords = {};
var lists = {};

function editUp(evt){
	if (!isEdit){
		return;
	}
	var bcr = evt.currentTarget.getBoundingClientRect();
	var xMul = 800/outputEl.getBoundingClientRect().width;
	var x = (evt.clientX-bcr.left)*xMul;
	var y = (evt.clientY-bcr.top);
	var sKey = false;
	for (key in wordIds){
		var bb = wordIds[key]['minX']
		if (x < wordIds[key]['left'] || x > wordIds[key]['left']+wordIds[key]['width']){
			continue;
		}
		if (y < wordIds[key]['top'] || y > wordIds[key]['top']+40){
			continue;
		}
		sKey = key;
		break;

	}
	if (sKey && isEdit == "quote"){
		var qid = 0;
		for (key in displaySettings.quotes){
			if (displaySettings.quotes[key]['selected']== true){
				qid = key;
				displaySettings.quotes[key]['end']=sKey;
				displaySettings.quotes[key]['selected']= false;
				break;
				
			}
			else {
				qid=key+1;
			}
		}
		if (displaySettings.quotes[qid]){
			displaySettings.quotes[qid]['end']=sKey;
			//displaySettings.quotes[qid]['keys']=[];
			
			var start = {'x':wordIds[displaySettings.quotes[qid]['start']]['left'],'y':wordIds[displaySettings.quotes[qid]['start']]['top']};
			var end = {'x':wordIds[displaySettings.quotes[qid]['end']]['left'],'y':wordIds[displaySettings.quotes[qid]['end']]['top']};
			for (key in wordIds){
				if (start.y < wordIds[key]['top'] && end.y > wordIds[key]['top']){
					
				}
				else if (start.y < end.y && start.y == wordIds[key]['top'] && start.x <= wordIds[key]['left']){
					
				}
				else if (start.y < end.y && end.y == wordIds[key]['top'] && end.x >= wordIds[key]['left']) {
				
				}
				else if (start.y == end.y && end.y == wordIds[key]['top'] && end.x >= wordIds[key]['left'] && start.x <= wordIds[key]['left']) {
				
				}
				else {
					continue;
				}
				for (key2 in displaySettings.quotes){
					if (key2 != qid && (displaySettings.quotes[key2]['start'] == key || displaySettings.quotes[key2]['end'] == key)){
						delete displaySettings.quotes[key2];
					}
				}
				//displaySettings.quotes[qid]['keys'].push(key);

			}
			for (key2 in displaySettings.quotes){
				var start2 = {'x':wordIds[displaySettings.quotes[key2]['start']]['left'],'y':wordIds[displaySettings.quotes[key2]['start']]['top']};
				var end2 = {'x':wordIds[displaySettings.quotes[key2]['end']]['left'],'y':wordIds[displaySettings.quotes[key2]['end']]['top']};
			
				if (start2.y < start.y && end2.y > start.y){
					
				}
				else if (start2.y < end2.y && start2.y == start.y && start2.x <= start.x){
					
				}
				else if (start2.y < end2.y && end2.y == start.y && end2.x >= start.x) {
				
				}
				else if (start2.y == end2.y && end2.y == start.y && end2.x >= start.x && start2.x <= start.x) {
				
				}
				else {
					continue;
				}
				if (key2 != qid){
					delete displaySettings.quotes[key2];
				}
			}
			console.log(displaySettings.quotes);
			makeQuotes(displaySettings.quotes);
		}
		else {
			displaySettings.quotes[qid]={'selected':true,'start':sKey,'end':sKey};
		}
		
		
	}
	else if (sKey && isEdit == "note"){
		var qid = 0;
		for (key in displaySettings.notes){
			if (displaySettings.notes[key]['selected']== true){
				qid = key;
				displaySettings.notes[key]['end']=sKey;
				displaySettings.notes[key]['selected']= false;
				break;
				
			}
			else {
				qid=key+1;
			}
		}
		if (displaySettings.notes[qid]){
			displaySettings.notes[qid]['end']=sKey;
			//displaySettings.notes[qid]['keys']=[];
			
			var start = {'x':wordIds[displaySettings.notes[qid]['start']]['left'],'y':wordIds[displaySettings.notes[qid]['start']]['top']};
			var end = {'x':wordIds[displaySettings.notes[qid]['end']]['left'],'y':wordIds[displaySettings.notes[qid]['end']]['top']};
			for (key in wordIds){
				if (start.y < wordIds[key]['top'] && end.y > wordIds[key]['top']){
					
				}
				else if (start.y < end.y && start.y == wordIds[key]['top'] && start.x <= wordIds[key]['left']){
					
				}
				else if (start.y < end.y && end.y == wordIds[key]['top'] && end.x >= wordIds[key]['left']) {
				
				}
				else if (start.y == end.y && end.y == wordIds[key]['top'] && end.x >= wordIds[key]['left'] && start.x <= wordIds[key]['left']) {
				
				}
				else {
					continue;
				}
				for (key2 in displaySettings.notes){
					if (key2 != qid && (displaySettings.notes[key2]['start'] == key || displaySettings.notes[key2]['end'] == key)){
						delete displaySettings.notes[key2];
					}
				}
				//displaySettings.notes[qid]['keys'].push(key);

			}
			for (key2 in displaySettings.notes){
				var start2 = {'x':wordIds[displaySettings.notes[key2]['start']]['left'],'y':wordIds[displaySettings.notes[key2]['start']]['top']};
				var end2 = {'x':wordIds[displaySettings.notes[key2]['end']]['left'],'y':wordIds[displaySettings.notes[key2]['end']]['top']};
			
				if (start2.y < start.y && end2.y > start.y){
					
				}
				else if (start2.y < end2.y && start2.y == start.y && start2.x <= start.x){
					
				}
				else if (start2.y < end2.y && end2.y == start.y && end2.x >= start.x) {
				
				}
				else if (start2.y == end2.y && end2.y == start.y && end2.x >= start.x && start2.x <= start.x) {
				
				}
				else {
					continue;
				}
				if (key2 != qid){
					delete displaySettings.notes[key2];
				}
			}
			console.log(displaySettings.notes);
			makeNotes(displaySettings.notes);
		}
		else {
			displaySettings.notes[qid]={'selected':true,'start':sKey,'end':sKey};
		}
		
		
	}
	else if (sKey){
		var key = sKey;
		mmStrokes = [{'x':wordIds[key]['left'],'y':wordIds[key]['top']},{'x':wordIds[key]['left'],'y':wordIds[key]['top']+40},{'x':wordIds[key]['left']+wordIds[key]['width'],'y':wordIds[key]['top']+40},{'x':wordIds[key]['left']+wordIds[key]['width'],'y':wordIds[key]['top']},{'x':wordIds[key]['left'],'y':wordIds[key]['top']}];
			
		if (selectedWords[key]){
			addBorder(mmStrokes,wordIds[key]['borderKey'],wordIds[key]['borderKey'],'gray');
			delete selectedWords[key];
		}
		else {
			addBorder(mmStrokes,wordIds[key]['borderKey'],wordIds[key]['borderKey'],'red');
			selectedWords[key]=true;
		}
	}
	
	
	
	
}
function boldButton() {
	for (key in selectedWords){
		if (key){
			makeBold(false,key);
		}
	}
}
function deleteButton() {
	for (key in selectedWords){
		if (key){
			deleteWord(false,key);
		}
	}
}
function italicsButton() {
	for (key in selectedWords){
		if (key){
			makeItalics(false,key);
		}
		
	}
}
function underlineButton() {
	for (key in selectedWords){
		
		if (key){
			makeUnderline(false,key);
		}
	}
}
function linkButton() {
	var linkURL = document.getElementById('linkURL').value;
	for (key in selectedWords){
		
		if (key){
			makeLink(false,key,linkURL);
		}
	}
}
function colorButton() {
	var color = document.getElementById('colorName').value;
	for (key in selectedWords){
		
		if (key){
			makeColor(false,key,color);
		}
	}
}
function sizeButton() {
	var size = document.getElementById('fontSize').value;
	for (key in selectedWords){
		
		if (key){
			makeFontSize(false,key,size);
		}
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
function quoteButton() {
	isEdit = "quote";
	outputEl.style.pointerEvents = "all";
}
function noteButton() {
	isEdit = "note";
	outputEl.style.pointerEvents = "all";
}

function addLine(id) {
	addVertical();
	for (var i=0;i<strokes.length;i++){
		sumY = 0;
		nY = 0;
		for (var ii=0;ii<strokes[i].length;ii++){
			sumY += strokes[i][ii].y;
			nY += 1;
		}
		if (nY >0){
			line = Math.floor((sumY/nY)/100);
			if (line > id){
				for (var ii=0;ii<strokes[i].length;ii++){
					strokes[i][ii].y += 100;
				}
				addStroke(strokes[i],i,"black");
			}
		}
	}
	var maxLine = 0;
	for (i in borders){
		var line = parseInt(i.split('-')[0]);
		if ( line > maxLine){
			maxLine= line;
		}
	}
	var newBorders = {};
	for (i in borders){
		newBorders[i]=borders[i];
	}
	for (var iii=maxLine;iii>id;iii--){
		for (i in borders){
			var line = parseInt(i.split('-')[0]);
			if ( line == iii){
				var newBorder = [];
				for (var ii=0;ii<borders[i].length;ii++){
					newBorder.push({x:borders[i][ii].x,y:borders[i][ii].y+100});
				}
				addBorder(newBorder,i,(line+1)+"-"+i.split('-')[1],"gray");
				newBorders[(line+1)+"-"+i.split('-')[1]]=newBorder;
				delete newBorders[i];
			}
		}
	}
	borders = {};
	for (i in newBorders){
		borders[i]=newBorders[i];
	}
	var newParagraphs = {};
	for (i in displaySettings['paragraphs']){
		if (i > id){
			newParagraphs[i+1]=true;
		}
		else {
			newParagraphs[i]=true;
		}
	}
	displaySettings['paragraphs'] = {};
	for (i in newParagraphs){
		displaySettings['paragraphs'][i]=true;
	}
	
	//TODO: update Lists
}
function removeLine(id) {
	for (var i=0;i<strokes.length;i++){
		sumY = 0;
		nY = 0;
		for (var ii=0;ii<strokes[i].length;ii++){
			sumY += strokes[i][ii].y;
			nY += 1;
		}
		if (nY >0){
			line = Math.floor((sumY/nY)/100);
			if (line == id){
				
				addStroke(false,i,"black");
				strokes[i]=[];
			}
			else if (line > id){
				for (var ii=0;ii<strokes[i].length;ii++){
					strokes[i][ii].y -= 100;
				}
				addStroke(strokes[i],i,"black");
			}
		}
	}
	var newBorders = {};
	for (i in borders){
		newBorders[i]=borders[i];
	}
	var maxLine = 0;
	for (i in borders){
		var line = parseInt(i.split('-')[0]);
		if ( line > maxLine){
			maxLine= line;
		}
	}
	for (var iii=id;iii<=maxLine;iii++){
		for (i in borders){
			var line = parseInt(i.split('-')[0]);
			if ( line == id && line == iii){
				borders[i]=[];
				addBorder(false,i,i,"gray");
				delete newBorders[i];
			}
			else if ( line == iii){
				var newBorder = [];
				for (var ii=0;ii<borders[i].length;ii++){
					newBorder.push({x:borders[i][ii].x,y:borders[i][ii].y-100});
				}
				addBorder(newBorder,i,(line-1)+"-"+i.split('-')[1],"gray");
				newBorders[(line-1)+"-"+i.split('-')[1]]=newBorder;
				delete newBorders[i];
			}
		}
	}
	borders = {};
	for (i in newBorders){
		borders[i]=newBorders[i];
	}
	var newParagraphs = {};
	for (i in displaySettings['paragraphs']){
		if (i >= id){
			newParagraphs[i-1]=true;
		}
		else {
			newParagraphs[i]=true;
		}
	}
	displaySettings['paragraphs'] = {};
	for (i in newParagraphs){
		displaySettings['paragraphs'][i]=true;
	}
	//TODO: update Lists
}
function addParagraph(id) {
	displaySettings['paragraphs'][id]=true;
}
function removeParagraph(id) {
	delete displaySettings['paragraphs'][id];
}

function clearBorders() {
	
	borders = {};
}
function rightList(id){
	displaySettings.listList[id]=1;
}
function leftList(id){
	if (displaySettings.listList[id] && displaySettings.listList[id] < 0){
		displaySettings.listList[id]--;
	}
	else {
		displaySettings.listList[id]=-1;
	}
	
}
function continueList(id){
	displaySettings.listList[id]=2;
}

function save(event) {
	var url = "/save";
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	var jsonmessage = {id:'test',displaySettings:displaySettings,strokes:strokes,wordsHashed:wordsHashed};
	request.send(JSON.stringify(jsonmessage));
	event.preventDefault();
}
document.getElementById('saveButton').addEventListener('click',save);
function load() {
	var jsonmessage = {type:'load'};
	ws.send(JSON.stringify(jsonmessage));
}

function hashStrokes(stroke) {
	var str = "str";
	for (var i=0;i<stroke.length;i++){
		for (var ii=0;ii<stroke[i].length;ii++){
			str += stroke[i][ii].x+"-"+stroke[i][ii].y+"-";
		}
	}
	return cyrb53(str);
}
const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};
function simplifyStroke(currentCurve){

	var newStroke = [];
	newStroke.push({x:currentCurve[0].x,y:currentCurve[0].y});
	var initialCL = currentCurve.length;
	var maxminD2 = 0.02;
	var maxCL = initialCL + 5;
	//maxCL = 25;
	//console.log(initialCL);
	while (currentCurve.length > maxCL){
		var minDiff = -1;
		for (var i=1; i<currentCurve.length - 2; i++){
			var minD2 = nearestBezier(currentCurve[i-1].x,currentCurve[i].x,currentCurve[i+2].x,currentCurve[i-1].y,currentCurve[i].y,currentCurve[i+2].y, currentCurve[i+1].x, currentCurve[i+1].y);
			//console.log(minD2);
			if (minD2 < maxminD2){
				currentCurve.splice(i+1,1);
				i--;
				if (currentCurve.length < maxCL){break;}
				continue;
			}
			else if (minD2 - maxminD2 < minDiff || minDiff == -1){
				minDiff = minD2 - maxminD2;
			}
			
		}
		maxminD2 += Math.max(0.02,minDiff+0.02);
	}
	for (var i=1; i<currentCurve.length; i++){
		newStroke.push({x:currentCurve[i].x,y:currentCurve[i].y});
	}
	return newStroke;
}
function createPD(currentCurve){
	var pd = "M"; 
	pd += " " + curveRound(currentCurve[0].x);
	pd += " " + curveRound(currentCurve[0].y);
	
	for (var i=1; i<currentCurve.length - 2; i++){
		pd += " Q " + curveRound(currentCurve[i].x);
		pd += " " + curveRound(currentCurve[i].y);
		var xc = (currentCurve[i].x + currentCurve[i+1].x) / 2;
		var yc = (currentCurve[i].y + currentCurve[i+1].y) / 2;
		pd += " " + curveRound(xc);
		pd += " " + curveRound(yc);
	}
	if (currentCurve.length > 1){
		pd += " Q " + curveRound(currentCurve[currentCurve.length - 2].x);
		pd += " " + curveRound(currentCurve[currentCurve.length - 2].y);
	}
	pd += " " + curveRound(currentCurve[currentCurve.length - 1].x);
	pd += " " + curveRound(currentCurve[currentCurve.length - 1].y);
	
	return pd;
}
function curveRound(x){
	//var xx = x*10;
	//return Math.round(xx)/10;
	return Math.round(x);
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