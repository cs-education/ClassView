'use strict';

angular.module('classViewApp')
	.controller('ClassViewCtrl', ($scope, $q, Course, Section, Recording, buildIntervalQuery, getUrlForVideo, formatRecording, eventEmitter, _) => {
		$scope.searchResults = [];
		$scope.currentTime   = new Date(0); // default should be such that nothing can be after it

		$scope.playingRecording = null;

		$scope.$on('setPlayingRecording', (event, recording) => {
			console.log('setPlayingRecording');
			$scope.playingRecording = recording;
			$scope.$broadcast('playingRecording', $scope.playingRecording);
		});

		$scope.$on('updateCurrentTime', (event, {recording, videoTime}) => {
			console.log('updateCurrentTime');
			if ($scope.playingRecording.id !== recording.id) {
				console.log(`updateCurrentTime called by rogue widget ${recording.id}`);
				return;
			}
			
			var videoTimeMillis = videoTime * 1000;
			var videoStartTimeMillis = recording.startTime.getTime();
			
			$scope.currentTime = new Date(videoTimeMillis + videoStartTimeMillis);
		});

		$scope.$on('playbackDone', (event, recording) => {
			console.log('playbackDone parent');
			if ($scope.playingRecording && $scope.playingRecording.id !== recording.id) {
				console.log('playbackDone called by rogue widget');
				return;
			}

			$scope.playingRecording = null;
			$scope.$broadcast('playbackDone', recording);
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

	  	function getDateUIString(date) {
	  		var amPm = date.getHours() >= 11 ? 'PM' : 'AM';
	  		var hour = (date.getHours() % 12) + 1;
	  		var min = date.getMinutes();
	  		return `${hour}:${min} ${amPm}`;
	  	}

	  	function getRecordingTitle(recording) {
	  		return `${getDateUIString(recording.startTime)} - ${getDateUIString(recording.endTime)} ID=${recording.id}`;
	  	}

	  	function setRecordingData(recordings) {
			// recordings from different sections have been aggregated into one
			recordings.forEach(formatRecording);
			$scope.searchResults = recordings.map(buildVideoObject);
			// Order primarily by sectionID, then by earliest startTime, and then by earliest endTime
			$scope.searchResults = _.sortByAll($scope.searchResults, ['startTime', 'endTime']);
			$scope.currentTime = _.first($scope.searchResults).startTime;
			
		  	$scope.dashboardOptions = {
		  		widgetDefinitions: $scope.searchResults.map((recording, idx) => {
		  			var title = getRecordingTitle(recording);
		  			return {
		  				title: title,
		  				name: title,
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
		  		}),
		  		defaultWidgets: $scope.searchResults.map(getRecordingTitle),
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
