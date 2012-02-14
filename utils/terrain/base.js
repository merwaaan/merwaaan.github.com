var webGLCapable = false;

var size = 150;
var size2 = size * size;

var time = 0;

var data = {};

function insertDemo($container, task) {

   $container.addClass('notClicked');
   $container.append('<p>Click...</p>');

   var id = $container.attr('id');
   data[id] = {};
	data[id].map = [];
	data[id].toDraw = [];

   $container.click(function() {

		// Prepare a canvas and set up the 3D scene.
		buildHeightMap($container);
		buildTerrain($container);

		$container.removeClass('notClicked');
		$('p', $container).remove();

		var worker = new Worker('/utils/terrain/worker.js');

		task.size = size;
		task.index = 0;

		worker.onmessage = function(event) {

			data[id].toDraw.push(event.data.height);

			if(data[id].toDraw.length > 5) {

				// Update the canvas.
				updateHeightMap($container);

				// Move pixels to draw to the drawn list.
				for(var i in data[id].toDraw)
					data[id].map.push(data[id].toDraw[i]);
				data[id].toDraw = [];
			}

			// Process the next pixels.
			++task.index;
			if(task.index < size2 - 1)
				worker.postMessage(task);
			else {
				worker.terminate();
				updateTerrain($container);
				data[id].animable = true;
			}
		};

		worker.postMessage(task);

		$container.unbind('click');
   });
}

function buildHeightMap($container) {

	var id = $container.attr('id');

   var $canvas = $('<canvas width="' + size + '" height="' + size + '"></canvas>').appendTo($container);
   var ctxt = $canvas[0].getContext('2d');

	data[id].ctxt = ctxt;
}

function updateHeightMap($container) {

	var id = $container.attr('id');

	var ctxt = data[id].ctxt;

	var map = data[id].map;
	var toDraw = data[id].toDraw;

	for(var i = 0; i < toDraw.length; ++i) {

		var height = toDraw[i];

		// Compute the pixel color.
		var c = Math.floor(height * 255);
		ctxt.fillStyle = 'rgb('+c+','+c+','+c+')';

		// Compute the pixel position.
		var index = map.length + i;
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

function updateTerrain($container) {

   var id = $container.attr('id');

	var map = data[id].map;

	var scene = data[id].scene;
	var camera = data[id].camera;
	var material = data[id].material;

	var terrainGeometry = new THREE.Geometry();
	var cubeGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);

	for(var i = 0; i < map.length; ++i) {

		var height = map[i];

		var x = i % size;
		var y = Math.floor(i / size);

		var cubeMesh = new THREE.Mesh(cubeGeometry, material);
		cubeMesh.scale.y = Math.floor(height * 60);
		cubeMesh.position.x = x - size / 2;
		cubeMesh.position.y = cubeMesh.scale.y / 2;
		cubeMesh.position.z = y - size / 2;

		THREE.GeometryUtils.merge(terrainGeometry, cubeMesh);
	}

	var terrainMesh = new THREE.Mesh(terrainGeometry, material);
	terrainMesh.rotation.y = Math.PI / 4;
	scene.add(terrainMesh);

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

   time += 0.001;

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

	webGLCapable = (function() {

		if(!window.WebGLRenderingContext)
			return false;

		var canvas = $('<canvas></canvas>').appendTo('body');
		if(!canvas[0].getContext('webgl'))
			return false;

		//canvas.remove();

		return true;
	})();

   insertDemo($('#try1'), {type: 'random'});
   insertDemo($('#try2'), {type: 'octave', k: 4});
   insertDemo($('#try3'), {type: 'value', k: 7});

	if(webGLCapable)
		animate();
});
