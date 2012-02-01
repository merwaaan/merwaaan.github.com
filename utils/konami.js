var keys = {
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	a: 65,
	b: 66
};

var code = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

var cursor = 0;

$(window).keyup(function(event) {

	var key = event.keyCode;

	if(key === keys[code[cursor]]) {

		if(++cursor == code.length) {

			$(window).unbind('keyup');

			easterEgg();
		}
	}
	else
		cursor = (key === keys[code[0]] ? 1 : 0);
});

function easterEgg() {

	// Do stuff!
}
