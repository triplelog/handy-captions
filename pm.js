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



var mySetup = exampleSetup({schema: mySchema})


console.log(mySetup);

var myState = EditorState.fromJSON({
    schema: mySchema,
    plugins: exampleSetup({schema: mySchema})
},{});
console.log(myState);
myState.doc = 'Test';
console.log(myState);
var newState = myState.fromJSON({
    schema: mySchema,
    plugins: exampleSetup({schema: mySchema})
});
console.log(myState);

window.view = new EditorView(document.querySelector(".input-1"), {
  state: myState
})


/*
var myState = EditorState.create({
    doc: 'Test text',
    schema: mySchema,
    plugins: exampleSetup({schema: mySchema})
})
*/