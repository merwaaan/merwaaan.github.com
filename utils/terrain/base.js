var webGLCapable = false;

var size = 128;
var size2 = size * size;

var time = 0;

var cache = [];

var data = {};

function insertDemo($container, task) {

   $container.addClass('notClicked');
   $container.append('<p>Click...</p>');

   var id = $container.attr('id');
   data[id] = {};

   $container.click(function() {

		$container.unbind('click');

		// Prepare a canvas and set up the 3D scene.
		buildHeightMap($container);
		buildTerrain($container);

		$container.removeClass('notClicked');
		$('p', $container).remove();

		var worker = new Worker('/utils/terrain/worker.js');

		task.size = size;
		task.index = 0;
		task.chunk = 512;
		task.cache = cache;

		worker.onmessage = function(event) {

			var answer = event.data;

			// Update the displays.
			updateHeightMap($container, answer.task.index, answer.heights);
			updateTerrain($container, answer.task.index, answer.heights);

			// Update the cache.
			cache = event.data.cache;

			// Process the next pixels or stop.
			answer.task.index = answer.next;

			if(answer.task.index < size2 - 1)
				worker.postMessage(answer.task);
			else {
				worker.terminate();
				data[id].animable = true;
			}
		};

		worker.postMessage(task);
   });
}

function buildHeightMap($container) {

	var id = $container.attr('id');

   var $canvas = $('<canvas width="' + size + '" height="' + size + '"></canvas>').appendTo($container);
   var ctxt = $canvas[0].getContext('2d');

	data[id].ctxt = ctxt;
}

function updateHeightMap($container, startIndex, heights) {

	var id = $container.attr('id');

	var ctxt = data[id].ctxt;

	for(var i = 0, l = heights.length; i<l; ++i) {

		var height = heights[i];

		// Compute the pixel color.
		var c = Math.floor(height * 255);
		ctxt.fillStyle = 'rgb('+c+','+c+','+c+')';

		// Compute the pixel position.
		var index = startIndex + i;
		var x = index % size;
		var y = Math.floor(index / size);

		ctxt.fillRect(x, y, 1, 1);
	}
}

function buildTerrain($container) {

   var id = $container.attr('id');

   var renderer = webGLCapable ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
   renderer.setSize(500, 400);

   $container.append(renderer.domElement);

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

   // Store specific data.
   data[id].renderer = renderer;
   data[id].scene = scene;
   data[id].camera = camera;
	data[id].material = material;
}

function updateTerrain($container, startIndex, heights) {

   var id = $container.attr('id');

	var scene = data[id].scene;
	var camera = data[id].camera;
	var material = data[id].material;

	var terrainGeometry = new THREE.Geometry();
	var cubeGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);

	for(var i = 0, l = heights.length; i < l; ++i) {

		var height = heights[i];

		var index = startIndex + i;
		var x = index % size;
		var y = Math.floor(index / size);

		var cubeMesh = new THREE.Mesh(cubeGeometry, material);
		cubeMesh.scale.y = Math.floor(height * 60);
		cubeMesh.position.x = x - size / 2;
		cubeMesh.position.y = cubeMesh.scale.y / 2;
		cubeMesh.position.z = y - size / 2;

		scene.add(cubeMesh);
	}

	data[id].renderer.render(scene, camera);
}

window.requestAnimationFrame = (function(){
   return window.requestAnimationFrame ||
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

   time += 0.01;

   var sint = Math.sin(time) * 200;
   var cost = Math.cos(time) * 200;

   for(var i in data) {

		if(!data[i].animable)
			continue;

		data[i].camera.position.x = sint;
		data[i].camera.position.z = cost;
		data[i].camera.lookAt(data[i].scene.position);

		data[i].renderer.render(data[i].scene, data[i].camera);
   }
}

$(function() {

	// Check for WebGL compatibility.

	webGLCapable = (function() {

		if(!window.WebGLRenderingContext)
			return false;

		var canvas = $('<canvas></canvas>').appendTo('body');

		var contexts = ['webgl', 'experimental-webgl'];
		for(var i in contexts)
			if(canvas[0].getContext(contexts[i]))
				return true;

		canvas.remove();

		return false;
	})();

	console.log('webGL capable =', webGLCapable);

	// Add the demos to the page.

   insertDemo($('#try1'), {type: 'r'});
   insertDemo($('#try2'), {type: 'o', k: 4});
	insertDemo($('#try3'), {type: 'v', k: 7});

	// Spin the terrain if possible.
	if(webGLCapable)
		animate();
});
