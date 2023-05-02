export default {
	content: /*html*/`
		<style>
			:host {
				display: flex;
				max-width: 1200px;
				margin: 64px auto 128px auto;
				padding: 0 32px;
				font-family: sans-serif;
				flex-wrap: wrap;
				justify-content: center;
				gap: 32px;

				background-attachment: fixed;
			}

			h1 {
				flex: 0 0 100%;
				display: block;
				margin: 0.2em 0 0.8em 0;
				font-size: clamp(32px, 8.5vw, 110px);
				text-align: center;
				white-space: nowrap;
				text-decoration: underline;
			}

			.card {
				flex: 1 1 calc(50% - 16px);
				max-width: calc(50% - 16px);
				aspect-ratio: 11/3;
				text-align: center;
				text-decoration: none;
				font-weight: bold;
				color: white;
				font-size: clamp(44px, 6.8vw, 87px);
				background: var(--bg);
				border-radius: 8px;
				box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
				transition: box-shadow 180ms ease-out;

				display: grid;
				grid-template: 1fr / auto 1fr;
				align-items: center;
			}
			@media screen and (max-width: 880px) {
				.card {
					flex: 1 1 100%;
					max-width: 580px;
					font-size: clamp(16px, 12vw, 87px);
				}
			}
			.card:hover {
				box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
			}
			.card:active {
				box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
				filter: brightness(1.2);
			}
			.card-placeholder {
				visibility: hidden;
				aspect-ratio: none;
				height:0;
			}


			.icon {
				height: 100%;
				aspect-ratio: 140/120;
			}

			path {
				fill: white;
			}

		</style>
		<h1> Nos Réseaux </h1>

		<a class="card" style="--bg:#7289DA" href="#/">
			<svg class="icon" viewbox="-20 -10 140 120">
				<path d="M 36,12 C 30,13 19,16 15,19 5,34 -2,53 1,75 6,81 26,88 26,88 l 5,-9 c -6,-2 -8,-4 -8,-4 l 2,-2 c 15,8 35,8 50,0 l 2,2 c 0,0 -2,2 -8,4 l 5,9 C 74,88 94,81 99,75 102,53 95,34 85,19 81,16 70,13 64,12 l -3,6 C 51,17 48,17 39,18 Z M 33,64 a 9,10 0 1 1 0.1,0z M 67,64 a 9,10 0 1 1 0.1,0z"></path>
			</svg>
			<span>Discord</span>
		</a>
		<a class="card" style="--bg:#F01010" href="#/">
			<svg class="icon" viewbox="-10 -10 120 120">
				<path d="m 50,15 c 49,0 50,1 50,35 0,34 -1,35 -50,35 C 1,85 0,84 0,50 0,16 1,15 50,15 Z M 40,35 V 65 L 66,50 Z"></path>

			</svg>
			<span>Youtube</span>
		</a>
		<a class="card" style="--bg:#1DA1F2" href="#/">
			<svg class="icon" viewbox="-10 -10 120 120">
				<path d="m 100,19 c -5,2 -12,3 -12,3 0,0 8,-4 9,-11 -5,3 -13,5 -13,5 C 70,1 45,14 49,35 49,35 23,34 7,13 c -9,16 6,28 6,28 0,0 -7,-1 -9,-3 0,18 16,20 16,20 0,0 -4,2 -9,1 7,15 19,14 19,14 0,0 -12,11 -30,8 41,27 91,-5 90,-51 0,0 6,-5 10,-11 z"></path>
			</svg>
			<span>Twitter</span>
		</a>`,
	onRouteUpdate: () => {
		console.log('route update')
	}
}
