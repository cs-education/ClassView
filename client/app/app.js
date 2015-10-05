'use strict';

angular.module('classViewApp.resources', [
  'ngResource'
])
  .constant('API_BASE_URL', '/api/'); // server will internally forward these calls to API Server

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
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('interceptor');
  });
