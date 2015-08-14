'use strict';

angular.module('classViewApp.resources', [
  'ngResource'
])
  .constant('API_BASE_URL', '');

angular.module('classViewApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'classViewApp.resources'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
