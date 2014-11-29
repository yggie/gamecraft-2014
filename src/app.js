(function () {
  'use strict';

  window.jump = {};

  $(document).on('ready', function () {
    var game = new jump.Game({
      worldFactory: jump.World,
      tick: 15,
      cloudLimit: 10,
      speed: 1,
      $canvas: $('canvas#game-window'),
      $root: $(document)
    });

    game.start();
  });
}).call(this);

