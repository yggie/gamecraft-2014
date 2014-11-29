jump.Game = (function () {
  'use strict';

  function Game(options) {
    this.$canvas = options.$canvas;
    this.$root = options.$root;
    this.worldFactory = options.worldFactory;
    this.world = null;
    this.tick = 50;
    this.options = options;
    this.setOptions(options);
    this.playerName = 'Anonymous';

    if (localStorage) {
      this.playerName = localStorage.getItem('player name') || this.playerName;
    }

    var $input = this.$root.find('.player-options input[type="text"]');
    $input.val(this.playerName);
    this.$root.find('.player-options').on('submit', function (event) {
      this.playerName = $input.val();
      if (localStorage) {
        localStorage.setItem('player name', this.playerName);
      }

      return false;
    }.bind(this));

    this.timeout = null;
    this.state = Game.PLAYING;
    this.context = this.$canvas[0].getContext('2d');

    this.menu = new jump.MenuOverlay();
    this.gameover = new jump.GameOver();

    this.$canvas.on('click', this.clickEvent.bind(this));
    options.$root.on('keyup', this.keyEvent.bind(this));

    this.updateScoreBoard();
  };


  Game.PLAYING = 0;
  Game.PAUSED  = 1;
  Game.ENDED   = 2;


  Game.prototype.setOptions = function (options) {
    this.tick = options.tick;
  };


  Game.prototype.updateScoreBoard = function () {
    var scores = this.getScores();
    if (scores.length) {
      var $scores = this.$root.find('.high-scores');
      $scores.html('');

      for (var i = 0; i < scores.length; i++) {
        var $li = $('<li></li>');
        $li.text(scores[i].player + ': ' + scores[i].value.toString());
        $scores.append($li);
      }
    }
  };


  Game.prototype.start = function () {
    this.state = Game.PLAYING;
    this.world = new this.worldFactory(this.options, function () {
      this.state = Game.ENDED;
      this.saveNewScore(this.world.score());
    }.bind(this));
    console.log('STARTED');
    if (!this.timeout) {
      this.loop();
    }
  };


  Game.prototype.clickEvent = function (event) {
    event.stopPropagation();

    switch (this.state) {
      case Game.PLAYING:
        this.world.clickEvent({
          x: event.offsetX / this.$canvas.width(),
          y: 1.0 - event.offsetY / this.$canvas.height(),
          radius: 0
        });
        break;

      case Game.ENDED:
        this.start();
        break;


      case Game.PAUSED:
        this.state = Game.PLAYING;
        break;
    }


    return false;
  };


  Game.prototype.keyEvent = function (event) {
    switch (event.keyCode) {
      case 27: // ESC
        this.togglePause();
      break;

      default:
        console.log('Unsupported key:', event.keyCode);
      break;
    }
  };


  Game.prototype.loop = function () {
    this.timeout = setTimeout(this.loop.bind(this), this.tick);

    if (this.state === Game.PLAYING) {
      this.world.update();
    }

    var canvas = this.$canvas[0],
        context = this.context;
    context.save();
    this.render(context, canvas.width, canvas.height);
    context.restore();
  };


  Game.prototype.render = function (context, width, height) {
    context.scale(width, -height);
    context.translate(0, -1);
    context.save();
    this.world.render(context);
    context.restore();

    context.save();
    this.renderScore(context);
    context.restore();

    if (this.state === Game.PAUSED) {
      context.save();
      this.menu.render(context);
      context.restore();
    } else if (this.state === Game.ENDED) {
      context.save();
      this.gameover.render(context);
      context.restore();
    }
  };


  Game.prototype.renderScore = function (context) {
    context.translate(0.5, 0.9);
    context.rotate(Math.PI);
    context.scale(-1, 1);
    context.font = '0.1px Georgia';
    context.textAlign = 'center';
    context.fillStyle = '#000';
    context.fillText(this.world.score().toString(), 0, 0.02);

    context.font = '0.03px Georgia';
    context.fillText(this.playerName, 0, -0.06);
  };


  Game.prototype.togglePause = function () {
    switch (this.state) {
      case Game.PLAYING:
        this.state = Game.PAUSED;
        break;

      case Game.PAUSED:
        this.state = Game.PLAYING;
        break;
    }
  };


  Game.prototype.getScores = function () {
    if (localStorage) {
      var rawScores = localStorage.getItem('high scores');
      if (rawScores) {
        return JSON.parse(rawScores);
      } else {
        return [];
      }
    } else {
      this.scores = this.scores || [];
      return this.scores;
    }
  };


  Game.prototype.saveScores = function (scores) {
    if (localStorage) {
      localStorage.setItem('high scores', JSON.stringify(scores));
    } else {
      this.scores = scores;
    }
  };


  Game.prototype.saveNewScore = function (score) {
    var scores = this.getScores();

    scores.push({
      player: this.playerName,
      value: score
    });

    scores.sort(function (a, b) {
      if (a.value < b.value) {
        return 1;
      } else if (a.value > b.value) {
        return -1;
      }

      return 0;
    });

    this.saveScores(scores.slice(0, 10));
    this.updateScoreBoard();
  };


  return Game;
}).call(this);
