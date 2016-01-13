'use strict';

angular.module('classViewApp')
  .factory('Comment', ($resource, API_BASE_URL) => {
    return $resource(`${API_BASE_URL}/comment/:id`, {
      id: '@id'
    });
  });
