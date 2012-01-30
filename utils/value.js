var size = 150;
var size2 = size * size;

var time = 0;

var data = {};

function linear(a, b, x) {

   return a * (1 - x) + x * b;
}

function cosine(a, b, x) {

   var y = (1 - Math.cos(x * Math.PI)) / 2;

   return a * (1 - y) + b * y;
}

var interpolate = cosine;

function randomNoise() {

   var array = [];

   for(var i = 0; i < size2; ++i)
		array[i] = Math.random();

   return array;
}

function octave(k, source) {

   var wavelength = Math.pow(2, k);
   var frequency = 1 / wavelength;

   var result = [];

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

			result[i * size + j] = interpolate(top, bottom, blend_i);
		}
   }

   return result;
}

function valueNoise(noise) {

	// Generate and store octaves.

   var octaves = [noise];

   for(var i = 1; i < 6; ++i)
		octaves[i] = octave(i, noise);

   octaves.reverse();

	// Initialize the result grid with values from the last octave.

   var result = [];

   for(var i in octaves[0])
		result[i] = octaves[0][i];

	// Add each other octaves with respect to the persistence.

   var persistence = 0.4;
	var amplitude = 1;
   var sumAmplitude = amplitude;

   for(var i = 1; i < octaves.length; ++i) {

		// Decrease the amplitude.
		amplitude = Math.pow(persistence, i);

		for(var j in result)
			result[j] += octaves[i][j] * amplitude;

		sumAmplitude += amplitude;
   }

	// Normalize the height values.

   for(var i in result)
		result[i] /= sumAmplitude;

   return result;
}

function insertDemo(container, heightMap) {

   container.addClass('notClicked');
   container.append('<p>Click and be patient ...</p>');

   container.click(function() {

		drawHeightMap(container, heightMap);
		drawTerrain(container, heightMap, true);

		container.unbind('click');
   });
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

   var renderer = new THREE.WebGLRenderer();
   renderer.setSize(500, 400);

   container.append(renderer.domElement);

   var scene =  new THREE.Scene();

   var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
   camera.position.y = 130;
   camera.position.z = 200;
   camera.lookAt({x: 0, y: 0, z: 0});
   scene.add(camera);

   var light = new THREE.PointLight(0xFFFFFF);
   light.position.x = -200;
   light.position.y = 200;
   light.lookAt(scene.position);
   light.intensity = 1;
   scene.add(light);

   var material = new THREE.MeshLambertMaterial({
		color: 0x00AA00
   });

   if(blocks) {

		var terrainGeo = new THREE.Geometry();

		var cubeGeo = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);

		for(var i = 0, l = size * size; i < l; ++i) {

			var cube = new THREE.Mesh(cubeGeo);
			cube.scale.y = Math.floor(noise[i] * 30);
			cube.position.x = i % size - size / 2;
			cube.position.y = cube.scale.y / 2;
			cube.position.z = Math.floor(i / size) - size / 2;

			THREE.GeometryUtils.merge(terrainGeo, cube);
		}

		var terrainMesh = new THREE.Mesh(terrainGeo, material);
		scene.add(terrainMesh);
   }
   else {

		var planeGeo = new THREE.PlaneGeometry(size, size, size - 1, size - 1);
		for(var i = 0, l = size * size; i < l; ++i)
			planeGeo.vertices[i].position.z = noise[i] * 30;
		planeGeo.computeCentroids();

		var terrainMesh = new THREE.Mesh(planeGeo, material);
		terrainMesh.rotation.x = -90 * Math.PI / 180;
		scene.add(terrainMesh);
   }

   // Store specific data.
   var id = container.attr('id');
   data[id] = {};
   data[id].renderer = renderer;
   data[id].scene = scene;
   data[id].camera = camera;

   container.removeClass('notClicked');
   $('p', container).remove();

   animate();
}

window.requestAnimationFrame = (function(){
   return  window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element) {
			window.setTimeout(callback, 1000 / 20);
		};
})();

function animate() {

   window.requestAnimationFrame(animate);

   time += 0.001;

   var sint = Math.sin(time) * 200;
   var cost = Math.cos(time) * 200;

   for(var i in data) {

		data[i].camera.position.x = sint;
		data[i].camera.position.z = cost;
		data[i].camera.lookAt(data[i].scene.position);

		data[i].renderer.render(data[i].scene, data[i].camera);
   }
}

$(function() {

   var noise = randomNoise();

   insertDemo($('#try1'), noise);
   insertDemo($('#try2'), octave(5, noise));
   insertDemo($('#try3'), valueNoise(noise));
});
