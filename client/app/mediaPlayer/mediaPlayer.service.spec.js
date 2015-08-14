'use strict';

describe('Service: mediaPlayer', function () {

  // load the service's module
  beforeEach(module('classViewApp'));

  // instantiate service
  var mediaPlayer;
  beforeEach(inject(function (_mediaPlayer_) {
    mediaPlayer = _mediaPlayer_;
  }));

  it('should do something', function () {
    expect(!!mediaPlayer).toBe(true);
  });

});
