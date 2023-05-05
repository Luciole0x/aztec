
const baseTemplate = /*html*/`
<style>
	:host {
		display: block;
		max-width: 1000px;
		margin: 0 auto;
		padding-top: 32px;
		background: white;
	}

	[hidden] {
		display: none;
	}
	[readonly] {
		opacity: 0.6;
		pointer-events: none;
	}

	.header {
		border-top: solid 1px #0008;
		border-bottom: solid 1px #0008;
		position: sticky;
		text-align: center;
		display: grid;
		top: 32px;
		z-index: 1;
		background: white;
		font-weight: bold;
		font-size: 18px;
	}
		.header > div {
			border-right: solid 1px #0008;
		}
		.header > div:last-of-type,
		.row > span:last-of-type {
			border-right: none;
		}
		.create {
			color: #048;
		}
		.create:hover {
			color: white;
			background-color: #ACF;
			cursor: pointer;
		}

	#items {
		display: grid;
	}
		.row {
			display: grid;
			cursor: pointer;
		}
		.row:hover {
			background-color: #0002;
		}
			.row > span {
				overflow: hidden;
				border: solid #0008;
				border-width: 0 1px 1px 0;
				padding: 0 2px;
				white-space: nowrap;
			}
			.row:last-of-type > span {
				border-bottom: none;
			}
			.delete {
				font-weight: bold;
				color: #A00;
				text-align: center;
				cursor: pointer;
			}
			.delete:hover {
				color: #FFF;
				background-color: #F00;
			}

	.shadow {
		position: fixed;
		z-index: 20;
		inset: 0;
		background: #0008;
		overflow: auto;
		transition: opacity 200ms ease-in;
		animation: fade-in 200ms ease-out;
	}
	@keyframes fade-in {
		from {opacity:0}
		to {opacity:1}
	}

		.card {
			background: white;
			border-radius: 4px;
			width: 100%;
			max-width: 600px;
			margin: 128px auto;
			display: grid;
			padding: 16px;
			grid-gap: 8px;
			font-size: 18px;
			box-sizing: border-box;
		}
		.card.blink > input:invalid,
		.card.blink > .input:invalid {
			background: #F004;
			transition: background 0ms;
		}
		.card-delete {
			border: solid red 2px;
			background: #FEE;
		}
		label {
			margin: 0 0 -10px 0px;
		}
		.actions {
			margin-top: 16px;
			display: flex;
			gap: 8px;
			justify-content: right;
		}

		button {
			flex: 1 1 auto;
			min-width: 100px;
			max-width: 200px;
			padding: 8px 4px;
		}

		button, .dir-button {
			font-size: 18px;
			border: solid 1px #0008;
			border-radius: 2px;
			background: #EEF;
		}
		.dir-button {
			flex: 0 0 auto;
			padding: 2px 8px;
			stroke: currentColor;
			stroke-width: 8;
			stroke-linejoin: round;
			fill: none;
			height: 34px;
		}
		button:hover, .dir-button:hover {
			background: #DDD;
			cursor: pointer;
		}

		input, .input {
			border: solid 1px #0008;
			border-radius: 2px;
			font-size: 18px;
			padding: 2px;
			background: #F000;
			transition: background 220ms;
		}
		:invalid {
			border-color: #F64;
			border-width: 2px;
			padding: 1px;
		}
</style>`

export default class AdminElement extends HTMLElement {
	constructor(template, itemType, apiPath) {
		super()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = `${baseTemplate}${template}`

		this.items = []
		this.itemType = itemType
		this.apiPath = apiPath
		this.itemsNode = this.shadowRoot.getElementById('items')
		this.shadowRoot.addEventListener('click', this.dispatchAction.bind(this))
	}

	connectedCallback() {
		this.renderItems()
	}

	dispatchAction(e) {
		let target = e.target.closest('[data-action]') || {dataset:{}}
		switch (target.dataset.action) {
		case 'close-card': return this.closeCard(target)
		case 'open-edit': return this.openEdit(Number(target.dataset.id))
		case 'post-item': return this.postItem(target)
		case 'open-delete': return this.openDelete(Number(target.dataset.id))
		case 'delete-item': return this.deleteItem(target)
		case 'open-dir': return this.openDir(target.dataset.dir)
		}
	}

	/**@param {boolean?} forceUpdate */
	async renderItems(forceUpdate) {
		this.items = (await document.body.getIndexData(forceUpdate))[this.itemType]
		this.itemsNode.innerHTML = this.items
			.map(this.renderItem)
			.join('')
	}

	/** @param {HTMLButtonElement} target */
	async postItem(target) {
		const form = target.closest('form')
		if (!form.checkValidity()) {
			form.classList.add('blink')
			return setTimeout(() => form.classList.remove('blink'))
		}

		const formData = new FormData(form)

		try {
			const res = await fetch(this.apiPath, { method:'POST', body:formData })
			if (!res.ok) await res.json().then(err => {throw err})

			this.closeCard(form)
			document.body.notify(`Modification effectué`)
			return this.renderItems(true)

		} catch (err) {
			document.body.notify(err.message||err, 'error')
		}
	}

	/**
	 * @param {number} idItem
	 * @param {string} msg 
	 */
	openDelete(idItem, msg) {
		const form = /*html*/`
		<div class="shadow">
			<form class="card card-delete" onsubmit="return false">
				<p>${msg}</p>
				<div class="actions">
					<button data-action="close-card"> Annuler </button>
					<button data-action="delete-item" data-id="${idItem}"> Supprimer </button>
				</div>
			</form>
		</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)

	}

	/** @param {HTMLElement} target */
	async deleteItem(target) {
		try {
			const res = await fetch(this.apiPath, {
				method: 'DELETE',
				body: target.dataset.id,
				headers: {'Content-Type':'application/json'} })
			if (!res.ok) await res.json().then(err => {throw err})

			this.closeCard(target)
			document.body.notify(`Supression effectué.`)
			return this.renderItems(true)
		} catch (err) {
			document.body.notify(err.message||err, 'error')
		}
	}


	/** @param {HTMLElement} target */
	closeCard(target) {
		target = target.closest('.shadow')
		if (target) {
			target.style.opacity = 0
			setTimeout(() => target.remove(), 200)
		}
	}

	async openDir(dir) {
		const res = await fetch('/api/cmd/open-dir', {
			method: 'POST',
			body: JSON.stringify(dir),
			headers: {'Content-Type':'application/json'} })
		if (!res.ok)
			await res.json().then(err => document.body.notify(err, 'error'))
		else
			document.body.notify(`Ouverture en cour...`)
	}
}
