/*
    SPFieldValidationMessages - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldValidationMessages
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldValidationMessages', 

    [

    function spfieldValidationMessages_DirectiveFactory() {

        var spfieldValidationMessages_DirectiveDefinitionObject = {

            restrict: 'E',
            replace: true,
            templateUrl: 'templates/form-templates/spfield-validation-messages.html',


            link: function($scope, $element, $attrs) {

                $scope.SPClientRequiredValidatorError = Strings.STS.L_SPClientRequiredValidatorError;
            }

        };


        return spfieldValidationMessages_DirectiveDefinitionObject;

    }

]);
