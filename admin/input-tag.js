const template = /*html*/`
<style>
	:host {
		display: inline-flex;
	}

	.tag {
		display: inline-block;
		height: 2em;
		aspect-ratio: 1/1;
		background-image: url('/app/tag/tag.webp');
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

	attributeChangedCallback(name, oldValue, newValue) {
		this.value = newValue
	}

	constructor() {
		super()
		this.internals = this.attachInternals()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = `${template}${this.buildTags()}`
		this.shadowRoot.addEventListener('click', this.dispatchAction.bind(this))
		this.setAttribute('tabindex', '0')
		this._value = []
	}

	buildTags() {
		return InputTag.TAGS.map(tag =>
			/*html*/`<span class="tag" title="${tag.name}" data-id="${tag.id}"
					style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}">
			</span>`)
			.join('')
	}

	set value(newValue) {
		if ((typeof newValue) === 'string')
			newValue = newValue.split(',').filter(v=>v).map(Number)

		if (this.hasAttribute('data-single'))
			newValue.splice(1, newValue.length)
		this._value = newValue

		for (let tag of this.shadowRoot.children)
			newValue.includes(Number(tag.dataset.id)) ?
				tag.setAttribute('selected', '') :
				tag.removeAttribute('selected')

		this.validate()
	}

	get value() {
		return this._value
	}

	dispatchAction(e) {
		if (!e.target.classList.contains('tag'))
			return

		const id = Number(e.target.dataset.id)
		this.value = this._value.includes(id) ?
			this._value.filter(v => v!==id) :
			[id, ...this._value]
	}

	validate() {
		this.internals.setFormValue(this._value.join())
		this.internals.setValidity({})
	}
}

customElements.define('input-tag', InputTag)
