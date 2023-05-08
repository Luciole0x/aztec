/**
 * @typedef {import('../azt-app.js').TeamData} TeamData
 * @typedef {import('../azt-app.js').PlayerData} PlayerData
 * @typedef {import('../azt-app.js').RouteValue} RouteValue
 * @typedef {import('../azt-app.js').AztApp} AztApp
 */

/**
 * @typedef {Object} Contact
 * @property {string} id - identifiant de contact
 * @property {string} display
 * @property {ContactType} type - steam|discord|dofus
 * 
 * @typedef {Object} ContactType
 * @property {string} linkHead
 * @property {string} iconId
 * @property {string} color
 */

let template = /*html*/`
<style>
	:host {
		animation: display 120ms ease-in forwards;
	}
	:host(.close) {
		animation: close 120ms ease-in forwards;
	}
	@keyframes close {
		from { opacity:1; }
		to { opacity:0; }
	}
	@keyframes display {
		from { opacity:0; }
		to { opacity:1; }
	}


	p {
		margin: 64px auto;
		padding: 16px;
		max-width: 680px;
	}
	.icons-definition {
		display: none;
	}
	path {
		fill: white;
	}


	.coaches {
		justify-content: center;
		display: flex;
		flex-wrap: wrap;
		gap: 32px;
	}
		.coach {
			margin: 24px 0 0 16px;
			border-radius: 4px;
			width: 280px;
			box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
			display: grid;
			grid-template: 48px 1fr / 48px 1fr;
			text-align: center;
			background: #444;
		}
			.coach-picture {
				margin: -37px 0 0 -16px;
				height: 100px;
				width: 100px;
				background: #222;
				border: solid 4px #444;
				border-radius: 50%;
			}
			.coach-pseudo {
				color: #000D;
				font-size: 1.4em;
				line-height: 48px;
				font-weight: bold;
			}
		.contacts {
			grid-column-end: span 2;
			display: flex;
			flex-wrap: wrap;
			fill: white;
		}
		.contact {
			display: grid;
			grid-template-columns: 60px 1fr;
			align-items: center;
			flex: 1 1 0;
			text-decoration: none;
			background-color: var(--bg);
			color: white;
		}
		.contact[href]:hover {
			filter: brightness(1.2);
		}
		.contact:last-of-type {
			border-radius: 0 0 4px 4px;
		}

	.teams {
		padding-bottom: 128px;
	}
		.team {
			margin-top: 128px;
			padding: 0 0 64px 0;
			display: block;
			background-color: #0008;
			background-image: var(--bg);
			background-position: center;
			background-attachment: fixed;
			background-size: cover;
		}
		.team-name {
			font-size: 2em;
			font-weight: bold;
			margin: 0 0 48px 0;
			transform: translateY(-50%);
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			align-items: center;
			text-shadow: -1px -1px 2px black, 1px 1px 2px black;
		}
		.team-name:before,
		.team-name:after {
			content: '';
			border: solid 1px white;
			margin: 0 32px;
		}
		.players {
			display: flex;
			flex-wrap: wrap;
			gap: 48px 64px;
			justify-content: center;
			max-width: 1100px;
			margin: 0 auto;
			padding: 0 32px;
		}

		.player {
			width: 300px;
			border-radius: 4px;
			background: #444;
			margin: 22px 0 22px 22px;
			display: grid;
			grid-template: 36px 28px / 64px 1fr;
			align-items: center;
		}
		.player-picture {
			border-radius: 50%;
			background: #222;
			height: 100px;
			width: 100px;
			border: 4px solid #444;
			margin: -22px 0 -22px -22px;
			grid-area: 1/1/3/2;
		}
		.player-name {
			text-align: center;
			padding-left: 16px;
			font-size: 28px;
		}
		.player-role {
			opacity: 0.8;
			padding-left: 22px;
			font-size: 18px;
		}

</style>
<svg class="icons-definition">
	<path id="Discord" d="M 36,12 C 30,13 19,16 15,19 5,34 -2,53 1,75 6,81 26,88 26,88 l 5,-9 c -6,-2 -8,-4 -8,-4 l 2,-2 c 15,8 35,8 50,0 l 2,2 c 0,0 -2,2 -8,4 l 5,9 C 74,88 94,81 99,75 102,53 95,34 85,19 81,16 70,13 64,12 l -3,6 C 51,17 48,17 39,18 Z M 33,64 a 9,10 0 1 1 0.1,0z M 67,64 a 9,10 0 1 1 0.1,0z"/>
	<path id="Bnet" d="M 62,25 53,24 C 25,-5 25,47 43,75 c 6,9 10,15 19,21 2,1 8,4 -2,1 C 48,93 35,75 29,60 7,7 36,-21 62,25 Z m 3,48 7,-8 C 115,55 45,15 1,39 c -3,2 1,-4 8,-7 10,-6 33,-8 53,-3 40,8 59,43 3,44 z M 22,52 26,61 C 12,99 70,75 83,21 83,4 87,15 85,28 84,35 82,44 70,61 36,107 -6,99 22,52 Z"/>
	<path id="Xbox" d="M 25,9 C 40,-1 60,-1 75,9 57,8 50,17 50,17 50,17 43,8 25,9 Z m -9,6 C 25,15 37,28 37,28 37,28 9,61 12,79 -13,45 16,15 16,15 Z M 50,40 C 12.258176,73.410795 17,85 17,85 c 17,18 49,18 66,0 0,0 4.918601,-13.533748 -33,-45 z M 63,28 c 0,0 12,-13 21,-13 0,0 30,28 5,64 C 90,59 63,28 63,28 Z"/>
	<path id="Steam" d="m 50,0 c 30,0 50,25 50,50 0,24 -19,50 -50,50 C 35,100 11,92 2,64 l 19,8 c 5,17 29,13 28,-4 L 66,56 C 82,56 91,38 82,26 70,11 47,20 48,37 L 36,55 c -2,-1 -6,0 -9,2 L 0,46 C 2,21 23,0 50,0 Z M 63,25 C 73,22 82,32 78,42 74,52 61,52 56,44 53,40 52,29 63,25 Z m -3,19 c -6,-7 -2,-14 4,-16 7,-2 12,4 12,9 0,8 -9,13 -16,7 z M 25,73 c 11,6 14,3 16,0 3,-5 2,-11 -10,-14 9,-3 13,4 14,6 1,4 1,11 -7,14 -4,1 -9,1 -13,-6 z"/>
	<path id="Ankama" d="M 0,11 h 74 v 33 l 5,-5 h 21 V 92 H 26 V 58 l -5,5 H 0 Z m 82,8 H 94 V 31 H 82 Z m -70,50 9,9 -9,9 -9,-9 z M 21,21 V 40 H 47 V 82 H 79 V 63 H 53 V 21 Z"/>
</svg>

<p class="presentation">
	Aztec s'engage dans l'esport ! Nous ouvrons nos portes aux équipes sur les jeux suivant : 
	League of Legends / Counter Strike / Valorant / Rocket League. <br>
	<br>
	Venant de CS:GO, nous avons l'expérience de la compétition et de ce qui l'entoure. Nous saurons vous donner les clés nécessaires pour faire évoluer votre équipe. <br>
	<br>
	Aztec vient de naitre dans ce milieu nous sommes donc actuellement fermés aux équipes de niveau semi-professionnel. Nous souhaitons avancer côte à côte avec de jeunes équipes investies dans leur projet. <br>
	<br>
</p> `

