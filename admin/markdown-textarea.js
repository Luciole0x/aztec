export default class MarkdownTextarea extends HTMLTextAreaElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
	}
}

customElements.define('markdown-textarea', MarkdownTextarea, {extends:'textarea'})