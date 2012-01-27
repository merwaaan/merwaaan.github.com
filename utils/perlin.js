var size = 150;

function randomNoise() {

	var array = [];

	for(var i = 0, l = size * size; i < l; ++i)
		array[i] = Math.random();

	return array;
}

function interpolate(x0, x1, blend) {

	//return x0 * (1 - blend) + blend * x1;

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

		sumAmplitude += amplitude;

		for(var i in perlin)
			perlin[i] += arrays[k][i] * amplitude;

		amplitude *= 0.4;
	}

	for(var i in perlin)
		perlin[i] /= sumAmplitude;

	return perlin;
}

function insertDemo(container, heightMap) {

	drawHeightMap(container, heightMap);
	drawTerrain(container, heightMap, true);
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

function drawTerrain(container, noise, blocks) {

	var renderer = new THREE.CanvasRenderer();
	renderer.setSize(500, 400);

	container.append(renderer.domElement);

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
	camera.position.x = -200;
	camera.position.y = 130;
	camera.position.z = 200;
	camera.lookAt({x: 0, y: 0, z: 0});
	scene.add(camera);

	var light = new THREE.PointLight(0xFFFFFF);
	light.position.x = 100;
	light.position.y = 100;
	light.rotation.z = -70 * Math.PI / 180;
	light.intensity = 5;
	scene.add(light);

	var image = new Image();
	image.src = '/images/terrain_texture.jpg';

	var texture = new THREE.Texture(image);

	var material = new THREE.MeshLambertMaterial({
		map: texture,
		wireframe: false
	});

	if(blocks) {

		var cubeGeo = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);

		for(var i = 0, l = size * size; i < l; ++i) {

			var cube = new THREE.Mesh(cubeGeo, material);
			cube.scale.y = Math.floor(noise[i] * 30);
			cube.position.x = i % size - size / 2;
			cube.position.y = cube.scale.y / 2;
			cube.position.z = Math.floor(i / size) - size / 2;

			scene.add(cube);
		}
	}
	else {

		var planeGeo = new THREE.PlaneGeometry(size, size, size - 1, size - 1);
		for(var i = 0, l = size * size; i < l; ++i)
			planeGeo.vertices[i].position.z = noise[i] * 50;
		planeGeo.computeCentroids();

		var terrain = new THREE.Mesh(planeGeo, material);
		terrain.rotation.x = -70 * Math.PI / 180;
		terrain.rotation.z = 180 * Math.PI / 180
		scene.add(terrain);
	}

   image.onload = function(){
		renderer.render(scene, camera);
   };
}

$(function() {

	var noise = randomNoise();

	insertDemo($('#try1'), randomNoise());
	insertDemo($('#try2'), octave(4, randomNoise()));
	insertDemo($('#try3'), perlinNoise());
});
