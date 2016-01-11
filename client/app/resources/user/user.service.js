'use strict';

angular.module('classViewApp')
  .factory('User', ($resource, API_BASE_URL) => {
    return $resource(API_BASE_URL + '/user/:id', {
      id: '@id'
    });
  });
