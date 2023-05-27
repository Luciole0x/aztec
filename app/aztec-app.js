const players = [
	/*html*/`
		<span class="bold">Pseudo:</span> Player A <br>
		<span class="bold">Role:</span> Piou Piou <br>
		<span class="bold">Victoires:</span> 9999 <br>`,
	/*html*/`
		<span class="bold">Pseudo:</span> Player B <br>
		<span class="bold">Role:</span> Piou Piou <br>
		<span class="bold">Victoires:</span> 0 <br>`,
	/*html*/`
		<span class="bold">Pseudo:</span> Player C <br>
		<span class="bold">Role:</span> Piou Piou <br>
		<span class="bold">Defaites:</span> 1000 <br>`,
	/*html*/`
		<span class="bold">Pseudo:</span> Player D <br>
		<span class="bold">Role:</span> Piou Piou <br>
		<span class="bold">Match nul:</span> 786 <br>`,
	/*html*/`
		<span class="bold">Pseudo:</span> Player D <br>
		<span class="bold">Role:</span> Piou Piou <br>
		<span class="bold">Defaites:</span> 1 <br>`,
]

class AztecApp {
	constructor() {
		/**@type {HTMLElement} */
		this.background = document.getElementById('background')
		/**@type {HTMLElement} */
		this.sponsors = document.getElementById('sponsors')
		/**@type {HTMLElement} */
		this.propos = document.getElementById('a-propos')
		/**@type {HTMLDivElement} */
		this.activePlayer = null
		/**@type {HTMLDivElement} */
		this.rosterInfoText = document.querySelector('.roster-info-text')
		this.currentOpacity = -1

		document.body.addEventListener('hash', e => this.onScroll(e))
		document.body.addEventListener('scroll', e => this.onScroll(e))
		document.body.addEventListener('click', e => this.dispatchAction(e))

		this.init()
	}

	init() {
		if (location.hash)
			this.scrollTo(location.hash)
	}

	onScroll(e) {
		let opacity = 0.35
		if (document.body.scrollTop+document.body.clientHeight*0.6 > this.propos.offsetTop)
			opacity = 0.1
		if (document.body.scrollTop > document.body.scrollHeight-document.body.offsetHeight-100)
			opacity = 1.0

		if (opacity != this.currentOpacity) {
			this.currentOpacity = opacity
			background.style.opacity = opacity
		}
	}

	dispatchAction(e) {
		const target = e.target.closest('[data-action]')
		switch (target?.dataset.action) {
		case 'scroll-to': return this.scrollTo(target.getAttribute('href'), e)
		case 'display-player': return this.displayPlayer(target)
		}
	}

	/**
	 * @param {string} id
	 * @param {MouseEvent} e
	 */
	scrollTo(id, e) {
		e?.preventDefault()
		history.replaceState(undefined, undefined, id)
		document.querySelector(id)
			.scrollIntoView({ behavior:'smooth' })
	}

	/**
	 * @param {HTMLDivElement} player */
	displayPlayer(player) {
		if (this.activePlayer === player)
			return

		this.activePlayer?.classList.remove('active')
		this.activePlayer = player

		this.activePlayer.classList.add('active')
		const id = Number(player.dataset.id)
		this.rosterInfoText.innerHTML = players[id]
		player.classList.add('active')
	}
}

window.app = new AztecApp()
