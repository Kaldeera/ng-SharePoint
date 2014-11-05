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
            require: '^spform',

            link: function($scope, $element, $attrs, spformCtrl) {

                spformCtrl.focusElements = spformCtrl.focusElements || [];
                spformCtrl.focusElements.push({ name: $scope.name, element: $element });

            } // link

        }; // Directive definition object


        return spfieldFocusElement_DirectiveDefinitionObject;
        
    } // Directive factory

]);