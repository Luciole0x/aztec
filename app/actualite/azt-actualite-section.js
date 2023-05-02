import { app, TAG, SECTION } from '../azt-app.js'

const fragment = (() => {
	let template = document.createElement('template')
	template.innerHTML = /*html*/`
		<style>
			:host {
				display: contents;
			}

			.tag {
				display: inline-block;
				height: 48px;
				width: 48px;
				cursor: pointer;
				margin-right: 4px;
				border-radius: 4px;
				background-color: #FFFA;
				background-image: url('media/icon/game.webp');
				background-size: 400%;
			}
			.tag:hover {
				filter: brightness(120%);
				background-color: white;
			}
			.tag-DIABLO { background-position: 0 0; }
			.tag-DOFUS { background-position: -48px 0; }
			.tag-CSGO { background-position: -96px 0; }


			article.preview {
				color: black;
				position: relative;
				margin: 16px auto;
				width: 900px;
				height: 220px;
				max-width: 100%;
				border-radius: 4px;

				display: grid;
				grid-template: 2em 1fr 1em / 1fr 2fr;
				box-shadow: #00000029 0 3px 6px, #0000003B 0 3px 6px;
			}

			.preview-tags {
				grid-area: 1/1/1/1;
				width: fit-content;
				height: fit-content;
				z-index: 1;
				padding: 0;
				margin: -8px 0 0 -8px;
			}

			.thumbnail {
				grid-area: 1/1/4/2;
				display: block;
				background-position: center;
				background-color: #DDD;
				background-image: url(media/logo.svg);
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
				background-color: white;
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
				background-color: white;
			}

			.preview-timestamp {
				grid-area: 3/2/4/4;
				color: #000A;
				font-size: 0.7em;
				padding-left: 8px;
				background: white;
				border-radius: 0 0 4px 0;
			}



			.full {
				color: black;
				position: fixed;
				z-index: 2;

				margin: 0;
				width: 100%;
				height: 100%;
				overflow: hidden auto;
				top: 0;
				left: 0;
				background: #000A;
				display: grid;
				grid-template: 240px 80px auto 64px
					/ minmax(0,1fr) 640px minmax(0,1fr);
			}

			.picture {
				top: 0;
				height: 340px;
				border-radius: 0 0 16px 16px;
				width: 1300px;
				justify-self: center;
				position: sticky;
				top: 0;
				z-index: -1;
				object-fit: none;
				grid-area: 1/1/3/4;
				background: #888;
			}

			.card {
				position: relative;
				box-shadow: #00000029 0 3px 6px, #0000003B 0 3px 6px;
				border-radius: 8px;
				background: white;
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

				.tags {
					position: sticky;
					height: fit-content;
					margin: 0 0 0 -72px;
					width: 48px;
					padding: 8px;
					top: 76px;
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
		</style>
	`
	return template.content
})()

/**
 * @typedef {Object} actuData
 * @property {string} id
 * @property {number} timestamp
 * @property {string[]} tags - Les différents tags de l'article see "TAGS".
 * @property {string} title
 * @property {string} preview - Une version raccourci du contenu text de l'article.
 * @property {string?} content
 *
 * @typedef {Object} routeValue
 * @property {string} section - From SECTION
 * @property {string?} filter - From TAG
 * @property {string} id
 */

export default class AztActualiteSection extends HTMLElement {
	/**@param {routeParams} route - From SECTION */
	static async display(route) {
		let node = new AztActualiteSection()
		let actualites = app.cache.sections.get(SECTION.ACTUALITE).list
		if (route.filter)
			actualites = actualites.filter(actu => actu.tags.includes(route.filter))

		let content = node.generatePreviews(actualites, route)
		node.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', content)
		return node
	}

	/**
	 * @param {actuData[]} actualites
	 * @param {routeValue} route
	 * @return {string}
	 */
	generatePreviews(actualites, route) {
		let head = `#/${route.section}/${
			route.filter ? `${route.filter}/` : ''}${
			route.section===SECTION.ACTUALITE ? '' : '[actualite]'}`

		let html = []
		for (let actu of actualites)
			html.push(/*html*/`
				<article class="preview" data-id="${actu.id}">
				<a class="thumbnail" href="${head}${actu.id}">
					<img src="actualite/data/${actu.id}/thumbnail.webp" loading="lazy"/>
				</a>
				<h3 class="preview-title"> <a href="${head}${actu.id}"> ${actu.title} </a> </h3>
				<p class="preview-text"> ${actu.preview} </p>
				<span class="preview-timestamp">${this.parseTimestamp(actu.timestamp)}</span>
				<div class="preview-tags">
					${actu.tags.map(tag =>/*html*/`<a class="tag tag-${tag}" href="#/${route.section}/${tag}"></a>`).join('')}
				</div>
				</article> `)
		return html.join('')
	}

