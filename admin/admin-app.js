import InputTag from './input-tag.js'

const template = /*html*/`
<style>
	:host {
		padding: 0;
		margin: 0;
		width: 100%;
		min-height: 100vh;
		font-size: 16px;
		overflow: hidden scroll;
		background: #aaa;
		font-family: roboto, sansserif;
	}

	header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: block;
		height: 32px;
		width: 100%;
		background: white;
		border-bottom: solid 1px #444;
	}
		nav {
			display: flex;
			justify-content: center;
		}
			a {
				color: black;
				text-decoration: none;
				font-size: 24px;
				line-height: 32px;
				display: inline-block;
				padding: 0 8px;
				margin: 0 8px;
			}
			a.displayed,
			a.displayed:hover {
				color: black;
				background: #0002;
				box-shadow: inset 0 -2px;
			}
			a:hover {
				color: white;
				background: #0008;
			}

	#notifications {
		position: fixed;
		bottom: 0;
		right: 0;
	}

		.notification {
		}

</style>
<header>
	<nav>
		<a href="#/admin-tag"> Tag </a>
		<a href="#/admin-event"> Événement </a>
		<a href="#/admin-news"> Actualite </a>
		<a href="#/admin-team"> Équipes </a>
		<a href="#/admin-player"> Joueurs </a>
	</nav>
</header>
<section id="container">
	<slot></slot>
</section>
<div id="notifications"></div>`

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
 * @property {TagData[]} tags
 * @property {string} title
 *
 * @typedef {Object} NewsData
 * @property {number} id
 * @property {number} timestamp - ms
 * @property {TagData[]} tags
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
 * @property {TagData} tag
 * @property {PlayerData[]} players
 */

export default class AdminApp extends HTMLBodyElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
		this.notifications = this.shadowRoot.getElementById('notifications')

		this.displayedLink = null
		this.shadowRoot.innerHTML = template
		window.addEventListener('hashchange', e=>this.onHashChange())
		this.onHashChange()

		this.index = {
			data: { events:[], news:[], teams:[],
				tags: InputTag.TAGS,
				players:[] },
			tags: new Map(),
			players: new Map(),
		}
	}

	async onHashChange() {
		let contentName = document.location.hash.split('/').pop()

		this.displayedLink?.classList.remove('displayed')
		this.displayedLink = this.shadowRoot.querySelector(`[href="#/${contentName}"]`)
		this.displayedLink?.classList.add('displayed')

		if (!contentName) return

		let ContentElement = (await import(`./${contentName}.js`)).default
		if (!(this.firstElementChild instanceof ContentElement)) {
			this.firstElementChild?.remove()
			this.appendChild(new ContentElement())
		}
	}

	async getIndexData(force) {
		if (!force && this.index.data.tags.length)
			return this.index.data

		const updatedData = await fetch('/app/index.json').then(res => res.json())
		const { data, tags, players } = this.index

		for (let field of ['events', 'news', 'teams', 'tags', 'players'])
			data[field].splice(0, 9999, ...updatedData[field])

		tags.clear()
		for (let tag of data.tags)
			tags.set(tag.id, tag)
		players.clear()
		for (let player of data.players)
			players.set(player.id, player)


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
		}

		return this.index.data
	}

	notify(msg, type='') {

	}
}

customElements.define('admin-app', AdminApp, {extends:'body'})
