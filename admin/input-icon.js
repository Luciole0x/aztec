const template = /*html*/`
<style>
	:host {
		display: inline-flex;
		max-height: 256px;
		justify-content: center;
	}

	.tags {
		cursor: pointer;
		background-image: url('/app/tag/tag.webp');
		background-size: 97% 97%;
		background-repeat: no-repeat;
		background-position: center;
		aspect-ratio: 1/1;
		max-height: 100%;
		max-width: 100%;
	}

	[selected] {
		opacity: 1;
		filter: grayscale(0);
	}

	.mask {
		fill: #FFFB;
		stroke-linejoin: round;
		stroke-width: 2;
	}

</style>
<svg class="tags" viewbox="-2 -2 104 104">
	<path class="mask" d="M-8,-8H108V108H-8Z" fill="#FFFA"></path>
</svg>
`

export default class InputIcon extends HTMLElement {
	static observedAttributes = ['value']
	static formAssociated = true

	attributeChangedCallback(name, oldValue, newValue) {
		this.value = newValue
	}

	constructor() {
		super()
		this.internals = this.attachInternals()
		this.attachShadow({mode:'open', delegatesFocus:true})
		this.shadowRoot.innerHTML = template
		this.setAttribute('tabindex', 0)

		this._value = [0,0]
		this._hover = { x:-1, y:-1 }
		this.path = this.shadowRoot.querySelector('.mask')

		const svg = this.path.parentElement
		svg.addEventListener('mousemove', this.onMouseMove.bind(this))
		svg.addEventListener('mouseleave', this.onMouseLeave.bind(this))
		svg.addEventListener('click', this.onClick.bind(this))
	}
	
	set value(newValue) {
		if ((typeof newValue) === 'string')
			newValue = newValue.split(',')
		this._value = newValue.map(Number)
		this._hover = { x:-1, y:-1 }
		this.updatePath(this._value[0], this._value[1])

		this.internals.setFormValue(this.value)
		this.internals.setValidity({})
	}

	get value() {
		return this._value.join(',')
	}

	onMouseMove(e) {
		const pos = this.getCursorPos(e)
		this.updatePath(pos.x, pos.y)
	}
	onMouseLeave(e) {
		this.updatePath(this._value[0], this._value[1])
	}
	onClick(e) {
		const pos = this.getCursorPos(e)
		this.value = [ pos.x, pos.y ]
	}

	updatePath(x, y) {
		if (x===this._hover.x && y===this._hover.y)
			return

		this._hover.x = x
		this._hover.y = y

		if (isNaN(x) || isNaN(y))
			return this.path.setAttribute('d', `M-8,-8H108V108H-8Z`)

		let color = '#2196F3'
		if (x===this._value[0] && y===this._value[1])
			color = '#9E9E9E'

		this.path.style.stroke = color
		this.path.setAttribute('d', `M-8,-8H108V108H-8Z M${x*25-1},${y*25-1} v27h27v-27Z`)
	}

	getCursorPos(e) {
		const { height, width } = this.path.parentElement.getBoundingClientRect()
		let x = Math.floor((e.offsetX / width *1.04-0.02) *4)
		let y = Math.floor((e.offsetY / height *1.04-0.02) *4)
		x = Math.min(Math.max(0, x), 3)
		y = Math.min(Math.max(0, y), 3)
		return {x,y}
	}
}

customElements.define('input-icon', InputIcon)
