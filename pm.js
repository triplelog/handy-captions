import {EditorState, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import {TextSelection, Selection, Transaction} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
var allCurves = {};
var currentCurve;
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

var selectedText = {0:{start:0,end:0,offset:[0,0,0,0,0]},1:{start:0,end:0,offset:[0,0,0,0,0]},2:{start:0,end:0,offset:[0,0,0,0,0]}};

let myPlugin = new Plugin({
  props: {
    decorations(state) {
    	var id = state.doc.attrs.id;
    	if (id || id == 0){
		  return DecorationSet.create(state.doc, [
			Decoration.inline(selectedText[id].start, selectedText[id].end, {style: "background: yellow"})
		  ])
        }
    }
  },
  filterTransaction: (t,s) => {
	
    for (var idx=0;idx<3;idx++){
		const oldStart = selectedText[idx].start;
		const oldEnd = selectedText[idx].end;
		const oldAnchor = selectedText[idx].offset[4];
		selectedText[idx].start = t.mapping.map(oldStart);
		selectedText[idx].end = t.mapping.map(oldEnd);
		selectedText[idx].offset[4] = t.mapping.map(oldAnchor);
		if (idx == s.doc.attrs.id){
			console.log("st4:",selectedText[idx].offset[4]);
			console.log("catst4:",myViews[idx].coordsAtPos(selectedText[idx].offset[4]));
			var offset = myViews[idx].coordsAtPos(selectedText[idx].offset[4]);
			selectedText[idx].offset[2] = offset.left;
			selectedText[idx].offset[3] = offset.top;
			var el = document.querySelector('.out-'+idx+' > svg');
			var newViewBox = (selectedText[idx].offset[0]-selectedText[idx].offset[2]) + ' ';
			newViewBox += (selectedText[idx].offset[1]-selectedText[idx].offset[3]) + ' ';
			newViewBox += '600 600';
			el.setAttribute('viewBox',newViewBox); 
			//el.style.top = (selectedText[idx].offset[3]-selectedText[idx].offset[1])+'px';
			//el.style.left = (selectedText[idx].offset[2]-selectedText[idx].offset[0])+'px';
			
			console.log("off:",offset);
			
		}
  	}
  	return true; 
  }
})



var plugins = exampleSetup({schema: mySchema});

plugins.push(myPlugin);



var myViews = [];
myViews.push(new EditorView(document.querySelector("#tab-0"), {
  state: EditorState.create({
  		doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
		schema: mySchema,
		plugins: plugins
	})
}));

myViews.push(new EditorView(document.querySelector("#tab-1"), {
  state: EditorState.create({
  		doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
		schema: mySchema,
		plugins: plugins
	})
}));

myViews.push(new EditorView(document.querySelector("#tab-2"), {
  state: EditorState.create({
  		doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
		schema: mySchema,
		plugins: plugins
	})
}));

myViews[0].state.doc.attrs = {id:0};
myViews[1].state.doc.attrs = {id:1};
myViews[2].state.doc.attrs = {id:2};

var minPos = [-1,-1];
var maxPos = [-1,-1];
var inputEl = document.querySelector('.input');
var curveWorker = new Worker('js/curveWorker.js');
curveWorker.onmessage = function(evt){
	if (evt.data.type == 'inputCurve'){
		for (var i=0;i<evt.data.points.length;i++){
			drawCurveIn(evt.data.points[i]);
		}
	}
	else if (evt.data.type == 'outputCurve'){
		drawCurveOut(evt.data.id,evt.data.pd,evt.data.startPoint,evt.data.endPoint,evt.data.tab);
	}
	else if (evt.data.type == 'convexHull'){
		drawConvexHull(evt.data.pdArray);
	}
}

var isDown = false;

for (var i=0;i<3;i++){
	var el = document.querySelector("#tab-"+i);
	el.addEventListener('pointerdown',inputDown);
	el.addEventListener('pointermove',inputMove);
	el.addEventListener('pointerup',inputUp);
}

var tabId = 0;
var anchor = [true,true,true];
var writing = false;
function inputDown(evt){
	if (writing){
		evt.preventDefault();
	}
	var id = -1;
	var el = evt.target;
	while (id == -1 && el){
		if (el.id.substr(0,4) != 'tab-'){
			el = el.parentElement;
		}
		else {
			id = parseInt(el.id.substr(4));
		}
	}
	if (id == -1){return;}
	console.log("Downid:",id);
	tabId = id;
	
	if (writing){

		if (anchor[id]) {
			console.log('x',evt.offsetX);
			console.log('y',evt.offsetY);
			console.log('evt',evt);
			var pos = myViews[id].posAtCoords({left:evt.clientX,top:evt.clientY});
			console.log(pos);
			var offset = myViews[id].coordsAtPos(pos.pos);
			var currentOffset = [selectedText[id].offset[2]-selectedText[id].offset[0],selectedText[id].offset[3]-selectedText[id].offset[1]];
			selectedText[id].offset = [offset.left-currentOffset[0],offset.top-currentOffset[1],offset.left,offset.top,pos.pos];

			anchor[id] = false;
		}
		var currentOffset = [selectedText[id].offset[2]-selectedText[id].offset[0],selectedText[id].offset[3]-selectedText[id].offset[1]];
		curveWorker.postMessage({'type':'down','x':evt.offsetX-currentOffset[0],'y':evt.offsetY-currentOffset[1]});
		
	}
	
	var posTop = myViews[id].posAtCoords({left:evt.clientX,top:evt.clientY-16});
	var posBottom = myViews[id].posAtCoords({left:evt.clientX,top:evt.clientY+16});
	if (posTop && posTop.pos){
		minPos[0] = posTop.pos;
		maxPos[0] = posTop.pos;
	}
	if (posBottom && posBottom.pos){
		minPos[1] = posBottom.pos;
		maxPos[1] = posBottom.pos;
	}

	
	isDown = true;
}
function inputMove(evt){
	if (writing){
		evt.preventDefault();
	}
	
	if (isDown){
		var id = tabId;
		if (id == -1){return;}
		if (writing){
			if (isDown){
				var currentOffset = [selectedText[id].offset[2]-selectedText[id].offset[0],selectedText[id].offset[3]-selectedText[id].offset[1]];
				curveWorker.postMessage({'type':'move','x':evt.offsetX-currentOffset[0],'y':evt.offsetY-currentOffset[1]});
			
			}
		}
		var posTop = myViews[id].posAtCoords({left:evt.clientX,top:evt.clientY-16});
		var posBottom = myViews[id].posAtCoords({left:evt.clientX,top:evt.clientY+16});
		if (posTop && posTop.pos){
			if (posTop.pos < minPos[0]){
				minPos[0] = posTop.pos;
			}
			else if (posTop.pos > maxPos[0]){
				maxPos[0] = posTop.pos;
			}
		}
		if (posBottom && posBottom.pos){
			if (posBottom.pos < minPos[1]){
				minPos[1] = posBottom.pos;
			}
			else if (posBottom.pos > maxPos[1]){
				maxPos[1] = posBottom.pos;
			}
		}
	
		
	}
}
function inputUp(evt){
	if (writing){evt.preventDefault();}
	if (isDown){
		var id = -1;
		var el = evt.target;
		while (id == -1 && el){
			if (el.id.substr(0,4) != 'tab-'){
				el = el.parentElement;
			}
			else {
				id = parseInt(el.id.substr(4));
			}
		}
		if (id == -1){return;}
		console.log("Upid:",id);
		tabId = id;
		var posTop = myViews[id].posAtCoords({left:evt.clientX,top:evt.clientY-16});
		var posBottom = myViews[id].posAtCoords({left:evt.clientX,top:evt.clientY+16});
		if (posTop && posTop.pos){
			if (posTop.pos < minPos[0]){
				minPos[0] = posTop.pos;
			}
			else if (posTop.pos > maxPos[0]){
				maxPos[0] = posTop.pos;
			}
		}
		if (posBottom && posBottom.pos){
			if (posBottom.pos < minPos[1]){
				minPos[1] = posBottom.pos;
			}
			else if (posBottom.pos > maxPos[1]){
				maxPos[1] = posBottom.pos;
			}
		}
		console.log(minPos[0],maxPos[0]);
		console.log(minPos[1],maxPos[1]);
	
	
		if (minPos[1] <= maxPos[0]){
			selectedText[id].start = minPos[1];
			selectedText[id].end = maxPos[0];
			//var rPos = myView.state.doc.resolve(minPos[1]);
			//var rPos2 = myView.state.doc.resolve(maxPos[0]);
			var tt = myViews[id].state.tr;
			//var sel = new TextSelection(rPos,rPos2);
			//tt.setSelection(sel);
			myViews[id].dispatch(tt);
			
			
		}
		if (writing){
			console.log('x',evt.offsetX);
			console.log('y',evt.offsetY);
			console.log('evt',evt);
			var currentOffset = [selectedText[id].offset[2]-selectedText[id].offset[0],selectedText[id].offset[3]-selectedText[id].offset[1]];
			curveWorker.postMessage({'type':'up','x':evt.offsetX-currentOffset[0],'y':evt.offsetY-currentOffset[1],'tab':id});

		}

		isDown = false;
		
		
	}
	
}

function drawCurveIn(pt){
	
	var el = document.createElement('div');
	el.classList.add("pt");
	el.style.left = pt[0]+"px";
	el.style.top = pt[1]+"px";
	inputEl.appendChild(el);
}
function drawCurveOut(id,pd,startPoint,endPoint,tab){
	
	var svg = document.querySelector('.out-'+tab+' .bgSVG');
	var path0 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	
	path0.setAttribute('d',pd);
	path0.setAttribute('stroke','rgba(255,255,255,.1)');
	path0.setAttribute('stroke-width','5');
	path0.setAttribute('fill','none');
	path0.id = "bbg-"+id;
	svg.appendChild(path0);
	

	var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	
	path.setAttribute('d',pd);
	path.setAttribute('stroke','rgba(255,255,255,.9)');
	path.setAttribute('stroke-width','4');
	path.setAttribute('fill','none');
	path.id = "bg-"+id;
	svg.appendChild(path);
	
	var svg2 = document.querySelector('.out-'+tab+'  .fgSVG');
	var path2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path2.setAttribute('d',pd);
	path2.setAttribute('stroke','black');
	path2.setAttribute('stroke-width','3');
	path2.setAttribute('fill','none');
	path2.id = "fg-"+id;
	svg2.appendChild(path2);
	
	allCurves[id]= currentCurve;
	
}

function drawConvexHull(pdArray) {


}


export function chgTab(from,to) {
	myViews[to].state.doc = myViews[from].state.doc;
	myViews[to].state.doc.attrs = {id:to};
	myViews[to].updateState(myViews[to].state);
	var ttt = myViews[to].state.tr;
	ttt.setMeta('k',true);
	var rPos1 = myViews[to].state.doc.resolve(selectedText[to].start);
	var rPos2 = myViews[to].state.doc.resolve(selectedText[to].start);
	
	var s = new TextSelection(rPos1,rPos2);
	console.log(s);
	ttt.setSelection(s);
	ttt.scrollIntoView();
	myViews[to].dispatch(ttt);
}
export function resetAnchor() {
	anchor[tabId] = true;
}
export function writingMode() {
	if (writing){
		writing = false;
		var els = document.querySelectorAll('.ProseMirror-menubar-wrapper > *');
		for (var i=0;i<els.length;i++){
			var el = els[i];
			el.style.pointerEvents = 'all';
			el.style.touchAction = 'all';
		}
	}
	else {
		writing = true;
		var els = document.querySelectorAll('.ProseMirror-menubar-wrapper > *');
		for (var i=0;i<els.length;i++){
			var el = els[i];
			el.style.pointerEvents = 'none';
			el.style.touchAction = 'none';
		}
	}
	
}