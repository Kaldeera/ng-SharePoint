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
			template: '<img src="/_layouts/15/images/loadingcirclests16.gif" alt="" />',

			link: function($scope, $element, $attrs, controllers) {

				$scope.schema = controllers[0].getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || controllers[0].getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;

					// Show loading animation.
					setElementHTML('<img src="/_layouts/15/images/loadingcirclests16.gif" alt="" />');

					// Gets the data for the lookup and then render the field.
					getLookupData(newValue).then(function(){

						renderField(newValue);

					});

				});



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

								list.getProperties().then(function() {

									def.resolve($scope.lookupList);

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

						getLookupItems().then(function(items) {

							angular.forEach($scope.value.results, function(selectedItem) {

								var lookupItem = $filter('filter')(items, { Id: selectedItem }, true)[0];

								if (lookupItem !== void 0) {

									$scope.selectedLookupItems.push({
										Title: lookupItem.Title,
										url: lookupItem.list.Forms.results[0].ServerRelativeUrl + '?ID=' + selectedItem + '&Source=' + encodeURIComponent(window.location)
									});

								}

							});

							def.resolve();

						});

					}

					return def.promise;

				}



				// ****************************************************************************
				// Gets the lookup data for edit mode.
				//
				function getLookupDataForEdit() {
					
					var def = $q.defer();

					def.resolve();

					return def.promise;

				}

			}

		};

	}

]);