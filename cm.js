import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {EditorView, keymap} from "@codemirror/view"
import {defaultTabBinding} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"

const doc = `if (true) {
  console.log("okay")
} else {
  console.log("oh no")
}
`

let editor = new EditorView({
  state: EditorState.create({
    doc,
    extensions: [basicSetup, keymap.of([defaultTabBinding]), javascript()]
  }),
  parent: document.body
})