/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolverparam
 *
 * @description
 * SPExpressionResolverparam provides functionality to solve param expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolverparam', 

    [

    function SPExpressionResolverParam_Factory() {

        'use strict';

        var PARTS_REGEXP = /[\[./]([\w )]+)/g;

        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }

        return {

            resolve: function(expression, scope) {

                var paramName = getExpressionParts(expression)[0];
                var value = utils.getQueryStringParamByName(paramName);

                if (scope.expressions !== void 0) {

                    var extendedExpression = {
                        param: {
                        }
                    };
                    extendedExpression.param[paramName] = value;

                    scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
                }
                return 'expressions.param.' + paramName;
            }

        };

    }
]);

