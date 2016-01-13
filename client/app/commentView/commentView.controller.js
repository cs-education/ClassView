'use strict';

angular.module('classViewApp')
	.controller('CommentViewCtrl', ($scope, moment, Comment, _) => {
		$scope.getCommentHeader = () => {
			var user = $scope.comment.poster;
			var timeStr = moment($scope.comment.time).format('h:mm:ss a');
			
			return `${user.firstName} ${user.lastName} about ${timeStr}`;
		};

		$scope.showReplies = false;

		$scope.loadReplies = _.once(() => {
			$scope.comment.replies = $scope.comment.replies.map(replyID => {
				return Comment.get({'id': replyID});
			});
		});
	
	});