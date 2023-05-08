/**
 * @typedef {import('../azt-app.js').NewsData} NewsData
 * @typedef {import('../azt-app.js').RouteValue} RouteValue
 * @typedef {import('../azt-app.js').AztApp} AztApp
 */

const template = /*html*/`
<style>
	:host(.close) {
		animation: close 120ms ease-in forwards;
	}
	@keyframes close {
		from {opacity:1;}
		to {opacity:0;}
	}

	.tag {
		display: inline-block;
		height: 48px;
		width: 48px;
		cursor: pointer;
		margin-right: 4px;
		border-radius: 4px;
		background-color: #DDD;
		background-image: url('./tag/tag.webp');
		background-size: var(--tag-bg-size);
		background-position: calc(var(--offX) * var(--tag-tile-coef)) calc(var(--offY) * var(--tag-tile-coef));
	}
	.tag:hover {
		filter: brightness(120%);
	}

	article.preview {
		position: relative;
		margin: 16px auto;
		width: 900px;
		height: 220px;
		max-width: 100%;
		border-radius: 4px;
		background: #333;

		display: grid;
		grid-template: 2em 1fr 1em / 1fr 2fr;
		box-shadow: #00000029 0 3px 6px, #0000003B 0 3px 6px;
		opacity: 0;
		animation: display-preview 350ms var(--delay,0) ease-out forwards;
	}
	@keyframes display-preview {
		from { opacity: 0; }
		to { opacity: 1; }

	}

	.preview-tags {
		grid-area: 1/1/1/1;
		width: fit-content;
		height: fit-content;
		z-index: 1;
		padding: 0;
		margin: -8px 0 0 -8px;
		position: sticky;
		left: 0;
	}

	.thumbnail {
		grid-area: 1/1/4/2;
		display: block;
		background-position: center;
		background-color: #DDD;
		background-image: url(logo.svg);
		background-size: cover;
		border-radius: 4px 0 0 4px;
		overflow: hidden;
	}
	.thumbnail:hover {
		filter: brightness(120%);
	}
		.thumbnail > img {
			height: 100%;
			width: 100%;
			object-fit: cover;
		}

	.preview-title {
		grid-area: 1/2/2/4;
		margin: 0;
		line-height: 2em;
		border-radius: 0 4px 0 0;
	}
		.preview-title a {
			text-decoration: none;
			color: inherit;
			padding: 0 16px;
		}
		.preview-title a:hover {
			text-decoration: underline;
		}

	.preview-text {
		padding: 4px 8px 8px 16px;
		margin: 0;
		grid-area: 2/2/3/4;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 300;
	}

	.preview-timestamp {
		grid-area: 3/2/4/4;
		font-size: 0.7em;
		padding-left: 8px;
		border-radius: 0 0 4px 0;
	}



	.full {
		position: fixed;
		z-index: 2;

		margin: 0;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden scroll;
		background: #0008;
		display: grid;
		grid-template: 240px 80px auto 64px
			/ minmax(0,1fr) 640px minmax(0,1fr);
	}

	.picture {
		top: 0;
		height: 350px;
		border-radius: 0 0 16px 16px;
		width: 1300px;
		justify-self: center;
		position: sticky;
		z-index: -1;
		object-fit: none;
		grid-area: 1/1/3/4;
	}

	.card {
		position: relative;
		box-shadow: #00000029 0 3px 6px, #0000003B 0 3px 6px;
		border-radius: 8px;
		background-color: #333;
		max-width:100%;
		width: 640px;
		margin: 0;
		display: grid;
		grid-template: 0 auto 1fr auto / 1fr;
		grid-area: 2/2/4/3;
		padding: 8px;
		box-sizing: border-box;
	}

	.title {
		margin: 8px 0 0 0;
		padding: 0;
	}
	.timestamp { display:none; }
	.content {
		min-height: 600px;
		font-weight: 300;
	}

		.tags {
			position: sticky;
			height: fit-content;
			margin: 0 0 0 -72px;
			width: 48px;
			padding: 8px;
			top: 120px;
			left: 0;
		}

		.full.close {
			transition: opacity 280ms ease-in;
			opacity: 0;
		}
		.full.close > .card {
			transition: transform 280ms ease-in, opacity 180ms ease-in;
			transform: translateY(32px);
			opacity: 0;
		}

		.preview {
			animation: full-in 280ms ease-out;
		}

		.full {
			animation: full-in 280ms ease-out;
		}
		@keyframes full-in {
			from { opacity:0; }
			to { opacity:1; }
		}
		.full > .card {
			animation: full-card-in 280ms ease-out;
		}
		@keyframes full-card-in {
			from { transform: translateY(32px); }
			to { transform: translateY(0); }
		}
</style>`

/**@type {AztApp}*/const app = window.app
const S = app.SECTION

export default class AztNewsSection extends HTMLElement {
	/**
	 * @param {AztApp} app
	 * @param {RouteValue} route */
	static async display(app, route) {
		return new AztNewsSection(
			app.cache.index.data.news,
			route)
	}

