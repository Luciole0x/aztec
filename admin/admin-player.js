import AdminElement from './admin-element.js'

/**
 * @typedef {import('./admin-app.js').DataBase} DataBase
 * @typedef {import('./admin-app.js').PlayerData} PlayerData
 */

const template = /*html*/`
<style>
	:host {
		max-width: 800px;
	}

	.row, .header {
		grid-template: auto / 3fr 3fr 5fr 20px;
	}
</style>
<div class="header">
	<div> Nom </div>
	<div> Role </div>
	<div> Contact </div>
	<div class="create" data-action="open-edit"> + </div>
</div>
<section id="items">
</section>`

export default class AdminPlayer extends AdminElement {
	constructor() {
		super(template, 'players', '/api/team/player')
		/**@type {PlayerData[]}*/this.items
	}

	/**
	 * @param {PlayerData} player
	 * @return {string} */
	renderItem(player) {
		return /*html*/`
		<div class="row" data-id="${player.id}" data-action="open-edit">
			<span> ${player.name||''} </span>
			<span> ${player.role||''} </span>
			<span> ${player.contact||''} </span>
			<span class="delete" data-id="${player.id}" data-action="open-delete"> x </span>
		</div>`
	}

	/** @param {number} idPlayer */
	async openEdit(idPlayer) {
		const player = this.items.find(player => player.id === idPlayer) || {}
		const form = /*html*/`
		<div class="shadow">
			<form class="card">
				<label> ID: </label>
				<input type="number" name="id" value="${player.id}" readonly tabindex="-1">
				<label> Nom*: </label>
				<input type="text" name="name" value="${player.name||''}" required>
				<label> Rôle*: </label>
				<input type="text" name="role" value="${player.role||''}" required>
				<label> Contact*: </label>
				<input type="text" name="contact" value="${player.contact||''}">
				<div class="actions">
					<button type="button" data-action="close-card"> Annuler </button>
					<button type="button" data-action="post-item"> ${player.id?'Modifier':'Créer'} </button>
				</div>
			</form>
		</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)
	}

	/** @param {number} idPlayer */
	openDelete(idPlayer) {
		const player = this.items.find(player => player.id === idPlayer)
		super.openDelete(idPlayer, /*html*/`
			Voulez-vous vraiment supprimer le Joueur
			"${player.name}"(ID:${player.id})`)
	}
}

customElements.define('admin-player', AdminPlayer)
