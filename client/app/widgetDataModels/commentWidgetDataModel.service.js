'use strict';

angular.module('classViewApp')
  .factory('CommentWidgetDataModel', function (WidgetDataModel) {
    class CommentWidgetDataModel extends WidgetDataModel {

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

    return CommentWidgetDataModel;
  });
