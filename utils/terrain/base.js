var webGLCapable = false;

var size = 100;
var size2 = size * size;

var time = 0;

var data = {};

function insertDemo($container, task) {

   $container.addClass('notClicked');
   $container.append('<p>Click...</p>');

   var id = $container.attr('id');
   data[id] = {};
	data[id].map = [];

	buildHeightMap($container);
	buildTerrain($container);

   $container.click(function() {

		var worker = new Worker('/utils/terrain/worker.js');

		task.index = 0;

		worker.onmessage = function(event) {

			data[id].map.push(event.data.height);

			updateHeightMap($container);
			updateTerrain($container);

			// Process the next pixel.
			++task.index;
			if(task.index < size2)
				worker.postMessage(task);
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

	var map = data[id].map;
	var height = map[map.length - 1];
	var ctxt = data[id].ctxt;

	// Compute the pixel color.
	var c = Math.floor(height * 255);
	ctxt.fillStyle = 'rgb('+c+','+c+','+c+')';

	// Draw.
	var x = map.length % size;
	var y = Math.floor(map.length / size);
	ctxt.fillRect(x, y, 1, 1);
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

	var terrainGeometry = new THREE.Geometry();

   // Store specific data.
   data[id].renderer = renderer;
   data[id].scene = scene;
   data[id].camera = camera;
	data[id].material = material;
	data[id].geometry = terrainGeometry;

   $container.removeClass('notClicked');
   $('p', $container).remove();

	if(webGLCapable)
		animate();
	else
		renderer.render(scene, camera);
}

function updateTerrain($container) {

   var id = $container.attr('id');

	var map = data[id].map;
	var height = map[map.length - 1];
	var index = map.length - 1;

	var scene = data[id].scene;
	var camera = data[id].camera;
	var material = data[id].material;
	var terrainGeometry = data[id].geometry;

	scene.remove(data[id].mesh);

	var cubeGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);

	var cubeMesh = new THREE.Mesh(cubeGeometry, material);
	cubeMesh.scale.y = Math.floor(height * 30);
	cubeMesh.position.x = index % size - size / 2;
	cubeMesh.position.y = cubeMesh.scale.y / 2;
	cubeMesh.position.z = Math.floor(index / size) - size / 2;

	THREE.GeometryUtils.merge(terrainGeometry, cubeMesh);

	var terrainMesh = new THREE.Mesh(terrainGeometry, material);
	terrainMesh.rotation.y = Math.PI / 4;

	scene.add(terrainMesh);

	--x;
	if(x == 0) {
		data[id].renderer.render(scene, camera);
		x = 1000;
	}

	data[id].mesh = terrainMesh;
}
var x = 1000; //TODO

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

		data[i].camera.position.x = sint;
		data[i].camera.position.z = cost;
		data[i].camera.lookAt(data[i].scene.position);

		data[i].renderer.render(data[i].scene, data[i].camera);
   }
}

$(function() {

	webGLCapable = (function checkWebGL() {

		if(!window.WebGLRenderingContext)
			return false;

		var canvas = $('<canvas></canvas>').appendTo('body');
		if(!canvas[0].getContext('webgl'))
			return false;

		canvas.remove();

		return true;
	})();

   insertDemo($('#try1'), {type: 'random'});
   insertDemo($('#try2'), {type: 'octave', k: 4});
   insertDemo($('#try3'), {type: 'value', k: 7});
});
