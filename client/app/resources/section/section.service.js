'use strict';

angular.module('classViewApp')
  .factory('Section', ($resource, API_BASE_URL) => {
    return $resource(`${API_BASE_URL}/section/:id`, {
      id: '@id'
    });
  });
