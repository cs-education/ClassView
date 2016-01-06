'use strict';

angular.module('classViewApp')
  .directive('classView', function () {
    return {
      templateUrl: 'app/classView/classView.html',
      restrict: 'EA',
      scope: {
      	mediaPlayer: '=', // instance from MediaPlayer factory
        section: '=?', // ID of section to search for videos within...optional
      	apiHost: '=?' // optional
      }
    };
  });
  