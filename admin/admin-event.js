import AdminElement from './admin-element.js'
import InputTag from './input-tag.js'
/**
 * @typedef {import('./admin-app.js').DataBase} DataBase
 * @typedef {import('./admin-app.js').EventData} EventData
 */

const template = /*html*/`
<style>
	.row, .header {
		grid-template-columns: 112px 112px 100px 1fr 20px;
		grid-auto-rows: 26px;
	}

	.tag {
		height: 100%;
		aspect-ratio: 1/1;
		display: inline-block;
		background-image: url('/app/tag/tag.webp');
		background-size: 400% 400%;
		background-position: calc(var(--offX) * 33.33%) calc(var(--offY) * 33.33%);
	}
</style>
<div class="header">
	<div> Debut </div>
	<div> Fin </div>
	<div> Tags </div>
	<div> Titre </div>
	<div class="create" data-action="open-edit"> + </div>
</div>
<section id="items">
</section>`

export default class AdminEvent extends AdminElement {
	constructor() {
		super(template, 'events', '/api/event')
		/**@type {EventData[]}*/this.items
	}

	/**
	 * @param {EventData} event
	 * @return {string} */
	renderItem(event) {
		return /*html*/`
		<div class="row" data-id="${event.id}" data-action="open-edit">
			<span> ${event.start} </span>
			<span> ${event.end} </span>
			<span> ${
				event.tags.map(tag => /*html*/`<span class="tag" 
						style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}"></span>`)
					.join('')
			} </span>
			<span> ${event.title} </span>
			<span class="delete" data-id="${event.id}" data-action="open-delete"> x </span>
		</div> `
	}

	/** @param {number} idEvent */
	openEdit(idEvent) {
		const event = this.items.find(event => event.id === idEvent) || {tags:[]}
		const form = /*html*/`
			<div class="shadow">
				<form class="card">
					<label readonly> ID: </label>
					<input type="number" name="id" value="${event.id}" readonly tabindex="-1">
					<label> Début*: </label>
					<input type="datetime-local" name="start" value="${event.start||''}" required>
					<label> Fin*: </label>
					<input type="datetime-local" name="end" value="${event.end||''}" required>
					<label> Tags: </label>
					<input-tag class="input" name="tags" value="${event.tags.map(t => t.id)}"></input-tag>
					<label> Titre*: </label>
					<input type="text" name="title" value="${event.title||''}" maxlength="200" required>
					<label> Bannière: </label>
					<input type="file" name="banner">
					<label> Video preview: </label>
					<input type="file" name="preview">
					<div class="actions">
						<svg class="dir-button" data-action="open-dir" data-dir="/app/event/${event.id}" viewbox="0 0 100 100">
							<title>Ouvrir le dossier</title>
							<path d="M10,15V85H90V30H55L40,15Z"></path>
						</svg>
						<button type="button" data-action="close-card"> Annuler </button>
						<button type="button" data-action="post-item"> ${event.id?'Modifier':'Créer'} </button>
					</div>
				</form>
			</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)
	}

	/** @param {number} idEvent */
	openDelete(idEvent) {
		const event = this.items.find(event => event.id === idEvent)
		super.openDelete(idEvent, `Voulez-vous vraiment supprimer l'événement "${event.title}"(ID:${event.id})`)
	}
}

customElements.define('admin-event', AdminEvent)