	constructor() {
		super()
		this.setAttribute('is', 'azt-actualite-section')
		this.attachShadow({mode:'open'})
		this.shadowRoot.append(fragment.cloneNode(true))
		this.onRouteUpdate = this.onRouteUpdate.bind(this)
		this.onScroll = this.onScroll.bind(this)

		/**@type {HTMLElement?}*/this.active = null
		this.isFetchingPreviews = false
	}

	connectedCallback() {
		document.body.addEventListener('route-update', this.onRouteUpdate)
		if (app.router.parameters.section === SECTION.ACTUALITE)
			document.body.addEventListener('wheel', this.onScroll, {passive:true})
	}

	disconnectedCallback() {
		document.body.removeEventListener('route-update', this.onRouteUpdate)
		document.body.addEventListener('wheel', this.onScroll, {passive:true})
	}

	/**@param {CustomEvent} e*/
	onRouteUpdate(e) {
		/**@type {routeValue}*/let route = e.detail.to
		switch (route.section) {
		case SECTION.ACTUALITE:
		case SECTION.ACCUEIL:
			if (route.id)
				this.displayActualite(route)
			else
				this.closeActualite()
		}
	}

	async onScroll(e) {
		if (this.isFetchingPreviews || this.active
		|| (app.container.scrollTop+app.container.offsetHeight) < app.container.scrollHeight)
			return
		this.isFetchingPreviews = true

		//let actualites = app.cache.sections.get(SECTION.ACTUALITE).list
		//let content = this.generatePreviews(actualites, app.router.parameters)
		//this.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', content)

		this.isFetchingPreviews = false
	}

	/**
	 * @param {routeValue} route
	 * @return {promise} */
	async displayActualite(route) {
		if (this.active)
			await this.closeActualite()
		let actu = await app.cache.fetchElement(SECTION.ACTUALITE, route.id)
		this.shadowRoot.lastElementChild.insertAdjacentHTML(
			'afterend', this.generateActualite(actu, route))
		this.active = this.shadowRoot.lastElementChild
		this.active.addEventListener('click', (e) => {
			console.log('click:', e.target.nodeName)
			if (/(ARTICLE|IMG)/.test(e.target.nodeName))
				window.location.hash = /#\/.*\//.exec(window.location.hash)[0]
		})

		this.shadowRoot.appendChild(this.active)
	}

	/**
	 * @param {actuData} actu
	 * @param {routeValue} route */
	generateActualite(actu, route) {
		let link = `#/${route.section}/${route.section!==SECTION.ACTUALITE?'[actualite]':''}${actu.id}`
		return /*html*/`
			<article class="full" data-id="${actu.id}">
				<img class="picture" src="actualite/data/${actu.id}/header.webp"/>
				<div class="card">
					<div class="tags">
						${actu.tags.map(tag =>/*html*/`<a class="tag tag-${tag}" href="#/${route.section}/${tag}"></a>`).join('')}
					</div>
					<h3 class="title"> ${actu.title} </h3>
					<p class="content"> ${actu.content} </p>
					<span class="timestamp">${this.parseTimestamp(actu.timestamp)}</span>
				</div>
			</article>`
	}

	/**
	 * @param {number} timestamp
	 * @return {string} human formated timestamp
	 */
	parseTimestamp(timestamp) {
		return new Date(timestamp).toISOString().slice(0,10)
	}

	/**@return {Promise}*/
	closeActualite() {
		return new Promise(async (resolve, reject) => {
			if (!this.active)
				return resolve()

			this.active.addEventListener('transitionend', (e) => {
					if (e.target === this.active) {
						this.active.remove()
						this.active = null
						resolve()
					}
				})
			this.active.classList.add('close')
		})
	}

	close() {
	}
}

customElements.define('azt-actualite-section', AztActualiteSection, {extends:'section'})
