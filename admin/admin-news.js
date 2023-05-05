import AdminElement from './admin-element.js'
import InputTag from './input-tag.js'
/**
 * @typedef {import('./admin-app.js').DataBase} DataBase
 * @typedef {import('./admin-app.js').NewsData} NewsData
 */

const template = /*html*/`
<style>
	.row, .header {
		grid-template: auto / 140px 100px 1fr 20px;
	}

	.tag {
		height: 100%;
		aspect-ratio: 1/1;
		display: inline-block;
		background-image: url('/app/tag/tag.webp');
		background-size: 400% 400%;
		background-position: calc(var(--offX) * 33.33%) calc(var(--offY) * 33.33%);
	}

	textarea {
		resize: vertical;
		min-height: 8em;
	}

</style>
<div class="header">
	<div> Publication </div>
	<div> Tags </div>
	<div> Titre </div>
	<div class="create" data-action="open-edit"> + </div>
</div>
<section id="items">
</section>`

export default class AdminNews extends AdminElement {
	constructor() {
		super(template, 'news', '/api/news')
		/**@type {NewsData[]}*/this.items
	}

	/**
	 * @param {NewsData} news
	 * @return {string} */
	renderItem(news) {
		return /*html*/`
		<div class="row" data-id="${news.id}" data-action="open-edit">
			<span> ${new Date(news.publication).toISOString().slice(0,16)} </span>
			<span> ${
				news.tags.map(tag => /*html*/`<span class="tag"
						style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}"></span>`)
					.join('')
			} </span>
			<span> ${news.title} </span>
			<span class="delete" data-id="${news.id}" data-action="open-delete"> x </span>
		</div>`
	}

	/** @param {number} idNews */
	async openEdit(idNews) {
		const news = this.items.find(news => news.id === idNews) || {tags:[]}
		const article = await fetch(`/app/news/${idNews}/article.tpl`)
			.then(res => res.ok ? res.text() : '')
			.catch(err => '')

		const form = /*html*/`
		<div class="shadow">
			<form class="card">
				<label> ID: </label>
				<input type="number" name="id" value="${news.id}" readonly tabindex="-1">
				<label> Publication*: </label>
				<input type="datetime-local" name="publication" value="${news.publication||''}" required>
				<label> Tags: </label>
				<input-tag class="input" name="tags" value="${news.tags.map(t => t.id)}"></input-tag>
				<label> Titre*: </label>
				<input type="text" name="title" value="${news.title||''}" maxlength="256" required>
				<label> Article*: </label>
				<textarea class="input" name="article" required>${article}</textarea>
				<label> Bannière: </label>
				<input type="file" name="banner">
				<label> Vignette: </label>
				<input type="file" name="thumbnail">
				<div class="actions">
					<svg class="dir-button" data-action="open-dir" data-dir="/app/news/${news.id}" viewbox="0 0 100 100">
						<title>Ouvrir le dossier</title>
						<path d="M10,15V85H90V30H55L40,15Z"></path>
					</svg>
					<button type="button" data-action="close-card"> Annuler </button>
					<button type="button" data-action="post-item"> ${news.id?'Modifier':'Créer'} </button>
				</div>
			</form>
		</div>`
		this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', form)
	}

	/** @param {number} idNews */
	openDelete(idNews) {
		const news = this.items.find(news => news.id === idNews)
		super.openDelete(idNews, /*html*/`
			Voulez-vous vraiment supprimer l'actualité
			"${news.name}"(ID:${news.id})`)
	}
}

customElements.define('admin-news', AdminNews)
