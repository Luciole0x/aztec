#!/usr/bin/env node

import path from 'path'
import http from 'http'
import childProcess from 'child_process'
import AdminRouter from './admin/admin-router.js'
import AdminData from './admin/admin-data.js'

export default class AdminServer {
	constructor(port=8080, preventOpen) {
		this.port = port
		this.openOnStart = !preventOpen
		this.root = this.getDirectoryName()
		this.router = new AdminRouter(this)
		this.data = new AdminData(this)
	}

	getDirectoryName() {
		const pathname = new URL(import.meta.url).pathname
		let serverPath = path.dirname(pathname).replace(/^\/[A-Za-z]:/, '')
		return path.join(serverPath, '../')
	}

	async init() {
		console.log(`node ${process.version}, écoute sur le port ${this.port}.`)
		console.log(`load data...`)
		await this.data.init()

		console.log(`createServer...`)
		http.createServer(this.router.route)
			.on('clientError', (err, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'))
			.listen(this.port)

		if (this.openOnStart) {
			console.log(`Open app`)
			childProcess.exec(`start http://localhost:${this.port}/admin/`)
		}
	}
}

const server = new AdminServer(process.argv[2], process.argv[3])
server.init()

