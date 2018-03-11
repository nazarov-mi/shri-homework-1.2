
function Slider(el) {
  this.el = el;

  this.thumb = el.querySelector('.door-slider__thumb');

  this.isPressed = false;
  this.isFinished = false;

  this.onFinishedCallback = null;

  this._onThumbDownListener = this._onThumbDown.bind(this);
  this._onThumbMoveListener = this._onThumbMove.bind(this);
  this._onThumbUpListener = this._onThumbUp.bind(this);

  this.init();
}

Slider.prototype._setPercent = function (value) {
  this.percent = Math.min(Math.max(value, 0), 100);
  this.isFinished = this.percent >= 90;

  this.thumb.style.left = this.percent + '%';

  if (this.isFinished) {
    this.el.classList.add('door-slider__finished');

    this.onFinishedCallback && this.onFinishedCallback();
  } else {
    this.el.classList.remove('door-slider__finished');
  }
}

Slider.prototype._onThumbDown = function (e) {
  this._setPercent(0);
  this.isPressed = true;
}

Slider.prototype._onThumbUp = function (e) {
  this._setPercent(0);
  this.isPressed = false;
}

Slider.prototype._onThumbMove = function (e) {
  if (!this.isPressed) {
    return;
  }

  this.thumb.setPointerCapture(e.pointerId);

  var bounding = this.el.getBoundingClientRect();
  var percent = (e.clientX - bounding.left) / bounding.width;

  this._setPercent(percent * 100);
}

Slider.prototype.init = function () {
  var thumb = this.thumb;

  thumb.addEventListener('pointerdown',   this._onThumbDownListener);
  thumb.addEventListener('pointermove',   this._onThumbMoveListener);
  thumb.addEventListener('pointerup',     this._onThumbUpListener);
  thumb.addEventListener('pointercancel', this._onThumbUpListener);
  thumb.addEventListener('pointerleave',  this._onThumbUpListener);
}

Slider.prototype.destroy = function () {
  var thumb = this.thumb;

  thumb.removeEventListener('pointerdown',   this._onThumbDownListener);
  thumb.removeEventListener('pointermove',   this._onThumbMoveListener);
  thumb.removeEventListener('pointerup',     this._onThumbUpListener);
  thumb.removeEventListener('pointercancel', this._onThumbUpListener);
  thumb.removeEventListener('pointerleave',  this._onThumbUpListener);
}