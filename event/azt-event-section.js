import { app, TAG, SECTION } from '../azt-app.js'

const fragment = (() => {
	let template = document.createElement('template')
	template.innerHTML = /*html*/`
		<style>
			:host {
				display: contents;
			}

			@keyframes display {
				from { opacity:0; }
				to { opacity:1; }
			}

			.section-title {
				font-size: 2em;
				font-weight: bold;
				margin: 64px 0 48px 0;
				display: grid;
				grid-template-columns: 1fr auto 1fr;
				align-items: center;
				animation: display 240ms;
			}
			.section-title:before,
			.section-title:after {
				content: '';
				border: solid 1px white;
				margin: 0 32px;
			}

			.events {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				gap: 64px;
				max-width: 1250px;
				margin: 0 auto;
				padding: 0 90px 128px 90px;
			}
			.events.padding-top { padding-top: 64px; }
			.events.padding-bottom { padding-bottom: 128px; }

			.preview {
				flex: 0 0 580px;
				position: relative;
				display: grid;
				background: white;
				text-decoration: none;
				aspect-ratio: 16/9;
				cursor: pointer;
				max-width: 100%;
				border-radius: 8px;
				background-image: var(--bg);
				background-size: 142.5%;
				grid-template: 1fr auto 1fr 54px / 1fr 200px 1fr;
				transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
				box-shadow: #00000029 0 3px 6px, #0000003B 0 3px 6px;
				animation: display 240ms;
			}
			.preview:hover {
				transform: scale(1.05);
				z-index: 1;
			}
			.video-background {
				grid-area:1/1/5/4;
				border-radius: 8px;
				transition: opacity 180ms ease-in;
				opacity: 0;
				height: 100%;
				width: 100%;
			}
			.video-background.display {
				transition: opacity 180ms cubic-bezier(0.22, 0.61, 0.36, 1);
				opacity: 1;
			}
			.title {
				grid-area:4/2/5/3;
				transition: transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1);
				width: 200px;
				height: 70px;
				object-fit: none;
				object-position: -480px -200px;
			}
			.preview:hover > .title {
				transform: translateY(-16px) scale(1.15);
			}

			.time {
				grid-area: 2/1/3/4;
				text-align: center;
				font-weight: bold;
				color: white;
				padding: 0 16px;
				font-size: 32px;
				filter: drop-shadow(1px 1px 2px black) drop-shadow(-1px -1px 1px black);
			}
			.time.runing {
				background-image: linear-gradient(40deg, rgb(234,179,67) 40%, rgb(255,240,220) 50%, rgb(234,179,67) 60%);
				background-size: 200%;
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				animation: swip 3s linear infinite;
			}
			.time.old {
				color: #aaa;
			}
			@keyframes swip {
				from { background-position: 160% 50%; }
				to { background-position: -60% 50%; }
			}


			.particle {
				position: absolute;
				height: 100px;
				width: 100px;
				transition: transform 280ms linear;
				pointer-events: none;
				transform-origin: center;
				transition-delay: 0ms;
			}
			.particle::after {
				content: '';
				opacity: 0;
				display: block;
				height: 100px;
				width: 100px;
				background: var(--bg);
				transform: scale(0.3);
				transition: transform 280ms cubic-bezier(0.5, 1.8, 0.95, 1),
					opacity 100ms ease-out;
				transition-delay: 0ms;
			}
			.preview:hover .particle::after {
				opacity: 1;
			}

			.pa::after,
			.pd::after {
				transition: transform 280ms cubic-bezier(0.5, 2.5, 0.9, 1),
					opacity 100ms ease-out;
			}


			.pa { bottom:-20px; left:80px; }
			.pa::after { background-position: -480px 0px; }
			.preview:hover .pa { 
				transform: translateX(-140px);
				transition-delay: 100ms;
			}
			.preview:hover .pa::after {
				transform: translateY(-100px) rotate(-10deg) scale(1);
				transition-delay: 100ms;
			}
			.pb { top:100px; right:50%; transform:rotate(15deg); }
			.pb::after { background-position: -480px -100px; }
			.preview:hover .pb {
				transform: translateX(-40px) rotate(-15deg);
				transition-delay: 40ms;
			}
			.preview:hover .pb::after {
				transform: translateY(-160px) rotate(-10deg) scale(1);
				transition-delay: 40ms;
			}
			.pc { top:100px; left:50%; transform:rotate(-15deg); }
			.pc::after { background-position: -580px 0px; }
			.preview:hover .pc {
				transform: translateX(40px) rotate(15deg);
				transition-delay: 80ms;
			}
			.preview:hover .pc::after {
				transform: translateY(-160px) rotate(10deg) scale(1);
				transition-delay: 80ms;
			}
			.pd { bottom:-20px; right:80px; }
			.pd::after { background-position: -580px -100px; }
			.preview:hover .pd { transform: translateX(140px); }
			.preview:hover .pd::after {
				transform: translateY(-100px) rotate(10deg) scale(1);
			}
		</style> `
	return template.content
})()

/**
 * @typedef {Object} eventData
 * @property {number} id
 * @property {number} start
 * @property {number} end
 * @property {string[]} tags - Les différents tags de l'evenement see "TAGS".
 * @property {string} title
 *
 * @typedef {Object} routeValue
 * @property {string} section - From SECTION
 * @property {string?} filter - From TAG
 * @property {string} id
 */

