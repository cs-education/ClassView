'use strict';

describe('Controller: ClassViewCtrl', function () {

  // load the controller's module
  beforeEach(module('classViewApp'));

  var ClassViewCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClassViewCtrl = $controller('ClassViewCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
