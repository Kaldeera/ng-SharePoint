/**
 * @ngdoc object
 * @name ngSharePoint.SPExpressionResolver
 *
 * @description
 * SPExpressionResolver provides functionality to solve expressions.
 *
 * The method creates new scope variable called `expressions` that contains variables with the name of the expression 
 * provider used and their corresponding values. With this way, when AngularJS analizes the 
 * expressions, its will be evaluated correctly.
 *
 * Valid expressions should match the next pattern:
 * <pre>
 * {provider.value}
 * </pre>
 * Where `provider` refers to the provider who will solve the expression, and `value` refers
 * to the valuo to solve.
 * 
 * Actually the only providers that you can use are:
 * - `item`: solves item related values
 * - `currentUser`: solves current user related values (site user info list)
 * - `param`: solves page parameters
 * - `web`: solves web properties
 * - `list`: solves list properties
 * - `userProfile`: (coming soon)
 *
 * Expression, also, can be composed by complex values like:
 * <pre>
 * {provider.value1.value2....valuen}
 * </pre>
 * This only apply to `currentUser` or `item` values.
 *
 * @example
 * Example of expressions:
 * <pre>
 * {item.Status}=='Closed'
 * </pre>
 * <pre>
 * {currentUser.JobTitle}
 * </pre>
 * This expression creates a new variable called `currentUser` with the next composition:
 * <pre>
 * scope.expressions = {
 *      currentUser: {
 *           JobTitle: 'value' 
 *      }
 * }
 * </pre>
 *
 * <pre>
 * {item.Department.Manager.Email}
 * </pre>
 * Refers to the manager's email of the department where the item is referenced.
 * This expressions creates the next object composition:
 * <pre>
 * scope.expressions = {
 *      item: {
 *          Department: {
 *              Manager: {
 *                  Email: 'useremail@company.com'
 *              }
 *          }
 *      }
 * }
 * </pre>
 *
 * <pre>
 * {currentUser.Area.Address}
 * </pre>
 * 
 */

angular.module('ngSharePoint').provider('SPExpressionResolver', 

    [

    function SPExpressionResolver_Provider() {

        'use strict';

        var CustomExpresionProviders = {
            /*
            'currentUser': 'SPExpressionResolvercurrentUser',
            'currentUser': 'otherCurrentUserProvider'
            */
        };

        var SPExpressionResolver = function($injector, $q, SharePoint, $parse) {

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

                var expressionProviderName = 'SPExpressionResolver' + expressionType;
                if (CustomExpresionProviders[expressionType] !== void 0) {
                    expressionProviderName = CustomExpresionProviders[expressionType];
                }

                var service = $injector.get(expressionProviderName);
                var expressionPromise = service.resolve(expression, scope);

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

                if (queryParts.length == 1) {

                    return scope.item[queryParts[0]];

                } else {

                    return scope.item.list.getItemProperty(scope.item.Id, queryParts.join('/')).then(function(data) {

                        return data[queryParts[queryParts.length - 1]];
                
                    }, function() {

                        return undefined;
                    });
                }
                
            }



            function resolveCurrentUserExpression(expression) {

                return SharePoint.getCurrentWeb().then(function(web) {
                
                    return web.getList('UserInfoList').then(function(list) {

                        var queryParts = getExpressionParts(expression);

                        return list.getItemProperty(_spPageContextInfo.userId, queryParts.join('/')).then(function(data) {

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

            /**
             * @ngdoc function
             * @name ngSharePoint.SPExpressionResolver#resolve
             * @methodOf ngSharePoint.SPExpressionResolver
             * 
             * @description
             * This method solves all expressions contained within the text received as parameter.
             *
             * @param {string} Text expression to solve
             * @param {object} scope with the context where `expressions` values will be placed.
             * @returns {promise} Promise with the solved expressions
             * 
             * @example
             * <pre>
             * var textToEvaluate = '{currentUser.Id}=={item.Author.Id} and {params.Close}=="Yes"';
             * SPExpressionResolver.resolve(textToEvaluate, $scope).then(function(sentence) {
             *
             *      // At this point, expressions are solved and scope variables created
             *      // We can evaluate the sentence
             *
             *      if ($scope.$eval(sentence)) {
             *
             *          // The current user is the author of the current item and exists
             *          // a page param equals to `Yes`
             *      }
             *  });
             * </pre>
             */
            this.resolve = function(text, scope) {

                var deferred = $q.defer();
                var expressionsArray = [];

                if (angular.isString(text)) {
                    
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

                }

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

        };


        this.$get = function($injector, $q, SharePoint, $parse) {
            return new SPExpressionResolver($injector, $q, SharePoint, $parse);
        };

    }

]);
