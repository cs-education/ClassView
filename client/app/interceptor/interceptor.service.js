'use strict';

angular.module('classViewApp')
  .factory('interceptor', () => {
    return {
      request: config => {
        // Set's device header randomly...need to change if there's a way to specify the particular machine
        config.headers['consumer-device-id'] = String(Date.now() * Math.random() * 100);
        return config;
      }
    };
});
