/**
 * @typedef {import('./admin-app.js').PlayerData} PlayerData
 */

const template = /*html*/`
<style>
	:host {
		display: flex;
		gap: 8px;
	}

	.players {
		display: contents;
	}
		.player, .search {
			background: #0001;
			line-height: 1.4em;
			padding-left: 4px;
			display: inline-block;
			border-radius: 8px;
			border: solid 1px #0008;
			overflow: hidden;
			transition: background 250ms ease-in;
		}
		.remove {
			width: 1em;
			text-align: center;
			cursor: pointer;
			display: inline-block;
			color: #F88;
			font-weight: bold;
		}
		.remove:hover {
			color: white;
			background: #F88;
		}
		.blink {
			background: #000A;
			transition: background 0ms;
		}

</style>
<div class="players"></div>
<input class="search" list="options" placeholder="+ Ajouter">`

export default class InputPlayer extends HTMLElement {
	/**@type {PlayerData[]}*/
	static PLAYERS = []
	/**@type {Map<string|number, PlayerData>}*/
	static PLAYERS_MAP = new Map()
	static observedAttributes = ['value']
	static formAssociated = true

	attributeChangedCallback(name, oldValue, newValue) {
		this.value = newValue
	}

	constructor() {
		super()
		this.attachShadow({mode:'open', delegatesFocus:true})
		this.internals = this.attachInternals()
		this.setAttribute('tabindex', '0')
		this.shadowRoot.innerHTML = `${template}${this.buildOptions()}`

		this.playersNode = this.shadowRoot.querySelector('.players')
		this.optionsNode = this.shadowRoot.querySelector('#options')
		this._value = []

		this.shadowRoot.addEventListener('click', this.dispatchAction.bind(this))
		this.shadowRoot.querySelector('input').addEventListener('input', this.onInput.bind(this))
	}

	buildOptions() {
		return /*html*/`
			<datalist id="options">${
				InputPlayer.PLAYERS
					.map(p => /*html*/`<option value="${p.name}"></option>`)
					.join('')
			}</datalist>`
	}

	set value(newValue) {
		if ((typeof newValue) === 'string')
			newValue = newValue.split(',').filter(v=>v).map(Number)
		this._value = newValue

		this.playersNode.innerHTML = this._value
			.map(id => InputPlayer.PLAYERS_MAP.get(id))
			.sort((a,b) => a.name < b.name)
			.map(p => /*html*/`<div class="player"> ${p.name
					}<div data-action="remove-player" data-id="${p.id}" class="remove">x</div>
				</div>`)
			.join('')

		this.internals.setFormValue(this.value.join())
		this.internals.setValidity({})
	}

	get value() {
		return this._value
	}

	dispatchAction(e) {
		switch (e.target?.dataset.action) {
		case 'remove-player': return this.removePlayer(e.target)
		}
	}

	onInput(e) {
		let player = InputPlayer.PLAYERS_MAP.get(e.target.value)
		if (player) {
			if (this._value.includes(player.id)) {
				let playerNode = this.playersNode.querySelector(`[data-id="${player.id}"]`).parentElement
				playerNode.classList.add('blink')
				setTimeout(() => playerNode.classList.remove('blink'))
			} else
				this.value = [...this._value, player.id]
			e.target.value = ''
		}
	}

	removePlayer(target) {
		let id = Number(target.dataset.id)
		this.value = this._value.filter(playerId => playerId!==id)
	}
}

customElements.define('input-player', InputPlayer)

