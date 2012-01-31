$(function() {

	webGLCapable = checkWebGL();

   insertDemo($('#try1'), {type: 'random'});
   insertDemo($('#try2'), {type: 'octave', k: 4});
   insertDemo($('#try3'), {type: 'value', k: 7});
});