export default class AztEventSection extends HTMLElement {
	/**
	 * @param {routeValue} route
	 * @param {string} timeFilter */
	static async display(route, timeFilter) {
		let sectionNode = new AztEventSection()
		let evenements = await app.cache.sections.get(SECTION.EVENT).list
		let previews = sectionNode.generatePreviews(evenements, route, timeFilter)
		sectionNode.shadowRoot.lastElementChild.insertAdjacentHTML('afterend', previews)
		sectionNode.bindPreviewEvent()
		return sectionNode
	}

	constructor() {
		super()
		this.setAttribute('is', 'azt-event-section')
		this.attachShadow({mode:'open'})
		this.shadowRoot.append(fragment.cloneNode(true))
		this.onRouteUpdate = this.onRouteUpdate.bind(this)
		this.initVideo = this.initVideo.bind(this)
		this.onEnterVideo = this.onEnterVideo.bind(this)
		this.onLeaveVideo = this.onLeaveVideo.bind(this)
		/**@type {HTMLElement?}*/this.displayedEvent = null
	}

	connectedCallback() {
		document.body.addEventListener('route-update', this.onRouteUpdate)

	}

	disconnectedCallback() {
		document.body.removeEventListener('route-update', this.onRouteUpdate)
	}

	bindPreviewEvent() {
		let previews = this.shadowRoot.querySelectorAll('.preview')
		for (let preview of previews)
			preview.addEventListener('mouseenter', this.initVideo, {once:true})
	}
	initVideo(e) {
		let video = e.target.firstElementChild
		e.target.onmouseenter = this.onEnterVideo
		e.target.onmouseleave = this.onLeaveVideo
		video.setAttribute('src', video.dataset.src)
		this.onEnterVideo(e)
	}
	onEnterVideo(e) {
		let video = e.target.firstElementChild
		video.play()
		video.classList.add('display')
	}
	onLeaveVideo(e) {
		let video = e.target.firstElementChild
		video.pause()
		video.classList.remove('display')
	}

	/**@param {CustomEvent} e*/
	onRouteUpdate(e) {
		/**@type {routeValue}*/let route = e.detail.to
		switch (route.section) {
			case SECTION.ACTUALITE:
			case SECTION.ACCUEIL:
				if (route.id)
					this.displayEvent(route)
				else
					this.closeEvent()
			}
	}

	async displayEvent(route) {
		if (this.displayedEvent)
			await this.closeEvent()
		let event = await app.cache.fetchElement(SECTION.EVENT, route.id)
		this.shadowRoot.lastElementChild.insertAdjacentElement(
			'afterend', this.generateEvent(event, route))
		this.displayedEvent = this.shadowRoot.lastElementChild

		this.active.addEventListener('click', (e) => {
			if (e.target === this.active)
				window.location.hash = `#/${route.section}`
		})
	}

	generateEvent(event, route) {
		return /*html*/`
			<section class="event" data-background="/event/data/${event.id}/background.webp">
				<video class="video"></video>
				<img class="title" src="/event/data/${event.id}/title.webp"/>
				<div class="discord"> Se Joindre à l'évenement </div>
			</section>`
	}

	async closeEvent() {
		
	}

	/**
	 * @param {eventData[]} events
	 * @param {routeValue} route²
	 * @param {string} timeFilter
	 * @return {string}
	 */
	generatePreviews(events, route, timeFilter) {
		let now = Date.now()/60000
		let runing=[], coming=[], old=[]
		for (let event of events)
			(event.id  > now ? coming :
			 event.end < now ?    old : runing)
				.push(event)

		let html = []
		if (runing.length && (!timeFilter || timeFilter.includes('runing'))) {
			html.push(/*html*/`<section class="events padding-top">`)
			for (let event of runing)
				html.push(this.generatePreview(event, route))
			html.push(/*html*/`</section>`)
		}
		if (coming.length && (!timeFilter || timeFilter.includes('coming'))) {
			html.push(/*html*/`<h2 class="section-title"> Prochainement </h2><section class="events">`)
			for (let event of coming)
				html.push(this.generatePreview(event, route))
			html.push(/*html*/`</section>`)
		}
		if (old.length && (!timeFilter || timeFilter.includes('old'))) {
			html.push(/*html*/`<h2 class="section-title"> Événements passés </h2><section class="events padding-bottom">`)
			for (let event of old)
				html.push(this.generatePreview(event, route))
			html.push(/*html*/`</section>`)
		}
		return html.join('')
	}

	/**
	 * @param {eventData} event
	 * @param {routeValue} route
	 * @return {string}
	 */
	generatePreview(event, route) {
		return /*html*/`
			<a class="preview" href="#/${SECTION.EVENT}/${event.id}"
					style="--bg:url('./event/data/${event.id}/image.webp');">
				<video class="video-background" data-src="./event/data/${event.id}/video.webm" loop autoplay muted></video>
				<div class="particle pa"></div>
				<div class="particle pb"></div>
				<div class="particle pc"></div>
				<div class="particle pd"></div>
				<img class="title" src="./event/data/${event.id}/image.webp" width=""/>
				${this.parseTime(event.id, event.end)}
			</a> `
	}

	parseTime(start, end) {
		start = new Date(start*60000)
		end = new Date(end*60000)
		let now = new Date()
		let months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

		if (start < now && end > now)
			return `<div class="time runing"> Événement en cour ! </div>`
		else if (start > now) {
			let sameMonth = start.getMonth() === end.getMonth()
			return `<div class="time comming"> ${
				start.getDate()}&nbsp;${
				!sameMonth ? months[start.getMonth()]:''} - ${
				end.getDate()}&nbsp;${months[end.getMonth()]} </div>`
		} else
			return `<div class="time old"> ${months[start.getMonth()]}&nbsp;${start.getFullYear()} </div>`
	}
}

customElements.define('azt-event-section', AztEventSection, {extends:'section'})