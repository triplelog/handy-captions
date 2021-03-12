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

var selectedText = {0:{start:0,end:0},1:{start:0,end:0},2:{start:0,end:0}};

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
for (var i=0;i<3;i++){
	var el = document.querySelector(".input-"+i);
	el.addEventListener('pointerdown',inputDown);
	el.addEventListener('pointermove',inputMove);
	el.addEventListener('pointerup',inputUp);
}

function inputDown(evt){
	var id = 0;
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
	console.log("Downid:",id);
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
}
function inputMove(evt){
	var id = 0;
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
function inputUp(evt){
	var id = 0;
	console.log("Upid:",id);
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
		var tt = myViews[0].state.tr;
		//var sel = new TextSelection(rPos,rPos2);
		//tt.setSelection(sel);
		myViews[0].dispatch(tt);
	}

	
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