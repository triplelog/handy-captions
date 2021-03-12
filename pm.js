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

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

var selectedText = {0:{start:0,end:0,offset:[0,0,0,0]},1:{start:0,end:0,offset:[0,0,0,0]},2:{start:0,end:0,offset:[0,0,0,0]}};

let myPlugin = new Plugin({
  props: {
    decorations(state) {
    	var id = state.doc.attrs.id;
    	console.log(id);
    	console.log(selectedText);
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
		selectedText[idx].start = t.mapping.map(oldStart);
		selectedText[idx].end = t.mapping.map(oldEnd);
		if (idx == 0){
			var offset = myViews[idx].coordsAtPos(selectedText[idx].start);
			selectedText[idx].offset[2] = offset.left;
			selectedText[idx].offset[3] = offset.top;
			
			console.log(selectedText[idx].offset);
			var el = document.querySelector('.o2');
			el.style.top = (selectedText[idx].offset[3]-selectedText[idx].offset[1])+'px';
			el.style.left = (selectedText[idx].offset[2]-selectedText[idx].offset[0])+'px';
		}
  	}
  	return true; 
  }
})



var plugins = exampleSetup({schema: mySchema});

plugins.push(myPlugin);



var myViews = [];
myViews.push(new EditorView(document.querySelector(".input-0"), {
  state: EditorState.create({
  		doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
		schema: mySchema,
		plugins: plugins
	})
}));

myViews.push(new EditorView(document.querySelector(".input-1"), {
  state: EditorState.create({
  		doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
		schema: mySchema,
		plugins: plugins
	})
}));

myViews.push(new EditorView(document.querySelector(".input-2"), {
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
		drawCurveOut(evt.data.id,evt.data.pd,evt.data.startPoint,evt.data.endPoint);
	}
	else if (evt.data.type == 'convexHull'){
		drawConvexHull(evt.data.pdArray);
	}
}

var isDown = false;

for (var i=0;i<3;i++){
	var el = document.querySelector(".input-"+i);
	el.addEventListener('pointerdown',inputDown);
	el.addEventListener('pointermove',inputMove);
	el.addEventListener('pointerup',inputUp);
}

var tabId = -1;
function inputDown(evt){
	var id = -1;
	var el = evt.target;
	while (id == -1 && el){
		console.log(el);
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
	curveWorker.postMessage({'type':'down','x':evt.clientX,'y':evt.clientY});
	isDown = true;
}
function inputMove(evt){
	if (isDown){
		var id = tabId;
		if (id == -1){return;}
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
	
		curveWorker.postMessage({'type':'move','x':evt.clientX,'y':evt.clientY});
	}
}
function inputUp(evt){
	if (isDown){
		var id = -1;
		var el = evt.target;
		while (id == -1 && el){
			console.log(el);
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
			curveWorker.postMessage({'type':'up','x':evt.clientX,'y':evt.clientY});
			var offset = myViews[id].coordsAtPos(minPos[1]);
			selectedText[id].offset = [offset.left,offset.top,offset.left,offset.top];
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
function drawCurveOut(id,pd,startPoint,endPoint){
	var el = document.querySelector('.o2');
	el.style.top = '0px';
	el.style.left = '0px';
	var svg = document.querySelector('.o2 .bgSVG');
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
	
	var svg2 = document.querySelector('.o2  .fgSVG');
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
	myViews[to].state.doc = DOMParser.fromSchema(mySchema).parse(document.querySelector(".input-"+from+" > div > .ProseMirror"));
	myViews[to].state.doc.attrs = {id:to};
	var tt = myViews[to].state.tr;
	tt.setMeta('k',true);
	var rPos = myViews[to].state.doc.resolve(0);
	var rPos2 = myViews[to].state.doc.resolve(1);
	var sel = new TextSelection(rPos,rPos2);
	tt.setSelection(sel);
	myViews[to].dispatch(tt);
}