const template = /*html*/`
<style>
	:host {
		max-width: 250px;
		margin: 64px auto;
		display: block;
	}

	.action {
		font-size: 1.4em;
		position: relative;
		border-radius: 4px;
		padding: 12px 4px;
		margin: 32px 0;
		text-align: center;
		background: white;
		box-shadow: #0003 0 3px 6px, #0004 0 3px 6px;
		transition: box-shadow 180ms ease-out;
		cursor: pointer;
	}
	.action:hover {
		box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
	}
	.processing::before {
		content: '';
		display: block;
		position: absolute;
		inset: 0;
		background-color: #DDDA;
	}
	.processing::after {
		content: '';
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		height: 32px;
		width: 32px;
		border: solid 4px;
		border-color: #000A #0000 #0000 #0000;
		border-radius: 50%;
		animation: loop 900ms cubic-bezier(0.50, 0.65, 0.50, 0.35) infinite;
	}
	@keyframes loop {
		from { transform: translate(-50%, -50%) rotate(0deg); }
		to { transform: translate(-50%, -50%) rotate(360deg); }
	}

</style>
<div class="action" data-action="publish"> Publier </div>
<div class="action" data-action="commit"> GIT: Commit </div>
<div class="action" data-action="pull"> GIT: Pull --force </div>`

export default class AdminCmd extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template

		this.shadowRoot.addEventListener('click', this.dispatchAction.bind(this))
	}

	async dispatchAction(e) {
		const target = e.target.closest('[data-action]')
		if (target) {
			target.classList.add('processing')
			await document.body[target.dataset.action]()
			target.classList.remove('processing')
		}
	}
}

customElements.define('admin-cmd', AdminCmd)