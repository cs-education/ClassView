'use strict';

angular.module('classViewApp')
  .controller('MainCtrl', ['$scope', 'mediaPlayer', 'recordings', 'buildIntervalQuery', 'getUrlForVideo', '_', ($scope, mediaPlayer, recordings, buildIntervalQuery, getUrlForVideo, _) => {
  	mediaPlayer.onSetInterval(({startTime, endTime}) => {
  		recordings
	  		.query(buildIntervalQuery({startTime, endTime}))
	  		.$promise
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
  }]);
