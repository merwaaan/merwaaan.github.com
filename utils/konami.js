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

	// PWEE PWUU PWEE PWUU PWEE PWUU

	$audio = $('<audio></audio>')
		.attr({autoplay: 'autoplay'})
		.appendTo('body');

	$sound = $('<source></source>')
		.attr({src: 'images/alarm.ogg', type: 'audio/ogg'})
		.appendTo($audio);

	// DU DUDU DUDU DUUUU

	setTimeout(function() {

		$gentleman = $('<img/>')
			.attr('src', 'images/gentleman.png')
			.hide()
			.appendTo('body')
			.load(
				function() {
					blink($(this), 8, 230);
				}
			);

		$gentleman.css({
			position: 'fixed',
			bottom: 0,
			right: 0
		});

	}, 10500);
}

function blink($element, count, duration) {

	if(count < 0)
		return;

	var nextCall = function() {
		blink($element, count - 1, duration);
	};

	if($element.is(':visible'))
		$element.fadeOut(duration, nextCall);
	else
		$element.fadeIn(duration, nextCall);
}
