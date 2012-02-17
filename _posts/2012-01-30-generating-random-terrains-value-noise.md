---
layout: post
title: "Generating Random Terrain: Value Noise"
published: true
comments: true
js: [three, terrain/base]
css: [terrain]
---

### Motivation

Probably due to the ongoing success of Minecraft and to numerous
hackers trying to emulate the aforementioned game, there is a strong
resurgence of interest in automatic terrain generation, and I am no
exception. In this article, I document my transgressions as a budding
terraformer.

### Tech note

For the following examples, I am using the [HTML5
canvas](https://developer.mozilla.org/en/Canvas_tutorial) to draw
height maps and [Three.js](https://github.com/mrdoob/three.js/) with a
WebGL renderer to display the resulting terrains. If your browser
doesn't support WebGL, a canvas is displayed instead. But be advised,
you're missing on some fancy animating here!

### The stuff

[Height maps](http://en.wikipedia.org/wiki/Heightmap) are often used
to represent the relief of a virtual terrain. Concisely, a height map
is a grid of real values between 0 and 1, each representing the
elevation of a corresponding vertex of our terrain (0 means lowest, 1
means highest, any value in between is proportionally high). They are
often persistently stored as images which is convenient as you just
need to open them in any image viewer to have an idea of the
appearance of a terrain. Of course, the previous principle is still
valid with colors: black (RGB\[0,0,0]) means lowest, white
(RGB\[255,255,255]) means highest and any shade of grey in between is
proportionally high.

Height maps have some downsides though. As the idea is to extrapolate
a third dimension model from two-dimensionnal data, you can only
change vertices y-coordinates (pull them upward or push them
downward). Thus, certain features, such as overhangs or caverns are
not representable.

With all that in mind, our only work here is to generate a height map
representing a terrain. Let's start by randomly generating one of
those. For each grid value (or pixel), we assign a random float
between 0 and 1. If you click on the dark box below (and if you remain
patient), you will see both the generated height map and the
corresponding terrain.

<div class="try" id="try1">
</div>

Well, without surprise, the result is a bit disappointing. We obtain a
grassy-looking terrain, far from anything we could find in real
life. This terrain lacks two features. Firstly, it needs
**continuity**. In a real landscape, we could not find such variations
(except with some [unique geological
formations](http://en.wikipedia.org/wiki/Giant's_Causeway)). There is
too much height difference between neighbor vertices, it's too abrupt,
not smooth enough.

Secondly, it lacks **several levels of precision**. Imagine for a
moment that we solved the first issue by only giving random values to
some pixels and using these pixels as guides to determine the height
of the others by interpolation. Like when you pull a cloth up, your
action is only applied to a specific point but every surrounding
vertices rise too. Well, even with this workaround our terrain won't
be realistic enough because it will only be composed of flat and
artificial slopes. When looking at a mountain from afar, you can
merely observe the general outline. If you walk closer, some hills and
valleys start to appear. When you're on the mountain itself, you can
see very tiny details, small holes, rocks. To give our terrain a
natural feel, we need to capture variations both at the macroscopic
and microscopic levels.

This is when value noise (not to be confused with [Perlin
noise](http://www.noisemachine.com/talk1/)) comes into play. The
steps described below let us generate a more natural-looking terrain:

1. Sample *n* regular subsets of pixels (where subset *n* contains
every *2<sup>n</sup>*-th pixel)

2. Fill the gaps between the selected pixels with some kind of
interpolation

3. Sum up each layer with an appropriate weight to obtain the final
height map

### Sampling

Sampling the original random noise at different levels provides us the
several layers of precision needed.  Each of these sampled maps is
called an octave and is associated with a number starting from
*0*. Octave *i* contains every *2<sup>i</sup>* pixels of the original
height map. This forms a grid of squares, each sampled points being
corners of those squares.

IMAGE GRID 1 -> OCTAVE
IMAGE GRID 4 -> OCTAVE
IMAGE GRID 6 -> OCTAVE

### Filling the gaps

For the moment, an octave is mainly empty, apart from the sampled
points. We now need to determine the value of absent pixels. Let's say
we want to compute the value of pixel *P* of a given octave. To do
that, we simply find in which grid square *P* is and interpolate the
values of its corners with respect to the distance from *P* to each
corner.

We can use several kind of interpolation. The simplest is linear
interpolation; efficient in terms of speed but the result can be a bit
rough.

function linear(a, b, x) {
  return a + (b - a) * x;
}

Then there is cosine interpolation.

function cosine(a, b, x) {

}

You will note that the given functions only work in 1D. To obtain the
value of *P* from the four corner of the square (*C1*, *C2*, *C3*,
*C4*, in clockwise order starting from the top left), we separately
interpolate (*C1* and *C2*) and (*C3* and *C*4) which gives us the
values of points respectively at the top and bottom lines of the
square. Then we interpolate these two intermediate points. This
process is known as bilinear interpolation.

IMAGE INTERPOLATION

### Summing up

Let's summarize. From a unique random noise, we created octaves by
regularly sampling pixels and we filled the gap with interpolation.

Now that we dispose of n octaves, we just need to assemble them into a
unique image. In order to make good use of our different layers of
precision, the influence of each of them in the final result is
weighted. It's rather straightforward to assume that the octave with
the largest frequency is going to help define the global relief
whereas the one with the smallest frequency will only influe on small
local details.

We introduce the notion of persistence, a increasing value which will
define the global influence of each layer.

<div class="try" id="try2">
</div>

<div class="try" id="try3">
</div>
