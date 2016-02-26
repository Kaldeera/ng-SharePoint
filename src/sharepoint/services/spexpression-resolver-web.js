/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolverweb
 *
 * @description
 * SPExpressionResolverweb provides functionality to solve web expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolverweb', 

    [

    function SPExpressionResolverWeb_Factory() {

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

        function createExpressionValue(scope, name, value) {

            if (scope.expressions !== void 0) {

                var extendedExpression = {
                    web: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.web[name[0]] = valueObject;

                } else {
                    extendedExpression.web[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                var queryParts = getExpressionParts(expression);

                return scope.item.list.web.getProperties().then(function(properties) {

                    var value = properties[queryParts[0]];
                    createExpressionValue(scope, queryParts[0], value);
                    return 'expressions.web.' + queryParts[0];
                });
            }

        };

    }
]);

