import {EditorState, basicSetup} from "@codemirror/basic-setup"
import {EditorView, keymap} from "@codemirror/view"
import {Transaction, Annotation, AnnotationType} from "@codemirror/state"
import {defaultTabBinding} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"

const doc = `if (true) {
  console.log("okay")
} else {
  console.log("oh no")
}
`



let views = [];
let syncAnnotation = new AnnotationType().of(false);
syncAnnotation.define;

console.log(syncAnnotation);

function syncDispatch(from, to) {
	console.log(from,to);
	console.log(syncAnnotation);
  return (tr) => {
    views[from].update([tr]);
    console.log(syncAnnotation);
    console.log(tr.annotation(syncAnnotation));
    console.log(tr.annotations);
    if (!tr.changes.empty && !tr.annotation(syncAnnotation)){
      views[to].dispatch({changes: tr.changes, annotations: syncAnnotation.of(true)})
    }
  }
}

views.push(
  new EditorView({
    state: EditorState.create({
		doc,
		extensions: [basicSetup, keymap.of([defaultTabBinding]), javascript()]
	}),
	parent: document.querySelector('.input-1'),
    dispatch: syncDispatch(0, 1)
  }),
  new EditorView({
    state: EditorState.create({
		doc,
		extensions: [basicSetup, keymap.of([defaultTabBinding]), javascript()]
	}),
	parent: document.querySelector('.input-2'),
    dispatch: syncDispatch(1, 0)
  })
)