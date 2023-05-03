#!/usr/bin/env node

import path from 'path'
import http from 'http'
import childProcess from 'child_process'
import AdminRouter from './admin-router.js'

const dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/[A-Za-z]:/, '')
const port = process.argv[2] || 8080
const router = new AdminRouter(dirname, port)

http.createServer(router.route)
	.on('clientError', (err, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'))
	.listen(port)

console.log(`node ${process.version}, écoute sur le port ${port}.`)
//childProcess.exec(`start http://localhost:${port}/admin/`)
