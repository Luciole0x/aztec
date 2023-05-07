import AztHeader from './azt-header.js'
/**
 * @typedef {import('../admin/admin-app.js').DataBase} DataBase
 * @typedef {import('../admin/admin-app.js').TagData} TagData
 * @typedef {import('../admin/admin-app.js').EventData} EventData
 * @typedef {import('../admin/admin-app.js').NewsData} NewsData
 * @typedef {import('../admin/admin-app.js').TeamData} TeamData
 * @typedef {import('../admin/admin-app.js').PlayerData} PlayerData
 */

/**
 * @typedef {Object} RouteValue
 * @property {string} section - From SECTION
 * @property {string?} filter - From TAG
 * @property {string} id
 */

const S = {
	NEWS: 'actualite',
	PRESENTATION: 'presentation',
	ESPORT: 'esport',
	EVENT: 'evenement',
	NETWORK: 'reseaux',
}

class AztApp {
	constructor() {
		this.SECTION = S
		this.background = document.getElementById('background')
		/**@type {AztHeader}*/this.header = document.getElementById('header')
		this.container = document.getElementById('container')

		this.router = new Router(this)
		this.cache = new DataCache(this)
		this.styleManager = new StyleManager(this)
		document.body.appendChild(this.styleManager)

		this.cache.getIndexData(true)
			.then(() => {
				this.header.init(this)
				this.router.route()
			})
	}

	async setContent(fragment) {
		document.body.scrollTo({ top:0, behavior:'smooth' })

		const promises = []
		for (let element of this.container.children)
			promises.push(element.close ? element.close() : true)

		await Promise.all(promises)
		for (let element of [...this.container.children])
			element.remove()

		this.container.append(fragment)
	}
}

class Router {
	/**@param {AztApp} app */
	constructor(app) {
		this.app = app
		this.parameters = { section:null, filter:'', id:null }

		this.sectionsComposition = {
			[S.PRESENTATION]: [ ['./azt-presentation.js'], ['./event/azt-event-section.js','runing'] ],
			[S.NEWS]: [ ['./news/azt-news-section.js'] ],
			[S.EVENT]: [ ['./event/azt-event-section.js'] ],
			[S.ESPORT]: [ ['./esport/azt-esport-section.js'] ],
			[S.NETWORK]: [ ['./azt-template-section.js','./template/reseaux.tpl.js'] ],
		}

		window.addEventListener('hashchange', (e) => this.route(e))
	}

	/**
	 * @param {HashChangeEvent} e
	 * @return {Promise}
	 */
	async route(e) {
		let hash = location.hash.split('/').slice(1)
		if (!hash[0])
			hash[0] = this.app.SECTION.PRESENTATION

		let oldParams = this.parameters
		this.parameters = {
			section:hash[0],
			filter: /[\d]+$/.test(hash[1]) ? '' : hash[1],
			id: Number(hash[2]||hash[1]||'0') }

		if (oldParams.section !== this.parameters.section) {
			let newContent = await this.generateContent()
			await this.app.setContent(newContent)
		}

		document.body.dispatchEvent(new CustomEvent('route-update', {
			detail:{ from:oldParams, to:this.parameters },
		}))
	}

	/** @return {Promise<DocumentFragment>} */
	async generateContent() {
		const sections = this.sectionsComposition[this.parameters.section]
		const fragment = document.createDocumentFragment()
		const promises = []

		for (const section of sections)
			promises.push( this.generateSection(...section))
		fragment.append( ...await Promise.all(promises) )

		return fragment
	}

	async generateSection(section, ...composition) {
		const SectionClass = (await import(section)).default
		return SectionClass.display(this.app, this.parameters, ...composition)
	}
}

class DataCache {
	/**@param {AztApp} app*/
	constructor(app) {
		this.app = app
		this.index = {
			/**@type {DataBase}*/data: { events:[], news:[], teams:[], tags:[], players:[] },
			map: { tags:new Map(), players:new Map() },
		}

		this.fetchPromise = null
	}

	initFetchPromise() {
		let resolve = null
		let reject = null
		let promise = new Promise((resolve_, reject_) => {
			resolve = resolve_
			reject = reject_
		})
		promise.resolve = resolve
		promise.reject = reject
		promise.pending = true
		promise.finally(() => promise.pending = false)

		return promise
	}

