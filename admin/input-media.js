const template = /*html*/`
<style>
	:host {
		position: relative;
		max-height: 300px;
		min-height: 64px;
		display: flex;
	}

	input, svg {
		cursor: pointer;
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		opacity: 0;
		transition: opacity 250ms ease-out;
		background-color: #0006;
	}
	:host(:hover) svg {
		opacity: 1;
	}

	path {
		stroke-width: 10;
		stroke-linejoin: round;
		stroke-linecap: round;
		fill: none;
		stroke: #FFFE;
	}

	video, img {
		max-width: 100%;
		max-height: 100%;
		margin: 0 auto;
	}
</style>
<svg viewbox="-10 -10 120 120" preserveAspectRatio="xMidYMid meet">
	<path d="M5,50V95H95V50m-45,15 0,-60 -20,20 20,-20 20,20"/>
</svg>
<input type="file" tabindex="-1">`

export default class InputMedia extends HTMLElement {
	/**@type {import("./admin-app").TagData[]}*/
	static observedAttributes = ['data-source', 'accept']
	static formAssociated = true

	attributeChangedCallback(name, oldValue, newValue) {
		if (name==='data-source')
			this.updateSource(newValue)
		else if (newValue===null)
			this.input.removeAttribute(name, newValue)
		else
			this.input.setAttribute(name, newValue)
	}

	constructor() {
		super()
		this.internals = this.attachInternals()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template
		this.setAttribute('tabindex', 0)

		/**@type {string?}*/this.source = null
		/**@type {HTMLInputElement}*/this.input = this.shadowRoot.querySelector('input')
		/**@type {HTMLImageElement|HTMLVideoElement}*/this.mediaNode = null

		this.shadowRoot.addEventListener('change', this.onChange.bind(this))
	}

	onChange(e) {
		this.updateSource(this.input.files[0]||'')
	}

	/**@param {string|File} newSource */
	async updateSource(newSource='') {
		let sourceName = newSource
		URL.revokeObjectURL(this.source)

		if (typeof newSource === 'string') {
			const res = await fetch(newSource)
			if (res.ok)
				newSource = await res.blob()
			else
				sourceName = null
		} else
			sourceName = newSource.name

		this.source = sourceName ? URL.createObjectURL(newSource) : ''

		const mediaName = this.mediaNode?.nodeName
		let newMediaNode = null
		if (/\.webp/.test(sourceName) && (mediaName!=='IMG'))
			newMediaNode = document.createElement('img')
		else if (/\.webm/.test(sourceName) && mediaName!=='VIDEO') {
			newMediaNode = document.createElement('video')
			for (let attribute of ['autoplay', 'muted', 'loop'])
				newMediaNode.setAttribute(attribute, '')
		}

		if (newMediaNode) {
			this.mediaNode?.remove()
			this.mediaNode = newMediaNode
			this.input.insertAdjacentElement('beforebegin', this.mediaNode)
		}
		this.mediaNode?.setAttribute('src', this.source)

		this.internals.setFormValue(this.input.files[0]||'')
		this.internals.validity.valueMissing
		if (this.hasAttribute('required') && !this.source)
			this.internals.setValidity({valueMissing:true}, 'Média requis.')
		else
			this.internals.setValidity({})

	}
}

customElements.define('input-media', InputMedia)
