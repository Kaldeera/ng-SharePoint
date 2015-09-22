/*
    SPFieldChoice - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldChoice', 

    ['SPFieldDirective',

    function spfieldChoice_DirectiveFactory(SPFieldDirective) {

        var spfieldChoice_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: ['^spform', 'ngModel'],
            replace: true,
            scope: {
                mode: '@'
            },
            templateUrl: 'templates/form-templates/spfield-control.html',
            

            link: function($scope, $element, $attrs, controllers) {


                var directive = {
                    
                    fieldTypeName: 'choice',
                    replaceAll: false,

                    init: function() {

                        $scope.choices = $scope.schema.Choices.results;
                        $scope.chooseText = STSHtmlEncode(Strings.STS.L_Choose_Text);
                        $scope.choiceFillInDisplayText = STSHtmlEncode(Strings.STS.L_ChoiceFillInDisplayText);
                        $scope.selectedOption = null;
                        $scope.dropDownValue = null;
                        $scope.fillInChoiceValue = null;
                    },

                    renderFn: function() {

                        $scope.value = $scope.modelCtrl.$viewValue;


                        if ($scope.schema.FillInChoice && $scope.choices.indexOf($scope.value) == -1) {

                            $scope.fillInChoiceValue = $scope.value;
                            $scope.selectedOption = 'FillInButton';

                        } else {

                            switch($scope.schema.EditFormat) {

                                case 0:
                                    // Dropdown
                                    $scope.dropDownValue = $scope.value;
                                    $scope.selectedOption = 'DropDownButton';
                                    break;

                                case 1:
                                    // Radio buttons
                                    $scope.selectedOption = $scope.value;
                                    break;
                            }

                        }
                    }
                };
                

                SPFieldDirective.baseLinkFn.apply(directive, arguments);


                ///////////////////////////////////////////////////////////////////////////////


                $scope.$watch('fillInChoiceValue', function(newValue, oldValue) {

                    if (newValue == oldValue || newValue === void 0 || newValue === null) return;

                    $scope.selectedOption = 'FillInButton';
                    $scope.modelCtrl.$setViewValue(newValue);

                });


                $scope.$watch('selectedOption', function(newValue, oldValue) {

                    if (newValue == oldValue) return;

                    if ($scope.selectedOption == 'FillInButton') {

                        $scope.modelCtrl.$setViewValue($scope.fillInChoiceValue);
//                        $scope.value = $scope.fillInChoiceValue;

                        var fillInChoiceElement = document.getElementById($scope.schema.InternalName + '_' + $scope.schema.Id + '_$FillInChoice');

                        if (fillInChoiceElement) {

                            fillInChoiceElement.focus();

                        }
                        
                    } else {

                        switch($scope.schema.EditFormat) {

                            case 0:
                                // DropDown
                                $scope.value = $scope.dropDownValue;
                                $scope.modelCtrl.$setViewValue($scope.dropDownValue);
                                break;

                            case 1:
                                //Radio buttons
                                $scope.value = $scope.selectedOption;
                                $scope.modelCtrl.$setViewValue($scope.selectedOption);
                                break;

                        }
                    }

                });


                $scope.dropDownChanged = function() {

                    $scope.selectedOption = 'DropDownButton';
                    $scope.modelCtrl.$setViewValue($scope.dropDownValue);
                    $scope.value = $scope.dropDownValue;

                };


                $scope.dropDownClick = function() {

                    $scope.selectedOption = 'DropDownButton';

                };


                $scope.fillInChoiceClick = function() {

                    $scope.selectedOption = 'FillInButton';

                };

            } // link


        }; // Directive definition object


        return spfieldChoice_DirectiveDefinitionObject;

    } // Directive factory

]);
