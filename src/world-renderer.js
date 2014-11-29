jump.WorldRenderer = (function () {
  'use strict';

  function WorldRenderer() {
    this.camera = {
      zoom: 1.1,
      left: 0.0,
      bottom: 0.0
    };

    this.backgroundObjects = [];

    this.backgroundObjects.push(new jump.Cloud({
      x: 0,
      y: 0,
      radius: 10
    }));
    this.backgroundObjects.push(new jump.Cloud({
      x: 20,
      y: 30,
      radius: 10
    }));
    this.backgroundObjects.push(new jump.Cloud({
      x: 10,
      y: 50,
      radius: 10
    }));
  }


  function ease(a, b, easing) {
    return a*(0.9) + b*0.1;
  }


  function constrain(a, min, max) {
    return Math.min(Math.max(a, min), max);
  }


  WorldRenderer.prototype.renderBackground = function (context, world) {
    var s = 30;
    context.scale(1.5/s, 1/s);
    context.translate(0, -world.distanceTravelled);
    var i = this.backgroundObjects.length;
    while (i--) {
      context.save();
      context.fillStyle = '#eee';
      context.strokeStyle = 'rgba(0,0,0,0)';
      this.backgroundObjects[i].render(context);
      context.restore();
    }
  };


  WorldRenderer.prototype.renderStorm = function (context, world) {
    var gradient = context.createLinearGradient(0, -0.2, 0, 1.2);
    gradient.addColorStop(0, 'rgba(100, 100, 100, 1)');
    gradient.addColorStop(world.supportCutoff()/1.1, 'rgba(100, 100, 100, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(-1, -0.2, 2, 1.2);
  };


  WorldRenderer.prototype.applyCamera = function (context, world) {
    var xTarget = constrain((world.supportCloud.x - 0.5)/4, -0.1, 0.1),
        yTarget = constrain((world.supportCloud.y - 0.5)/4, -0.1, 0.1);

    this.camera.left = ease(this.camera.left, xTarget, 0.0001);
    this.camera.bottom = ease(this.camera.bottom, yTarget, 0.0001);

    context.translate(0.1 - this.camera.left, 0.1 - this.camera.bottom);
    context.scale(this.camera.zoom, this.camera.zoom);
  };


  WorldRenderer.prototype.render = function (context, world) {
    context.rect(0, 0, 1, 1);
    context.fillStyle = '#B3FFFE';
    context.fill();
    this.applyCamera(context, world);

    context.save();
    this.renderBackground(context, world);
    context.restore();

    context.save();
    this.renderStorm(context, world);
    context.restore();

    var i = world.clouds.length;
    while (i--) {
      var cloud = world.clouds[i];

      if (cloud.state === jump.Cloud.INACTIVE) {
        continue;
      }

      context.save();
      switch (cloud.state) {
        case jump.Cloud.ALIVE:
          context.fillStyle = '#fff';
          context.strokeStyle = '#888';
          break;

        case jump.Cloud.DYING:
          context.fillStyle = '#bbb';
          context.strokeStyle = '#555';
          break;

        case jump.Cloud.DEAD:
          context.fillStyle = '#888';
          context.strokeStyle = '#333';
          break;
      }

      context.lineWidth = 0.2*cloud.radius;
      cloud.render(context);
      context.restore();
    }

    context.lineWidth = 0.2*world.supportCloud.radius;
    context.fillStyle = '#00f';
    context.strokeStyle = '#fff';
    world.supportCloud.render(context);
  };


  return WorldRenderer;
}).call(this);
