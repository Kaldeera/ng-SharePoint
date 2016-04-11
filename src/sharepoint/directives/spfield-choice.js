/*
    SPFieldChoice - directive

    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License



    Minimal Schema definition and extended properties:

    FieldXXXX: {
        TypeAsString: 'Choice',
        FillInChoice: false,
        EditFormat: 0,          // 0 - DropDown, 1 - RadioButton
        Choices: {              // ListQuery apply if exists and removes current results
            ListQuery: {
                Web: '/path/to/valid/web',  // Optional (by default gets the curerent web)
                List: 'ListName',
                Field: 'Title',             // Optional (by default gets the 'Title')
                Query: {                    // Optional. All query properties of OData query operations are valid
                                            // https://msdn.microsoft.com/en-us/library/office/fp142385%28v=office.15%29.aspx
                    $orderBy: 'Title'
                }
            },
            // If you don't want to make a list query, you can specify one custom array of options
            results: ['Activity 1', 'Activity 2', 'Activity 3', '...']
        }
    },

*/



///////////////////////////////////////
//  SPFieldChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldChoice',

    ['SharePoint', 'SPFieldDirective', '$q',

    function spfieldChoice_DirectiveFactory(SharePoint, SPFieldDirective, $q) {

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

                        if ($scope.schema.Choices.ListQuery !== undefined) {

                            $scope.choices = [];
                            getResultsFromListQuery($scope.schema.Choices.ListQuery);

                        } else {

                            $scope.choices = $scope.schema.Choices.results;
                        }

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
                                    if ($scope.choices !== void 0) {
                                        $scope.dropDownValue = $scope.value;
                                    }
                                    $scope.selectedOption = 'DropDownButton';
                                    break;

                                case 1:
                                    // Radio buttons
                                    $scope.selectedOption = $scope.value;
                                    break;
                            }

                        }
                    },

                    formatterFn: function(modelValue) {

						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, modelValue, $scope.lastValue);
						$scope.lastValue = modelValue;

                        return modelValue;
                    },

					parserFn: function(viewValue) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue);
						$scope.lastValue = viewValue;

						return viewValue;
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


                ///////////////////////////////////////////////////////////////////
                function getResultsFromListQuery(ListQuery) {

                    var def = $q.defer();
                    var webPromise = $scope.item.list.web;

                    if (ListQuery.Web !== undefined) {
                        webPromise = SharePoint.getWeb(ListQuery.Web);
                    }

                    $q.when(webPromise).then(function(web) {

                        web.getList(ListQuery.List).then(function(list) {

                            list.getListItems(ListQuery.Query).then(function(items) {

                                $scope.choices = [];
                                angular.forEach(items, function(item) {
                                    $scope.choices.push(item[ListQuery.Field || 'Title']);
                                });
                                $scope.dropDownValue = $scope.value;
                            });

                        }, function(err) {

                            def.reject(err);
                        });

                    });

                    return def.promise;
                }



            } // link


        }; // Directive definition object


        return spfieldChoice_DirectiveDefinitionObject;

    } // Directive factory

]);
