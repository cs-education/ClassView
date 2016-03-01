'use strict';

angular.module('classViewApp')
	.constant('STATE_DIM_PERCENTS', {
		'playing': 40,
		'live_paused': 30,
		'paused': 25
	})
	.constant('SMALL_VIDEO_SEEK_THRESH', 2000)
	.constant('MIN_PLAYING_VIDEO_LENGTH', 7000) // video needs to be at least 7 seconds long for it to start playing automatically
	.controller('VideoWidgetCtrl', ($scope, _, STATE_DIM_PERCENTS, SMALL_VIDEO_SEEK_THRESH, MIN_PLAYING_VIDEO_LENGTH) => {
		$scope.API = {};
		$scope.videoTime = 0;
		$scope.currState = 'pause'; // can be 'play', 'pause', or 'stop'
		$scope.recording = $scope.widgetData.recordings[$scope.widgetData.idx];

		var lastMinTime = new Date(0);

		$scope.isLive = function (currentTime) {
			var recording = $scope.recording;
			currentTime = _.isDate(currentTime) ? currentTime : $scope.currentTime;

			var start = recording.startTime;
			var end = recording.endTime;

			return currentTime >= start && currentTime <= end;
		};

		$scope.attatchAPI = API => $scope.API = API;
		$scope.onUpdateTime = currTime => $scope.videoTime = currTime;
		$scope.onStateChange = state => $scope.currState = state;

		// Helpers for checking current state
		$scope.isPlaying = () => $scope.currState === 'play';
		$scope.isPaused = () => $scope.currState === 'pause';
		$scope.isStopped = () => $scope.currState === 'stop';

		$scope.playbackCompleted = () => {
			$scope.API.stop();
			$scope.$emit('videoPlaybackDone', $scope.recording);
		};

		$scope.$watch('currState', (newState, oldState) => {
			if (newState === oldState) {
				return;
			}

			if (newState === 'play') {
				// let all widgets know that this widget is playing so they stop if they are playing
				$scope.$emit('setPlayingRecording', $scope.recording);
			}
		});

		var lastSyncTime = 0;

	  	function clamp (lo, hi, val) {
	  		return val < lo ? lo : ((val > hi) ? hi : val);
	  	}

	  	var currentStyle = {};
	  	function updateViewStyle() {
	  		var newStyle = {};
			if ($scope.isPlaying()) {
				newStyle = _.merge(_.clone(currentStyle), {
					width: `${STATE_DIM_PERCENTS.playing}%`,
					height: `${STATE_DIM_PERCENTS.playing}%`
				});
			} else if (!$scope.isPlaying() && $scope.isLive()) {
				newStyle = _.merge(_.clone(currentStyle), {
					width: `${STATE_DIM_PERCENTS.live_paused}%`,
					height: `${STATE_DIM_PERCENTS.live_paused}%`
				});
			} else {
				newStyle = _.merge(_.clone(currentStyle), {
					width: `${STATE_DIM_PERCENTS.paused}%`,
					height: `${STATE_DIM_PERCENTS.paused}%`
				});
			}

			if (!_.isEqual(currentStyle, newStyle)) {
				$scope.widget.updateContainerStyle(newStyle);
				currentStyle = newStyle;
			}
	  	}

		$scope.$watch('currentTime', (currentTime) => {
			if ($scope.isLive(currentTime) && $scope.isPaused()) {
				var currentTimeMillis = currentTime.getTime();
				if (currentTimeMillis - lastSyncTime >= SMALL_VIDEO_SEEK_THRESH) {
					var seekTimeMillis = currentTimeMillis - $scope.recording.startTime.getTime();
					seekTimeMillis = clamp(0, $scope.API.totalTime, seekTimeMillis); // leave a little time there to help with playlist progression

					$scope.API.seekTime(seekTimeMillis / 1e3);
					// Update this timestamp to reflect the last time the video frame was updated.
					lastSyncTime = currentTimeMillis;
				}
			}

			updateViewStyle();
		});

		$scope.$on('nextVideo', (event, previousVideo) => {
			if (previousVideo.id === $scope.recording.id || $scope.recording.id === 0) {
				return; // the recording for this widget just completed playback 
			}

			lastSyncTime = 0; // reset this so syncing can begin for next video group
			var precedingRecording = $scope.widgetData.recordings[$scope.widgetData.idx-1];

			if (previousVideo.id === precedingRecording.id) {

				var remainingVideoTime = $scope.API.totalTime - ($scope.videoTime*1e3);

				if (remainingVideoTime >= MIN_PLAYING_VIDEO_LENGTH) {
					// the current recording is next in the playlist to start playing
					$scope.API.play();
				} else {
					// Skip this recording, not enough time left in video to bother showing it
					$scope.API.stop();
					$scope.$emit('skipVideo', $scope.recording);
				}
			}
		});

		$scope.$on('playingRecording', (event, playingRecording) => {
			if (playingRecording.id !== $scope.recording.id && $scope.isPlaying()) {
				$scope.API.pause();
			}
		});

		$scope.$watch('videoTime', (newVidTime, oldVidTime) => {
      $scope.$broadcast('broadcastCurrentTime', $scope.currentTime);
			if (newVidTime === oldVidTime) {
				return;
			}

			if ($scope.isPlaying()) {
				$scope.$emit('updateCurrentTime', {
					recording: $scope.recording,
					videoTime: newVidTime
				});
			}
		});

	});
