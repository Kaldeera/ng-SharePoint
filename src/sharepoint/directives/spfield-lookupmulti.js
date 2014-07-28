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

	['$compile', '$templateCache', '$http', '$q', '$filter', 'SharePoint',

	function($compile, $templateCache, $http, $q, $filter, SharePoint) {

		return {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			template: '<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);
				$scope.idPrefix = $scope.schema.InternalName + '_'+ $scope.schema.Id;
				$scope.addButtonText = STSHtmlEncode(Strings.STS.L_LookupMultiFieldAddButtonText) + ' >';
				$scope.removeButtonText = '< ' + STSHtmlEncode(Strings.STS.L_LookupMultiFieldRemoveButtonText);
				$scope.candidateAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldCandidateAltText, $scope.schema.Title));
				$scope.resultAltText = STSHtmlEncode(StBuildParam(Strings.STS.L_LookupMultiFieldResultAltText, $scope.schema.Title));



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					// Adjust the model if no value is provided
					if ($scope.value === null) {
						$scope.value = { results: [] };
					}
					
					return { mode: $scope.mode || controllers[0].getFormMode(), value: $scope.value };

				}, function(newValue, oldValue) {

					$scope.currentMode = newValue.mode;

					if (newValue.value.results !== oldValue.value.results) {
						$scope.selectedLookupItems = void 0;
					}

					// Show loading animation.
					setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function(){

						renderField($scope.currentMode);

					});

				}, true);



				// ****************************************************************************
				// Replaces the directive element HTML.
				//
				function setElementHTML(html) {

					var newElement = $compile(html)($scope);
					$element.replaceWith(newElement);
					$element = newElement;
				}



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-lookupmulti-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						setElementHTML(html);
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

						SharePoint.getWeb().then(function(web) {

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
				function getLookupItems() {

					var def = $q.defer();

					if ($scope.lookupItems !== void 0) {

						// Returns cached items
						def.resolve($scope.lookupItems);

					} else {
						
						getLookupList().then(function(list) {

							list.getListItems().then(function(items) {

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

					getLookupItems().then(function(candidateItems) {

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

							if ($scope.value.results.indexOf(item.Id) != -1) {

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

			}

		};

	}

]);