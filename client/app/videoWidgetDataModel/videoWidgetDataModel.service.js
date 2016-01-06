'use strict';

angular.module('classViewApp')
  .factory('VideoWidgetDataModel', function (WidgetDataModel) {
    class VideoWidgetDataModel extends WidgetDataModel {

      constructor({recordings, idx, title}) {
        super();
        this.recordings = recordings;
        this.title = title;
        this.idx = idx;
      }

      init() {
        this.updateScope({
          'recordings': this.recordings,
          'title': this.title,
          'idx': this.idx
        });
      }

      destroy() {}

    };

    return VideoWidgetDataModel;
  });
