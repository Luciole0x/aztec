const template = /*html*/`
<style>
	:host {
		display: inline-flex;
		max-height: 256px;
		justify-content: center;
	}

	.tags {
		cursor: pointer;
		aspect-ratio: 1/1;
		max-height: 100%;
		max-width: 100%;
	}

	[selected] {
		opacity: 1;
		filter: grayscale(0);
	}

	.mask {
		opacity: 0.35;
	}
	.selector {
		stroke: var(--stroke);
		stroke-linejoin: round;
		stroke-width: 2.1;
	}
</style>

<svg class="tags" viewbox="-2 -2 104 104">
	<defs>
		<pattern id="icons" patternUnits="userSpaceOnUse" width="100" height="100">
			<image href="/app/tag/tag.webp" x="0" y="0" width="100" height="100"/>
		</pattern>
	</defs>
	<path class="mask" d="M0,0H100V100H0Z" fill="url(#icons)"/>
	<path class="selector" style="--stroke:#9E9E9E" fill="url(#icons)"/>
	<path class="selector" style="--stroke:#2196F3" fill="url(#icons)"/>
</svg>`

export default class InputIcon extends HTMLElement {
	static GRID_SIZE = 4
	static observedAttributes = ['value']
	static formAssociated = true

	attributeChangedCallback(name, oldValue, newValue) {
		this.value = newValue
	}

	constructor() {
		super()
		this.internals = this.attachInternals()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template
		this.setAttribute('tabindex', 0)

		this._value = []
		this._hover = { x:-2, y:-2 }
		this.selectors = this.shadowRoot.querySelectorAll('.selector')

		this.svg = this.shadowRoot.querySelector('svg')
		this.svg.addEventListener('mousemove', this.onMouseMove.bind(this))
		this.svg.addEventListener('mouseleave', this.onMouseLeave.bind(this))
		this.svg.addEventListener('click', this.onClick.bind(this))
	}

	set value(newValue) {
		if ((typeof newValue) === 'string')
			newValue = newValue.split(',').map(Number).filter(v=>!isNaN(v))
		this._value = newValue
		this._hover = { x:-2, y:-2 }

		this.updateSelectors(this._value[0], this._value[1])

		this.validate()
	}

	get value() {
		return this._value.join(',')
	}

	onMouseMove(e) {
		const pos = this.getCursorPos(e)
		this.updateSelectors(pos.x, pos.y)
	}
	onMouseLeave(e) {
		this.updateSelectors(this._value[0], this._value[1])
	}
	onClick(e) {
		const pos = this.getCursorPos(e)
		this.value = [ pos.x, pos.y ]
	}

	updateSelectors(x, y) {
		if (x===this._hover.x && y===this._hover.y)
			return
		if (isNaN(x) || isNaN(y) || x===this._value[0] && y===this._value[1]) {
			this._hover.x = -2
			this._hover.y = -2
		} else {
			this._hover.x = x
			this._hover.y = y
		}

		let coef = 100 / InputIcon.GRID_SIZE
		let s = coef + 2
		this.selectors[0].setAttribute('d', `M${
			(this._value[0]||0)*coef-1},${
			(this._value[1]||0)*coef-1}v${s}h${s}v-${s}z`)
		this.selectors[1].setAttribute('d', `M${
			this._hover.x*coef-1},${
			this._hover.y*coef-1}v${s}h${s}v-${s}z`)
	}

	getCursorPos(e) {
		const { height, width } = this.svg.getBoundingClientRect()
		let x = Math.floor((e.offsetX / width *1.04-0.02) *InputIcon.GRID_SIZE)
		let y = Math.floor((e.offsetY / height *1.04-0.02) *InputIcon.GRID_SIZE)
		x = Math.min(Math.max(0, x), InputIcon.GRID_SIZE-1)
		y = Math.min(Math.max(0, y), InputIcon.GRID_SIZE-1)
		return {x,y}
	}

	validate() {
		this.internals.setFormValue(this.value)
		if (this.hasAttribute('required') && !this._value.length)
			this.internals.setValidity({valueMissing:true}, 'Icon requis.')
		else
			this.internals.setValidity({})
	}
}

customElements.define('input-icon', InputIcon)
