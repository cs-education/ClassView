'use strict';

angular.module('classViewApp.resources')
  .factory('recordings', ['$resource', 'API_BASE_URL', function ($resource, API_BASE_URL) {
  	return $resource(API_BASE_URL + '/recordings/:id', {
  		id: '@id'
  	});
  }])

  .factory('buildIntervalQuery', ({startTime, endTime}) => {
  	// API Docs specify query param format:
  	// 	http://sailsjs.org/documentation/reference/blueprint-api/find-where#?parameters
  	return {
  		// Want videos between start and end interval
		'where': JSON.stringify({
			'startTime': {
				'>=': startTime
			},
			'endTime': {
				'<=': endTime
			}
		})
	};
  })

  .factory('getUrlForVideo', ['API_BASE_URL', function (API_BASE_URL) {
  	return filename => [API_BASE_URL, 'videos', filename].join('/');
  }]);
