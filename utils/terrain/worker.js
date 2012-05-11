var size = null;
var size2 = null;

var cache = null;

/**
 * Interpolation functions.
 */

function linear(a, b, x) {

   return a + (b - a) * x;//a * (1 - x) + x * b;
}

function cosine(a, b, x) {

   var y = (1 - Math.cos(x * Math.PI)) / 2;

   return a * (1 - y) + b * y;
}

var interpolate = cosine;

/**
 * Generates the initial noise.
 */

function randomNoise(index) {

 	// Prepare the cache.
	if(!cache[0])
		cache[0] = [];
	// Use the cache if possible.
	else if(cache[0][index])
		return cache[0][index];

	// Or generate a new value.
	var noise = Math.random();

	// And update the cache.
	cache[0][index] = noise;

	return noise;
}

/**
 * Generates the k-th octave.
 */

function octave(k, index) {

	// Prepare the cache.
	if(!cache[k])
		cache[k] = [];
	// Use the cache if possible.
	else if(cache[k][index])
		return cache[k][index];

   var wavelength = Math.pow(2, k);
   var frequency = 1 / wavelength;

	var x = index % size;
	var y = Math.floor(index / size);

	// Compute corner points.
	var x0 = Math.floor(x / wavelength) * wavelength;
	var x1 = (x0 + wavelength) % size;
	var y0 = Math.floor(y / wavelength) * wavelength;
	var y1 = (y0 + wavelength) % size;

	// Compute blending factors.
	var blend_x = (x - x0) * frequency;
	var blend_y = (y - y0) * frequency;

	// Bilinear interpolation.

	var top = interpolate(
		randomNoise(y0 * size + x0),
		randomNoise(y0 * size + x1),
		blend_x);

	var bottom = interpolate(
		randomNoise(y1 * size + x0),
		randomNoise(y1 * size + x1),
		blend_x);

	var height = interpolate(top, bottom, blend_y);

	// Update the cache.
	cache[k][index] = height;

   return height;
}

/**
 * Generates the height map.
 */

function valueNoise(k, index) {

	// Prepare the cache.
	if(!cache[k])
		cache[k] = [];
	// Use the cache if possible.
	else if(cache[k][index])
		return cache[k][index];

	// Generate and store octaves.

   var octaves = [randomNoise(index)];

   for(var i = 1; i < k; ++i)
		octaves[i] = octave(i, index);

   octaves.reverse();

	// Add each octaves with respect to the persistence value.

	var height = octaves[0];

   var persistence = 0.56;
	var amplitude = 1;
   var sumAmplitude = amplitude;

   for(var i = 1; i < octaves.length; ++i) {

		amplitude = Math.pow(persistence, i);

		height += octaves[i] * amplitude;

		sumAmplitude += amplitude;
   }

	// Normalize the height.
	height /= sumAmplitude;

	// Update the cache.
	cache[k][index] = height;

   return height;
}

self.onmessage = function(event) {

	var task = event.data;

	// Retrieve the map dimensions.
	size = task.size;
	size2 = size * size;

	// Retrieve already computed data.
	cache = task.cache;

	var index = task.index;
	var chunk = task.chunk;

	var heights = [];

	for(var i = 0; i < chunk; ++i) {

		var height;

		// Random noise queried.
		if(task.type === 'r')
			height = randomNoise(index + i);
		// Octave k queried.
		else if(task.type === 'o')
			height = octave(task.k, index + i);
		// Final value noise queried.
		else if(task.type === 'v')
			height = valueNoise(task.k, index + i);

		heights.push(height);
	}

	self.postMessage({
		task: task,
		heights: heights,
		cache: cache,
		next: index + chunk
	});
};
