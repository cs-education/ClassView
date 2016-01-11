'use strict';

angular.module('classViewApp')
  .factory('Course', ($resource, API_BASE_URL) => {
    return $resource(`${API_BASE_URL}/course/:id`, {
      id: '@id'
    });
  });
