import * as Three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 *
 * @param {string | HTMLCanvasElement} element - The element in which the plan will be rendered
 * @param {} options
 */
export default function loadPlan() {
	const viewPortContainer = document.getElementById('plan-render-container');
	const { height: vpHeight, width: vpWidth } =
		viewPortContainer.getBoundingClientRect();

	const loader = new GLTFLoader();
	const scene = new Three.Scene();
	scene.background = new Three.Color(0xffeaa7);

	const camera = new Three.PerspectiveCamera(
		75,
		vpWidth / vpHeight,
		0.1,
		1000
	);
	camera.position.set(10, 5, 10);
	camera.lookAt(scene.position);

	const ambientLight = new Three.AmbientLight(0x404040, 0.1);
	const hemisphericLight = new Three.HemisphereLight(0xffffbb, 0x080820, 0.8);
	hemisphericLight.position.set(0, 430, -2500);

	const renderer = new Three.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(vpWidth, vpHeight);
	renderer.outputColorSpace = Three.SRGBColorSpace;

	// Add data attr to dispose of element later
	renderer.domElement.id = 'render-dom-element';
	viewPortContainer.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI / 2;
	controls.addEventListener('change', () => renderer.render(scene, camera));
	controls.update();

	scene.add(ambientLight);
	scene.add(hemisphericLight);

	const loadingScreen = document.querySelector(
		'[data-render-loading-screen]'
	);
	const loadingBar = document.querySelector('[data-render-loading-bar]');
	let loadedModel;

	if (loadedModel) {
		scene.add(loadedModel);
		renderer.render(scene, camera);
	} else {
		loader.load(
			'/render/scene.gltf',
			function (gltf) {
				const model = gltf.scene;
				loadedModel = model;
				scene.add(model);
				model.scale.set(0.5, 0.5, 0.5);

				controls.target.set(0, 0.5, 0);

				renderer.render(scene, camera);
				loadingScreen.classList.add('fadeOut');
			},
			function (xhr) {
				const percentage = Math.round((xhr.loaded / xhr.total) * 100);

				loadingBar.style = 'width: ' + percentage + '%';
			},
			console.error
		);
	}

	return function dispose() {
		if (loadedModel) scene.remove(loadedModel);
		document.querySelector('#render-dom-element').remove();
		loadingScreen.classList.remove('fadeOut');
		loadingBar.style = 'width: 0%';
		viewPortContainer.appendChild(loadingScreen);
	};
}
