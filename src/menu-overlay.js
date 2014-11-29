jump.MenuOverlay = (function () {
  'use strict';

  function MenuOverlay() {
  }


  MenuOverlay.prototype.render = function (context) {
    context.rect(0, 0, 1, 1);
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fill();
  };


  return MenuOverlay;
}).call(this);
