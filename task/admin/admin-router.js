import { Buffer } from 'buffer'
import { IncomingMessage, ServerResponse } from 'http'
import querystring from 'querystring'
import fs, { promises as fsP } from 'fs'
import path from 'path'
import AdminData from './admin-data.js'

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
	NUMBER_ARRAY: v => v.toString().split(',').map(Number),
	STRING: v => v.toString(),
	BUFFER: v => v,
}

export default class AdminRouter {
	/** @param {import('../admin-server.js').default} server */
	constructor(server) {
		this.server = server

		this.tree = {
			event: {
				POST: this.postEvent,
				DELETE: this.deleteEvent,
			},
			esport: {
				POST: this.postEsport,
			}
		}

		this.route = this.route.bind(this)
	}

	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res */
	route (req, res) {
		if (req.method === 'GET')
			return this.getStaticFile(req, res)

		let path = req.url.split('/').slice(2)
		path.push(req.method)
		let target = this.tree

		for (let i=0; target && i<path.length;)
			target = target[path[i++]]

	//	if(target)
	//		target.call(this, req, res)
	//			.catch(err => {
	//				console.log(err)
	//				this.jsonResponse(res, 500, err.stack)
	//			})
	//	else
			this.jsonResponse(res, 404, 'Not Found')
	}

	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res */
	getStaticFile(req, res) {
		const url = req.url.split(/[?#]/)[0].split('/').slice(1).join('/')
		let localPath = path.join(this.server.root, url)

		let extName = path.extname(localPath)
		if (extName === '') {
			extName = '.html'
			localPath = path.join(localPath, 'index.html')
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

	postEsport() {}

	postNews() {}
	deleteNews() {}
}
