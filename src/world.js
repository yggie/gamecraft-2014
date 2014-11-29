jump.World = (function () {
  'use strict';

  function World(options, endCallback) {
    this.clicked = null;
    this.clouds = [];
    this.thresholdHeight = 0.0;
    this.limit = 10;
    this.speed = -0.01;
    this.distanceTravelled = 0;
    this.spawn = {
      counter: 0,
      limit: 0,
      mean: 15,
      bound: 2,
    };
    this.settings = {
      thresholdHeightOffset: 0.0,
      speedMultiplier: 1.0
    };
    this.callbacks = {
      ended: endCallback || function () { }
    };

    this.setOptions(options);
    this.renderer = new jump.WorldRenderer();

    var props = this.generateCloudProperties();
    this.supportCloud = new jump.Cloud(props);
    this.clouds.push(this.supportCloud);
  }


  World.prototype.setOptions = function (options) {
    this.limit = options.cloudLimit;
    this.speed = options.speed / 250;
    this.spawn = {
      counter: 0,
      limit: 0,
      mean: 15,
      bound: 2,
    };
  };


  World.prototype.generateCloudProperties = function () {
    return {
      x: 0.8*Math.random() + 0.1,
      y: 1.0,
      radius: 0.05
    };
  };


  World.prototype.clickEvent = function (event) {
    this.clicked = event;
  };


  World.prototype.effectiveSpeed = function () {
    return this.speed * this.settings.speedMultiplier;
  };


  World.prototype.supportCutoff = function () {
    return this.thresholdHeight + this.settings.thresholdHeightOffset;
  };


  World.prototype.score = function () {
    return Math.round(this.distanceTravelled * 100);
  };


  World.prototype.clickEventProc = function (clicked) {
    if (clicked) {
      var i = this.clouds.length,
          nearestAvailableCloud;

      while (i--) {
        var cloud = this.clouds[i];
        if (cloud.y > this.supportCloud.y) {
          if (nearestAvailableCloud) {
            if (cloud.squaredDistanceTo(clicked) < nearestAvailableCloud.squaredDistanceTo(clicked)) {
              nearestAvailableCloud = cloud;
            }
          } else {
            nearestAvailableCloud = cloud;
          }
        }
      }

      if (nearestAvailableCloud) {
        this.supportCloud.addAnimation(new jump.Animations.Bounce(this.supportCloud.stretch, 'x', 0.3));
        this.supportCloud.addAnimation(new jump.Animations.Bounce(this.supportCloud.stretch, 'y', 0.3));
        this.supportCloud = nearestAvailableCloud;
        this.supportCloud.addAnimation(new jump.Animations.Bounce(this.supportCloud.stretch, 'x', -0.2));
        this.supportCloud.addAnimation(new jump.Animations.Bounce(this.supportCloud.stretch, 'y', -0.2));
      }

      this.clicked = null;
    }
  };


  World.prototype.spawnProc = function () {
    if (this.spawn.counter++ === this.spawn.limit) {
      this.spawn.counter = 0;
      this.spawn.limit = Math.round(Math.random()*2*this.spawn.bound) + this.spawn.mean;

      var prop = this.generateCloudProperties();

      if (this.clouds.length < this.limit) {
        console.log('NEW');
        this.clouds.push(new jump.Cloud(prop));
      } else {
        var i = this.clouds.length;
        while (i--) {
          var cloud = this.clouds[i];
          if (cloud.state === jump.Cloud.INACTIVE) {
            console.log('RESPAWNED');
            cloud.respawn(prop);
            return;
          }
        }
      }
    }
  };


  World.prototype.degradeCloudProc = function (cloud) {
    if (cloud.y < -0.2) {
      cloud.state = jump.Cloud.INACTIVE;
      return;
    }

    switch (cloud.state) {
      case jump.Cloud.ALIVE:
        if (cloud.y < this.supportCutoff()) {
          cloud.state = jump.Cloud.DYING;
          cloud.addAnimation(new jump.Animations.Ease(cloud.stretch, 'x', 0.0, 0.3));
          cloud.addAnimation(new jump.Animations.Ease(cloud.stretch, 'y', 0.0, 0.3));
        }
        break;

      case jump.Cloud.DYING:
        cloud.degradation += this.effectiveSpeed();
        if (cloud.degradation > 0.3) {
          cloud.state = jump.Cloud.DEAD;
        }
        break;
    }
  };


  World.prototype.checkGameStateProc = function () {
    switch (this.supportCloud.state) {
      case jump.Cloud.DEAD:
      case jump.Cloud.INACTIVE:
        console.log('ENDED');
        this.callbacks.ended();
        break;
    }
  };


  World.prototype.updateScoreProc = function () {
    this.distanceTravelled += this.effectiveSpeed();
  };


  World.prototype.bumpDifficultyProc = function () {
    var d = this.distanceTravelled;

    this.settings.speedMultiplier = Math.min(3.0, 1.0 + d*0.05);
    this.settings.thresholdHeightOffset = Math.min(0.5, d*0.015);
  };


  World.prototype.update = function () {
    this.clickEventProc(this.clicked);
    this.spawnProc();

    var i = this.clouds.length;
    while (i--) {
      var cloud = this.clouds[i];
      if (cloud.state === jump.Cloud.INACTIVE) {
        continue;
      }

      cloud.y -= this.effectiveSpeed();
      this.degradeCloudProc(cloud);
    }

    this.updateScoreProc();
    this.checkGameStateProc();
    this.bumpDifficultyProc();
  };


  World.prototype.render = function (context) {
    this.renderer.render(context, this);
  };


  return World;
}).call(this);
