'use strict';

angular.module('classViewApp')
  .factory('MediaPlayer', ($q, _) => {
    var MediaPlayer = function () {

        // This is set once the setIntervalCallback has been set
        this.setIntervalCbDeferred = $q.defer();

        this.onSetIntervalCallback = _.noop;
        this.onSeekCallback        = _.noop;
        this.onPauseCallback       = _.noop;
        this.onPlayCallback        = _.noop;
  	
        // onSetInterval to be used by classView directive, not by client of this angular module
      	MediaPlayer.prototype.onSetInterval = cb => {
      		this.onSetIntervalCallback = cb;
          // Pass this instance to the promise so the callback will have a this reference
          this.setIntervalCbDeferred.resolve(this);
          return this;
      	};

      	MediaPlayer.prototype.setInterval = ({startTime, endTime}) => {
          // Callback should return a promise
          return this.setIntervalCbDeferred.promise
            .then(instance => {
              return instance.onSetIntervalCallback({startTime, endTime});
            });
      	};

      	MediaPlayer.prototype.onSeek = cb => {
      		this.onSeekCallback = cb;
          return this;
      	};

      	MediaPlayer.prototype.onPause = cb => {
      		this.onPauseCallback = cb;
          return this;
      	};

      	MediaPlayer.prototype.onPlay = cb => {
      		this.onPlayCallback = cb;
          return this;
      	};
    };

    return MediaPlayer;
  });
