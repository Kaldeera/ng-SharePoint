/*
    SPFieldFocusElement - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldFocusElement
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldFocusElement', 

    [

    function spfieldFocusElement_DirectiveFactory() {

        var spfieldFocusElement_DirectiveDefinitionObject = {

            restrict: 'A',

            link: function($scope, $element, $attrs) {

                if ($scope.formCtrl) {

                    $scope.formCtrl.focusElements = $scope.formCtrl.focusElements || [];

                    if (!existsFocusElement($scope.name)) {

                        $scope.formCtrl.focusElements.push({ name: $scope.name, element: $element });

                    }

                }


                function existsFocusElement(name) {

                    for (var i = 0; i < $scope.formCtrl.focusElements.length; i++) {
                        
                        if ($scope.formCtrl.focusElements[i].name === name) {

                            return true;

                        }

                    }

                    return false;

                }

            } // link

        }; // Directive definition object


        return spfieldFocusElement_DirectiveDefinitionObject;
        
    } // Directive factory

]);
