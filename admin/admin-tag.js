import AdminElement from './admin-element.js'
import InputIcon from './input-icon.js'

/**
 * @typedef {import('./admin-app.js').DataBase} DataBase
 * @typedef {import('./admin-app.js').TagData} TagData
 */

const template = /*html*/`
<style>
	:host {
		max-width: 600px;
	}

	.row, .header {
		grid-template: 20px / 80px 80px 20px 1fr 20px;
	}

	.tag {
		padding: 0 !important;
		aspect-ratio: 1/1;
		display: inline-block;
		background-image: url('/app/tag/tag.webp');
		background-size: 400% 400%;
		background-position: calc(var(--offX) * 33.33%) calc(var(--offY) * 33.33%);
	}

	.small {
		color: #0008;
		font-size: 0.7em;
	}
</style>
<div class="header">
	<div> OffsetX </div>
	<div> OffsetY </div>
	<div></div>
	<div> Nom </div>
	<div class="create" data-action="open-edit"> + </div>
</div>
<section id="items">
</section>
`

export default class AdminTag extends AdminElement {
	constructor() {
		super(template, 'tags', '/api/tag')
		/**@type {TagData[]}*/this.items
	}

	/**
	 * @param {TagData} tag
	 * @return {string} */
	renderItem(tag) {
		return /*html*/`
		<div class="row" data-id="${tag.id}" data-action="open-edit">
			<span> ${tag.offset[0]} </span>
			<span> ${tag.offset[1]} </span>
			<span class="tag" style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}"> </span>
			<span> ${tag.name} </span>
			<span class="delete" data-id="${tag.id}" data-action="open-delete"> x </span>
		</div>`
	}

	/** @param {number} idTag */
	openEdit(idTag) {
		const tag = this.items.find(tag => tag.id === idTag) || {tags:[]}
		const form = /*html*/`
			<div class="shadow">
				<form class="card">
					<label> ID: </label>
					<input type="number" name="id" value="${tag.id}" readonly tabindex="-1">
					<label> Nom*: </label>
					<input type="text" name="name" value="${tag.name||''}" maxlength="200" required>
					<label> Icon*: <span class="small">(/app/tag/tag.webp)</span> </label>
					<input-icon class="input" name="offset" value="${tag.offset}"></input-icon>
					<label> Background: </label>
					<input type="file" name="background">
					<div class="actions">
						<button type="button" data-action="close-card"> Annuler </button>
						<button type="button" data-action="post-item"> ${tag.id?'Modifier':'Créer'} </button>
					</div>
				</form>
			</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)
	}

	/** @param {number} idTag */
	openDelete(idTag) {
		const tag = this.items.find(tag => tag.id === idTag)
		super.openDelete(idTag, /*html*/`
			Voulez-vous vraiment supprimer le tag
			"${tag.name}<span class="tag" style="--offX:${tag.offset[0]}; --offY:${tag.offset[1]}; height:1.2em;"> </span>"
			(ID:${tag.id})`)
	}
}

customElements.define('admin-tag', AdminTag)