	constructor(news, route) {
		super()
		this.attachShadow({mode:'open'})
		this.setAttribute('is', 'azt-news-section')
		this.onRouteUpdate = this.onRouteUpdate.bind(this)
		this.onTagFilter = this.onTagFilter.bind(this)

		/**@type {HTMLElement?}*/this.displayedNews = null
		/**@type {NewsData[]}*/this.news = news
		/**@type {RouteValue}*/this.route = route

		this.shadowRoot.innerHTML = `${
			template}${
			this.renderPreviews(this.news, this.route)}`
	}

	connectedCallback() {
		document.body.addEventListener('route-update', this.onRouteUpdate)
		app.header.addEventListener('tag-filter', this.onTagFilter)
	}

	disconnectedCallback() {
		document.body.removeEventListener('route-update', this.onRouteUpdate)
		app.header.removeEventListener('tag-filter', this.onTagFilter)
	}

	/**@param {CustomEvent} e*/
	onRouteUpdate(e) {
		this.route = e.detail.to
		switch (this.route.section) {
		case S.NEWS:
		case S.ACCUEIL:
			if (e.detail.to.filter !== e.detail.from.filter)
				this.onTagFilter(true)

			this.route.id ?
				this.displayNews(this.route) :
				this.closeNews()
		}
	}

	onTagFilter(forceUpdate) {
		if (this.route.filter && !forceUpdate)
			return

		const previews = this.shadowRoot.querySelectorAll('article.preview')
		for (let preview of previews)
			preview.remove()
		this.shadowRoot.firstElementChild.insertAdjacentHTML(
			'afterend',
			this.renderPreviews(this.news, this.route))
	}

	/**
	 * @param {NewsData[]} news
	 * @param {RouteValue} route
	 * @return {string} */
	renderPreviews(news, route) {
		const head = `#/${route.section}/${
			route.filter ? `${route.filter}/` : ''}${
			route.section===S.NEWS ? '' : '[actualite]'}`

		let filter = null
		if (route.filter) {
			const tagTarget =  app.cache.index.data.tags.find(tag => tag.name===route.filter)
			filter = (news) => news.tags.find(tag => tag===tagTarget)
		} else {
			const set = new Set(app.header.tagFilter)
			filter = (news) => {
				return news.tags.length === 0
				|| news.tags.filter(tag => !set.has(tag.id)).length > 0
			}
		}

		return news
			.filter(v => filter(v))
			.map((news, index) => /*html*/`
			<article class="preview" data-id="${news.id}" style="--delay:${40*index}ms">
				<a class="thumbnail" href="${head}${news.id}">
					<img src="./news/${news.id}/thumbnail.webp" loading="lazy"/>
				</a>
				<h3 class="preview-title">
					<a href="${head}${news.id}"> ${news.title} </a>
				</h3>
				<p class="preview-text"> ${news.preview} </p>
				<span class="preview-timestamp">${this.parsePublication(news.publication)}</span>
				<div class="preview-tags">
					${news.tags.map(tag =>/*html*/`<a class="tag" title="${tag.name}"
							style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}"
							href="#/${route.section}/${tag.name}"></a>`)
						.join('')}
				</div>
			</article>`)
			.join('')
	}

	/**
	 * @param {RouteValue} route
	 * @return {promise} */
	async displayNews(route) {
		if (this.displayedNews)
			await this.closeNews()

		const news = this.news.find(news => news.id === route.id)
		const article = await fetch(`./news/${route.id}/article.tpl`)
			.then(res => res.ok ? res.text() : '')
			.catch(err => 'Not Found')

		this.shadowRoot.lastElementChild.insertAdjacentHTML(
			'afterend', this.renderNews(news, route, article))
		this.displayedNews = this.shadowRoot.lastElementChild
		this.displayedNews.addEventListener('click', (e) => {
			if (/(ARTICLE|IMG)/.test(e.target.nodeName))
				window.location.hash = /#\/.*\//.exec(window.location.hash)[0]
		})
	}

	/**
	 * @param {NewsData} news
	 * @param {RouteValue} route */
	renderNews(news, route, article) {
		let link = `#/${route.section}/${route.section===S.NEWS?'':'[actualite]'}${news.id}`
		return /*html*/`
		<article class="full" data-id="${news.id}">
			<img class="picture" src="./news/${news.id}/banner.webp"/>
			<div class="card">
				<div class="tags">
					${news.tags.map(tag =>/*html*/`<a class="tag" title="${tag.name}"
							style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}"
							href="#/${route.section}/${tag.name}"></a>`).join('')}
				</div>
				<h3 class="title"> ${news.title} </h3>
				<p class="content"> ${article} </p>
				<span class="timestamp">${this.parsePublication(news.publication)}</span>
			</div>
		</article>`
	}

	/**
	 * @param {number} timestamp
	 * @return {string} human readable */
	parsePublication(timestamp) {
		return new Date(timestamp).toISOString().slice(0,10)
	}

	closeNews() {
		return new Promise(async (resolve, reject) => {
			if (!this.displayedNews)
				return resolve()
			this.displayedNews.addEventListener('transitionend', (e) => {
					if (e.target === this.displayedNews) {
						this.displayedNews.remove()
						this.displayedNews = null
						resolve()
					}
				})
			this.displayedNews.classList.add('close')
		})
	}

	close() {
		return new Promise((resolve, reject) => {
			this.addEventListener('animationend', resolve, {once:true})
			this.classList.add('close')
		})
	}
}

customElements.define('azt-news-section', AztNewsSection, {extends:'section'})
