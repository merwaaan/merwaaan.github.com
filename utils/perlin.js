var size = 200;

function randomNoise() {

	var array = [];

	for(var i = 0, l = size * size; i < l; ++i)
		array[i] = Math.random();

	return array;
}

function interpolate(x0, x1, blend) {

	return x0 * (1 - blend) + blend * x1;

	var blend2 = (1 - Math.cos(blend * Math.PI)) / 2;
	return x0 * (1 - blend2) + x1 * blend2;
}

function octave(k, source) {

	var wavelength = Math.pow(2, k);
	var frequency = 1 / wavelength;

	var array = [];

	for(var i = 0; i < size; ++i) {

		var i0 = Math.floor(i / wavelength) * wavelength;
		var i1 = (i0 + wavelength) % size;
		var blend_i = (i - i0) * frequency;

		for(var j = 0; j < size; ++j) {

			var j0 = Math.floor(j / wavelength) * wavelength;
			var j1 = (j0 + wavelength) % size;
			var blend_j = (j - j0) * frequency;

			var top = interpolate(
				source[i0 * size + j0],
				source[i0 * size + j1],
				blend_j);

			var bottom = interpolate(
				source[i1 * size + j0],
				source[i1 * size + j1],
				blend_j);

			array[i * size + j] = interpolate(top, bottom, blend_i);
		}
	}

	return array;
}

function perlinNoise() {

	var noise = randomNoise();

	var arrays = [noise];
	for(var i = 1; i < 7; ++i)
		arrays.push(octave(i, noise));
	arrays.reverse();

	var perlin = [];
	for(var i in noise)
		perlin.push(0);

	var amplitude = 1;
	var sumAmplitude = 0;

	for(var k = 0; k < arrays.length; ++k) {

		amplitude *= 0.7;
		sumAmplitude += amplitude;

		for(var i in perlin)
			perlin[i] += arrays[k][i] * amplitude;
	}

	for(var i in perlin)
		perlin[i] /= sumAmplitude;

	return perlin;
}

function insertDemo(container, heightMap) {

	drawHeightMap(container, heightMap);
	drawTerrain(container, heightMap);
}

function drawHeightMap(container, noise) {

	var canvas = $('<canvas width="' + size + '" height="' + size + '"></canvas>').appendTo(container);
	var ctxt = canvas[0].getContext('2d');

	for(var i = 0; i < size; ++i)
		for(var j = 0; j < size; ++j) {

			var c = Math.floor(noise[i * size + j] * 255);
			ctxt.fillStyle = 'rgb('+c+','+c+','+c+')';

			ctxt.fillRect(j, i, 1, 1);
		}
}

function drawTerrain(container, noise) {

	var renderer = new THREE.CanvasRenderer();
	renderer.setSize(500, 500);

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
	camera.position.z = 400;
	camera.rotation.x = -5 * Math.PI / 180
	scene.add(camera);

	container.append(renderer.domElement);

	var planeGeo = new THREE.PlaneGeometry(200, 200, size - 1, size - 1);
	for(var i = 0, l = size * size; i < l; ++i)
		planeGeo.vertices[i].position.z = noise[i] * 50;
	console.log(noise.length, planeGeo.vertices.length);

	planeGeo.computeCentroids();

	var material = new THREE.MeshLambertMaterial({color: 0xCC0000});

	var terrain = new THREE.Mesh(planeGeo, material);
	terrain.rotation.x = -70 * Math.PI / 180;
	scene.add(terrain);

	renderer.render(scene, camera);
}

$(function() {

	var noise = randomNoise();

	insertDemo($('#try1'), randomNoise());
	insertDemo($('#try2'), perlinNoise());
});
