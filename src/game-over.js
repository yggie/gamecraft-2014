jump.GameOver = (function () {
  'use strict';

  function GameOver() {
  }


  GameOver.prototype.render = function (context) {
    context.rect(0, 0, 1, 1);
    context.fillStyle = 'rgba(255, 255, 255, 0.5)';
    context.fill();
  };


  return GameOver;
}).call(this);
