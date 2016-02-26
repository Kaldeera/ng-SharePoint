/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolverlist
 *
 * @description
 * SPExpressionResolverlist provides functionality to solve list expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolverlist', 

    [

    function SPExpressionResolverList_Factory() {

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
                    list: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.list[name[0]] = valueObject;

                } else {
                    extendedExpression.list[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                var queryParts = getExpressionParts(expression);

                return scope.item.list.getProperties().then(function(properties) {

                    var value = properties[queryParts[0]];
                    createExpressionValue(scope, queryParts[0], value);
                    return 'expressions.list.' + queryParts[0];
                });
            }

        };

    }
]);

