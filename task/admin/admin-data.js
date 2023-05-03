import { promises as fsP } from 'fs'
import path from 'path'

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
		saveItem: async function(ad, item) {
			const eventPath = path.join(ad.server.root, this.path, `${item.id}`)
			await fsP.mkdir(eventPath, {recursive:true})

			const promises = []
			if (item.banner.length)
				promises.push(fsP.writeFile(path.join(eventPath, 'banner.webp'), item.banner))
			if (item.preview.length)
				promises.push(fsP.writeFile(path.join(eventPath, 'preview.webm'), item.preview))
			return Promise.all(promises)
		},
		deleteItem: function(ad, id) {
			let eventPath = path.join(ad.server.root, this.path, `${id}`)
			return fsP.rm(eventPath, {recursive:true, force:true})
		},
	},
	NEWS: { path:'app/news/data', indexField:'news' },
	ESPORT: { path:'app/esport/data', indexField:'teams' },
	TAG: { path:'app/esport/data', indexField:'tags' },
}

export default class AdminData {
	static get TYPE() { return TYPE }

	/** @param {import('../admin-server.js').default} server */
	constructor(server) {
		this.server = server
		this.indexPath = path.join(this.server.root, 'app/index.json')
		this.rawIndex = {}
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
}
