export class InfiniteSlider {
	containerElem;
	sliderElem;
	slidesElems;
	bulletElems = [];
	prevBtn;
	nextBtn;
	autoSlideIntvId;
	totalSlides;
	currentSlide = 0;
	animationDuration = 500;
	animationSleep = 1500;
	isBigSlider = false;

	constructor(containerElemSelector = '[data-slider-container]') {
		this.containerElem = document.querySelector(containerElemSelector);
		this.sliderElem = this.containerElem.querySelector(
			'[data-slider-slider]'
		);
		this.slidesElems = this.sliderElem.querySelectorAll(
			'[data-slider-slide]'
		);
		this.prevBtn = this.containerElem.querySelector('[data-slider-prev]');
		this.nextBtn = this.containerElem.querySelector('[data-slider-next]');
		this.animationDuration = parseInt(
			this.sliderElem.dataset.sliderAnimationDuration
		);
		this.animationSleep = parseInt(
			this.sliderElem.dataset.sliderAnimationSleep
		);
		this.totalSlides = this.slidesElems.length;
		this.isBigSlider = window.matchMedia('(width >= 768px)').matches;

		const sliderNavigation = createElement('div', {
			className: 'slider-navigation',
		});

		for (let i = 0; i < this.totalSlides; i++) {
			const btn = createElement('button', {
				type: 'button',
				className: 'slider-bullet',
				onclick: () => this.goto(i),
			});

			this.bulletElems.push(btn);
		}

		this.sliderElem.addEventListener('transitionend', () => {
			if (this.currentSlide <= -1)
				this.currentSlide = this.totalSlides - 1;
			if (this.currentSlide >= this.totalSlides) this.currentSlide = 0;
			this.animate(0);
		});

		this.containerElem.addEventListener('pointerenter', () => {
			this.stop();
		});
		this.containerElem.addEventListener('pointerleave', () => {
			this.play();
		});

		sliderNavigation.append(...this.bulletElems);
		this.containerElem.append(sliderNavigation);

		this.sliderElem.prepend(
			this.slidesElems[this.totalSlides - 1].cloneNode(true)
		);
		this.sliderElem.append(this.slidesElems[0].cloneNode(true));

		if (this.isBigSlider) {
			this.sliderElem.style.transform = `translateX(133.33%)`;
			this.sliderElem.prepend(
				this.slidesElems[this.totalSlides - 2].cloneNode(true)
			);
			this.sliderElem.append(this.slidesElems[1].cloneNode(true));
		}

		this.animate = this.animate.bind(this);
		this.prev = this.prev.bind(this);
		this.next = this.next.bind(this);
		this.goto = this.goto.bind(this);
		this.play = this.play.bind(this);

		this.prevBtn.addEventListener('click', e => {
			e.preventDefault();
			this.stop();
			this.prev();
			this.play();
		});
		this.nextBtn.addEventListener('click', e => {
			e.preventDefault();
			this.stop();
			this.next();
			this.play();
		});
	}

	animate(ms = this.animationDuration) {
		const cMod =
			((this.currentSlide % this.totalSlides) + this.totalSlides) %
			this.totalSlides;

		this.sliderElem.style.transitionDuration = `${ms}ms`;
		/* 		this.sliderElem.style.transform = `translateX(${
			(-this.currentSlide - 1) * 100
		}%)`; */
		this.translateSlideToCenter();

		this.slidesElems.forEach((slide, i) =>
			slide.classList.toggle('is-active', cMod === i)
		);
		this.bulletElems.forEach((bulletBtn, i) =>
			bulletBtn.classList.toggle('is-active', cMod === i)
		);
	}

	prev() {
		if (this.currentSlide <= -1) return;
		this.currentSlide -= 1;
		this.animate();
	}

	next() {
		if (this.currentSlide >= this.totalSlides) return; // prevent blanks on fast next-click
		this.currentSlide += 1;
		this.animate();
	}

	goto(index) {
		this.currentSlide = index;
		this.animate();
	}

	play() {
		this.autoSlideIntvId = setInterval(
			this.next,
			this.animationSleep + this.animationDuration
		);
	}

	stop() {
		clearInterval(this.autoSlideIntvId);
	}

	translateSlideToCenter() {
		const translateAmount = this.calcTranslateAmount(this.isBigSlider);

		this.sliderElem.style.transform = `translateX(${
			(-this.currentSlide - 1) * translateAmount
		}%)`;
	}

	calcTranslateAmount(isBigSlider) {
		const mod = this.calcSlideMod(this.currentSlide, this.totalSlides);

		if (isBigSlider) {
			return (1 / 3) * 100;
		} else {
			return 100;
		}
	}

	calcSlideMod(currentIndex, totalSlides) {
		return ((currentIndex % totalSlides) + totalSlides) % totalSlides;
	}
}

function createElement(tag, prop) {
	return Object.assign(document.createElement(tag), prop);
}
