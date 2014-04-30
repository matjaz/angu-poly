angular.module('angupoly', [])
.directive('angupoly', function($rootScope, $parse) {
  return {
    priority : 42,
    restrict : 'A',
    compile  : function(tElement, tAttr) {
      var conf = $rootScope.$eval(tAttr.angupoly);
      var assignables = {};
      var paths       = {};
      var needsMutationObserver;

      Object.keys(conf).forEach(function(attrName) {
        var path  = conf[attrName],
            parse = $parse(path);
        if (parse.assign) {
          assignables[attrName] = parse.assign;
          needsMutationObserver = true;
        }
        paths[attrName] = path;
      });
      return function(scope, element) {
        var el = element[0];

        // from angular scope to attribute
        // http://www.polymer-project.org/platform/node_bind.html
        for (var attrName in paths) {
          el.bind(attrName, new PathObserver(scope, paths[attrName]));
        }

        if (needsMutationObserver) {
          // from attribute to angular scope
          // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
          // http://caniuse.com/mutationobserver
          new MutationObserver(function(mutations) {
            var mutation,
                updates,
                i = 0;
            while ((mutation = mutations[i++])) {
              for (var attrName in assignables) {
                if (mutation.attributeName === attrName) {
                  assignables[attrName](scope, mutation.target[attrName]);
                  updates = true;
                }
              }
            }
            if (updates) {
              scope.$apply();
            }
          }).observe(el, {attributes:true});
        }
      };
    }
  };
});