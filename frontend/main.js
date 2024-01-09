import { Gallery } from './src/gallery';
import loadPlan from './src/plan';
import { InfiniteSlider } from './src/slider';

document.addEventListener('DOMContentLoaded', () => {
	// Navbar
	const navbar = document.querySelector('#main-navbar');
	const navbarToggler = document.querySelector('#main-navbar-toggler');

	navbarToggler.addEventListener('click', () => {
		navbar.classList.toggle('visible');
	});

	// Add click listener for links
	document
		.querySelectorAll('[data-mobile-navbar-link]')
		.forEach(link =>
			link.addEventListener('click', () =>
				navbar.classList.toggle('visible', false)
			)
		);

	// Hero
	setTimeout(animateBackgrounds(), 3000);

	// Detail List
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				entry.target
					.querySelectorAll('li')
					.forEach(child => child.classList.add('slideInUp'));

				observer.unobserve(entry.target);
			}
		},
		{ threshold: 0.25 }
	);

	// Contact Form
	const contactForm = document.querySelector('[data-contact-form]');
    const contactFormLoadingSpinner = document.querySelector('[data-contact-form-loading]');

    console.dir(contactForm, contactFormLoadingSpinner);

	contactForm.addEventListener('submit', async e => {
		e.preventDefault();
        contactFormLoadingSpinner.style = 'display: flex;'
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

        contactFormLoadingSpinner.style = 'display: none;'

		alert(response.message);
		for (let input of inputs) {
			input.value = '';
			if (input.tagName === 'TEXTAREA') input.innerHTML = '';
		}
	});

	// Comunicate
	const contactList = document.querySelector('#contact-list');
	observer.observe(contactList);

	// Render / Maps
	const locateSelectorBtns = document.querySelectorAll(
		'[data-locate-selector]'
	);
	const locateSelectorBg = document.querySelector('[data-locate-bg]');
	const locateDisplayElements = document.querySelectorAll(
		'[data-locate-display]'
	);
	let disposeRender;

	for (const btn of locateSelectorBtns) {
		btn.addEventListener('click', () => {
			const displayId = btn.dataset.locateSelector;

			if (displayId === 'maps') {
				locateSelectorBg.classList.add('maps');
				locateSelectorBg.classList.remove('render');
			} else {
				locateSelectorBg.classList.remove('maps');
				locateSelectorBg.classList.add('render');
			}

			for (const element of locateDisplayElements) {
				const id = element.dataset.locateDisplay;

				if (id === displayId) {
					element.classList.remove('invisible');
				} else {
					element.classList.add('invisible');
				}
			}

			if (displayId === 'render' && typeof disposeRender !== 'function') {
				disposeRender = loadPlan();
			} else if (displayId !== 'render') {
				disposeRender();
				disposeRender = null;
			}
		});
	}

	// Amenity Slider
	const slider = new InfiniteSlider();
	slider.animate.bind(slider, 0);
	slider.play();

	// Gallery
	const gallery = new Gallery();
	gallery.play();
});

async function postContactRequest(requestData) {
	const response = await fetch('http://localhost:3000/api/send-contact-request', {
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

	const heroVideo = document.querySelector('[data-hero-video]');
	const heroImage = document.querySelector('[data-hero-image]');

	return function toggle() {
		if (activeElement === '[data-hero-video]') {
			heroVideo.classList.remove('fadeIn');
			heroImage.classList.remove('fadeOut');

			heroVideo.classList.add('fadeOut');
			heroImage.classList.add('fadeIn');

			activeElement = '[data-hero-image]';
			heroVideo.currentTime = 0;

			setTimeout(toggle, 3 * 1000);
		} else {
			heroVideo.classList.remove('fadeOut');
			heroImage.classList.remove('fadeIn');

			heroVideo.classList.add('fadeIn');
			heroImage.classList.add('fadeOut');

			activeElement = '[data-hero-video]';
			heroVideo.play();

			setTimeout(toggle, 10 * 1000);
		}
	};
}
