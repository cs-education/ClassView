'use strict';

angular.module('classViewApp')
	.controller('ClassViewCtrl', ($scope, $q, Course, Section, Recording, buildIntervalQuery, getUrlForVideo, formatRecording, moment, _) => {
		$scope.searchResults = [];
		$scope.currentTime   = new Date(0); // default should be such that nothing can be after it

		$scope.playingRecording = null;

		$scope.$on('setPlayingRecording', (event, recording) => {
			$scope.playingRecording = recording;
			$scope.$broadcast('playingRecording', $scope.playingRecording);
		});

		$scope.$on('updateCurrentTime', (event, params) => {
      var recording = params.recording;
      var videoTime = params.videoTime;
			if ($scope.playingRecording.id !== recording.id) {
				return;
			}
			
			var videoTimeMillis = videoTime * 1000;
			var videoStartTimeMillis = recording.startTime.getTime();
			
			$scope.currentTime = new Date(videoTimeMillis + videoStartTimeMillis);
      $scope.$broadcast('broadcastCurrentTime', $scope.currentTime);
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

    // for commentListWidget communication to commentWidget
    $scope.$on('changeComment', function (event, newComment) {
      $scope.$broadcast('commentWidgetChangeComment', newComment);
    });
    $scope.$on('commentsWidgetNewComment', function (event, comment) {
      $scope.$broadcast('commentListNewComment', comment);
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

	  	function getRecordingTitle(recording) {
	  		return `${moment(recording.startTime).format('LT')} - ${moment(recording.endTime).format('LT')}`;
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

      var commentWidget = {
        title: 'Comments',
        name: 'comments',
        templateUrl: 'app/classView/commentsWidget/commentsWidget.html',
        dataModelType: 'CommentWidgetDataModel',
        dataModelArgs: {
          recordings: $scope.searchResults
        },
        size: {
          width: '60%',
          height: '25%'
        }
      };
      widgetDefinitions.push(commentWidget);

      var commentListWidget = {
        title: 'Comment List',
        name: 'commentList',
        templateUrl: 'app/classView/commentListWidget/commentListWidget.html',
        dataModelType: 'CommentListWidgetDataModel',
        dataModelArgs: {
          recordings: $scope.searchResults
        },
        size: {
          width: '40%',
          height: '75%'
        }
      };
      widgetDefinitions.push(commentListWidget);

		  	$scope.dashboardOptions = {
		  		widgetDefinitions: widgetDefinitions,
		  		defaultWidgets: _.pluck(widgetDefinitions, 'name'), // must correspond to widget names
		  		hideToolbar: true,
		  		hideWidgetName: true,
		  		hideWidgetSettings: true,
		  		hideWidgetClose: true
		  	};
	  	}

	  	function searchForSectionRecordings(params, sectionsPromise) {
        var startTime = params.startTime;
        var endTime = params.endTime;
	  		return sectionsPromise
	  			.then(section => {
					var queryParams = buildIntervalQuery({startTime, endTime}, section.id);
					return Recording
						.query(queryParams)
						.$promise;
	  			});
	  	}

	  	$scope.mediaPlayer.onSetInterval((params) => {
        var startTime = params.startTime;
        var endTime = params.endTime;
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
          $scope.$broadcast('broadcastNewRecording', recordings);
	  		});
	  		didFirstRequest = true;
	  	});
	});
