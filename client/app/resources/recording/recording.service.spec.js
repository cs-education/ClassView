'use strict';

describe('Service: recordings', function () {

  // load the service's module
  beforeEach(module('classViewApp'));

  // instantiate service
  var recordings;
  beforeEach(inject(function (_recordings_) {
    recordings = _recordings_;
  }));

  it('should do something', function () {
    expect(!!recordings).toBe(true);
  });

});
