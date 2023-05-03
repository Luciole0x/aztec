import { Buffer } from 'buffer'
import { IncomingMessage, ServerResponse } from 'http'
import querystring from 'querystring'
import fs, { promises as fsP } from 'fs'
import path from 'path'

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
	STRING: v => v.toString(),
	BUFFER: v => v,
}

export default class AdminRouter {
	constructor(dirname, port) {
		this.dirname = dirname
		this.port = port

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
	 * @param {ServerResponse} res
	 */
	async route (req, res) {
		if (req.method === 'GET')
			return this.getStaticFile(req, res)

		let path = req.url.split('/').slice(2)
		path.push(req.method)
		let target = this.tree

		for (let i=0; target && i<path.length;)
			target = target[path[i++]]

		return target ?
			target.call(this, req, res) :
			this.jsonResponse(res, 404, 'Not Found')
	}

	/**
	 * @param {IncomingMessage} req
	 * @param {ServerResponse} res
	 */
	getStaticFile(req, res) {
		const url = req.url.split(/[?#]/)[0].split('/').slice(1).join('/')
		let localPath = path.join(this.dirname, '../', url)

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

	/** @param {IncomingMessage} req */
	async parseBody(req, body) {
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
			payload.subarray(0, i),     //token
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

		for (i=0; i<boundaries.length; i+=4) {
			let key = payload.subarray(boundaries[i]+1, boundaries[i+1]).toString()
			let value = payload.subarray(boundaries[i+2]+1, boundaries[i+3]-targets[3].length-1)
			body[key] = body[key](value)
		}

		return body
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
		const body = await this.parseBody(req, { 
			id:     P.NUMBER,
			start:  P.STRING,
			end:    P.STRING,
			title:  P.STRING,
			banner: P.BUFFER })

		await fsP.writeFile(`${this.dirname}/test.webp`, body.banner, 'binary')
		this.jsonResponse(res, 200, '')
	}
	deleteEvent(req, res) {

	}

	postEsport() {}

	postNews() {}
	deleteNews() {}
}
