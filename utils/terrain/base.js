var webGLCapable = false;

function checkWebGL() {

	if(!window.WebGLRenderingContext)
		return false;

	var canvas = $('<canvas></canvas>').appendTo('body');
	if(!canvas[0].getContext('webgl'))
		return false;

	return true;
}

var size = 150;
var size2 = size * size;

var time = 0;

var data = {};

function insertDemo(container, task) {

   container.addClass('notClicked');
   container.append('<p>Click and be patient ...</p>');

   container.click(function() {

		var worker = new Worker('/utils/terrain/worker.js');

		worker.onmessage = function(event) {

			var heightMap = event.data;

			drawHeightMap(container, heightMap);
			drawTerrain(container, heightMap);

			worker.terminate();
		};

		worker.postMessage(task);

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

function drawTerrain(container, noise) {

   var renderer = webGLCapable ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
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

	var terrainGeo = new THREE.Geometry();

	var cubeGeo = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);

	for(var i = 0; i < size2; ++i) {

		var cube = new THREE.Mesh(cubeGeo);
		cube.scale.y = Math.floor(noise[i] * 30);
		cube.position.x = i % size - size / 2;
		cube.position.y = cube.scale.y / 2;
		cube.position.z = Math.floor(i / size) - size / 2;

		THREE.GeometryUtils.merge(terrainGeo, cube);
	}

	var terrainMesh = new THREE.Mesh(terrainGeo, material);
	terrainMesh.rotation.y = Math.PI / 4;
	scene.add(terrainMesh);

   // Store specific data.
   var id = container.attr('id');
   data[id] = {};
   data[id].renderer = renderer;
   data[id].scene = scene;
   data[id].camera = camera;

   container.removeClass('notClicked');
   $('p', container).remove();

	if(webGLCapable)
		animate();
	else
		renderer.render(scene, camera);
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

		data[i].camera.position.x = sint;
		data[i].camera.position.z = cost;
		data[i].camera.lookAt(data[i].scene.position);

		data[i].renderer.render(data[i].scene, data[i].camera);
   }
}
