import InputTag from './input-tag.js'
/**
 * @typedef {import('./admin-app.js').DataBase} DataBase
 * @typedef {import('./admin-app.js').EventData} EventData
 */

const template = /*html*/`
<style>
	:host {
		display: block;
		max-width: 1000px;
		margin: 0 auto;
		padding-top: 32px;
		background: white;
	}

	.tag {
		height: calc(100% + 4px);
		margin-top: -2px;
		aspect-ratio: 1/1;
		display: inline-block;
		background-image: url('/app/media/icon/game.webp');
		background-size: 400% 400%;
		background-position: calc(var(--offX) * 33.33%) calc(var(--offY) * 33.33%);
	}

	[hidden] {
		display: none;
	}
	[readonly] {
		opacity: 0.8;
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
		grid-template: auto / 112px 112px 90px 1fr 20px;
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
			background: #ACF;
			cursor: pointer;
		}

	#events {
		display: grid;
		grid-template-columns: 112px 112px 90px 1fr 20px;
		grid-auto-rows: auto;
	}
		.row {
			display: contents;
			cursor: pointer;
		}
		.row:hover > span {
			background: #0002;
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
				background: #F00 !important;
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
		.card.blink > input-tag:invalid {
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
			font-size: 18px;
		}
		input, input-tag {
			border: solid 1px #0008;
			border-radius: 2px;
			font-size: 18px;
			padding: 2px;
			background: #F000;
			transition: background 220ms;
		}
		input:invalid, input-tag:invalid {
			border-color: #F64;
			border-width: 2px;
			padding: 1px;
		}

</style>
<div class="header">
	<div> Debut </div>
	<div> Fin </div>
	<div> Tags </div>
	<div> Titre </div>
	<div class="create" data-action="open-edit"> + </div>
</div>
<section id="events">
</section>`

export default class AdminEvent extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template

		/**@type {EventData[]}*/this.events = []
		this.eventsNode = this.shadowRoot.getElementById('events')
		this.shadowRoot.addEventListener('click', this.dispatchAction.bind(this))
	}

	connectedCallback() {
		this.renderEvents()
	}

	dispatchAction(e) {
		let target = e.target.closest('[data-action]') || {dataset:{}}
		switch (target.dataset.action) {
		case 'close-card': return this.closeCard(target)
		case 'open-edit': return this.openEdit(Number(target.dataset.id))
		case 'post-event': return this.postEvent(target)
		case 'open-delete': return this.openDelete(Number(target.dataset.id))
		case 'delete-event': return this.deleteEvent(target.dataset.id)
		}
	}

	/**@param {boolean?} forceUpdate */
	async renderEvents(forceUpdate) {
		this.events = (await document.body.getIndexData(forceUpdate)).events
		this.eventsNode.innerHTML = this.events
			.map(this.renderEvent)
			.join('')
	}

	/**
	 * @param {EventData} event
	 * @return {string} */
	renderEvent(event) {
		return /*html*/`
			<div class="row" data-id="${event.id}" data-action="open-edit">
				<span> ${event.start} </span>
				<span> ${event.end} </span>
				<span> ${
					event.tags.map(tag => /*html*/`
							<span class="tag" style="--offX:${tag.offX};--offY:${tag.offY}"></span>

						`).join('')
				} </span>
				<span> ${event.title} </span>
				<span class="delete" data-id="${event.id}" data-action="open-delete"> x </span>
			</div> `
	}

	/** @param {number} idEvent */
	openEdit(idEvent) {
		const event = this.events.find(e => e.id === idEvent) || {tags:[]}
		const form = /*html*/`
			<div class="shadow">
				<form class="card">
					<label for="id" readonly> ID: </label>
					<input type="number" name="id" id="id" value="${event.id}" readonly tabindex="-1">
					<label for="start"> Début*: </label>
					<input type="datetime-local" name="start" id="start" value="${event.start||''}" required>
					<label for="end"> Fin*: </label>
					<input type="datetime-local" name="end" id="end" value="${event.end||''}" required>
					<label for="tags"> Tags: </label>
					<input-tag name="tags" id="tags" value="${event.tags.map(t => t.id)}" tabindex="0"></input-tag>
					<label for="title"> Titre*: </label>
					<input type="text" name="title" id="title" value="${event.title||''}" maxlength="200" required>
					<label for="banner"> Bannière: </label>
					<input type="file" name="banner" id="banner">
					<label for="preview"> Video preview: </label>
					<input type="file" name="preview" id="preview">
					<div class="actions">
						<button type="button" data-action="close-card"> Annuler </button>
						<button type="button" data-action="post-event"> ${event.id?'Modifier':'Créer'} </button>
					</div>
				</form>
			</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)
	}

	/** @param {HTMLButtonElement} target */
	async postEvent(target) {
		const form = target.closest('form')
		if (!form.checkValidity())
			return form.classList.add('blink')

		const formData = new FormData(form)

		try {
			await fetch('/api/event', { method:'POST', body:formData })
			this.closeCard(form)
			return this.renderEvents(true)
		} catch (err) {
			document.body.notify(err.message, 'error')
		}
	}

	/** @param {number} idEvent */
	openDelete(idEvent) {
		const event = this.events.find(e => e.id === idEvent)
		const form = /*html*/`
		<div class="shadow">
			<form class="card card-delete" onsubmit="return false">
				<p>Voulez-vous vraiment supprimer l'événement "${event.title}"(ID:${event.id}) ?</p>
				<div class="actions">
					<button data-action="close-card"> Annuler </button>
					<button data-action="delete-event" data-id="${event.id}"> Supprimer </button>
				</div>
			</form>
		</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)
	}

	/** @param {string} id */
	async deleteEvent(id) {
		await fetch('/api/event', {
			method: 'DELETE',
			body: id,
			headers: {'Content-Type':'application/json'} })
		return this.renderEvents(true)
	}

	/** @param {HTMLElement} target */
	closeCard(target) {
		target = target.closest('.shadow')
		if (target) {
			target.style.opacity = 0
			setTimeout(() => target.remove(), 200)
		}
	}
}

customElements.define('admin-event', AdminEvent)
