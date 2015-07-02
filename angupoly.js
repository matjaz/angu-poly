angular.module('angupoly', [])
.directive('angupoly', function($parse) {
  return {
    priority: 42,
    restrict: 'A',
    controller: function($scope, $element, $attrs) {
      var el = $element[0];
      var conf = $scope.$eval($attrs.angupoly);

      Object.keys(conf).forEach(function(propName) {
        var path = conf[propName];
        var type;
        if (typeof path === 'object') {
          type = path.type;
          path = path.path;
        }
        var parse = $parse(path);
        var assign = parse.assign;

        // from angular scope to element property
        if (type === 'array') {
          $scope.$watchCollection(path, function(val) {
            // clone new array, since Polymer doesn't update same object reference
            el.set(propName, val.slice());
          });
        } else {
          $scope.$watch(path, function(val) {
            el[propName] = val;
          });
        }

        if (assign) {
          // from element property to angular scope
          el.addEventListener(propName + '-changed', function(e) {
            var detail = e.detail;
            var path = detail.path;
            if (!path || path === propName) {
              $scope.$evalAsync(function() {
                assign($scope, detail.value);
              });
            } else if (path === propName + '.splices') {
              $scope.$apply();
            }
          });
        }

      });
    }
  };
});
