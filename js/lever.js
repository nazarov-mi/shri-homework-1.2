
function Lever(el) {
  this.el = el;

  this.thumb = el.querySelector('.door-lever__thumb');
  this.circle = el.querySelector('.door-lever__svg circle');

  this.angle = 0;
  this.isPressed = false;
  this.isFinished = false;

  this.onFinishedCallback = null;

  this._onThumbDownListener = this._onThumbDown.bind(this);
  this._onThumbMoveListener = this._onThumbMove.bind(this);
  this._onThumbUpListener = this._onThumbUp.bind(this);

  this._setAngle(0);
  this.init();
}

Lever.prototype.init = function () {
  var thumb = this.thumb;

  thumb.addEventListener('pointerdown',   this._onThumbDownListener);
  thumb.addEventListener('pointermove',   this._onThumbMoveListener);
  thumb.addEventListener('pointerup',     this._onThumbUpListener);
  thumb.addEventListener('pointercancel', this._onThumbUpListener);
  thumb.addEventListener('pointerleave',  this._onThumbUpListener);
}

Lever.prototype.destroy = function () {
  var thumb = this.thumb;

  thumb.removeEventListener('pointerdown',   this._onThumbDownListener);
  thumb.removeEventListener('pointermove',   this._onThumbMoveListener);
  thumb.removeEventListener('pointerup',     this._onThumbUpListener);
  thumb.removeEventListener('pointercancel', this._onThumbUpListener);
  thumb.removeEventListener('pointerleave',  this._onThumbUpListener);
}

Lever.prototype._setAngle = function (value, force) {
  var rad = Math.min(Math.max(value, 0), Math.PI * 2);
  var deg = rad * (180 / Math.PI);

  if ((deg < this.angle || deg - this.angle > 30) && !force) {
    return;
  }

  this.angle = deg
  this.isFinished = deg >= 355;

  var left = Math.cos(rad) * 50 + 50;
  var top  = Math.sin(rad) * 50 + 50;
  var percent = deg / 360 * 101;

  this.thumb.style.left = left + '%';
  this.thumb.style.top = top + '%';
  this.circle.style.strokeDasharray = percent + ' 100'

  if (this.isFinished) {
    this.onFinishedCallback && this.onFinishedCallback();
  }
}

Lever.prototype._onThumbDown = function (e) {
  this._setAngle(0, true);
  this.isPressed = true;
}

Lever.prototype._onThumbUp = function (e) {
  this._setAngle(0, true);
  this.isPressed = false;
}

Lever.prototype._onThumbMove = function (e) {
  if (!this.isPressed) {
    return;
  }

  this.thumb.setPointerCapture(e.pointerId);

  var bounding = this.el.getBoundingClientRect();
  var centerX = bounding.left + bounding.width * .5;
  var centerY = bounding.top + bounding.height * .5;

  var dx = e.clientX - centerX;
  var dy = e.clientY - centerY;
  var angle = Math.atan(dy / dx);

  if (dx < 0) {
    angle = Math.PI + angle;
  }

  if (angle < 0) {
    angle = Math.PI * 2 + angle
  }

  this._setAngle(angle);
}