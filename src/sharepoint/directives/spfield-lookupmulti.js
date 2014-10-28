/*
	SPFieldLookupMulti - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldLookupMulti
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldLookupmulti', 

	['SPFieldDirective', '$q', '$filter', 'SharePoint',

	function spfieldLookupmulti_DirectiveFactory(SPFieldDirective, $q, $filter, SharePoint) {

		var spfieldLookupmulti_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control-loading.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					
					fieldTypeName: 'lookupmulti',
					replaceAll: false,

					init: function() {

						$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
						$scope.addButtonText = STSHtmlEncode(Strings.STS.L_LookupMultiFieldAddButtonText) + ' >';
						$scope.removeButtonText = '< ' + STSHtmlEncode(Strings.STS.L_LookupMultiFieldRemoveButtonText);
						$scope.candidateAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldCandidateAltText, $scope.schema.Title));
						$scope.resultAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldResultAltText, $scope.schema.Title));

						// Adjust the model if no value is provided
						if ($scope.value === null || $scope.value === void 0) {
							$scope.value = { results: [] };
						}
						
					},
					
					parserFn: function(modelValue, viewValue) {

						$scope.modelCtrl.$setValidity('required', !$scope.schema.Required || $scope.value.results.length > 0);
						return $scope.value;
					},

					watchModeFn: function(newValue) {

						refreshData();
					},

					watchValueFn: function(newValue, oldValue) {

						if (newValue === oldValue) return;

						$scope.selectedLookupItems = void 0;
						refreshData();						
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);



				// ****************************************************************************
				// Check for dependences.
				//
				if ($attrs.dependsOn !== void 0) {

					$scope.$on($attrs.dependsOn + '_changed', function(evt, newValue) {

						$scope.dependency = {
							fieldName: $attrs.dependsOn,
							value: newValue
						};

						// Initialize the items collection to force query the items again.
						$scope.lookupItems = void 0;

						// Reset the current selected items.
						$scope.value = null;

						refreshData();

					});

				}



				// ****************************************************************************
				// Controls the 'changed' event in the associated <select> element.
				//
				/*
				$scope.valueChanged = function() {

					// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
					$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, $scope.value);
				};
				*/



				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function refreshData() {

					// Adjust the model if no value is provided
					if ($scope.value === null || $scope.value === void 0) {
						$scope.value = { results: [] };
					}
					
					// Show loading animation.
					directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function() {

						directive.renderField($scope.currentMode);

					}, function(err) {

						$scope.errorMsg = err.message;

						if ($scope.value === void 0) {
							directive.setElementHTML('');
						} else {
							directive.setElementHTML('<span style="color: brown">{{errorMsg}}</span>');
						}
					});

				}



				// ****************************************************************************
				// Gets lookup data for data-binding.
				//
				function getLookupData(mode) {

					if (mode === 'edit') {

						return getLookupDataForEdit();

					} else {

						return getLookupDataForDisplay();

					}
				}



				// ****************************************************************************
				// Gets the lookup list.
				//
				function getLookupList() {

					var def = $q.defer();

					if ($scope.lookupList === void 0) {

						SharePoint.getWeb($scope.schema.LookupWebId).then(function(web) {

							web.getList($scope.schema.LookupList).then(function(list) {

								$scope.lookupList = list;

								list.getProperties({ $expand: 'Forms' }).then(function() {

									list.getFields().then(function() {

										def.resolve($scope.lookupList);

									});

								});

							});

						});

					} else {

						// Returns cached list
						def.resolve($scope.lookupList);
					}


					return def.promise;
				}



				// ****************************************************************************
				// Gets the items from the lookup list.
				//
				function getLookupItems($query) {

					var def = $q.defer();

					if ($scope.lookupItems !== void 0) {

						// Returns cached items
						def.resolve($scope.lookupItems);

					} else {
						
						getLookupList().then(function(list) {

							list.getListItems($query).then(function(items) {

								$scope.lookupItems = items;
								def.resolve($scope.lookupItems);

							});

						});
					}

					return def.promise;
				}



				// ****************************************************************************
				// Gets the lookup data for display mode.
				//
				function getLookupDataForDisplay() {

					var def = $q.defer();

					if ($scope.selectedLookupItems !== void 0) {

						// Returns cached selected items
						def.resolve($scope.selectedLookupItems);

					} else {

						// Initialize the selected items array
						$scope.selectedLookupItems = [];

						// Gets the lookup items and populate the selected items array
						getLookupItems().then(function(items) {

							if ($scope.value !== null && $scope.value !== void 0) {
								
								angular.forEach($scope.value.results, function(selectedItem) {

									var lookupItem = $filter('filter')(items, { Id: selectedItem }, true)[0];

									if (lookupItem !== void 0) {

										var displayValue = lookupItem[$scope.schema.LookupField];
										var fieldSchema = $scope.lookupList.Fields[$scope.schema.LookupField];

										if (fieldSchema.TypeAsString === 'DateTime' && displayValue !== null) {
											var cultureInfo = __cultureInfo || Sys.CultureInfo.CurrentCulture;
											var date = new Date(displayValue);
											displayValue = $filter('date')(date, cultureInfo.dateTimeFormat.ShortDatePattern + (fieldSchema.DisplayFormat === 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern));
										}

										// When the field is a Computed field, shows its title.
										// TODO: Resolve computed fields.
										if (fieldSchema.TypeAsString === 'Computed' && displayValue !== null) {
											displayValue = lookupItem.Title;
										}

										$scope.selectedLookupItems.push({
											Title: displayValue,
											url: lookupItem.list.Forms.results[0].ServerRelativeUrl + '?ID=' + selectedItem + '&Source=' + encodeURIComponent(window.location)
										});

									}

								});
							}

							def.resolve($scope.selectedLookupItems);

						});

					}

					return def.promise;

				}



				// ****************************************************************************
				// Gets the lookup data for edit mode.
				//
				function getLookupDataForEdit() {

					var def = $q.defer();
					var $query = void 0;

					if ($scope.dependency !== void 0) {
						$query = {
							$select: '*, ' + $scope.dependency.fieldName + '/Id',
							$expand: $scope.dependency.fieldName + '/Id',
							$filter: $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value,
						};
					}

					getLookupItems($query).then(function(candidateItems) {

						$scope.candidateItems = [];
						$scope.selectedCandidateItems = [];
						$scope.resultItems = [];
						$scope.selectedResultItems = [];

						// Populate selected and candicate items for data-binding
						angular.forEach(candidateItems, function(item) {

							var displayValue = item[$scope.schema.LookupField];
							var fieldSchema = $scope.lookupList.Fields[$scope.schema.LookupField];

							if (fieldSchema.TypeAsString === 'DateTime') {
								var cultureInfo = __cultureInfo || Sys.CultureInfo.CurrentCulture;
								var date = new Date(displayValue);
								displayValue = $filter('date')(date, cultureInfo.dateTimeFormat.ShortDatePattern + (fieldSchema.DisplayFormat === 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern));
							}

							var bindingItem = {
								id: item.Id,
								name: displayValue,
								title: displayValue
							};

							if ($scope.value && $scope.value.results && $scope.value.results.indexOf(item.Id) != -1) {

								$scope.resultItems.push(bindingItem);

							} else {

								$scope.candidateItems.push(bindingItem);

							}

						});

						def.resolve();

					});

					
					return def.promise;

				}



				function updateModel() {

					if ($scope.value === null || $scope.value === void 0) {
						$scope.value = {};
					}

					$scope.value.results = [];

					angular.forEach($scope.resultItems, function(item) {
						$scope.value.results.push(item.id);
					});
				}



				$scope.addItems = function() {

					// Adds the selected candidate items to the results array
					$scope.resultItems = $scope.resultItems.concat($scope.selectedCandidateItems);

					// Removes the selected candidate items from the candidates array
					$scope.candidateItems = $filter('filter')($scope.candidateItems, function(item) {
						var isSelected = false;

						for (var i = 0; i < $scope.selectedCandidateItems.length; i++) {
							if (item.id == $scope.selectedCandidateItems[i].id) {
								isSelected = true;
								break;
							}
						}

						return !isSelected;
					});

					// Initialize the selected cadidates array
					$scope.selectedCandidateItems = [];

					// Finaly update the model
					updateModel();

				};



				$scope.removeItems = function() {

					// Adds the selected results items to the cadidates array
					$scope.candidateItems = $scope.candidateItems.concat($scope.selectedResultItems);

					// Removes the selected results items from the results array
					$scope.resultItems = $filter('filter')($scope.resultItems, function(item) {
						var isSelected = false;

						for (var i = 0; i < $scope.selectedResultItems.length; i++) {
							if (item.id == $scope.selectedResultItems[i].id) {
								isSelected = true;
								break;
							}
						}

						return !isSelected;
					});

					// Initialize the selected results array
					$scope.selectedResultItems = [];

					// Finaly update the model
					updateModel();
				};

			} // link

		}; // Directive definition object


		return spfieldLookupmulti_DirectiveDefinitionObject;

	} // Directive factory

]);