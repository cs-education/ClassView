'use strict';

describe('Directive: classView', function () {

  // load the directive's module and view
  beforeEach(module('classViewApp'));
  beforeEach(module('app/classView/classView.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<class-view></class-view>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the classView directive');
  }));
});