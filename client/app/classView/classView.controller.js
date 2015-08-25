'use strict';

angular.module('classViewApp')
	.controller('ClassViewCtrl', ['$scope', 'recordings', 'buildIntervalQuery', 'getUrlForVideo', '_', ($scope, recordings, buildIntervalQuery, getUrlForVideo, _) => {
	  	$scope.mediaPlayer.onSetInterval(({startTime, endTime}) => {
	  		recordings
		  		.query(buildIntervalQuery({startTime, endTime})).$promise
		  		.then((results) => {
		  			var firstResult = _.first(results);
		  			if (_.isUndefined(firstResult)) {
		  				// TODO: Add some sort of alert
		  			} else {
		  				var videoSrc = getUrlForVideo(firstResult.filename);
		  				$scope.videoSources = [
		  					{
		  						'src': videoSrc,
		  						'type': 'video/mp4'
		  					}
		  				];
		  			}
		  		});
	  	});

	  	$scope.videoSources = [
	  		{
	  			'src': 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
	  			'type': 'video/mp4'
	  		}
	  	];
	}]);