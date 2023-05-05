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
		this.header = document.getElementById('header')
		this.container = document.getElementById('container')
		this.activeContent = null

		this.router = new Router(this)
		this.cache = new DataCache(this)

		this.cache.getIndexData(true)
			.then(() => this.router.route())
	}

	async setContent(element) {
		let previousElement = this.activeContent
		if (previousElement)
			previousElement.close ? (await previousElement.close()) : this.container.innerHTML = ''
		this.container.scrollTop = 0
		this.container.appendChild(element)
		this.activeContent = element
	}
}

class Router {
	/**@param {AztApp} app */
	constructor(app) {
		this.app = app
		this.parameters = { section:null, filter:null, id:null }

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
			hash[0] = AztApp.SECTION.PRESENTATION

		let oldParams = this.parameters
		this.parameters = {
			section:hash[0],
			filter: /^[A-Z]+$/.test(hash[1]) ? hash[1] : null,
			id: Number(hash[2]||hash[1]||0) }

		if (oldParams.section !== this.parameters.section
		|| oldParams.filter !== this.parameters.filter) {
			let newContent = await this.generateContent()
			await this.app.setContent(newContent)
		}

		document.body.dispatchEvent(new CustomEvent('route-update', {
			detail:{ from:oldParams, to:this.parameters },
		}))
	}

	/** @return {Promise<DocumentFragment>} */
	async generateContent() {
		console.log(this.sectionsComposition,this.parameters.section)
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
	}

	/**
	 * @param {boolean?} force
	 * @return {Promise} */
	async getIndexData(force=false) {
		if (!force)
			return this.index.data

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
	}
}

window.app = new AztApp()
export default app
export { Router, DataCache, AztApp }
