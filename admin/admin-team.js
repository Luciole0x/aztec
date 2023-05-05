import AdminElement from './admin-element.js'
import InputTag from './input-tag.js'
import InputPlayer from './input-player.js'

/**
 * @typedef {import('./admin-app.js').DataBase} DataBase
 * @typedef {import('./admin-app.js').TeamData} TeamData
 */

const template = /*html*/`
<style>
	.row, .header {
		grid-template: auto / 35px 180px 3fr 2fr 20px;
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
	<div> Tag </div>
	<div> Nom </div>
	<div> Joueurs </div>
	<div> Coachs </div>
	<div class="create" data-action="open-edit"> + </div>
</div>
<section id="items">
</section>`

export default class AdminTeam extends AdminElement {
	constructor() {
		super(template, 'teams', '/api/team')
		/**@type {TeamData[]}*/this.items
	}

	/**
	 * @param {TeamData} team
	 * @return {string} */
	renderItem(team) {
		return /*html*/`
		<div class="row" data-id="${team.id}" data-action="open-edit">
			<span><span class="tag" style="--offX:${team.tag.offset[0]};--offY:${team.tag.offset[1]}"></span></span>
			<span> ${team.name} </span>
			<span> ${team.players.map(player => player.name).join(' , ')} </span>
			<span> ${team.coaches.map(coach => coach.name).join(' , ')} </span>
			<span class="delete" data-id="${team.id}" data-action="open-delete"> × </span>
		</div>`
	}

	/** @param {number} idTeam */
	async openEdit(idTeam) {
		const team = this.items.find(team => team.id === idTeam) || {players:[], coaches:[]}
		const form = /*html*/`
		<div class="shadow">
			<form class="card">
				<label> ID: </label>
				<input type="number" name="id" value="${team.id}" readonly tabindex="-1">
				<label> Nom*: </label>
				<input type="text" name="name" value="${team.name||''}" required>
				<label> Tag: </label>
				<input-tag class="input" name="tag" value="${team.tag?.id||''}" data-single></input-tag>
				<label> Joueurs*: </label>
				<input-player class="input" name="players" value="${team.players?.map(c=>c.id)}" required></input-player>
				<label> Coachs: </label>
				<input-player class="input" name="coaches" value="${team.coaches?.map(c=>c.id)}"></input-player>

				<div class="actions">
					<button type="button" data-action="close-card"> Annuler </button>
					<button type="button" data-action="post-item"> ${team.id?'Modifier':'Créer'} </button>
				</div>
			</form>
		</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)
	}

	/** @param {number} idTeam */
	openDelete(idTeam) {
		const team = this.items.find(team => team.id === idTeam)
		super.openDelete(idTeam, /*html*/`
			Voulez-vous vraiment supprimer l'équipe
			"${team.name}"(ID:${team.id})`)
	}
}
customElements.define('admin-team', AdminTeam)