/*
	SPFieldLookup - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldLookup
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldLookup', 

	['SPFieldDirective', '$q', '$filter', 'SharePoint',

	function spfieldLookup_DirectiveFactory(SPFieldDirective, $q, $filter, SharePoint) {

		var spfieldLookup_DirectiveDefinitionObject = {

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
					
					fieldTypeName: 'lookup',
					replaceAll: false,

					watchModeFn: function(newValue) {

						refreshData();
					},

					watchValueFn: function(newValue, oldValue) {

						if (newValue === oldValue) return;

						$scope.lookupItem = void 0;
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

						refreshData();

					});

				}



				// ****************************************************************************
				// Controls the 'changed' event in the associated <select> element.
				//
				$scope.valueChanged = function() {

					if ($scope.lastValue !== $scope.value) {

						// Calls the 'fieldValueChanged' method in the SPForm controller to broadcast to all child elements.
						$scope.formCtrl.fieldValueChanged($scope.schema.InternalName, $scope.value);

						$scope.lastValue = $scope.value;
					}
				};



				// ****************************************************************************
				// Refresh the lookup data and render the field.
				//
				function refreshData() {
					
					// Show loading animation.
					directive.setElementHTML('<div><img src="/_layouts/15/images/loadingcirclests16.gif" alt="" /></div>');

					// Gets the data for the lookup and then render the field.
					getLookupData($scope.currentMode).then(function(){

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

						// TODO: Check if the list is in the form's cache to improve performance and reduce XHR calls.
						// NOTE: Do the same in other fields like SPFieldLookupMulti or SPFieldUser.
						// NOTE 2: Also we could do the same with the SPWeb object.
						/*
						// Try to recover the list from the form's cache.
						$scope.lookupList = SPCache.getCacheValue(<form_identifier>, $scope.schema.LookupList);

						if ($scope.lookupList === void 0) { //-> Not in the cache

							// Recover the list...

						} else {

							// Returns previously resolved list (Form's cache).
							def.resolve($scope.lookupList);
						}
						*/

						SharePoint.getWeb($scope.schema.LookupWebId).then(function(web) {

							web.getList($scope.schema.LookupList).then(function(list) {

								$scope.lookupList = list;

								list.getProperties({ $expand: 'Forms' }).then(function() {

									list.getFields().then(function() {

										// TODO: Add the list to the form's cache when resolved
										//SPCache.setCacheValue(<form_identifier>, $scope.schema.LookupList, $scope.lookupList);
										
										def.resolve($scope.lookupList);

									}, function(err) {

										def.reject(err);
									});

								}, function(err) {

									def.reject(err);
								});

							}, function(err) {

								def.reject(err);
							});

						});

					} else {

						// Returns previously resolved list
						def.resolve($scope.lookupList);
					}


					return def.promise;
				}



				// ****************************************************************************
				// Gets the lookup data for display mode.
				//
				function getLookupDataForDisplay() {

					var def = $q.defer();

					if ($scope.lookupItem !== void 0) {

						// Returns cached selected item
						def.resolve($scope.lookupItem);

					} else {

						getLookupList().then(function(list) {

							if ($scope.value === null || $scope.value === 0 || $scope.value === void 0) {

								// If no value returns an empty object for correct binding
								$scope.lookupItem = {
									Title: '',
									url: ''
								};

								def.resolve($scope.lookupItem);

							} else {

								list.getItemById($scope.value).then(function(item) {

									var displayValue = item[$scope.schema.LookupField];
									var fieldSchema = $scope.lookupList.Fields[$scope.schema.LookupField];

									if (fieldSchema.TypeAsString === 'DateTime' && displayValue !== null) {
										var cultureInfo = __cultureInfo || Sys.CultureInfo.CurrentCulture;
										var date = new Date(displayValue);
										displayValue = $filter('date')(date, cultureInfo.dateTimeFormat.ShortDatePattern + (fieldSchema.DisplayFormat === 0 ? '' :  ' ' + cultureInfo.dateTimeFormat.ShortTimePattern));
									}

									if (fieldSchema.TypeAsString === 'Number') {
										if (fieldSchema.Percentage) {
											displayValue += '%';
										}
									}

									// When the field is a Computed field, shows its title.
									// TODO: Resolve computed fields.
									if (fieldSchema.TypeAsString === 'Computed' && displayValue !== null) {
										displayValue = item.Title;
									}

									$scope.lookupItem = {
										Title: displayValue,
										url: item.list.Forms.results[0].ServerRelativeUrl + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location)
									};

									def.resolve($scope.lookupItem);

								}, function(err) {

									def.reject(err);
								});
							}

						}, function(err) {

							def.reject(err);
						});
					}

					return def.promise;

				}



				// ****************************************************************************
				// Gets the lookup data for edit mode.
				//
				function getLookupDataForEdit() {

					var def = $q.defer();

					if ($scope.lookupItems !== void 0){

						// Returns cached selected items
						def.resolve($scope.lookupItems);

					} else {
						
						getLookupList().then(function(list) {

							var $query = void 0;

							if ($scope.dependency !== void 0) {
								$query = {
									$select: '*, ' + $scope.dependency.fieldName + '/Id',
									$expand: $scope.dependency.fieldName + '/Id',
									$filter: $scope.dependency.fieldName + '/Id eq ' + $scope.dependency.value,
								};
							}

							list.getListItems($query).then(function(items) {

								$scope.lookupItems = items;

								// Adds an extra empty element '(None)' if the field is not required.
								if (!$scope.schema.Required) {
									$scope.lookupItems = [{ Id: 0, Title: STSHtmlEncode(Strings.STS.L_LookupFieldNoneOption) }].concat(items);
								}

								// Sets the initial value when no value is provided
								if ($scope.value === null || $scope.value === void 0) {
									if ($scope.schema.Required) {
										if ($scope.lookupItems.length > 0) {
											$scope.value = $scope.lookupItems[0].Id;
										} else {
											$scope.value = null;
										}
									} else {
										$scope.value = 0;
									}
								}

								// If there is a dependency, checks if the current value exists on the new result set.
								if ($scope.dependency !== void 0) {
									
									var match = $scope.lookupItems.reduce(function(prev, curr) {
										return ($scope.value === curr.Id) || prev;
									}, false);

									// If the current value does not exists, select the first value from the new result set.
									if (!match) {
										if ($scope.lookupItems.length > 0) {
											$scope.value = $scope.lookupItems[0].Id;
										} else {
											$scope.value = null;
										}
									}
								}

								$scope.valueChanged();

								def.resolve($scope.lookupItems);

							}, function(err) {

								def.reject(err);
							});

						}, function(err) {

							def.reject(err);
						});
					}


					return def.promise;

				}

			} // link

		}; // Directive definition object


		return spfieldLookup_DirectiveDefinitionObject;

	} // Directive factory

]);
