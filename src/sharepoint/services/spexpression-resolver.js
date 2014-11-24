/*
    SPExpressionResolver - service
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPExpressionResolver
///////////////////////////////////////

angular.module('ngSharePoint').service('SPExpressionResolver', 

    ['$q', 'SharePoint', '$parse',

    function SPExpressionResolver_Factory($q, SharePoint, $parse) {

        'use strict';


        //var OLD_EXPRESSION_REGEXP = /{\b([\w+( |.)]*|[\[\w+\]]*)}/g;
        var EXPRESSION_REGEXP = /{(\w+\W*[\w\s./\[\]\(\)]+)}(?!})/g; //-> Faster but less accurate
        //var EXPRESSION_REGEXP = /{(\w+?(?:[.\/\[](?! )[\w \]]*?)+?)}(?!})/g; //-> More accurate but slower
        var PARTS_REGEXP = /[\[./]([\w )]+)/g;


        // ****************************************************************************
        // Private methods
        //

        function resolveExpression(expressionsArray, scope, index, deferred) {

            index = index || 0;
            deferred = deferred || $q.defer();

            var expression = expressionsArray[index++];

            if (expression === void 0) {

                deferred.resolve();
                return deferred.promise;
            }


            // Extract the expression type.
            var expressionType = expression.substring(0, expression.indexOf(/\W/.exec(expression)));
            var expressionPromise;

            switch (expressionType) {

                case 'param':
                    var paramName = getExpressionParts(expression)[0];
                    expressionPromise = utils.getQueryStringParamByName(paramName);
                    break;

                case 'item':
                    expressionPromise = resolveItemExpression(expression, scope);
                    break;

                case 'currentUser':
                    expressionPromise = resolveCurrentUserExpression(expression);
                    break;

                case 'fn':
                    var functionExpression = /\W(.*)/.exec(expression)[1];
                    expressionPromise = resolveFunctionExpression(functionExpression, scope);
                    break;
            }


            // Resolve/Reject the current expression promise
            $q.when(expressionPromise).then(function(result) {

                // Sets the resolved value for the current expression
                expressionsArray[index - 1] = result;

                // Resolve next expression
                resolveExpression(expressionsArray, scope, index, deferred);

            }, function(result) {

                // Even with a promise rejection, sets the result in the current expression
                expressionsArray[index - 1] = result;
                
                // Resolve next expression
                resolveExpression(expressionsArray, scope, index, deferred);

            });


            return deferred.promise;
        }



        function getExpressionParts(text) {

            var matches = [];
            var match;

            while ((match = PARTS_REGEXP.exec(text))) {

                match.shift();
                matches.push(match.join(''));
            }

            return matches;
        }



        function resolveItemExpression(expression, scope) {

            var queryParts = getExpressionParts(expression);

            return scope.item.list.getItemQueryById(scope.item.Id, queryParts.join('/')).then(function(data) {

                return data[queryParts[queryParts.length - 1]];
        
            }, function() {

                return undefined;
            });
            
        }



        function resolveCurrentUserExpression(expression) {

            return SharePoint.getCurrentWeb().then(function(web) {
            
                return web.getList('UserInfoList').then(function(list) {

                    var queryParts = getExpressionParts(expression);

                    return list.getItemQueryById(_spPageContextInfo.userId, queryParts.join('/')).then(function(data) {

                        return data[queryParts[queryParts.length - 1]];

                    }, function() {

                        return undefined;
                    });
                });
            });
        }



        function resolveFunctionExpression(functionExpression, scope) {

            return scope.$eval($parse(functionExpression));

        }



        // ****************************************************************************
        // Public methods (Service API)
        //

        this.resolve = function(text, scope) {

            var deferred = $q.defer();
            var expressionsArray = [];

            // Use 'replace' function to extract the expressions and replace them for {e:1} to {e:n}.
            text = text.replace(EXPRESSION_REGEXP, function(match, p1, offset, originalText) {

                // Check if the expression is already added.
                // This way resolves the expression only once and replaces it in all places 
                // where appears in the text.
                var pos = expressionsArray.indexOf(p1);

                if (pos == -1) {
                    expressionsArray.push(p1);
                    pos = expressionsArray.length - 1;
                }

                return '{e:' + pos + '}';

            });


            // Resolve the 'expressionsArray' with promises
            resolveExpression(expressionsArray, scope).then(function() {

                // Replace {e:1} to {e:n} in the 'text' with the corresponding resolved expressions values.
                for (var i = 0; i < expressionsArray.length; i++) {
                    text = text.replace(new RegExp('{e:' + i + '}', 'g'), expressionsArray[i]);
                }

                // Resolve the main promise
                deferred.resolve(text);

            });


            return deferred.promise;

        }; // resolve method

    } // SPExpressionResolver factory

]);
