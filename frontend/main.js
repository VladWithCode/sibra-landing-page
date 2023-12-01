// import './style.css';

import loadPlan from './src/plan';

document.addEventListener('DOMContentLoaded', () => {
	// Navbar
	const navbar = document.querySelector('#main-navbar');
	const navbarToggler = document.querySelector('#main-navbar-toggler');

	navbarToggler.addEventListener('click', () => {
		navbar.classList.toggle('visible');
	});

	// Hero
	setInterval(animateBackgrounds(), 5000);

	// Detail List
	const detailList = document.querySelector('#detail-list');
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				detailList
					.querySelectorAll('li')
					.forEach(child => child.classList.add('slideInUp'));
			}
		},
		{ threshold: 0.25 }
	);

	observer.observe(detailList);

	// Contact Form
	const contactForm = document.querySelector('#contact-form');

	contactForm.addEventListener('submit', async e => {
		e.preventDefault();
		const requestData = {
			name: '',
			phone: '',
			message: '',
		};
		const inputs = [];

		for (let input of contactForm) {
			if (input.tagName !== 'BUTTON') {
				inputs.push(input);
				requestData[input.name] = input.value;
			}
		}

		const [sendError, response] = await asyncHandler(
			postContactRequest(requestData)
		);

		if (sendError) alert(sendError.message);

		alert(response.message);
		for (let input of inputs) {
			input.value = '';
			if (input.tagName === 'TEXTAREA') input.innerHTML = '';
		}
	});

	// Render / Maps
	const locateSelectorBtns = document.querySelectorAll(
		'[data-locate-selector]'
	);
	const locateDisplayElements = document.querySelectorAll(
		'[data-locate-display]'
	);
	const activeBtnClasslist = [
		'bg-white',
		'shadow-sm',
		'shadow-zinc-300',
		'font-medium',
	];

	for (const btn of locateSelectorBtns) {
		btn.addEventListener('click', () => {
			const displayId = btn.dataset.locateSelector;
			let displayElement;
			btn.classList.add(...activeBtnClasslist);

			for (const btn of locateSelectorBtns) {
				const id = btn.dataset.locateSelector;

				if (id !== displayId)
					btn.classList.remove(...activeBtnClasslist);
			}

			for (const element of locateDisplayElements) {
				const id = element.dataset.locateDisplay;

				if (id === displayId) {
					element.classList.remove('invisible');
					displayElement = element;
				} else {
					element.classList.add('invisible');
				}
			}

			if (displayId === 'render') {
				loadPlan();
			}
		});
	}
});

async function postContactRequest(requestData) {
	const response = await fetch('/api/send-contact-request', {
		headers: {
			'content-type': 'application/json',
		},
		method: 'POST',
		body: JSON.stringify(requestData),
	});

	const data = await response.json();

	if (response.status !== 200)
		throw new Error(data.message || 'Error conectarse con el servidor');

	return data;
}

async function asyncHandler(p) {
	try {
		return [await p, undefined];
	} catch (e) {
		return [undefined, e];
	}
}

function animateBackgrounds() {
	let activeElement = '[data-hero-image]';

	return function toggle() {
		// Hero
		const heroVideo = document.querySelector('[data-hero-video]');
		const heroImage = document.querySelector('[data-hero-image]');

		if (activeElement === '[data-hero-video]') {
			heroVideo.classList.remove('fadeIn');
			heroImage.classList.remove('fadeOut');

			heroVideo.classList.add('fadeOut');
			heroImage.classList.add('fadeIn');

			activeElement = '[data-hero-image]';
			heroVideo.currentTime = 0;
		} else {
			heroVideo.classList.remove('fadeOut');
			heroImage.classList.remove('fadeIn');

			heroVideo.classList.add('fadeIn');
			heroImage.classList.add('fadeOut');

			activeElement = '[data-hero-video]';
			heroVideo.play();
		}
	};
}
