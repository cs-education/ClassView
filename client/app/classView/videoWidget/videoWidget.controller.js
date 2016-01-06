'use strict';

angular.module('classViewApp')
	.constant('STATE_DIM_PERCENTS', {
		'playing': 40,
		'live_paused': 30,
		'paused': 25
	})
	.constant('SMALL_VIDEO_SEEK_THRESH', 2000)
	.controller('VideoWidgetCtrl', ($scope, _, STATE_DIM_PERCENTS, SMALL_VIDEO_SEEK_THRESH) => {
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

		$scope.isPlaying = () => $scope.currState === 'play';
		$scope.isPaused = () => $scope.currState === 'pause';
		$scope.isStopped = () => $scope.currState === 'stop';

		$scope.playbackCompleted = () => {
			$scope.$emit('playbackDone', $scope.recording);
			$scope.API.stop();
		};

		function updateViewByState(currState) {

		}

		$scope.$watch('currState', (newState, oldState) => {
			if (newState === oldState) {
				return;
			}

			if (newState === 'play') {
				$scope.widget.updateContainerStyle(_.merge($scope.widget.style, {
					width: `${STATE_DIM_PERCENTS.playing}%`,
					height: `${STATE_DIM_PERCENTS.playing}%`
				}));
				// let all widgets know that this widget is playing so they stop if they are playing
				$scope.$emit('setPlayingRecording', $scope.recording);
			}
		});

		var lastSyncTime = 0;

	  	function clamp (lo, hi, val) {
	  		return val < lo ? lo : ((val > hi) ? hi : val);
	  	}

		$scope.$watch('currentTime', (currentTime) => {
			console.log('currentTime' + ` ${$scope.recording.id}`);
			if ($scope.isLive(currentTime) && $scope.isPaused()) {
				var currentTimeMillis = currentTime.getTime();
				if (currentTimeMillis - lastSyncTime >= SMALL_VIDEO_SEEK_THRESH) {
					var seekTimeMillis = currentTimeMillis - $scope.recording.startTime.getTime();
					seekTimeMillis = clamp(0, $scope.API.totalTime-10, seekTimeMillis); // leave a little time there to help with playlist progression

					$scope.API.seekTime(seekTimeMillis / 1e3);
					// Update this timestamp to reflect the last time the video frame was updated.
					lastSyncTime = currentTimeMillis;
				}
			}
		});

		$scope.$on('playbackDone', (event, completedRecording) => {
			console.log('playbackDone' + ` ${$scope.recording.id}`);
			if (completedRecording.id === $scope.recording.id) {
				return; // the recording for this widget just completed playback 
			}

			lastSyncTime = 0; // reset this so syncing can begin for next video group
			var precedingRecording = $scope.widgetData.recordings[$scope.widgetData.idx-1];

			if (completedRecording.id === precedingRecording.id) {
				// the current recording is next in the playlist to start playing
				$scope.API.play();
			}
		});

		$scope.$on('playingRecording', (event, playingRecording) => {
			console.log(`playingRecording child ${$scope.recording.id}`);
			if (playingRecording.id !== $scope.recording.id && $scope.isPlaying()) {
				$scope.API.pause();
			}

			if ($scope.isPaused() && $scope.isLive()) {
				$scope.widget.updateContainerStyle(_.merge($scope.widget.style, {
					width: `${STATE_DIM_PERCENTS.live_paused}%`,
					height: `${STATE_DIM_PERCENTS.live_paused}%`
				}));
			} else if (!$scope.isPlaying()) {
				$scope.widget.updateContainerStyle(_.merge($scope.widget.style, {
					width: `${STATE_DIM_PERCENTS.paused}%`,
					height: `${STATE_DIM_PERCENTS.paused}%`
				}));
			}
		});

		$scope.$watch('videoTime', (newVidTime, oldVidTime) => {
			console.log('videoTime' + ` ${$scope.recording.id}`);
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