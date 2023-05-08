import { Buffer } from 'buffer'
import { IncomingMessage, ServerResponse } from 'http'
import querystring from 'querystring'
import fs, { promises as fsP } from 'fs'
import path from 'path'
import AdminData from './admin-data.js'
import { exec } from 'child_process'

const DT = AdminData.TYPE

const EXT_TO_MIME = new Map([
	['default', 'application/octet-stream'              ],
	['.txt',    'text/plain'                            ],
	['.html',   'text/html; charset=utf-8'              ],
	['.js',     'application/javascript; charset=utf-8' ],
	['.json',   'application/json; charset=utf-8'       ],
	['.png',    'image/png'                             ],
	['.jpg',    'image/jpeg'                            ],
	['.webp',   'image/webp'                            ],
	['.weba',   'audio/webm'                            ],
	['.webm',   'video/webm'                            ],
	['.css',    'text/css'                              ],
	['.svg',    'image/svg+xml'                         ],
])

const P = {
	NUMBER: v => Number(v.toString()),
	NUMBER_ARRAY: v => v.toString().split(',').filter(v=>v).map(Number).filter(v=>!isNaN(v)),
	STRING: v => v.toString(),
	BUFFER: v => v,
}

export default class AdminRouter {
	/** @param {import('../admin-server.js').default} server */
	constructor(server) {
		this.server = server

		this.tree = {
			api: {
				event: {
					POST: this.postEvent,
					DELETE: this.deleteEvent },
				tag: {
					POST: this.postTag,
					DELETE: this.deleteTag },
				news: {
					POST: this.postNews,
					DELETE: this.deleteNews },
				esport: {
					team: {
						POST: this.postTeam,
						DELETE: this.deleteTeam },
					player: {
						POST: this.postPlayer,
						DELETE: this.deletePlayer }, },
				cmd: {
					'open-dir': { POST: this.openDir }, },
			},
		}

		this.route = this.route.bind(this)
	}

	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res */
	route (req, res) {
		if (req.method === 'GET')
			return this.getStaticFile(req, res)

		let path = req.url.split('/').slice(1)
		path.push(req.method)
		let target = this.tree

		for (let i=0; target && i<path.length;)
			target = target[path[i++]]

		if(target)
			target.call(this, req, res)
				.catch(err => {
					console.log(err)
					this.jsonResponse(res, 500, err.stack)
				})
		else
			this.jsonResponse(res, 404, 'Not Found')
	}

	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res */
	async getStaticFile(req, res) {
		const url = req.url.split(/[?#]/)[0].split('/').slice(1).join('/')
		let localPath = path.join(this.server.root, url)

		let extName = path.extname(localPath)
		if (extName === '') {
			try {
				const stat = await fsP.lstat( path.join(localPath, 'index.html') )
				if (stat.isFile)
					res.writeHead(302, { 'location': `${path.join(req.url, 'index.html')}` }).end()
				return
			} catch(err) {}
			return this.jsonResponse(res, 404, 'Not Found')
		}
		const mime = EXT_TO_MIME.get(extName) || EXT_TO_MIME.get('default')

		const fileStream = fs.createReadStream(localPath)
		fileStream
			.on('error', err => {
				const status = err.code==='ENOENT' ? 404 : 500
				res.writeHead(status, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({
					message: err.message,
					stack: err.stack,
					code: err.code,
				}))
			})
			.on('open', () => {
				mime && res.setHeader('Content-Type', mime)
				fileStream.pipe(res)
			})
	}

	/**
	 * @param {IncomingMessage} req
	 * @param {Object} bodyTemplate
	 * @return {Promise<Object>} */
	async parseFormBody(req, bodyTemplate) {
		const chunks = []
		/**@type {Buffer}*/let payload = 
			await new Promise((resolve, reject) => {
				req.on('data', (data) => chunks.push(data))
				req.on('end', () => resolve(Buffer.concat(chunks)))
				req.on('error', reject)
			})

		let i=0
		for (; i<payload.length; i++)
			if (payload[i] === 0x0d) // 0x0a=\n  0x0d=\r
				break

		const boundaries = []
		const targets = [
			Buffer.from('name="'),   //startName
			Buffer.from('"'),        //endName
			Buffer.from('\r\n\r\n'), //startData
			payload.subarray(0, i),  //token
		]
		let targetIndex = 0
		let target = targets[0]
		let matchLength = 0

		for (; i<payload.length; i++)
			if (payload[i] !== target[matchLength])
				matchLength = 0
			else if (++matchLength === target.length) {
				matchLength = 0
				target = targets[++targetIndex%targets.length]
				boundaries.push(i)
			}

		const body = {}
		for (i=0; i<boundaries.length; i+=4) {
			let key = payload.subarray(boundaries[i]+1, boundaries[i+1]).toString()
			let value = payload.subarray(boundaries[i+2]+1, boundaries[i+3]-targets[3].length-1)
			body[key] = bodyTemplate[key](value)
		}

		return body
	}

	/**
	 * @param {IncomingMessage} req
	 * @return {Promise<Object>} */
	async parseJsonBody(req) {
		const chunks = []
		/**@type {Buffer}*/let payload = 
			await new Promise((resolve, reject) => {
				req.on('data', (data) => chunks.push(data))
				req.on('end', () => resolve(Buffer.concat(chunks).toString()))
				req.on('error', reject)
			})
		return JSON.parse(payload)
	}

	/**
	 * @param {ServerResponse} res
	 * @param {number} statusCode
	 * @param {any} data
	 */
	jsonResponse(res, statusCode, data) {
		res.writeHead(statusCode, { 'Content-Type': 'application/json' })
		res.end( JSON.stringify(data) )
	}

	async postEvent(req, res) {
		const eventItem = await this.parseFormBody(req, {
			id:      P.NUMBER,
			start:   P.STRING,
			end:     P.STRING,
			tags:    P.NUMBER_ARRAY,
			title:   P.STRING,
			banner:  P.BUFFER,
			preview: P.BUFFER })
		await this.server.data.saveItem(DT.EVENT, eventItem)
		this.jsonResponse(res, 200, '')
	}
	async deleteEvent(req, res) {
		const id = await this.parseJsonBody(req)
		await this.server.data.deleteItem(DT.EVENT, id)
		this.jsonResponse(res, 200, '')
	}

	async postTag(req, res) {
		const tagItem = await this.parseFormBody(req, {
			id:         P.NUMBER,
			name:       P.STRING,
			offset:     P.NUMBER_ARRAY,
			background: P.BUFFER })
		await this.server.data.saveItem(DT.TAG, tagItem)
		this.jsonResponse(res, 200, '')
	}
	async deleteTag(req, res) {
		const id = await this.parseJsonBody(req)
		await this.server.data.deleteItem(DT.TAG, id)
		this.jsonResponse(res, 200, '')
	}

	async postNews(req, res) {
		const newsItem = await this.parseFormBody(req, {
			id:          P.NUMBER,
			publication: P.STRING,
			tags:        P.NUMBER_ARRAY,
			title:       P.STRING,
			article:     P.STRING,
			banner:      P.BUFFER,
			thumbnail:   P.BUFFER })
		newsItem.preview = newsItem.article.slice(0,250).replace(/<.*?>/g, '').slice(0,200)
		await this.server.data.saveItem(DT.NEWS, newsItem)
		this.jsonResponse(res, 200, '')
	}
	async deleteNews(req, res) {
		const id = await this.parseJsonBody(req)
		await this.server.data.deleteItem(DT.NEWS, id)
		this.jsonResponse(res, 200, '')
	}

	async postTeam(req, res) {
		const teamItem = await this.parseFormBody(req, {
			id:          P.NUMBER,
			tag:         P.NUMBER,
			name:        P.STRING,
			players:     P.NUMBER_ARRAY,
			coaches:     P.NUMBER_ARRAY })
		await this.server.data.saveItem(DT.TEAM, teamItem)
		this.jsonResponse(res, 200, '')
	}
	async deleteTeam(req, res) {
		const id = await this.parseJsonBody(req)
		await this.server.data.deleteItem(DT.TEAM, id)
		this.jsonResponse(res, 200, '')
	}

	async postPlayer(req, res) {
		const playerItem = await this.parseFormBody(req, {
			id: P.NUMBER,
			name: P.STRING,
			role: P.STRING,
			contact: P.STRING,
			picture: P.BUFFER })
		await this.server.data.saveItem(DT.PLAYER, playerItem)
		this.jsonResponse(res, 200, '')
	}
	async deletePlayer(req, res) {
		const id = await this.parseJsonBody(req)
		await this.server.data.deleteItem(DT.PLAYER, id)
		this.jsonResponse(res, 200, '')
	}

	//GOTO:cmd
	async openDir(req, res) {
		const dir = await this.parseJsonBody(req)
		exec(`start "" ${path.join(this.server.root, dir)}`)
		this.jsonResponse(res, 200, '')
	}

	async publish(req, res) {
		exec(`git subtree push --prefix app origin gh-pages`)
	}

	async fetchAndCommit(req, res) {
		
	}
}
