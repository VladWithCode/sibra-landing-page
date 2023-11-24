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
	viewPortContainer.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI / 2;
	controls.addEventListener('change', () => renderer.render(scene, camera));
	controls.update();

	scene.add(ambientLight);
	scene.add(hemisphericLight);

	loader.load(
		'/render/scene.gltf',
		function (gltf) {
			const model = gltf.scene;
			scene.add(model);
			model.scale.set(0.5, 0.5, 0.5);

			controls.target.set(0, 0.5, 0);

			renderer.render(scene, camera);
		},
		onRenderLoadProgress,
		onRenderLoadError
	);
}

function onRenderLoadSuccess(gltf, scene, camera, renderer) {}

function onRenderLoadProgress(xhr) {}

function onRenderLoadError(error) {
	console.error(error);
}
