const template = /*html*/`
<style>
	:host {
		display: inline-flex;
	}

	.tag {
		display: inline-block;
		height: 2em;
		aspect-ratio: 1/1;
		background-image: url('/app/media/icon/game.webp');
		background-size: 400% 400%;
		background-position: calc(var(--offX) * 33.33%) calc(var(--offY) * 33.33%);
		opacity: 0.4;
		filter: grayscale(1);
		cursor: pointer;
	}

	[selected] {
		opacity: 1;
		filter: grayscale(0);
	}

</style>`

export default class InputTag extends HTMLElement {
	/**@type {import("./admin-app").TagData[]}*/
	static TAGS = []
	static observedAttributes = ['value']
	static formAssociated = true
	#internals

	attributeChangedCallback(name, oldValue, newValue) {
		this.value = newValue
	}

	constructor() {
		super()
		this.#internals = this.attachInternals()
		this.attachShadow({mode:'open', delegatesFocus:true})
		this.shadowRoot.innerHTML = `${template}${this.buildTags()}`
		this.shadowRoot.addEventListener('click', this.dispatchAction.bind(this))
		this.setAttribute('tabindex', 0)
	}

	buildTags() {
		return InputTag.TAGS.map(tag =>
			/*html*/`<span class="tag" title="${tag.name}" data-id="${tag.id}"
					style="--offX:${tag.offX};--offY:${tag.offY}">
			</span>`)
			.join('')
	}

	set value(newValue) {
		newValue = ((typeof newValue) === 'string') ?
			newValue.split(',') :
			newValue.map(v => `${v}`)
		newValue = new Set(newValue)

		for (let tag of this.shadowRoot.children)
			newValue.has(tag.dataset.id) ?
				tag.setAttribute('selected', '') :
				tag.removeAttribute('selected')

		this.#internals.setFormValue(this.value)
		this.#internals.setValidity({})
	}

	get value() {
		return Array.from(this.shadowRoot.querySelectorAll('[selected]'))
			.map(tag => tag.dataset.id)
			.join(',')
	}

	dispatchAction(e) {
		if (!e.target.classList.contains('tag'))
			return
		e.target.hasAttribute('selected') ?
			e.target.removeAttribute('selected') :
			e.target.setAttribute('selected', '')
		this.#internals.setFormValue(this.value)
		this.#internals.setValidity({})
	}
}

customElements.define('input-tag', InputTag)
