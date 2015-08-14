'use strict';

angular.module('classViewApp')
  .service('mediaPlayer', [function MediaPlayer() {
  	
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


  }]);
