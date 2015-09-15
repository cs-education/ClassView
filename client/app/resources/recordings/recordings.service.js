'use strict';

angular.module('classViewApp.resources')
  .factory('recordings', ['$resource', 'API_BASE_URL', function ($resource, API_BASE_URL) {
  	return $resource(API_BASE_URL + '/recording/:id', {
  		id: '@id'
  	});
  }])

  // TODO: Migrate these helpers into a separate utils.service.js file
  .factory('formatRecording', function () {
    return (recording) => {
      recording.startTime = new Date(recording.startTime);
      recording.endTime   = new Date(recording.endTime);
      recording.createdAt = new Date(recording.createdAt);
      recording.updatedAt = new Date(recording.updatedAt);
      return recording;
    };
  })

  .factory('buildIntervalQuery', () => {
  	// API Docs specify query param format:
  	// 	http://sailsjs.org/documentation/reference/blueprint-api/find-where#?parameters
  	return ({startTime, endTime}) => {
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
    };
  })

  .factory('getUrlForVideo', ['API_BASE_URL', function (API_BASE_URL) {
  	return filename => [API_BASE_URL, 'getVideo', filename].join('/');
  }]);
