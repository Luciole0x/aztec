const template = ``


export default class AdminEsport extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
	}
}

customElements.define('admin-esport', AdminEsport)