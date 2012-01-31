var size = 150;
var size2 = size * size;

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

self.onmessage = function(event) {

	var task = event.data;

	var noise = randomNoise();

	if(task.type === 'random')
		self.postMessage(noise);
	else if(task.type === 'octave')
		self.postMessage(octave(task.k, noise));
	else if(task.type === 'value')
		self.postMessage(valueNoise(noise));
};
