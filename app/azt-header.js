/**
 * @typedef {import('./azt-app.js').TagData} TagData
 * @typedef {import('./azt-app.js').AztApp} AztApp
 * @typedef {import('./azt-app.js').RouteValue} RouteValue
 */

import app from './azt-app.js'

const template = /*html*/`
<style>
	:host {
		--header-top: 16px;
		--header-height: 50px;
		--header-margin: 0 auto 32px auto;
		--header-opacity: 0.8;
		--header-color: #6D2C18; /*#144123 #5A4D12*/
		--border-radius: 8px;
		--font-size: 28px;
		--max-width: 900px;
	}

	:host {
		position: sticky;
		z-index: 10;
		top: var(--header-top);
		margin: var(--header-margin);
		display: grid;
		max-width: var(--max-width);
		grid-template: var(--header-height) / 120px 1fr;
		backdrop-filter: blur(5px);
	}

	.cover {
		position: absolute;
		z-index: -1;
		inset: 0;
		background-color: var(--header-color);
		border-radius: var(--border-radius);
		opacity: var(--header-opacity);
	}

	.logo {
		cursor: pointer;
		justify-content: center;
		display: grid;
		border-radius: 8px 0 0 8px;
	}
	.logo:hover {
		background-color: #FFF4;
	}
		.logo-display {
			height: 110px;
			width: 110px;
			margin-top: -16px;
			background-size: 100% 100%;
			background-image: url(logo.svg)
		}
		.logo-display.logo-tag {
			margin-top: -4px;
			height: 64px;
			width: 64px;
			background-image: url('./tag/tag.webp');
			background-size: var(--tag-bg-size);
			background-position: calc(var(--offX) * var(--tag-tile-coef)) calc(var(--offY) * var(--tag-tile-coef));
		}

	nav {
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		column-gap: 16px;
	}

		section {
			position: relative;
			height: 100%;
		}
		section:hover {
			padding-bottom: 16px;
		}

			h2 {
				margin: 0;
				padding: 0 8px;
				font-size: var(--font-size);
				display: inline-block;
				white-space: nowrap;
				vertical-align: middle;
				line-height: var(--header-height);
				font-weight: var(--font-weight);
			}
			section:hover h2 {
				background-color: #FFF2;
			}
			section:has(ul) h2::after {
				content: '';
				display: inline-block;
				margin-left: 4px;
				height: 6px;
				width: 6px;
				border: solid;
				border-width: 0 3px 3px 0;
				border-radius: 0 4px 0 4px;
				transform: translateY(-4px) rotate(45deg);
				opacity: 0.4;
			}

			ul {
				margin: 0 0 0 50%;
				padding: 8px 0;
				border-radius: 4px;
				position: absolute;
				width: 250px;
				display: block;
				visibility: hidden;
				background-color: var(--header-color);
				box-shadow: #0003 0 3px 6px, #0004 0 3px 6px;

				transition: visibility 0ms,
					opacity 120ms ease-out,
					transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1);
				transform-origin: top;
				transform: translate(-50%, 4px) scale(1,0.92);
				opacity: 0;
			}

			section:hover ul {
				visibility: visible;
				transform: translate(-50%, 8px) scale(1,1);
				opacity: 1;
			}

				li {
					font-weight: bold;
					display: block;
					line-height: 2em;
				}
				li a {
					display: grid;
					grid-template: 1fr / auto 1fr;
					align-items: center;
					padding: 0 0 0 8px;
					margin: 4px;
					border-radius: 4px;
					grid-gap: 4px;
				}
				li a:hover {
					background-color: #FFF2;
				}

				.tags {
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
					justify-content: center;
				}

				.tag {
					display: inline-block;
					background-image: url('./tag/tag.webp');
					background-size: var(--tag-bg-size);
					background-position: calc(var(--offX) * var(--tag-tile-coef)) calc(var(--offY) * var(--tag-tile-coef));
					height: 50px;
					width: 50px;
					border-radius: 4px;
					filter: grayscale(1);
					cursor: pointer;
				}
				.tag.active {
					filter: none;
				}
				.tag:hover {
					background-color: #FFF4;
				}
				
				.icon {
					height: 100%;
				}

	a {
		display: block;
		color: inherit;
		text-decoration: none;
	}
</style>
<div class="cover"></div>
<a href="#/presentation" class="logo">
	<div class="logo-display"> </div>
</a>
<nav>
	<section>
		<a href="#/actualite"> <h2>Actualité</h2> </a>
		<ul class="tags">
		
		</ul>
	</section>
	<section>
		<a href="#/evenement"> <h2>Événements</h2> </a>
	</section>
	<section>
		<a href="#/esport"> <h2>ESport</h2> </a>
	</section>
	<section>
		<a href="#/reseaux"> <h2>Réseaux</h2> </a>
		<ul>
			<li><a target="BLANK" href="#">
				<svg class="icon" viewbox="-20 -10 140 120" style="fill:#7289DA">
					<path d="M 36,12 C 30,13 19,16 15,19 5,34 -2,53 1,75 6,81 26,88 26,88 l 5,-9 c -6,-2 -8,-4 -8,-4 l 2,-2 c 15,8 35,8 50,0 l 2,2 c 0,0 -2,2 -8,4 l 5,9 C 74,88 94,81 99,75 102,53 95,34 85,19 81,16 70,13 64,12 l -3,6 C 51,17 48,17 39,18 Z M 33,64 a 9,10 0 1 1 0.1,0z M 67,64 a 9,10 0 1 1 0.1,0z"/>
				</svg>
				Discord
			</a></li>
			<li><a target="BLANK" href="#">
				<svg class="icon" viewbox="-10 -10 120 120" style="fill:#1DA1F2">
					<path d="m 100,19 c -5,2 -12,3 -12,3 0,0 8,-4 9,-11 -5,3 -13,5 -13,5 C 70,1 45,14 49,35 49,35 23,34 7,13 c -9,16 6,28 6,28 0,0 -7,-1 -9,-3 0,18 16,20 16,20 0,0 -4,2 -9,1 7,15 19,14 19,14 0,0 -12,11 -30,8 41,27 91,-5 90,-51 0,0 6,-5 10,-11 z"/>
				</svg>
				Twitter
			</a></li>
		</ul>
	</section>
</nav>`

