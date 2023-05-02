import AztHeader from './azt-header.js'
import AztActualiteSection from './actualite/azt-actualite-section.js'
import AztEventSection from './event/azt-event-section.js'
import AztPresentation from './azt-presentation.js'
import AztTemplateSection from './azt-template-section.js'
import AztEsportSection from './esport/azt-esport-section.js'

const SECTION = {
	PRESENTATION: 'presentation',
	ACTUALITE: 'actualite',
	EVENT: 'event',
	ESPORT:'esport',
	RESEAUX:'reseaux',
}

const TAG = {
	DIABLO: {},
	DOFUS: {},
	CSGO: {},
}

class AztApp {
	constructor() {
		this.background = document.getElementById('background')
		this.header = document.getElementById('header')
		this.container = document.getElementById('container')
		this.scrollHolder = document.querySelector('.scroll-holder')
		this.footer = document.getElementById('footer')
		this.activeContent = null

		this.router = new Router(this)
		this.cache = new DataCache(this)

		Promise.all([
				this.cache.fetchIndex(SECTION.ACTUALITE),
				this.cache.fetchIndex(SECTION.EVENT),
				this.cache.fetchIndex(SECTION.ESPORT),
			])
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
			[SECTION.PRESENTATION]: [ AztPresentation, [AztEventSection,'runing'] ],
			[SECTION.ACTUALITE]: [ AztActualiteSection ],
			[SECTION.EVENT]: [ AztEventSection ],
			[SECTION.ESPORT]: [ AztEsportSection ],
			[SECTION.RESEAUX]: [ [AztTemplateSection,'./template/reseaux.tpl.js'] ],
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
			hash[0] = SECTION.PRESENTATION

		let oldParams = this.parameters
		this.parameters = {
			section:hash[0],
			filter: /^[A-Z]+$/.test(hash[1]) ? hash[1] : null,
			id: hash[2]||hash[1]||null }

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
		let sections = this.sectionsComposition[this.parameters.section]
		let content = document.createDocumentFragment()
		let promises = []

		for (let section of sections) {
			if (section instanceof Array) {
				let constructor = section[0]
				section = section.slice(1)
				promises.push(constructor.display(this.parameters, ...section))
			} else
				promises.push(section.display(this.parameters))
		}

		await Promise.all(promises).then(sections => {
			for (let section of sections)
				content.append(section)
		})

		return content
	}
}

class DataCache {
	/**@param {AztApp} app*/
	constructor(app) {
		this.app = app
		this.sections = new Map()
		for (let section of [SECTION.ACTUALITE, SECTION.ESPORT, SECTION.EVENT])
			this.sections.set(section, { list:[], index:new Map(), status:{} })

		this.sections.get(SECTION.ACTUALITE).hydrate = this.hydrateActualite
		this.sections.get(SECTION.EVENT).hydrate = this.hydrateEvent
	}

	/**
	 * @param {string} sectionType - See SECTION 
	 * @return {Promise} */
	async fetchIndex(sectionType) {
		let section = this.sections.get(sectionType)
		section.list = await fetch(`${sectionType}/data/index.json`).then(r => r.json())

		switch (sectionType) {
		case SECTION.ESPORT: 
			this.parseEsportIndex(section)
		break
		default:
			for (let element of section.list)
				section.index.set(element.id, element)
		}
	}

	async parseEsportIndex(section) {
		for (let coach of section.list.coaches) {
			for (let contact of coach.contacts)
				contact.type = section.list.contactTypes[contact.type]
			section.index.set(coach.id, coach)
		}
	}

	async fetchElement(sectionType, id) {
		let section = this.sections.get(sectionType)
		let element = section.index.get(id)

		if (element?.isHydrated === true)
			return element

		let data = await fetch(`${sectionType}/data/${id}/info.json`).then(r => r.json())
		if (!data)
			throw new Error(`Aucun "${sectionType}" ne comporte l'identifiant ${id}.`)

		if (!element) {
			element = {}
			section.index.set(id, element)
		}

		section.hydrate(element, data, id)
		return element
	}

	/**
	 * @param {Object} actualite - Existing Object
	 * @param {Object} data - Suplementary data
	 * @param {string} id
	 */
	hydrateActualite(actualite, data, id) {
		if (!actualite.preview) {
			actualite.id = id
			actualite.preview = `${data?.content.slice(0,120)}...`
		}
		actualite.content = data.content
		actualite.isHydrated = true
	}

	/**
	 * @param {Object} event - Existing Object
	 * @param {Object} data - Suplementary data
	 * @param {string} id
	 */
	hydrateEvent(event, data, id) {
		event.content = data.content
		event.isHydrated = true
	}
}

const app = new AztApp()
window.app = app
export { SECTION, TAG, app }
