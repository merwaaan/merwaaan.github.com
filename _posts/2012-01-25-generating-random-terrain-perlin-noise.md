---
layout: post
title: "Generating Random Terrain: Perlin Noise"
js: [jquery, three, perlin]
css: [terrain]
published: false
---

Probably due to the ongoing success of Minecraft and to numerous
hackers trying to emulate the aforementioned game, there is a strong
resurgence of interest in random terrain generation, and I am no
exception. In this article, I will document my transgressions as a
budding terraformer.

Height maps are often used to represent the relief of a virtual
terrain. Concisely, a height map is a grid of real values, each of
those representing the elevation of a corresponding vertex of our
terrain. They are often persistently stored as images, which is
convenient as you just need open it in any image viewer to give an
idea of a terrain relief. Plus color channels can be used to represent
several [levels of
precision](http://notch.tumblr.com/post/3746989361/terrain-generation-part-1). This
method does not only have advantages though, and it does not permit
certain terrain features such as caverns or overhangs.

For each of the following examples, I'm using Javascript to generate
height maps and display them on a HTML5 canvas, and
[Three.js](https://github.com/mrdoob/three.js/) for the three-dimensional
rendering.

Let's start by randomly generating an elevation map. For each grid
value (or pixel), we assign a random float between 0 and 1. Without
surprise, the result is a bit disappointing. What we need is
continuity between the heights of neighbor vertices.

<div class="try" id="try1">
</div>

<div class="try" id="try2">
</div>

<div class="try" id="try3">
</div>
