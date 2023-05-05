const fragment = (() => {
	let template = document.createElement('template')
	template.innerHTML = /*html*/`
		<style>
			:host {
				position: absolute;
				z-index: 10;
				top: 12px;
				left: 24px;
				right: calc(15px + 24px);
				background-color: rgb(var(--secondary-background));
				border-radius: 8px;
				display: grid;
				grid-template: 56px / 120px 1fr;
				color: #000D;
			}

			.logo {
				cursor: pointer;
				border-radius: 8px 0 0 8px;
				justify-content: center;
				display: grid;
			}
			.logo:hover {
				background-color: rgb(var(--secondary-background));
			}
				.logo img {
					height: 76px;
					margin-top: -8px;
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
						padding: 0 16px;
						font-size: 1.3em;
						display: inline-block;
						white-space: nowrap;
						vertical-align: middle;
						line-height: 56px;
					}
					section:hover h2 {
						background-color: rgb(var(--secondary-background));
					}
					section:has(ul) h2::after {
						content:'';
						display: inline-block;
						height: 8px;
						width: 8px;
						border: solid;
						border-width: 0 4px 4px 0;
						border-radius: 0 0 4px 0;
						transform: rotate(45deg);
					}

					ul {
						margin: 0 0 0 50%;
						padding: 8px 0;
						border-radius: 4px;
						position: absolute;
						width: 250px;
						display: block;
						visibility: hidden;
						background-color: rgb(var(--secondary-background));
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
							font-size: 1.1em;
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
							background-color: #fff4;
						}

						.tag {
							display: inline-block;
							background-image: url('media/icon/game.webp');
							background-size: 400%;
							height: 32px;
							width: 32px;
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
		<a href="#/presentation" class="logo">
			<img src="media/icon/aztec.png"/>
		</a>
		<nav>
			<section>
				<a href="#/actualite"> <h2> Actualité </h2> </a>
				<ul>
					<li><a href="#/actualite/DIABLO"> <span class="tag" style="background-position:0 0;"></span> Diablo </a></li>
					<li><a href="#/actualite/DOFUS"><span class="tag" style="background-position:-32px 0;"></span> Dofus </a></li>
					<li><a href="#/actualite/CSGO"><span class="tag" style="background-position:-64px 0;"></span> Counter Strike </a></li>
				</ul>
			</section>
			<section>
				<a href="#/event"> <h2> événements </h2> </a>
			</section>
			<section>
				<a href="#/esport"> <h2> ESport </h2> </a>
			</section>
			<section>
				<a href="#/reseaux"> <h2> Réseaux </h2> </a>
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
		</nav>
	`
	return template.content
})()

export default class AztHeader extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode:'open' })
		this.shadowRoot.append(fragment.cloneNode(true))
	}
}

customElements.define('azt-header', AztHeader, {extends:'header'})