	/**
	 * @param {boolean?} force
	 * @return {Promise<DataBase>} */
	async getIndexData(force=false) {
		if (!force && this.fetchPromise)
			return this.fetchPromise

		let newFetch = this.initFetchPromise()
		if (this.fetchPromise?.pending)
			this.fetchPromise.resolve(newFetch)
		this.fetchPromise = newFetch

		try {
			const updatedData = await fetch('./index.json').then(res => res.json())
			const { data, map: { tags, players } } = this.index

			for (let field of ['events', 'news', 'teams', 'tags', 'players'])
				data[field].splice(0, data[field].length, ...updatedData[field])
			data.players.sort((a,b) => a.name < b.name)

			tags.clear()
			for (let tag of data.tags)
				tags.set(tag.id, tag)

			players.clear()
			for (let player of data.players) {
				players.set(player.id, player)
				players.set(player.name, player)
			}

			for (let event of data.events)
				for (let i=0; i<event.tags.length; i++)
					event.tags[i] = tags.get(event.tags[i])

			for (let news of data.news)
				for (let i=0; i<news.tags.length; i++)
					news.tags[i] = tags.get(news.tags[i])

			for (let team of data.teams) {
				team.tag = tags.get(team.tag)
				for (let i=0; i<team.players.length; i++)
					team.players[i] = players.get(team.players[i])
				for (let i=0; i<team.coaches.length; i++)
					team.coaches[i] = players.get(team.coaches[i])
			}

			this.fetchPromise.resolve(this.index)
		} catch (err) {
			this.fetchPromise.reject(err)
		}
	}
}


const templateStyleManager = /*html*/`
<style>
	:host {
		position: fixed;
		bottom: 0;
		right: 0;
		width: 400px;
		height: 0;
		z-index: 1000;
		background: white;
		color: black;
		transition: height 350ms ease-out;
	}
	:host(.display) {
		height: 350px;
	}

	.toggle-button {
		background: white;
		margin: calc(-2px - 1.2em) -4px 0 0;
		border-top-left-radius: 20px;
		float: right;
		padding: 2px 8px;
		cursor: pointer;
	}

	.container {
		position: relative;
		height: 100%;
		width: 100%;
		padding: 4px;
		overflow: hidden scroll;
		box-sizing: border-box;
	}

	section {
		max-height: calc(1.2em - 4px);
		display: grid;
		grid-template-columns: 3fr 4fr;
		overflow: hidden;
		border-bottom: solid 1px #0008;
		padding-bottom: 4px;
	}
	section.display {
		max-height: 1200px;
	}

	h3 {
		grid-column: 1/3;
		margin: 0;
		font-size: 1em;
		cursor: pointer;
	}
	h3::after {
		content: '';
		margin-left: 4px;
		height: 4px;
		width: 4px;
		display: inline-block;
		border: solid #000;
		transform: rotate(45deg);
		border-width: 0 3px 3px 0;
	}
	section.display h3::after {
		border-width: 3px 0 0 3px;
	}

</style>
<div class="toggle-button" data-action="toggle"> Style Manager </div>
<div class="container">
	<section data-target="header" class="display">
		<h3 data-action="toggle-section">Header</h3>
		<span> Écart </span>
		<input type="range" min="0" max="64" value="16" step="1"
				data-rules="--header-top|{}px">
		<span> Marge / </span>
		<input type="range" min="0" max="120" value="12" step="1"
				data-rules="--header-margin|0 {}px 32px {}px||--max-width| 100vw">
		<span> / Largeur max</span>
		<input type="range" min="400" max="1100" value="900" step="100"
				data-rules="--max-width| {}px||--header-margin|0 auto 32px auto">
		<span> Hauteur </span>
		<input type="range" min="20" max="120" value="50" step="1"
				data-rules="--header-height|{}px">

		<span> Arrondi Coin </span>
		<input type="range" min="0" max="40" value="8" step="1"
				data-rules="--border-radius|{}px">
		<span> Opacity </span>
		<input type="range" min="0.0" max="1.0" value="0.8" step="0.01"
				data-rules="--header-opacity|{}">
		<span> Color </span>
		<input type="color" value="#144123"
				data-rules="--header-color|{}">
	
		<span> Font-Weight </span>
		<input type="range" min="100" max="900" value="400" step="100"
				data-rules="--font-weight|{}">
		<span> Font-Size </span>
		<input type="range" min="14" max="80" value="28" step="1"
				data-rules="--font-size|{}px">

	</section>
</div>`
class StyleManager extends HTMLElement {
	constructor(app) {
		super()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = templateStyleManager
		/**@type {AztApp}*/this.app = app
		this.shadowRoot.addEventListener('click', this.dispatchActions.bind(this))
		this.shadowRoot.addEventListener('input', (e) => this.updateCss(e.target))
	}

	dispatchActions(e) {
		let target = e.target.closest('[data-action]')
		switch (target?.dataset.action) {
		case 'toggle': return this.classList.toggle('display')
		case 'toggle-section': return target.parentElement.classList.toggle('display')
		}
	}

	/**@param {HTMLInputElement}node*/
	updateCss(node) {
		let target = node.closest('[data-target]').dataset.target
		/**@type {CSSRule}*/let cssRule = app[target].shadowRoot.querySelector('style').sheet.rules[0]

		let values = node.value.split('|')
		node.dataset.rules
			.split('||').map((rule, index) => {
				const [key, tpl] = rule.split('|')
				cssRule.styleMap.set(key, tpl.replace(/{}/g, values[index]?values[index]:values[0]))
			})
	}
}
customElements.define('style-manager', StyleManager)

window.app = new AztApp()
export default app
export { Router, DataCache, AztApp }
