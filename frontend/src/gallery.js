export class Gallery {
	animationDuration = 500;
	animationSleep = 1500;
	currentImgIndex = 0;

	displayElem;
	thumbContainerElem;
	thumbsElems;
	thumbCount;
	currentImg;
	prevImg;
	intvId;

	constructor() {
		this.displayElem = document.querySelector('[data-gallery-display]');
		this.thumbContainerElem = document.querySelector(
			'[data-gallery-thumbs]'
		);
		this.thumbsElems = this.thumbContainerElem.querySelectorAll('img');
		this.thumbCount = this.thumbsElems.length;

		// Create current img element
		this.currentImg = this.createImageFromThumb(this.thumbsElems[0]);
		this.currentImg.dataset.galleryActiveImage = 'current';

		this.animate = this.animate.bind(this);
		this.goto = this.goto.bind(this);
		this.next = this.next.bind(this);

		this.thumbsElems.forEach((thumb, i) =>
			thumb.addEventListener('click', () => this.goto(i))
		);

		this.animate();
	}

	animate(ms = this.animationDuration) {
		const indexMod = this.currentImgIndex % this.thumbCount;
		const duration = Math.round(ms / 2);
		const delay = Math.round(duration / 2);

		this.currentImg.dataset.galleryActiveImage = 'prev';
		this.prevImg = this.currentImg;

		let existingImg = this.displayElem.querySelector(
			`[data-gallery-image-index="${indexMod}"]`
		);

		if (!existingImg) {
			this.currentImg = this.createImageFromThumb(
				this.thumbsElems[this.currentImgIndex]
			);
			this.currentImg.dataset.galleryImageIndex = indexMod;
			this.displayElem.append(this.currentImg);
		} else {
			this.currentImg = existingImg;
		}

		this.currentImg.dataset.galleryActiveImage = 'current';
		this.currentImg.style.animationDuration = duration;
		this.currentImg.style.animationName = 'galleryImageIn';
		this.currentImg.style.animationDelay = delay;

		this.prevImg.style.animationDuration = duration;
		this.prevImg.style.animationName = 'galleryImageOut';

		this.thumbsElems.forEach((thumb, i) =>
			thumb.classList.toggle('active', indexMod === i)
		);

		this.currentImg.addEventListener(
			'animationend',
			() => {
				if (this.currentImgIndex <= -1)
					this.currentImgIndex = this.thumbCount - 1;
				else if (this.currentImgIndex >= this.thumbCount)
					this.currentImgIndex = 0;
				this.animate;
			},
			{
				once: true,
			}
		);
		this.scrollThumbIntoView();
	}

	goto(index) {
		clearInterval(this.intvId);
		this.currentImgIndex = index;
		this.animate(0);
		this.play();
	}

	next() {
		if (this.currentImgIndex >= this.thumbCount) return;
		this.currentImgIndex += 1;
		this.animate();
	}

	play() {
		this.intvId = setInterval(
			this.next,
			this.animationDuration + this.animationSleep
		);
	}

	createImageFromThumb(thumbElement) {
		let imgElem = thumbElement.cloneNode();
		imgElem.setAttribute('width', '400');
		imgElem.setAttribute('height', '225');
		imgElem.classList.add('gallery-image', 'animate');
		imgElem.classList.remove('gallery-thumb', 'brightness-75');

		return imgElem;
	}

	scrollThumbIntoView() {
		let scrollLeft = this.thumbContainerElem.scrollLeft;
		let parentPos = this.thumbContainerElem.getBoundingClientRect();
		let childPos =
			this.thumbsElems[
				this.currentImgIndex % this.thumbCount
			].getBoundingClientRect();
		let offset = childPos.left - parentPos.left + scrollLeft;

		this.thumbContainerElem.scrollLeft =
			offset - (parentPos.width * 0.5 - childPos.width * 0.5);
	}
}

function easeInOutQuad(t) {
	return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
