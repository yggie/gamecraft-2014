jump.Cloud = (function () {
  'use strict';

  function Cloud(props) {
    this.respawn(props);
  }


  Cloud.ALIVE    = 1;
  Cloud.DEAD     = 2;
  Cloud.DYING    = 4;
  Cloud.INACTIVE = 8;


  Cloud.prototype.respawn = function (props) {
    this.x = props.x;
    this.y = props.y;
    this.radius = props.radius;
    this.state = Cloud.ALIVE;
    this.degradation = 0;
    this.stretch = {
      x: 1.0 + (Math.random()-0.5)*0.2,
      y: 1.0 + (Math.random()-0.5)*0.2
    };
    this.animations = [];
  };


  Cloud.prototype.squaredDistanceTo = function (circle) {
    var dx = this.x - circle.x,
        dy = this.y - circle.y,
        dist = this.radius + circle.radius;
    return dx*dx + dy*dy - dist*dist;
  };


  Cloud.prototype.intersects = function (circle) {
    return this.squaredDistanceTo(circle) < 0.0;
  };


  Cloud.prototype.renderAsCircle = function (context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    context.fill();
    context.lineWidth = 0.1*this.radius;
    context.stroke();
  };


  Cloud.prototype.renderAsCloud = function (context) {
    context.translate(this.x, this.y);
    var s = Math.sin(2*Math.PI/7);
    context.scale(this.stretch.x*this.radius/(1+s), this.stretch.y*this.radius/(1+s));
    context.beginPath();
    for (var i = 0; i < 7; i++) {
      context.save();
      context.rotate(2*i*Math.PI/7);
      context.translate(0, 1);
      context.arc(0, 0, s, 0, Math.PI, false);
      context.restore();
    }
    context.closePath();
    context.fill();
    context.stroke();
  };


  Cloud.prototype.addAnimation = function (animation) {
    var i = this.animations.length;
    while (i--) {
      var anim = this.animations[i];
      if (anim.property === animation.property) {
        anim.end();
        this.animations.splice(i, 1);
        break;
      }
    }
    this.animations.push(animation);
  };


  Cloud.prototype.render = function (context) {
    var i = this.animations.length;
    while (i--) {
      var animation = this.animations[i];
      animation.animate();
      if (animation.complete()) {
        this.animations.splice(i, 1);
      }
    }
    this.renderAsCloud(context);
  };


  return Cloud;
}).call(this);
