function Vector2(x, y) {
	this.x = x === undefined ? 0 : x;
	this.y = y === undefined ? 0 : y;
}

Vector2.prototype.copy = function() {
	return new Vector2(this.x, this.y);
}

Vector2.prototype.length = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector2.prototype.add = function(v) {
	this.x += v.x;
	this.y += v.y;

	return this;
};

Vector2.prototype.sub = function(v) {
	this.x -= v.x;
	this.y -= v.y;

	return this;
};

Vector2.prototype.negate = function() {
	this.x = -this.x;
	this.y = -this.y;

	return this;
};

Vector2.prototype.scale = function(s) {
	this.x *= s;
	this.y *= s;

	return this;
};

Vector2.prototype.normalize = function() {
	var l = this.length();
	this.x /= l;
	this.y /= l;

	return this;
};

Vector2.prototype.rotate = function(a) {
	var nx = Math.cos(a) * this.x - Math.sin(a) * this.y;
	var ny = Math.sin(a) * this.x + Math.cos(a) * this.y;

	this.x = nx;
	this.y = ny;

	return this;
};

var u = new Vector2(0,1);
var v = new Vector2(0,5);

