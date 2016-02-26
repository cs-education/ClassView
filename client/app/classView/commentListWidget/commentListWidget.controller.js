'use strict';

angular.module('classViewApp')
	.controller('CommentListWidgetCtrl', ($scope, $q, _, Comment, moment) => {
    // update list of comments when commentWidget makes a new comment
    $scope.$on('commentListNewComment', function (event, comment) {
      // TODO: insert efficiently
      if (comment.parent) {
        for (var i = 0; i < $scope.comments.length; i++) {
          if ($scope.comments[i].id == comment.parent) {
            if (!$scope.comments[i].replies)
              $scope.comments[i].replies = [];
            $scope.comments[i].replies.push(comment);
            break;
          }
        }
      } else {
        $scope.comments.push(comment);
        sortComments();
      }
    });

    $scope.comments = [];
    $scope.lookupTable = {};
    $scope.$on('broadcastNewRecording', function (event, recordings) {
      $scope.searchResults = recordings;
      update();
    });

    // updates everything
    function update() {
      var commentsPromises = $scope.searchResults.map(recording => Comment.query({recording: recording.id}).$promise);
      $q.all(commentsPromises)
        .then(recordingComments => {
          $scope.comments = _.flatten(recordingComments);
          sortComments();
          $scope.lookupTable = createLookupTable($scope.comments);
          changeComment(-1);
        }
        );
    }
    update();

    // keep track of the currently playing recording
    $scope.activeRecording = null;
    $scope.$on('playingRecording', function (event, recording) {
      $scope.activeRecording = recording.id;
      updateComment();
    });

    // keep track of the time into the class
    $scope.currentTime = new Date(0);
    $scope.$on('broadcastCurrentTime', function (event, currentTime) {
      $scope.currentTime = currentTime;
      updateComment();
    });

    // checks whether we need to show a new comment
    $scope.activeCommentIndex = null;
    function updateComment() {
      if (!$scope.autoScroll)
        return;

      // find the best comment to show
      var bestCommentIndex = null;
      for (var i = 0; i < $scope.comments.length; i++) {
        if (new Date($scope.comments[i].time) > new Date($scope.currentTime))
          break;
        if ($scope.comments[i].recording == $scope.activeRecording)
          bestCommentIndex = i;
      }

      changeComment(bestCommentIndex);
    }

    // change the comment widget to show the comment at the specified index
    // pass in -1 to create a new comment
    function changeComment(index) {
      if (index == null) // || index == $scope.activeCommentIndex)
        return;

      $scope.activeCommentIndex = index;
      var newComment = (index >= 0) ? $scope.comments[index] : null;
      var newTime = (index >= 0) ? newComment.time : $scope.currentTime;
      var recording = $scope.activeRecording;
      if (!recording) {
        // TODO: better null checks on recording
        recording = $scope.searchResults[0].id;
      }
      $scope.$emit('changeComment', {
        comment: newComment,
        time: newTime,
        recording: recording,
        lookupTable: $scope.lookupTable
      });
    }

    // creates a lookup table from user.id to user.name
    function createLookupTable(comments) {
      var result = {};
      for (var i = 0; i < comments.length; i++) {
        var poster = comments[i].poster;
        if (comments[i].poster) {
          result[poster.id] = poster.firstName + ' ' + poster.lastName;
        }
      }
      return result;
    }

    // sort the comments
    function sortComments() {
      $scope.comments.sort(function (a, b) {
        return new Date(a.time) - new Date(b.time);
      });
    }

    // for the auto-scroll button
    $scope.autoScroll = false;
    $scope.toggleAutoScroll = function () {
      $scope.autoScroll = !$scope.autoScroll;
      updateComment();
    };
    $scope.autoScrollClass = function () {
      return $scope.autoScroll ? "btn-success" : "btn-default";
    };

    // for the new comment button
    $scope.newComment = function () {
      $scope.autoScroll = false;
      changeComment(-1);
    };

    // for the links
    $scope.clickLink = function (index) {
      $scope.autoScroll = false;
      changeComment(index);
    };
    $scope.formatTime = function (time) {
      return moment(time).format('LTS');
    };
    $scope.linkStyle = function (comment, index) {
      if (index == $scope.activeCommentIndex)
        return {};
      if (comment.recording.id == $scope.activeRecording)
        return {color: '#333'};
      return {color: '#888'};
    };
	});
