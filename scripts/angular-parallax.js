'use strict';

angular.module('angular-parallax', [
]).directive('parallax', ['$window','$timeout','$parse',
function($window,$timeout,$parse) {
  return {
    restrict: 'A',
    scope: {
      parallax: '=',
    },
    link: function($scope, elem, attrs) {

      // set defaults
      var centerScrollDistance,
        offsetStart = {
          vertical:0,
          horizontal:0
        },
        defaults = {
          vertical: {
            ratio: 1.1,
            offset: 0,
            bounce: false
          },
          horizontal: {
            ratio: 0,
            offset: 0,
            bounce: false
          },
          fade: false,
          start: 'relative'
        },
        options = angular.merge({},defaults,$scope.parallax);

      var init = function() {
        // start with no transform to find original position
        elem.css('transform','translate(0px, 0px)');
        centerScrollDistance =
          elem.offset().top + elem.outerHeight()/2 -$window.innerHeight/2
        if(options.start == 'relative')
          offsetStart = {
            vertical: centerScrollDistance*options.vertical.ratio,
            horizontal: centerScrollDistance*options.horizontal.ratio,
          };
        update();
      }

      var update = function () {
        var currentScroll = $window.pageYOffset;
        var offset = {
          vertical: currentScroll*options.vertical.ratio + options.vertical.offset - offsetStart.vertical,
          horizontal: currentScroll*options.horizontal.ratio + options.horizontal.offset - offsetStart.horizontal
        }
        if(options.horizontal.bounce && (currentScroll > centerScrollDistance))
          offset.horizontal = -offset.horizontal;
        if(options.vertical.bounce && (currentScroll > centerScrollDistance))
          offset.vertical = -offset.vertical;
        elem.css('transform','translate('+offset.horizontal+'px, '+offset.vertical+'px)');
        if(options.fade && options.start == 'relative')
          elem.css('opacity', 1-Math.min(Math.abs(centerScrollDistance-currentScroll)/($window.innerHeight/2),1));
        else if(options.fade)
          elem.css('opacity', 1-Math.min(currentScroll/($window.innerHeight/2),1));
      };

      $timeout(init,0);
      angular.element($window).bind("resize", init);
      angular.element($window).bind("scroll", update);
      angular.element($window).bind("touchmove", update);

      // cleanup
      $scope.$on('$destroy', function() {
        angular.element($window).unbind("resize", init);
        angular.element($window).unbind("scroll", update);
        angular.element($window).unbind("touchmove", update);
      });
    }  // link function
  };
}]).directive('parallaxBackground', ['$window', function($window) {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    scope: {
      parallaxRatio: '@',
    },
    link: function($scope, elem, attrs) {
      var setPosition = function () {
        var calcValY = (elem.prop('offsetTop') - $window.pageYOffset) * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
        // horizontal positioning
        $scope.$apply(elem.css('background-position', "50% " + calcValY + "px"));
      };

      // set our initial position - fixes webkit background render bug
      angular.element($window).bind('load', setPosition);
      angular.element($window).bind("scroll", setPosition);
      angular.element($window).bind("touchmove", setPosition);

      // cleanup
      $scope.$on('$destroy', function() {
        angular.element($window).unbind('load', setPosition);
        angular.element($window).unbind("scroll", setPosition);
        angular.element($window).unbind("touchmove", setPosition);
      });

    }  // link function
  };
}]);