export default class AztHeader extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template
		this.shadowRoot.addEventListener('click', this.dispatchAction.bind(this))
		document.body.addEventListener('route-update', this.onRouteUpdate.bind(this))

		/**@type {HTMLElement}*/this.logoDisplay = this.shadowRoot.querySelector('.logo-display')
		this.tagFilter = (localStorage.getItem('tag-filter') || '').split(',').filter(v=>v).map(Number)
	}

	onRouteUpdate(e) {
		/**@type {RouteValue}*/let route = e.detail.to
		let tag = app.cache.index.data.tags.find(tag => tag.name===route.filter)
		if (tag) {
			this.logoDisplay.classList.add('logo-tag')
			this.logoDisplay.style.setProperty('--offX', tag.offset[0])
			this.logoDisplay.style.setProperty('--offY', tag.offset[1])
		} else
			this.logoDisplay.classList.remove('logo-tag')
	}

	/**@param {AztApp} app*/
	init(app) {
		/**@type {DataTag[]}*/
		this.insertTags(app.cache.index.data.tags)
	}

	/** @param {DataTag[]} tags */
	insertTags(tags) {
		this.shadowRoot.querySelector('.tags')
			.innerHTML = tags.map(tag => /*html*/`
				<li class="tag ${this.tagFilter.includes(tag.id)?'':'active'}"
						data-action="toggle-tag" data-id="${tag.id}" title="${tag.name}"
						style="--offX:${tag.offset[0]};--offY:${tag.offset[1]}">
				</li>
			`).join('')
	}

	async dispatchAction(e) {
		let target = e.target.closest('[data-action]')
		switch (target?.dataset.action) {
		case 'toggle-tag': return this.toggleTag(target)
		}
	}

	/**@param {HTMLElement} target*/
	toggleTag(target) {
		target.classList.toggle('active')
		const tagId = parseInt(target.dataset.id)
		const tagIsActive = target.classList.contains('active')

		if (tagIsActive) {
			let index = this.tagFilter.findIndex(id => id===tagId)
			this.tagFilter.splice(index, 1)
		} else
			this.tagFilter.push(tagId)

		localStorage.setItem('tag-filter', this.tagFilter)
		this.dispatchEvent(new CustomEvent('tag-filter', {bubbles:true, detail:this.tagFilter}))
	}
}

customElements.define('azt-header', AztHeader, {extends:'header'})
