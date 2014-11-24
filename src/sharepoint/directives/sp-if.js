/*
  SPIf - directive
  
  Pau Codina (pau.codina@kaldeera.com)
  Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

  Copyright (c) 2014
  Licensed under the MIT License
*/



///////////////////////////////////////
//  SPIf
///////////////////////////////////////

angular.module('ngSharePoint').directive('spIf',

    ['$compile', 'SPExpressionResolver',

    function spIf_DirectiveFactory($compile, SPExpressionResolver) {

        var spIfDirectiveDefinitionObject = {

            restrict: 'A',
            terminal: true,
            priority: 600,


            link: function ($scope, $element, $attrs) {

                SPExpressionResolver.resolve($attrs.spIf, $scope).then(function(result) {

                    if (!$scope.$eval(result)) {

                        $element.remove();
                        $element = null;

                    } else {

                        $element.removeAttr('sp-if');
                        $element = $compile($element, 600)($scope);

                    }

                });

            } // link

        }; // Directive definition object


        return spIfDirectiveDefinitionObject;

    } // Directive factory

]);