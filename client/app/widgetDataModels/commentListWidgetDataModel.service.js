'use strict';

angular.module('classViewApp')
  .factory('CommentListWidgetDataModel', function (WidgetDataModel) {
    class CommentListWidgetDataModel extends WidgetDataModel {

      constructor(params) {
        super();
        this.recordings = params.recordings;
      }

      init() {
        this.updateScope({
          'recordings': this.recordings,
        });
      }

      destroy() {}

    };

    return CommentListWidgetDataModel;
  });
