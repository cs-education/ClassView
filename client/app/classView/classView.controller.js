'use strict';

angular.module('classViewApp')
	.controller('ClassViewCtrl', ($scope, $q, Course, Section, Recording, buildIntervalQuery, getUrlForVideo, formatRecording, _) => {
		$scope.searchResults = [];
		$scope.currentTime   = new Date(0); // default should be such that nothing can be after it

		$scope.playingRecording = null;

		$scope.$on('setPlayingRecording', (event, recording) => {
			$scope.playingRecording = recording;
			$scope.$broadcast('playingRecording', $scope.playingRecording);
		});

		$scope.$on('updateCurrentTime', (event, {recording, videoTime}) => {
			if ($scope.playingRecording.id !== recording.id) {
				return;
			}
			
			var videoTimeMillis = videoTime * 1000;
			var videoStartTimeMillis = recording.startTime.getTime();
			
			$scope.currentTime = new Date(videoTimeMillis + videoStartTimeMillis);
		});

		$scope.$on('videoPlaybackDone', (event, recording) => {
			if ($scope.playingRecording.id !== recording.id) {
				return;
			}

			$scope.playingRecording = null;

			var lastRecording = _.last($scope.searchResults);

			if (lastRecording.id === recording.id) {
				$scope.currentTime = new Date(0); // will set all widgets to not live
			} else {
				$scope.$broadcast('nextVideo', recording);
			}
		});

		$scope.$on('skipVideo', (event, recording) => {
			// tell widgets to start playing the video after this recording in the playlist
			var lastRecording = _.last($scope.searchResults);

			if (lastRecording.id === recording.id) {
				$scope.currentTime = new Date(0); // will set all widgets to not live
			} else {
				$scope.$broadcast('nextVideo', recording);
			}
		});

		function resolvedPromise(val) {
			var deferred = $q.defer();
			deferred.resolve(val);
			return deferred.promise;
		}

		// initially no sections to search within, will be populated after request for given course info
		var sectionsPromise = _.isNumber($scope.section) ? getSectionPromise() : resolvedPromise([]);

	  	function buildVideoObject(recording) {
	  		return _.merge(recording, {
	  			'videoSources': [
		  			{
		  				'src': getUrlForVideo(recording.filename),
		  				'type': 'video/mp4' 
		  			}
	  			]
	  		});
	  	}

	  	// given a JS Date, returns string of just the time in a simple human readable format
	  	function getDateUIString(date) {
	  		var amPm = date.getHours() >= 11 ? 'PM' : 'AM';
	  		var hour = (date.getHours() % 12) + 1;
	  		var minStr = String(date.getMinutes());
	  		minStr = minStr.length < 2 ? `0${minStr}` : minStr; // pad with a 0 if minutes is single digit
	  		return `${hour}:${minStr} ${amPm}`;
	  	}

	  	function getRecordingTitle(recording) {
	  		return `${getDateUIString(recording.startTime)} - ${getDateUIString(recording.endTime)}`;
	  	}

	  	function setRecordingData(recordings) {
			// recordings from different sections have been aggregated into one
			recordings.forEach(formatRecording);
			$scope.searchResults = recordings.map(buildVideoObject);
			// Order primarily by sectionID, then by earliest startTime, and then by earliest endTime
			$scope.searchResults = _.sortByAll($scope.searchResults, ['startTime', 'endTime']);
			$scope.currentTime = _.first($scope.searchResults).startTime;
			
			var widgetDefinitions = $scope.searchResults.map((recording, idx) => {
	  			var title = getRecordingTitle(recording);
	  			return {
	  				title: title,
	  				name: String(recording.id),
	  				templateUrl: 'app/classView/videoWidget/videoWidget.html',
	  				dataModelType: 'VideoWidgetDataModel',
	  				dataModelArgs: {
	  					recordings: $scope.searchResults,
	  					title: title,
	  					idx: idx
	  				},
			        size: {
						width: '25%',
						height: '25%'
			        }
	  			};
	  		});

		  	$scope.dashboardOptions = {
		  		widgetDefinitions: widgetDefinitions,
		  		defaultWidgets: _.pluck(widgetDefinitions, 'name'), // must correspond to widget names
		  		hideToolbar: true,
		  		hideWidgetName: true,
		  		hideWidgetSettings: true,
		  		hideWidgetClose: true
		  	};
	  	}

	  	function searchForSectionRecordings({startTime, endTime}, sectionsPromise) {
	  		return sectionsPromise
	  			.then(section => {
					var queryParams = buildIntervalQuery({startTime, endTime}, section.id);
					return Recording
						.query(queryParams)
						.$promise;
	  			});
	  	}

	  	$scope.mediaPlayer.onSetInterval(({startTime, endTime}) => {
	  		$scope.startTime = startTime;
	  		$scope.endTime = endTime;

	  		return searchForSectionRecordings({startTime, endTime}, sectionsPromise)
	  		.then(recordings => {
	  			setRecordingData(recordings);
	  			return recordings;
	  		});
	  	});

	  	function getSectionPromise(sectionID) {
	  		sectionID = sectionID || $scope.section;
	  		return Section.get({id: sectionID}).$promise;
	  	}

	  	var didFirstRequest = false;

	  	$scope.$watch('section', (newSectionID, oldSectionID) => {
	  		if (newSectionID === oldSectionID && didFirstRequest) {
	  			return; // nothing changed, no need to make updates
	  		}

	  		// New course has been specified, update sectionsPromise and videos in display
	  		sectionsPromise = getSectionPromise(newSectionID);
	  		searchForSectionRecordings({
	  			startTime: $scope.startTime,
	  			endTime: $scope.endTime
	  		}, sectionsPromise)
	  		.then(recordings => {
	  			setRecordingData(recordings);
	  		});
	  		didFirstRequest = true;
	  	});
	});
