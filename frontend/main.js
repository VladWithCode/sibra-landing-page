// import './style.css';
document.addEventListener('DOMContentLoaded', () => {
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
