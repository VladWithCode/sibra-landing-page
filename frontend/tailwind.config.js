/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './main.js'],
	theme: {
		extend: {
			height: {
				100: '25rem',
				120: '30rem',
				160: '40rem',
			},
		},
	},
	plugins: [],
};
