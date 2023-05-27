#!/usr/bin/env node

import path from 'path'
import http from 'http'
import { execSync, exec } from 'child_process'
import { promises as fsP } from 'fs'
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

		console.log('git pull...')
		execSync('git pull')

		console.log(`load data...`)
		await this.data.init()

		console.log(`createServer...`)
		http.createServer(this.router.route)
			.on('clientError', (err, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'))
			.listen(this.port)

		console.log(`App running`)
		if (this.openOnStart) {
			console.log(`Open app`)
			exec(`start http://localhost:${this.port}/app/`)
		}
	}

	execP(cmd) {
		return new Promise((resolve, reject) => {
			exec(cmd, (err, stdout, stderr) => {
				if (err)
					reject(stderr)
				else
					resolve(stdout)
			})
		})
	}

	message(msg, clear) {
		let publishPath = path.join(this.root, 'next-publish.txt')
		return fsP.writeFile(publishPath, `${msg}\n`, {encoding:'utf8', flag:clear?'w':'a'})
	}

	async commit() {
		let publishPath = path.join(this.root, 'next-publish.txt')

		try {
			await this.execP("git add --all")
			await this.execP(`git commit -F "${publishPath}"`)
				.catch(err => {throw `Aucune modification`})
			await this.execP("git push")
			return 'Commit effectué.'

		} catch (err) {
			if (err === 'Aucune modification')
				return err
			throw err
		}
	}

	async publish() {
		let publishPath = path.join(this.root, 'next-publish.txt')
		let publishQueue = await fsP.readFile(publishPath, {encoding:'utf8'})
		if (publishQueue.length < 10)
			return `Aucune modification à publier.`

		await this.message('Publish\n', true)
		await this.commit()
		await this.execP("git subtree push --prefix app origin gh-pages")
		
		return `Publish effectué.`

		// git push origin `git subtree push --prefix app origin`:gh-pages --force
		// git push origin `git subtree split --prefix app origin`:gh-pages --force
	}

	async pullForce() {
		await this.execP("git pull --force")
		return '"git pull --force" effectué'
	}
}

const server = new AdminServer(process.argv[2], process.argv[3])
server.init()
