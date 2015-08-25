'use strict';

angular.module('classViewApp')
  .factory('MediaPlayer', ['_', (_) => {
    var MediaPlayer = function () {

        this.onSetIntervalCallback = _.noop;
        this.onSeekCallback        = _.noop;
        this.onPauseCallback       = _.noop;
        this.onPlayCallback        = _.noop;
  	
      	MediaPlayer.prototype.onSetInterval = function(cb) {
      		this.onSetIntervalCallback = cb;
      	};

      	MediaPlayer.prototype.setInterval = function({startTime, endTime}) {
      		this.onSetIntervalCallback({startTime, endTime});
      	};

      	MediaPlayer.prototype.onSeek = function(cb) {
      		this.onSeekCallback = cb;
      	};

      	MediaPlayer.prototype.onPause = function(cb) {
      		this.onPauseCallback = cb;
      	};

      	MediaPlayer.prototype.onPlay = function(cb) {
      		this.onPlayCallback = cb;
      	};
    };

    return MediaPlayer;
  }]);
