import ctEvents from 'ct-events'
import { registerDynamicChunk } from 'blocksy-frontend'
import { handleAccountModal, activateScreen } from './frontend/account'

const ensureAccountModalPresent = (cb) => {
	const selector = '#account-modal'
	try {
		document.querySelector(selector)
	} catch (e) {
		return
	}

	if (document.querySelector(selector)) {
		cb(document.querySelector(selector))
		return
	}

	fetch(
		`${
			ct_localizations.ajax_url
		}?action=blc_retrieve_account_modal&header_id=${
			document.body.dataset.header.split(':')[0]
		}`,

		{
			method: 'POST',
			body: JSON.stringify({
				current_url: location.href,
			}),
		}
	)
		.then((response) => response.json())
		.then(({ data: { html } }) => {
			const drawerCanvas = document.querySelector('.ct-drawer-canvas')
			drawerCanvas.insertAdjacentHTML('beforeend', html)

			setTimeout(() => {
				let el = document.querySelector(selector)

				if (window.nslReinit) {
					window.nslReinit()
				}

				;[...el.querySelectorAll('script')].map((s) => {
					var script = document.createElement('script')
					script.textContent = s.textContent
					document.body.appendChild(script)
				})
				;[...el.querySelectorAll('.g-recaptcha')].map((el) => {
					if (window.grecaptcha && !el.gr_rendered) {
						el.gr_rendered = true

						el.id += Math.floor(Math.random() * 1000) + 1

						el.gID = grecaptcha.render(el.id, {
							sitekey: el.dataset.sitekey,
						})
					}
				})

				if (window.anr_onloadCallback) {
					anr_onloadCallback()
				}

				cb(el)
			})
		})
}

registerDynamicChunk('blocksy_account', {
	mount: (el, { event }) => {
		event.preventDefault()

		ensureAccountModalPresent((accountModal) => {
			handleAccountModal(accountModal)

			activateScreen(accountModal, {
				screen: el.dataset.view || 'login',
			})

			ctEvents.trigger('ct:overlay:handle-click', {
				e: event,
				href: '#account-modal',
				options: {
					isModal: true,
				},
			})
		})
	},
})
