/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolveritem
 *
 * @description
 * SPExpressionResolverItem provides functionality to solve item expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolveritem', 

    [

    function SPExpressionResolverItem_Factory() {

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
                    item: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.item[name[0]] = valueObject;

                } else {
                    extendedExpression.item[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                var queryParts = getExpressionParts(expression);

                if (queryParts.length == 1) {

                    var value = scope.item[queryParts[0]];
                    createExpressionValue(scope, queryParts[0], value);
                    return 'expressions.item.' + queryParts[0];

                } else {

                    return scope.item.list.getItemProperty(scope.item.Id, queryParts.join('/')).then(function(data) {

                        var value = data[queryParts[queryParts.length - 1]];
                        createExpressionValue(scope, queryParts, value);
                        return 'expressions.item.' + queryParts.join('.');
                
                    }, function() {

                        return 'expressions.item.' + queryParts.join('.');
                    });
                }
            }

        };

    }
]);

