'use strict';

angular.module('classViewApp')
  .factory('User', ($resource, API_BASE_URL) => {
    return $resource(`${API_BASE_URL}/user/:id`, {
      id: '@id'
    }, { // authentication methods
    	login: {
    		method: 'POST',
    		url: `${API_BASE_URL}/user/login`,
    		isArray: false
    	},
    	register: {
    		method: 'POST',
    		url: `${API_BASE_URL}/user/register`,
    		isArray: false
    	},
    	logout: {
    		method: 'POST',
    		url: `${API_BASE_URL}/user/logout`,
    		isArray: false
    	},
    	me: {
    		method: 'GET',
    		url: `${API_BASE_URL}/user/me`,
    		isArray: false
    	},
        update: {
            method: 'PUT',
            url: `${API_BASE_URL}/user/:id`,
            params: {
                id: '@id'
            },
            isArray: false
        }
    });
  });
