var size = 100;
var size2 = size * size;

var randomSource = null;

function linear(a, b, x) {

   return a * (1 - x) + x * b;
}

function cosine(a, b, x) {

   var y = (1 - Math.cos(x * Math.PI)) / 2;

   return a * (1 - y) + b * y;
}

var interpolate = linear;

function randomNoise() {

	var array = [];

	for(var i = 0; i < size2; ++i)
		array[i] = Math.random();

	return array;
}

function octave(k, source, x, y) {

   var wavelength = Math.pow(2, k);
   var frequency = 1 / wavelength;

	// Compute corner points.

	var y0 = Math.floor(y / wavelength) * wavelength;
	var y1 = (y0 + wavelength) % size;
	var blend_y = (y - y0) * frequency;

	var x0 = Math.floor(x / wavelength) * wavelength;
	var x1 = (x0 + wavelength) % size;
	var blend_x = (x - x0) * frequency;

	// Bilinear interpolation.

	var top = interpolate(
		source[y0 * size + x0],
		source[y0 * size + x1],
		blend_x);

	var bottom = interpolate(
		source[y1 * size + x0],
		source[y1 * size + x1],
		blend_x);

	var height = interpolate(top, bottom, blend_y);

   return height;
}

function valueNoise(k, source, x, y) {

	// Generate and store octaves.

   var octaves = [source[y * size + x]];

   for(var i = 1; i < k; ++i)
		octaves[i] = octave(i, source, x, y);

   octaves.reverse();

	// Initialize the result grid with values from the last octave.

   var height = octaves[0];

	// Add each octaves with respect to the persistence value.

   var persistence = 0.4;
	var amplitude = 1;
   var sumAmplitude = amplitude;

   for(var i = 1; i < octaves.length; ++i) {

		amplitude = Math.pow(persistence, i);

		height += octaves[i] * amplitude;

		sumAmplitude += amplitude;
   }

	// Normalize the height values.
	height /= sumAmplitude;

   return height;
}

self.onmessage = function(event) {

	if(randomSource === null)
		randomSource = randomNoise();

	var task = event.data;

	var source = randomSource;
	var index = task.index;
	var k = task.k;

	var height;

	if(task.type === 'random')
		height = source[index]
	else if(task.type === 'octave')
		height = octave(k, source, index % size, Math.floor(index / size));
	else if(task.type === 'value')
		height = valueNoise(k, source, index % size, Math.floor(index / size));

	self.postMessage({height: height});
};