export default class AztEsportSection extends HTMLElement {
	/**
	 * @param {AztApp} app
	 * @param {RouteValue} route */
	static display(app, route) {
		return new AztEsportSection(
			[],
			app.cache.index.data.teams)
	}

	constructor(coaches, teams, route) {
		super()
		this.attachShadow({mode:'open'})
		this.onRouteUpdate = this.onRouteUpdate.bind(this)

		/**@type {HTMLElement?}*/this.displayedTeam = null
		/**@type {PlayerData[]}*/this.coaches = coaches
		/**@type {TeamData[]}*/this.teams = teams
		/**@type {RouteValue}*/this.route = route

		this.shadowRoot.innerHTML = this.getContent(coaches, teams)
	}

	connectedCallback() {
		document.body.addEventListener('route-update', this.onRouteUpdate)
	}

	disconnectedCallback() {
		document.body.removeEventListener('route-update', this.onRouteUpdate)
	}

	/**@param {CustomEvent} e*/
	onRouteUpdate(e) {
	}

	/**
	 * @param {PlayerData[]} coaches
	 * @param {TeamData[]} teams
	 * @return {string} */
	getContent(coaches, teams) {
		return `${template}
			${this.generatecoaches(coaches)}
			${this.generatesTeams(teams)}`
	}

	/**
	 * @param {TeamData[]} teams
	 * @return {string} */
	generatesTeams(teams) {
		return /*html*/`
		<section class="teams">
			${teams.map(team => this.generateTeam(team)).join('')}
		</section>`
	}

	/**
	 * @param {TeamData} team
	 * @returns {string} */
	generateTeam(team) {
		return /*html*/`
		<div class="team" style="--bg:url(./esport/team/${team.id}/background.webp)">
			<h1 class="team-name"> ${team.name} </h1>
			<section class="players">
				${team.players.map(player => /*html*/`
					<div class="player">
						<img class="player-picture" src="./esport/player/${player.id}/picture.webp">
						<div class="player-name">${player.name}</div>
						<div class="player-role">${player.role}</div>
					</div>
				`).join('')}
			</section>
		</div>`
	}

	/**
	 * @param {Coach[]} coaches
	 * @return {string} */
	generatecoaches(coaches) {
		return /*html*/`
		<section class="coaches">
			${coaches.map(coach => this.generatecoach(coach)).join('')}
		</section>`
	}

	/**
	 * @param {PlayerData} coach
	 * @return {string} */
	generatecoach(coach) {
		return /*html*/`
		<div class="coach">
		<img class="coach-picture" src="/esport/player/${coach.id}/picture.webp">
		<span class="coach-pseudo"> ${coach.name} </span>
		<div class="contacts">${
		//	coach.contacts.map(contact => /*html*/`
		//		<a class="contact" style="--bg:${contact.type.color}" ${
		//				contact.type.linkHead?`href="https://${contact.type.linkHead}${contact.id}" target="BLANK"`:''}>
		//			<svg class="contact-icon" viewbox="-20 -10 140 120">
		//				<title>${contact.type.iconId}</title>
		//				<use xlink:href="#${contact.type.iconId}" x="0" y="0"/>
		//			</svg>
		//			<span> ${contact.display||contact.id} </span>
		//		</a>
		//	`).join('')
		''
		}</div>
	</div>`
	}

	close() {
		return new Promise((resolve, reject) => {
			this.addEventListener('animationend', resolve, {once:true})
			this.classList.add('close')
		})
	}
}

customElements.define('azt-esport-section', AztEsportSection, {extends:'section'})
