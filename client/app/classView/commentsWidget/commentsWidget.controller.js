'use strict';

angular.module('classViewApp')
	.controller('CommentsWidgetCtrl', ($scope, $q, _, Comment, User) => {

    var POST_AS_MYSELF = 'Post as myself';
    var POST_ANONYMOUSLY = 'Post anonymously';
    $scope.postAsList = [POST_AS_MYSELF, POST_ANONYMOUSLY];
    $scope.postAs = $scope.postAsList[0];

    User.me(function (me) {
      $scope.userId = me.id;
    });

		$scope.comment = null;
    $scope.comments = [];
    $scope.parentId = undefined;
    $scope.currentTime = new Date(0);
    $scope.activeRecording = $scope.searchResults[0].id;

    $scope.$on('commentWidgetChangeComment', function (event, params) {
      $scope.comment = params.comment;
      $scope.currentTime = params.time;
      $scope.activeRecording = params.recording;
      $scope.lookupTable = params.lookupTable;

      var comment = $scope.comment;
      if (!!comment) {
        $scope.comments = [formatComment(comment)];
        // TODO: need to lookup the poster names using id
        for (var i = 0; i < comment.replies.length; i++) {
          $scope.comments.push(formatComment(comment.replies[i]));
        }
      }
    });

    function formatComment (comment) {
      return {
        poster: comment.poster,
        content: comment.content
      };
    }

    $scope.lookupId = function (poster) {
      if (typeof poster === 'object')
        var id = poster.id;
      else
        var id = poster;
      return $scope.lookupTable[id];
    };

    $scope.postDisabled = false;
    $scope.post = function () {
      $scope.postDisabled = true;

      var poster = undefined;
      if ($scope.postAs == POST_AS_MYSELF) {
        poster = $scope.userId;
      }

      var parentId = undefined;
      if (!!$scope.comment) {
        parentId = $scope.comment.id;
      }

      var commentBody = {
        content: $scope.content,
        poster: poster,
        time: $scope.currentTime,
        recording: $scope.activeRecording,
        parent: parentId
      };

      Comment.save(commentBody, function (comment) {
        $scope.postDisabled = false;

        if (parentId) {
          $scope.comments.push(formatComment(comment));
        } else {
          $scope.comment = comment;
          $scope.comments = [formatComment(comment)];
        }
        $scope.$emit('commentsWidgetNewComment', comment);
        $scope.content = '';
      }, function (error) {
        console.log(error);
        $scope.postDisabled = false;
      });
    };
	});
