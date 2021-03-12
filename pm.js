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
console.log(schema);
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

console.log(mySchema);


var selectedText = {start:0,end:0};

let myPlugin = new Plugin({
  props: {
    decorations(state) {
      return DecorationSet.create(state.doc, [
        Decoration.inline(selectedText.start, selectedText.end, {style: "background: yellow"})
      ])
    }
  },
  filterTransaction: (t,s) => {
  	const oldStart = selectedText.start;
  	const oldEnd = selectedText.end;
  	selectedText.start = t.mapping.map(oldStart);
  	selectedText.end = t.mapping.map(oldEnd);
  	/*if (oldEnd - selectedText.end != oldStart - selectedText.start){
  		selectedText.end = oldEnd;
  	}*/
  	return true; 
  }
})

var plugins = exampleSetup({schema: mySchema});
plugins.push(myPlugin);
console.log(plugins);

var myView = new EditorView(document.querySelector(".input-1"), {
  state: EditorState.create({
  		doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
		schema: mySchema,
		plugins: plugins
	})
})



var minPos = [-1,-1];
var maxPos = [-1,-1];
var el = document.querySelector(".input-1");
el.addEventListener('pointerdown',inputDown);
el.addEventListener('pointermove',inputMove);
el.addEventListener('pointerup',inputUp);

function inputDown(evt){
	var posTop = myView.posAtCoords({left:evt.clientX,top:evt.clientY-16});
	var posBottom = myView.posAtCoords({left:evt.clientX,top:evt.clientY+16});
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
	var posTop = myView.posAtCoords({left:evt.clientX,top:evt.clientY-16});
	var posBottom = myView.posAtCoords({left:evt.clientX,top:evt.clientY+16});
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
	var posTop = myView.posAtCoords({left:evt.clientX,top:evt.clientY-16});
	var posBottom = myView.posAtCoords({left:evt.clientX,top:evt.clientY+16});
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
		selectedText.start = minPos[1];
		selectedText.end = maxPos[0];
		var rPos = myView.state.doc.resolve(minPos[1]);
		var rPos2 = myView.state.doc.resolve(maxPos[0]);
		var tt = myView.state.tr;
		var sel = new TextSelection(rPos,rPos2);
		//tt.setSelection(sel);
		myView.dispatch(tt);
	}

	
}