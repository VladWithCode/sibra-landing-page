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
			screens: {
				xs: '480px',
				desktop: '1920px',
			},
			fontFamily: {
				serif: "'Merriweather', serif",
			},
		},
	},
	plugins: [],
};
