'use strict';

describe('Directive: commentView', function () {

  // load the directive's module and view
  beforeEach(module('classViewApp'));
  beforeEach(module('app/commentView/commentView.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<comment-view></comment-view>');
    element = $compile(element)(scope);
    scope.$apply();
  }));
});
