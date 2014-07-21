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

	['$compile', '$templateCache', '$http', '$q', 'SharePoint',

	function($compile, $templateCache, $http, $q, SharePoint) {

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

					$http.get('templates/form-templates/spfield-lookup-' + mode + '.html', { cache: $templateCache }).success(function(html) {

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

						def.resolve();

					} else {

						getLookupList().then(function(list) {

							if ($scope.value === null || $scope.value === 0) {

								// If no value returns an empty object for corrent binding
								$scope.lookupItem = {
									Title: '',
									url: ''
								};

								def.resolve();

							} else {

								list.getItemById($scope.value).then(function(item) {

									$scope.lookupItem = {
										Title: item.Title,
										url: item.list.Forms.results[0].ServerRelativeUrl + '?ID=' + $scope.value + '&Source=' + encodeURIComponent(window.location)
									};

									def.resolve();

								});
							}

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

						def.resolve();

					} else {
						
						getLookupList().then(function(list) {

							list.getListItems().then(function(items) {

								$scope.lookupItems = items;

								if (!$scope.schema.Required) {
									$scope.lookupItems = [{ Id: 0, Title: STSHtmlEncode(Strings.STS.L_LookupFieldNoneOption) }].concat(items);
								}

								// Init the initial value when no value is provided
								if ($scope.value === null) {
									$scope.value = 0;
								}

								def.resolve();

							});

						});
					}


					return def.promise;

				}

			}

		};

	}

]);