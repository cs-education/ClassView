'use strict';

angular.module('classViewApp')
  .directive('commentView', function () {
    return {
      templateUrl: 'app/commentView/commentView.html',
      restrict: 'EA',
      scope: {
      	'comment': '='
      }
    };
  });
