import AdminElement from './admin-element.js'
import InputIcon from './input-icon.js'
import InputMedia from './input-media.js'

/**
 * @typedef {import('./admin-app.js').DataBase} DataBase
 * @typedef {import('./admin-app.js').TagData} TagData
 */

const template = /*html*/`
<style>
	:host {
		max-width: 400px;
	}

	.row, .header {
		grid-template: 40px / 40px 1fr 20px;
		line-height: 40px;
	}

	.tag {
		padding: 0 !important;
		aspect-ratio: 1/1;
		display: inline-block;
		background-image: url('/app/tag/tag.webp');
		background-size: var(--tag-bg-size);
		background-position: calc(var(--offX) * var(--tag-tile-coef)) calc(var(--offY) * var(--tag-tile-coef));
	}

	.tag-inline {
		height: 1.6em;
		margin-bottom: -0.5em;
	}

</style>
<div class="header">
	<div></div>
	<div> Nom </div>
	<div class="create" data-action="open-edit"> + </div>
</div>
<section id="items">
</section>`

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
			<span class="tag" style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}"> </span>
			<span> ${tag.name} </span>
			<span class="delete" data-id="${tag.id}" data-action="open-delete"> × </span>
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
					<label> Icon*: <span class="link-template" data-action="open-dir" data-dir="/app/tag">(tag.webp↗)</span> </label>
					<input-icon class="input" name="offset" value="${tag.offset}" required></input-icon>
					<label> Background: 1280x720</label>
					<input-media class="input" name="background" accept=".webp" data-source="/app/tag/${tag.id}/background.webp"></input-media>
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
			"<span class="tag tag-inline"
					style="--offX:${tag.offset[0]}; --offY:${tag.offset[1]};"></span>
			${tag.name}"
			(ID:${tag.id})`)
	}
}

customElements.define('admin-tag', AdminTag)
