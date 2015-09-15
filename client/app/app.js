'use strict';

angular.module('classViewApp.resources', [
  'ngResource'
])
  .constant('API_BASE_URL', 'http://classcapture.herokuapp.com'); // TODO: Fill in once backend has been uploaded to host

angular.module('classViewApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'com.2fdevs.videogular',
  'com.2fdevs.videogular.plugins.controls',
  'classViewApp.resources'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
