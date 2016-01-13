'use strict';

angular.module('classViewApp')
	.controller('CommentsWidgetCtrl', ($scope, $q, _, Comment) => {
		$scope.comments = [];

		var commentsPromises = $scope.searchResults.map(recording => Comment.query({recording: recording.id}).$promise);
		$q.all(commentsPromises)
		.then(recordingComments => {
			$scope.comments = _.flatten(recordingComments);
		});
	});