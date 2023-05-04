import { promises as fsP } from 'fs'
import path from 'path'

/**
 * @typedef {Object} DataBase
 * @property {EventData[]} events
 * @property {NewsData[]} news
 * @property {TagData[]} tags
 * @property {TeamData[]} teams
 * @property {Players[]} players
 *
 * @typedef {Object} EventData
 * @property {number} id
 * @property {string} start - YYYY-MM-DDThh:mm
 * @property {string} end - YYYY-MM-DDThh:mm
 * @property {number[]} tags
 * @property {string} title
 *
 * @typedef {Object} NewsData
 * @property {number} id
 * @property {number} publication - YYYY-MM-DDThh:mm
 * @property {number[]} tags
 * @property {string} title
 * @property {string} preview
 *
 * @typedef {Object} TagData
 * @property {number} id
 * @property {string} name
 * @property {number} offX
 * @property {number} offY
 *
 * @typedef {Object} TeamData
 * @property {number} id
 * @property {string?} name
 * @property {number} tag
 * @property {number[]} players
 */

/**
 * @typedef {Object} IndexType
 * @property {string} path
 * @property {string} indexField
 * @property {Set<string>} itemFields
 * @property {function} saveItem
 * @property {function} deleteItem
 */

const TYPE = {
	EVENT: {
		path:'app/event/data',
		indexField:'events',
		itemFields: new Set(['id', 'start', 'end', 'tags', 'title']),
		/**@param {ad} */
		saveItem: async function(ad, event) {
			const eventPath = path.join(ad.server.root, this.path, `${event.id}`)
			await fsP.mkdir(eventPath, {recursive:true})
			return ad.saveFiles(eventPath, [
					['banner.webp', event.banner],
					['preview.webp', event.preview],
				])
		},
		deleteItem: function(ad, id) {
			let eventPath = path.join(ad.server.root, this.path, `${id}`)
			return fsP.rm(eventPath, {recursive:true, force:true})
		},
	},
	TAG: {
		path:'app/tag',
		indexField:'tags',
		itemFields: new Set(['id', 'name', 'offset']),
		saveItem: async function(ad, tag) {
			const tagPath = path.join(ad.server.root, this.path, `${tag.id}`)
			await fsP.mkdir(tagPath, {recursive:true})
			return ad.saveFiles(tagPath, [
					['background.svg', tag.background],
				])
		},
		/**@param {AdminData} ad */
		deleteItem: function(ad, id) {
			let eventPath = path.join(ad.server.root, this.path, `${id}`)

			for (let event of ad.rawIndex.events)
				event.tags = event.tags.filter(tag => tag !== id)
			for (let news of ad.rawIndex.news)
				news.tags = news.tags.filter(tag => tag !== id)
			for (let team of ad.rawIndex.teams)
				if (team.tag === id)
					team.tag = null

			return fsP.rm(eventPath, {recursive:true, force:true})
		},
	},
	NEWS: {
		path:'app/news/data',
		indexField:'news',
		itemFields: new Set(['id', 'publication', 'tags', 'title']),
		saveItem: async function(ad, news) {
			const newsPath = path.join(ad.server.root, this.path, `${news.id}`)
			await fsP.mkdir(newsPath, {recursive:true})
			return ad.saveFiles(newsPath, [
					['banner.webp', news.banner],
					['thumbnail.webp', news.thumbnail],
				])
		},
		deleteItem: async function(ad, id) {
			let newsPath = path.join(ad.server.root, this.path, `${id}`)
			return fsP.rm(newsPath, {recursive:true, force:true})
		}
	},
	ESPORT: { path:'app/esport/data', indexField:'teams' },
}

export default class AdminData {
	static get TYPE() { return TYPE }

	/** @param {import('../admin-server.js').default} server */
	constructor(server) {
		this.server = server
		this.indexPath = path.join(this.server.root, 'app/index.json')
		/**@type {DataBase}*/this.rawIndex = {}
	}

	async init() {
		let index = await fsP.readFile(this.indexPath, {encoding:'utf8'})
		this.rawIndex = JSON.parse(index)
	}

	/**
	 * @param {IndexType} type
	 * @param {number|string} id
	 * @return {Promise<Object>} */
	getItem(type, id) {
		return this.rawIndex[type.indexField].find(item => item.id===id)
	}

	/**
	 * @param {IndexType} type
	 * @param {Object} item */
	async saveItem(type, item) {
		const index = this.rawIndex[type.indexField]
		if (!item.id) {
			item.id = index[0].id+1
			const indexedItem = Object.fromEntries(
				Object.entries(item)
					.filter(([key]) => type.itemFields.has(key)))
			index.splice(0, 0, indexedItem)
		} else {
			const indexedItem = index.find(i => i.id === item.id)
			Object.entries(item)
				.forEach(([key,val]) => type.itemFields.has(key) && (indexedItem[key]=val))
		}

		await type.saveItem(this, item)
		return this.saveRawData()
	}

	/**
	 * @param {IndexType} type
	 * @param {number|string} id */
	async deleteItem(type, id) {
		let index = this.rawIndex[type.indexField]
		let itemIndex = index.findIndex(i => i.id===id)
		if (itemIndex!==-1)
			index.splice(itemIndex, 1)
		await type.deleteItem(this, id)
		return this.saveRawData()
	}

	saveRawData() {
		const rawJson = JSON.stringify(this.rawIndex, null, '\t')
			.replace(/\n\t{2,}(\t|})/g, (_,g1) => g1==='\t'?'':'}')
			.replace(/([^\\])": /g, '$1":')
		return fsP.writeFile(this.indexPath, rawJson, {encoding:'utf8'})
	}

	/**
	 * @param {string} directory
	 * @param {[string,Buffer][]} files
	 * @return {Promise} */
	saveFiles(directory, files) {
		let promises = []
		for (let [ name, buffer ] of files)
			if (buffer.length)
				promises.push(fsP.writeFile(path.join(directory, name), buffer))

		return Promise.all(promises)
	}
}
