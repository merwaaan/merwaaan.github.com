var scene =
[
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,4,0,4,0,4,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,4,0,4,0,4,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,4,0,4,0,4,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

var colors = ['grey','blue','red','green','orange'];

var tileSize = 10;

var player = {
	pos: new Vector2(5,15),
	dir: new Vector2(0,1)
};

var cameraPlane = {
	dir: new Vector2(1,0),
	distance: 2,
	width: 3,
	resolution: 100
};

window.addEventListener('load', function() {

	var viewCanvas = document.querySelector('#view');
	var viewContext = viewCanvas.getContext('2d');

	var mapCanvas = document.querySelector('#map');
	mapCanvas.width = scene[0].length * tileSize;
	mapCanvas.height = scene.length * tileSize;
	var mapContext = mapCanvas.getContext('2d');

	draw(viewContext, mapContext);

	// Controls.

	window.addEventListener('keydown', function(event) {

		if(event.which == 38)
			movePlayer(0.5);
		else if(event.which == 40)
			movePlayer(-0.5);
		else if(event.which == 37)
			rotatePlayer(-Math.PI/10);
		else if(event.which == 39)
			rotatePlayer(Math.PI/10);

		draw(viewContext, mapContext);
	});

	document.querySelector('#cameraPlaneDistance').addEventListener('change', function(event) {
		cameraPlane.distance = event.target.value;
		draw(viewContext, mapContext);
	});

	document.querySelector('#cameraPlaneWidth').addEventListener('change', function(event) {
		cameraPlane.width = event.target.value;
		draw(viewContext, mapContext);
	});

	document.querySelector('#cameraPlaneResolution').addEventListener('change', function(event) {
		cameraPlane.resolution = event.target.value;
		draw(viewContext, mapContext);
	});

});

function movePlayer(amplitude) {
	if(ray(player.pos.copy(), player.dir.copy()).distance > 1)
		player.pos.add(player.dir.copy().scale(amplitude));
}

function rotatePlayer(amplitude) {
	player.dir.rotate(amplitude);
	cameraPlane.dir = player.dir.copy().rotate(Math.PI/2);
}

function draw(viewContext, mapContext) {
	drawView(viewContext);
	drawMap(mapContext);
}

function drawView(context) {

	var columnWidth = context.canvas.width / cameraPlane.resolution;

	// Clear the canvas.

	context.fillStyle = colors[0];
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	// Draw each vertical line.

	for(var column = 0; column < cameraPlane.resolution; ++column) {

		// Compute the direction of the ray.

		var cameraPlaneLeft = player.pos.copy().add(player.dir.copy().scale(cameraPlane.distance)).add(cameraPlane.dir.copy().scale(-cameraPlane.width/2));
		var cameraPlanePoint = cameraPlaneLeft.add(cameraPlane.dir.copy().scale(column * cameraPlane.width / cameraPlane.resolution));
		var rayDir = cameraPlanePoint.copy().sub(player.pos);

		// Go, ray. You're free now.

		var wallInfo = ray(player.pos, rayDir);

		// Draw the encountered wall.

		context.fillStyle = colors[wallInfo.type];
		
		var wallHeight = (1 / wallInfo.distance) * context.canvas.height;
		context.fillRect(column * columnWidth, (context.canvas.height - wallHeight) / 2, columnWidth, wallHeight);
	}
}

function ray(pos, dir) {

	var shift = dir.copy().normalize().scale(0.05);
	var currentPos = pos.copy();

	for(var i = 0; i < 1000; ++i) {
		
		currentPos.add(shift);

		var x = Math.floor(currentPos.x);
		var y = Math.floor(currentPos.y);

		if(scene[y][x] !== 0)
			return {
					distance: shift.scale(i+1).length(),
					type: scene[y][x]
				};
	}

	console.log('oops');
}

function drawMap(context) {

	var tileWidth = context.canvas.width / scene.length;
	var tileHeight = context.canvas.width / scene[0].length;
	var tileSize = tileWidth < tileHeight ? tileWidth : tileHeight;

	// Draw tiles.

	scene.forEach(function(line, y) {
		line.forEach(function(tile, x) {
			context.fillStyle = colors[tile];
			context.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
		});
	});

	// Draw player.

	context.fillStyle = 'black';

	playerCanvasPos = player.pos.copy().scale(tileSize);

  context.beginPath();
  context.arc(playerCanvasPos.x, playerCanvasPos.y, tileWidth/4, 0, 2 * Math.PI, false);
	context.closePath();
  context.fill();

	// Draw FOV.

	context.fillStyle = 'rgba(255,255,0,0.5)';

	var cameraPlaneCanvasPos = playerCanvasPos.copy().add(player.dir.copy().scale(cameraPlane.distance*tileSize));
	var FOV1CanvasPos = cameraPlaneCanvasPos.copy().add(cameraPlane.dir.copy().scale(cameraPlane.width/2*tileSize));
	var FOV2CanvasPos = cameraPlaneCanvasPos.add(cameraPlane.dir.copy().negate().scale(cameraPlane.width/2*tileSize));

  context.beginPath();
	context.moveTo(playerCanvasPos.x, playerCanvasPos.y);
	context.lineTo(FOV1CanvasPos.x, FOV1CanvasPos.y);
	context.lineTo(FOV2CanvasPos.x, FOV2CanvasPos.y);
	context.closePath();
  context.fill();
}

