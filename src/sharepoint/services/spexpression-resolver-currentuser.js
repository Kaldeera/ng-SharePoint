/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolvercurrentUser
 *
 * @description
 * SPExpressionResolvercurrentUser provides functionality to solve current user expressions.
 * 
 */

angular.module('ngSharePoint').factory('SPExpressionResolvercurrentUser', 

    ['SharePoint', 

    function SPExpressionResolvercurrentUser_Factory(SharePoint) {

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
                    currentUser: {
                    }
                };
                if (angular.isArray(name)) {

                    var valueObject = value;

                    for(var r = name.length - 1; r > 0; r--) {

                        var childValue = valueObject;
                        valueObject = {};
                        valueObject[name[r]] = childValue;

                    }

                    extendedExpression.currentUser[name[0]] = valueObject;

                } else {
                    extendedExpression.currentUser[name] = value;
                }

                scope.expressions = utils.deepExtend(extendedExpression, scope.expressions);
            }

        }

        return {

            resolve: function(expression, scope) {

                return SharePoint.getCurrentWeb().then(function(web) {
                
                    return web.getList('UserInfoList').then(function(list) {

                        var queryParts = getExpressionParts(expression);

                        return list.getItemProperty(_spPageContextInfo.userId, queryParts.join('/')).then(function(data) {

                            var value = data[queryParts[queryParts.length - 1]];
                            createExpressionValue(scope, queryParts, value);
                            return 'expressions.currentUser.' + queryParts.join('.');

                        }, function() {

                            return 'expressions.currentUser.' + queryParts.join('.');
                        });
                    });
                });
            }

        };

    }
]);

