jump.Animations = (function () {
  'use strict';

  function Animations() {
  }


  Animations.Ease = function Ease(object, property, target, increment) {
    this.object = object;
    this.property = property;
    this.original = object[property];
    this.target = target;
    this.progress = 0.0;
    this.increment = increment ? increment/100 : 0.05;
  };


  Animations.Ease.prototype.animate = function () {
    if (!this.complete()) {
      this.object[this.property] = this.target + Math.exp(-this.progress*2)*(this.original - this.target);
      this.progress += this.increment;
    }
  };


  Animations.Ease.prototype.end = function () {
    this.object[this.property] = this.original;
    this.progress = 1.0;
  };


  Animations.Ease.prototype.complete = function () {
    return this.progress >= 1.0;
  };


  Animations.Bounce = function Bounce(object, property, amplitude) {
    this.object = object;
    this.property = property;
    this.original = object[property];
    this.amplitude = amplitude;
    this.progress = 0.0;
  };


  Animations.Bounce.prototype.animate = function () {
    if (!this.complete()) {
      this.object[this.property] = this.original + this.amplitude*Math.sin(this.progress * Math.PI);
      this.progress += 0.05;
    }
  };


  Animations.Bounce.prototype.end = function () {
    this.object[this.property] = this.original;
    this.progress = 1.0;
  };


  Animations.Bounce.prototype.complete = function () {
    return this.progress >= 1.0;
  };


  return Animations;
}).call(this);
