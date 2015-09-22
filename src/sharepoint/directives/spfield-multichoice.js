/*
    SPFieldMultiChoice - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldMultiChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldMultichoice', 

    ['SPFieldDirective',

    function spfieldMultichoice_DirectiveFactory(SPFieldDirective) {

        var spfieldMultichoice_DirectiveDefinitionObject = {

            restrict: 'EA',
            require: ['^spform', 'ngModel'],
            replace: true,
            scope: {
                mode: '@'
            },
            templateUrl: 'templates/form-templates/spfield-control.html',


            link: function($scope, $element, $attrs, controllers) {


                var directive = {
                    
                    fieldTypeName: 'multichoice',
                    replaceAll: false,

                    init: function() {

                        $scope.chooseText = STSHtmlEncode(Strings.STS.L_Choose_Text);
                        $scope.choiceFillInDisplayText = STSHtmlEncode(Strings.STS.L_ChoiceFillInDisplayText);
                        $scope.fillInChoiceCheckbox = false;
                        $scope.fillInChoiceValue = null;
                    },

                    renderFn: function() {

                        var value = $scope.modelCtrl.$viewValue;
                        
                        // Adjust the model if no value is provided
                        if (value === null || value === void 0) {
                            value = { results: [] };
                        }

                        $scope.choices = [].concat(value.results);
                        // Checks if 'FillInChoice' option is enabled
                        if ($scope.schema.FillInChoice) {

                            // Checks if there is a value that don't match with the predefined schema choices.
                            // If so, will be the 'FillInChoice' value (user custom value).
                            angular.forEach($scope.choices, function(choice) {

                                if ($scope.schema.Choices.results.indexOf(choice) == -1) {

                                    $scope.fillInChoiceCheckbox = true;
                                    $scope.fillInChoiceValue = choice;

                                }

                            });
                        }

                        // Replace standar required validator
                        $scope.modelCtrl.$validators.required = function(modelValue, viewValue) {

                            if ($scope.currentMode != 'edit') return true;
                            if (!$scope.schema.Required) return true;
                            if (viewValue && viewValue.results.length > 0) return true;

                            return false;
                        };
                    }
                };


                SPFieldDirective.baseLinkFn.apply(directive, arguments);


                // ****************************************************************************
                // Updates the model (array of choices) when a checkbox is toggled.
                //
                $scope.toggleCheckbox = function(choice) {

                    var idx = $scope.choices.indexOf(choice);

                    if (idx != -1) {

                        $scope.choices.splice(idx, 1);

                    } else {

                        $scope.choices.push(choice);

                    }

                    sortChoices();

                };



                // ****************************************************************************
                // Sort the choices according to the definition order.
                // NOTE: The choices are already ordered in the schema.
                //
                function sortChoices() {

                    var sortedChoices = [];

                    angular.forEach($scope.schema.Choices.results, function(choice) {

                        if($scope.choices.indexOf(choice) != -1) {
                            sortedChoices.push(choice);
                        }

                    });


                    if ($scope.schema.FillInChoice && $scope.fillInChoiceCheckbox && $scope.fillInChoiceValue) {

                        sortedChoices.push($scope.fillInChoiceValue);

                    }

                    $scope.modelCtrl.$setViewValue({ results: sortedChoices });

                }


                $scope.$watch('fillInChoiceValue', function(newValue, oldValue) {

                    if (newValue == oldValue) return;

                    var oldValueIndex = $scope.choices.indexOf(oldValue);

                    if (oldValueIndex != -1) {

                        $scope.choices.splice(oldValueIndex, 1);

                    }

                    sortChoices();
                    
                });


                $scope.fillInChoiceCheckboxChanged = function() {

                    if ($scope.fillInChoiceCheckbox) {

                        var fillInChoiceElement = document.getElementById($scope.schema.InternalName + '_' + $scope.schema.Id + 'FillInText');

                        if (fillInChoiceElement) {

                            fillInChoiceElement.focus();

                        }

                    }

                    
                    sortChoices();

                };

            } // link

        }; // Directive definition object


        return spfieldMultichoice_DirectiveDefinitionObject;

    } // Directive factory

]);
