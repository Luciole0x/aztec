let template = /*html*/`
	<style>
		h1 {
			margin-top: 0;
			text-align: center;
			font-size: 2.5em;
		}

		p {
			margin: 16px auto;
			padding: 16px;
			max-width: 680px;
			font-size: 1.2em;
		}

		.join {
			padding: 8px;
			display: grid;
			width: 420px;
			max-width: calc(100vw - 16px);
			aspect-ratio: 4/1;
			text-align: center;
			text-decoration: none;
			font-weight: bold;
			margin: 20vh auto;
			font-size: 38px;
			background: #7289DA;
			border-radius: 8px;
			box-shadow: 0 3px 6px rgba(0 0 0 0.16), 0 3px 6px rgba(0 0 0 0.23);
			transition: box-shadow 180ms ease-out;
			grid-template: 1fr / auto 1fr;
			align-items: center;
			color: inherit;
		}
		.join:hover {
			box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
		}
		.join:active {
			filter: brightness(1.2);
		}
			.icon {
				height: 100%;
				aspect-ratio: 140/120;
			}
			path {
				fill: white;
			}

			.scroll-arrow {
				stroke: white;
				stroke-width: 12;
				stroke-linecap: round;
				stroke-linejoin: round;
				height: 120px;
				width: 160px;
				margin: 12vh auto calc(88vh - 120px) auto;
				display: block;
			}
			.scroll-arrow > path {
				opacity: 0;
				fill: none;
				animation: blink 2.8s var(--delay) infinite;
			}
			@keyframes blink {
				40% { opacity:0 }
				45% { opacity:1 }
				55% { opacity:1 }
				60% { opacity:0 }
			}

	</style>
	<svg class="scroll-arrow" viewbox="0 20 100 60">
		<path d="M10,25L50,35L90,25" style="--delay:0ms"/>
		<path d="M10,45L50,55L90,45" style="--delay:120ms"/>
		<path d="M10,65L50,75L90,65" style="--delay:240ms"/>
	</svg>
	<h1>
		Communauté ESport
	</h1>
	<p>
		Nous sommes une communauté engagée dans ses projets, à la recherche de l'excellence dans l'encadrement et la gestion de nos évènements. <br>
		Il nous est important que les joueurs se sentent bien, qu'ils puissent profiter pleinement du contenu des jeux que nous proposons.
	</p>
	<a class="join" href="#/">
		<svg class="icon" viewbox="-20 -10 140 120">
			<path d="M 36,12 C 30,13 19,16 15,19 5,34 -2,53 1,75 6,81 26,88 26,88 l 5,-9 c -6,-2 -8,-4 -8,-4 l 2,-2 c 15,8 35,8 50,0 l 2,2 c 0,0 -2,2 -8,4 l 5,9 C 74,88 94,81 99,75 102,53 95,34 85,19 81,16 70,13 64,12 l -3,6 C 51,17 48,17 39,18 Z M 33,64 a 9,10 0 1 1 0.1,0z M 67,64 a 9,10 0 1 1 0.1,0z"/>
		</svg>
		Rejoindre Aztec
	</a> `

export default class AztPresentation extends HTMLElement {
	static async display(route) {
		return new AztPresentation()
	}

	constructor() {
		super()
		this.setAttribute('is', 'azt-presentation')
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template
		this.onScroll = this.onScroll.bind(this)
		this.scrollArrow = this.shadowRoot.querySelector('.scroll-arrow')
		this.logo = app.background.getElementById('background-logo')
		this.onTop = null
	}

	connectedCallback() {
		this.logo.style.opacity = 1
		document.body.addEventListener('scroll', this.onScroll, {passive:true})
	}

	disconnectedCallback() {
		this.logo.style.opacity = null
		document.body.removeEventListener('scroll', this.onScroll, {passive:true})
	}

	onScroll(e) {
		const opacity = Math.max(0.2, 1 - document.body.scrollTop / (document.body.clientHeight*0.8) *0.8 )

		if (this.onTop === opacity)
			return
		this.onTop = opacity
		this.logo.style.opacity = opacity
		this.scrollArrow.style.opacity = (opacity>0.4 ? 1 : 0)
	}
}

customElements.define('azt-presentation', AztPresentation, {extends:'section'})
