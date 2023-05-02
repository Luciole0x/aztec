/**
 * @typedef {Object} routeValue
 * @property {string} section - From SECTION
 * @property {string?} filter - From TAG
 * @property {string} id
 * 
 * @typedef {Object} template
 * @property {string} content
 * @property {Functon?} onRouteUpdate
 * @property {Functon?} onScroll
 */

export default class AztTemplateContent extends HTMLElement {
	/**
	 * @param {routeValue} route
	 * @param {string} tplPath */
	static async display(route, tplPath) {
		/**@type {template}*/let template = (await import(tplPath)).default
		return new AztTemplateContent(route, template)
	}
	/**
	 * @param {routeValue} route
	 * @param {template} template */
	constructor(route, template) {
		super()
		this.setAttribute('is', 'azt-template-content')
		this.attachShadow({mode:'open'})
		this.template = template
		this.shadowRoot.innerHTML = template.content

		this.onRouteUpdate = this.template.onRouteUpdate?.bind(this)
		this.onScroll = this.template.onScroll?.bind(this)
	}

	connectedCallback() {
		if (this.onRouteUpdate)
			document.body.addEventListener('route-update', this.onRouteUpdate)
		if (this.onScroll)
			app.container.addEventListener('scroll', this.onScroll)
	}

	diconnectedCallback() {
		document.body.removeEventListener('route-update', this.onRouteUpdate)
		app.container.removeEventListener('scroll', this.onScroll)
	}

	close() {
		return this.template.close && this.template.close()
	}
}

customElements.define('azt-template-content', AztTemplateContent, {extends:'section'})
