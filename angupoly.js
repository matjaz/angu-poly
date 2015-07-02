angular.module('angupoly', [])
.directive('angupoly', function($parse) {
  return {
    priority: 42,
    restrict: 'A',
    link: function(scope, element, attr) {
      var el = element[0];
      var conf = scope.$eval(attr.angupoly);

      Object.keys(conf).forEach(function(propName) {
        var path  = conf[propName];
        var parse = $parse(path);
        var assign = parse.assign;

        // from angular scope to element property
        scope.$watch(path, function(val) {
          el[propName] = val;
        });

        if (assign) {
          // from element property to angular scope
          el.addEventListener(propName + '-changed', function(e) {
            var detail = e.detail;
            var path = detail.path;
            if (!path || path === propName) {
              scope.$evalAsync(function() {
                assign(scope, detail.value);
              });
            } else if (path === propName + '.splices') {
              scope.$apply();
            }
          });
        }

      });
    }
  };
});
