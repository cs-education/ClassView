'use strict';

angular.module('classViewApp')
  .directive('classView', function () {
    return {
      templateUrl: 'app/classView/classView.html',
      restrict: 'EA',
      scope: {
      	mediaPlayer: '=', // from mediaPlayer service
      	apiHost: '=?' // optional
      }
    };
  });
  