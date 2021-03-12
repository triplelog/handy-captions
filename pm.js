import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
console.log(schema);
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

console.log(mySchema);


var myView = new EditorView(document.querySelector(".input-1"), {
  state: EditorState.create({
  		doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
		schema: mySchema,
		plugins: exampleSetup({schema: mySchema})
	})
})



var minPos = -1;
var maxPos = -1;
var el = document.querySelector(".input-1");
el.addEventListener('pointerdown',inputDown);
el.addEventListener('pointermove',inputMove);
el.addEventListener('pointerup',inputUp);

function inputDown(evt){
	var pos = myView.posAtCoords({left:evt.clientX,top:evt.clientY});
	minPos = pos.pos;
	maxPos = pos.pos;
}
function inputMove(evt){
	var pos = myView.posAtCoords({left:evt.clientX,top:evt.clientY});
	if (pos.pos < minPos){
		minPos = pos.pos;
	}
	else if (pos.pos > maxPos){
		maxPos = pos.pos;
	}
}
function inputUp(evt){
	var pos = myView.posAtCoords({left:evt.clientX,top:evt.clientY});
	if (pos.pos < minPos){
		minPos = pos.pos;
	}
	else if (pos.pos > maxPos){
		maxPos = pos.pos;
	}
	console.log(minPos,maxPos);
	
}