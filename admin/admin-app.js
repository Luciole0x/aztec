import InputTag from './input-tag.js'
import InputPlayer from './input-player.js'

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
		width: 100%;
		background: white;
		border-bottom: solid 1px #444;
	}
		nav {
			display: flex;
			flex-wrap: wrap;
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
		bottom: 24px;
		right: 32px;
		z-index: 20;
	}

		.notification {
			position: relative;
			animation: display-notif ease-out 250ms;
			background: white;
			padding: 8px;
			min-width: 250px;
			max-height: 150px;
			border-radius: 4px;
			border: solid 1px #0008;
			margin-bottom: 8px;
			overflow: hidden;
		}
		.notification::after {
			content:'';
			position: absolute;
			width: 100%;
			height: 4px;
			bottom: 0;
			left: 0;
			background: #0008;
			transform-origin: left;
			transform: scaleX(0);
			animation: notif-timer 5s linear;
		}
		.notification:hover::after {
			animation: none;
		}
		@keyframes display-notif {
			from { opacity:0; max-height:0px; margin-bottom:-10px; }
			50% { opacity:1; }
			to { opacity:1; max-height:150px; margin-bottom:8px; }
		}
		@keyframes notif-timer {
			from { transform: scaleX(0); }
			to { transform: scaleX(1); }
		}

		.notification.notif-hide {
			transform: translateX(calc(100% + 32px));
			margin-bottom: -18px;
			max-height: 0;
			animation: notif-hide 400ms cubic-bezier(0.4, 0, 0.2, 1);
		}
		@keyframes notif-hide {
			from { transform: translateX(0); max-height:150px; margin-bottom:8px; }
			35% { transform: translateX(calc(100% + 32px)); margin-bottom:8px; max-height:150px; }
			to { transform: translateX(calc(100% + 32px)); margin-bottom:-18px; max-height:0; }
		}

		.notif-error {
			background: #FDD;

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
 * @typedef {Object} TagData
 * @property {number} id
 * @property {string} name
 * @property {number[]} offset
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
 * @property {string} publication - YYYY-MM-DDThh:mm
 * @property {TagData[]} tags
 * @property {string} title
 * @property {string} preview
 *
 *
 * @typedef {Object} TeamData
 * @property {number} id
 * @property {string} name
 * @property {TagData} tag
 * @property {PlayerData[]} players
 * @property {PlayerData[]} coaches
 *
 * @typedef {Object} PlayerData
 * @property {number} id
 * @property {string} name
 * @property {string} role
 * @property {string} contact
 */

export default class AdminApp extends HTMLBodyElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template

		this.displayedLink = null
		this.notifications = this.shadowRoot.getElementById('notifications')
		window.addEventListener('hashchange', this.onHashChange.bind(this))
		this.shadowRoot.addEventListener('animationend', this.onAnimationEnd.bind(this))

		this.index = {
			data: { events:[], news:[], teams:[],
				tags: InputTag.TAGS,
				players: InputPlayer.PLAYERS,
				coaches: [] },
			tags: new Map(),
			players: InputPlayer.PLAYERS_MAP,
		}

		this.getIndexData(true)
			.then(() => this.onHashChange())
	}

	async onHashChange() {
		let contentName = document.location.hash.split('/').pop()

		this.displayedLink?.classList.remove('displayed')
		this.displayedLink = this.shadowRoot.querySelector(`[href="#/${contentName}"]`)
		this.displayedLink?.classList.add('displayed')

		if (!contentName) return

		try {
			let ContentElement = (await import(`./${contentName}.js`)).default
			if (!(this.firstElementChild instanceof ContentElement)) {
				this.firstElementChild?.remove()
				this.appendChild(new ContentElement())
			}
		} catch (err) {
			this.notify(err.message, 'error')
			this.firstElementChild?.remove()
		}
	}

	async getIndexData(force) {
		if (!force)
			return this.index.data

		const updatedData = await fetch('/app/index.json').then(res => res.json())
		const { data, tags, players } = this.index

		for (let field of ['events', 'news', 'teams', 'tags', 'players'])
			data[field].splice(0, data[field].length, ...updatedData[field])
		data.players.sort((a,b) => a.name < b.name)

		tags.clear()
		for (let tag of data.tags)
			tags.set(tag.id, tag)

		players.clear()
		for (let player of data.players) {
			players.set(player.id, player)
			players.set(player.name, player)
		}


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
			for (let i=0; i<team.coaches.length; i++)
				team.coaches[i] = players.get(team.coaches[i])
		}

		return this.index.data
	}

	notify(msg, type='default') {
		msg = msg.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;')
		this.notifications.insertAdjacentHTML('beforeend', /*html*/`
			<div class="notification notif-${type}"> ${msg} </div>`)
	}

	/**@param {AnimationEvent} e */
	onAnimationEnd(e) {
		switch (e.animationName) {
		case 'notif-timer': e.target.classList.add('notif-hide'); break
		case 'notif-hide': e.target.remove()
		}
	}
}

customElements.define('admin-app', AdminApp, {extends:'body'})
