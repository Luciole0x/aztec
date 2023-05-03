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
	header a {
		color: black;
		font-size: 24px;
		line-height: 32px;
		display: inline-block;
		padding: 0 8px;
		margin: 0 8px;
	}
	header a:hover {
		background: #0004;
	}

</style>
<header>
	<nav>
		<a href="#/admin-event"> événement </a>
		<a href="#/admin-esport"> Esport </a>
		<a href="#/admin-tags"> tags </a>
	</nav>
</header>
<section id="container">
	<slot></slot>
</section>
<div id="notifications"></div>`

export default class AdminApp extends HTMLBodyElement {
	constructor() {
		super()
		this.attachShadow({mode:'open'})
		this.shadowRoot.innerHTML = template
		window.addEventListener('hashchange', e=>this.onHashChange())
		this.onHashChange()
	}

	async onHashChange() {
		let contentName = document.location.hash.split('/').pop()
		let ContentElement = (await import(`./${contentName}.js`)).default

		if (!(this.firstElementChild instanceof ContentElement)) {
			this.firstElementChild?.remove()
			this.appendChild(new ContentElement())
		}
	}
}

customElements.define('admin-app', AdminApp, {extends:'body'})
