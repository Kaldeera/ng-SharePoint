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

    ['$q',

    function SPExpressionResolver_Factory($q) {

        'use strict';


        var EXPRESSION_REGEXP = /{\b([\w+( |.)]*|[\[\w+\]]*)}/g,
            VALUE_IN_BRACKETS_REGEXP = /\[(\w+)\]/;



        this.resolve = function(text) {

            var deferred = $q.defer();

            $q.when(text.replace(EXPRESSION_REGEXP, function(match, p1, offset, originalText) {

                var expression = p1,
                    expressionType = expression.substring(0, expression.indexOf(/\W/.exec(expression))),
                    expressionValue;

                switch (expressionType.toLowerCase()) {

                    case 'param':
                        var paramName = VALUE_IN_BRACKETS_REGEXP.exec(expression)[1];
                        expressionValue = utils.getQueryStringParamByName(paramName);
                        break;

                }

                return expressionValue;

            })).then(function(result) {

                deferred.resolve(result);
            });

            return deferred.promise;

        }; // resolve

    } // SPExpressionResolver factory
]);