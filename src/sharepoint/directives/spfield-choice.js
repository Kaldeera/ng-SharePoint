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
    }

    **NOTE**
    Query $filter value can include references to other item fields.
    This references are evaluated and used to retrieve dropDownValues.
    Example:
        $filter: "status eq 'Aprobado' and userName eq '{requiredBy.Title}'",

    Choice field watch for requiredBy changes, refresh the ListQuery sentence
    and retrieves new values.
*/



///////////////////////////////////////
//  SPFieldChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldChoice',

    ['SharePoint', 'SPFieldDirective', '$q', '$timeout',

    function spfieldChoice_DirectiveFactory(SharePoint, SPFieldDirective, $q, $timeout) {

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
                            if ($scope.currentMode === 'edit') {
                                getResultsFromListQuery($scope.schema.Choices.ListQuery);
                            }

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

                        var data;
                        if ($scope.items !== void 0) {
                            angular.forEach($scope.items, function(item) {
                                if (item.campo14 === viewValue) data = item;
                            });
                        }
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, viewValue, $scope.lastValue, data);
						$scope.lastValue = viewValue;

						return viewValue;
                    }

                };


                SPFieldDirective.baseLinkFn.apply(directive, arguments);


                // ****************************************************************************
				// Check for dependences.
				//
                if ($scope.currentMode === 'edit' && $scope.schema.Choices.ListQuery !== undefined) {
                    if ($scope.schema.Choices.ListQuery.Query !== void 0) {
                        if ($scope.schema.Choices.ListQuery.Query.$filter !== void 0) {

                            $scope.schema.Choices.ListQuery.Query.originalFilter = $scope.schema.Choices.ListQuery.Query.$filter;
                            $scope.dependences = [];

                            var EXPRESSION_REGEXP = /{(\w+\W*[\w\s./\[\]\(\)]+)}(?!})/g;
                            EXPRESSION_REGEXP.lastIndex = 0;
                            var matches;

                            while ((matches = EXPRESSION_REGEXP.exec($scope.schema.Choices.ListQuery.Query.$filter))) {

                                var dependenceField, dependenceValue;

                                var match = matches[1].split('.');
                                if (match.length > 1) {
                                    dependenceField = match[0];
                                    dependenceValue = match[1];
                                } else {
                                    dependenceField = match[0];
                                    dependenceValue = undefined;
                                }

                                $scope.dependences.push({
                                    field: dependenceField,
                                    fieldValue: dependenceValue
                                });


                            }

                            angular.forEach($scope.dependences, function(dependence) {

                                $scope.$on(dependence.field + '_changed', function(evt, newValue, oldValue, params) {

                                    angular.forEach($scope.dependences, function(dependence) {

                                        if (evt.name === dependence.field + '_changed') {

                                            if (dependence.fieldValue !== undefined) {
                                                dependence.value = (params !== undefined) ? params[dependence.fieldValue] : undefined;
                                            } else {
                                                dependence.value = newValue;
                                            }
                                        }
                                    });

                                    $scope.dropDownValue = undefined;
                                    $scope.value = undefined;
                                    $scope.modelCtrl.$setViewValue($scope.dropDownValue);
                                    getResultsFromListQuery($scope.schema.Choices.ListQuery);
                                });
                            });
                        }

                    }
                }


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

                    if ($scope.dropDownValue === undefined) {
                        $scope.formCtrl.fieldValueChanged($scope.schema.InternalName, undefined, $scope.lastValue, undefined);
                        $scope.lastValue = $scope.value;
                    }
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

                            parseQuery(ListQuery);
                            list.getListItems(ListQuery.Query).then(function(items) {

                                $scope.items = items;
                                var choices = [];
                                $scope.dropDownValue = undefined;
                                if (!$scope.schema.Required) {
                                    choices.push(undefined);
                                }
                                angular.forEach(items, function(item) {
                                    choices.push(item[ListQuery.Field || 'Title']);
                                });

                                $timeout(function() {
                                    $scope.$apply(function() {
                                        $scope.dropDownValue = $scope.value;
                                        $scope.choices = choices;
                                    });
                                });
                            });

                        }, function(err) {

                            def.reject(err);
                        });

                    });

                    return def.promise;
                }


                function parseQuery(ListQuery) {

                    if ($scope.dependences === void 0) return ListQuery;
                    if ($scope.dependences.length === 0) return ListQuery;

                    var originalFilter = $scope.schema.Choices.ListQuery.Query.originalFilter;
                    $scope.schema.Choices.ListQuery.Query.originalFilter = originalFilter;

                    angular.forEach($scope.dependences, function(dependence) {

                        var expression = '{' + dependence.field;
                        if (dependence.fieldValue !== undefined) {
                            expression += '.' + dependence.fieldValue + '}';
                        } else {
                            expression += '}';
                        }

                        originalFilter = originalFilter.replace(expression, dependence.value);
                    });

                    $scope.schema.Choices.ListQuery.Query.$filter = originalFilter;
                    return ListQuery;
                }


            } // link


        }; // Directive definition object


        return spfieldChoice_DirectiveDefinitionObject;

    } // Directive factory

]);
