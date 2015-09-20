'use strict';

angular.module('classViewApp')
	.controller('ClassViewCtrl', ($scope, $q, Course, Section, Recording, buildIntervalQuery, getUrlForVideo, formatRecording, _) => {
		const SMALL_VIDEO_SEEK_THRESH = 500; // Interval at which small videos will be synchronized with main video (millis)

		$scope.searchResults = [];
		$scope.mainVideo     = null;
		$scope.isPlaying     = false;
		$scope.autoPlay      = false;
		$scope.currentTime   = new Date(0); // default should be such that nothing can be after it

		function resolvedPromise(val) {
			var deferred = $q.defer();
			deferred.resolve(val);
			return deferred.promise;
		}

		// initially no sections to search within, will be populated after request for given course info
		var sectionsPromise = resolvedPromise([]);
		
		var lastSynchTime = new Date(0);

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

	  	function searchForCourseRecordings({startTime, endTime}) {
	  		return sectionsPromise
	  			.then(sections => {
	  				var sectionRecordingsPromises = sections
	  					.map(section => {
	  						var queryParams = buildIntervalQuery({startTime, endTime}, section);
		  					return Recording
		  						.query(queryParams)
		  						.$promise;
	  					});

  					return $q.all(sectionRecordingsPromises);
	  			})
				.then(sectionRecordingsResults => {
					// sectionRecordingsResults = [[Recordings for Section], [Recordings for Section], ....]
					// Just need to put all of these arrays of results into a single array
					return _.flatten(sectionRecordingsResults);
				})
				.then(results => {
					// results from different sections have been aggregated into one
		  			results.forEach(formatRecording);
					$scope.searchResults = results.map(buildVideoObject);
					// Order primarily by sectionID, then by earliest startTime, and then by earliest endTime
					$scope.searchResults = _.sortByAll($scope.searchResults, ['section.id', 'startTime', 'endTime']);
					$scope.mainVideo = $scope.searchResults.shift();

					return results;
		  		});
	  	}

	  	$scope.mediaPlayer.onSetInterval(({startTime, endTime}) => {
	  		return searchForCourseRecordings({startTime, endTime})
	  	});

	  	$scope.getUrlForVideo = getUrlForVideo;

	  	function clamp (lo, hi, val) {
	  		return val < lo ? lo : ((val > hi) ? hi : val);
	  	}

	  	function isLive (videoObject, currentTime) {
	  		currentTime = currentTime || $scope.currentTime;
	  		return (videoObject.startTime <= currentTime) && (videoObject.endTime >= currentTime);
	  	}

	  	function synchVideo (videoObject, currentTime) {
	  		currentTime = currentTime || $scope.currentTime;
			var videoSeekTimeMillis = currentTime.getTime() - videoObject.startTime.getTime();
			var videoSeekTimeSecs = videoSeekTimeMillis / 1000;
			videoSeekTimeSecs = clamp(0, videoObject.API.totalTime, videoSeekTimeSecs); // for safety
			if (videoObject == $scope.mainVideo) {
				console.log('videoSeekTimeSecs=' + videoSeekTimeSecs);
				console.log('$scope.mainVideo.API.seekTime=\n' + $scope.mainVideo.API.seekTime.toString());
			}
			videoObject.API.seekTime(videoSeekTimeSecs);
	  	}

	  	// Deferred promise to be fullfilled once mainVideo.API is attatched
	  	var mainVideoAPIDeferred = $q.defer();

	  	$scope.attatchMainVideoAPI = API => {
	  		console.log('attatchMainVideoAPI()');
	  		$scope.mainVideo.API = API;
	  		mainVideoAPIDeferred.resolve(API);
	  	};

	  	$scope.makeMainVideo = recordingId => {
	  		var timeBeforeChange = $scope.currentTime;
	  		mainVideoAPIDeferred = $q.defer();

	  		var newMainVideo = _.findWhere($scope.searchResults, {'id': recordingId});
	  		$scope.searchResults.push($scope.mainVideo);
	  		$scope.mainVideo = newMainVideo;
	  		_.remove($scope.searchResults, {'id': recordingId});
	  		// If it was a live video, make it seek to the time in the video that the user was at in the previous video
	  		if (isLive($scope.mainVideo, timeBeforeChange)) {
	  			console.log('isLive');
	  			console.log('$scope.mainVideo.API exists=' + !_.isUndefined($scope.mainVideo.API));
	  			
	  			if ($scope.mainVideo.API) {
	  				mainVideoAPIDeferred.resolve($scope.mainVideo.API);
	  			}

	  			mainVideoAPIDeferred.promise
		  			.then(API => {
		  				console.log('received mainVideo API');
		  				$scope.currentTime = timeBeforeChange;
		  				API.pause();
		  				synchVideo($scope.mainVideo);
		  				$scope.autoPlay = $scope.isPlaying;
		  			});
	  		} else {
	  			$scope.autoPlay = false;
	  		}

	  		lastSynchTime = new Date(0); // restart main video synchronization
	  	};

	  	$scope.onUpdateTime = seekTime => {
			var seekTimeMillis           = seekTime * 1000;
			var mainVideoStartTimeMillis = $scope.mainVideo.startTime.getTime();
			$scope.currentTime           = new Date(mainVideoStartTimeMillis + seekTimeMillis);
	  	};

	  	$scope.onStateChange = state => {
	  		console.log('state: ' + state);
	  		$scope.isPlaying = state === 'play';
	  		console.log('mainVideo.currentTime=' + $scope.mainVideo.API.currentTime)
	  	};

	  	// Responsible for synchronizing small videos with main video
	  	function synchronizeSmallVideos (currentTime) {
	  		// Only update every SMALL_VIDEO_SEEK_THRESH milliseconds. Improve performance by less seeks.
	  		if (currentTime.getTime() - lastSynchTime.getTime() < SMALL_VIDEO_SEEK_THRESH) {
	  			return;
	  		}

	  		var isCurrentlyLive = videoObject => isLive(videoObject, currentTime);

			var liveSmallVideos    = $scope.searchResults.filter(isCurrentlyLive);
			var nonLiveSmallVideos = $scope.searchResults.filter(_.negate(isCurrentlyLive));

	  		// Filter out the objects that don't yet have an API interface attached to it
	  		liveSmallVideos = liveSmallVideos.filter(videoObject => videoObject.API);

	  		liveSmallVideos.forEach(videoObject => {
	  			synchVideo(videoObject, currentTime);
	  		});

	  		var updatedSearchResults = liveSmallVideos.concat(nonLiveSmallVideos);
	  		if (!_.isEqual($scope.searchResults, updatedSearchResults)) {
		  		// Bring live videos to front of smallVideos list
		  		$scope.searchResults = updatedSearchResults;
	  		}

	  		lastSynchTime = currentTime; // update last synch time
	  	}

	  	$scope.$watch('currentTime', (newTime, oldTime) => {
	  		synchronizeSmallVideos(newTime);
	  	});

	  	function getCourseSectionsPromise(courseID) {
	  		courseID = courseID || $scope.course;
	  		return Course.get({id: courseID}).$promise
	  			.then(course => {
	  				return course.sections;
	  			});
	  	}

	  	$scope.$watch('course', (newCourseID, oldCourseID) => {
	  		if (newCourseID === oldCourseID) {
	  			return; // nothing changed, no need to make updates
	  		}

	  		// New course has been specified, update sectionsPromise and videos in display
	  		sectionsPromise = getCourseSectionsPromise(newCourseID);
	  		searchForCourseRecordings({
	  			startTime: $scope.startTime,
	  			endTime: $scope.endTime
	  		});
	  	});
	});
