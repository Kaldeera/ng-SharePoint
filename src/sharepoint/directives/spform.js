/*
	SPForm - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPForm
///////////////////////////////////////

angular.module('ngSharePoint').directive('spform', 

	['SPUtils', '$compile', '$templateCache', '$http',

	function(SPUtils, $compile, $templateCache, $http) {

		return {
			restrict: 'EA',
			template: '<form></form>',
			transclude: true,
			replace: true,
			//terminal: true,
			scope: {
				item: '='
			},



			controller: ['$scope', '$attrs', function($scope, $attrs) {

				this.getFieldSchema = function(fieldName) {
	
					return $scope.schema[fieldName];
				};

				this.getFormMode = function() {

					return $attrs.mode || 'display';

				};

			}],



			compile: function(element, attrs, transclude) {

				//console.log('SPForm.compile');

				return {

					pre: function($scope, $element, $attrs) {

						//console.log('SPForm.preLink');

						if (SPUtils.inDesignMode()) return;


						$scope.$watch('item', function(newValue) {

							// Checks if the item has a value
							if (newValue === void 0) return;


							// Checks if list fields (schema) were loaded
							if ($scope.item.list.Fields === void 0) {

								$scope.item.list.getFields().then(function(fields) {

									$scope.schema = fields;
									$scope.loadItemTemplate();

								});

							} else {

								$scope.schema = $scope.item.list.Fields;
								$scope.loadItemTemplate();

							}

						});



						$scope.loadItemTemplate = function() {
							
							if (!$scope.templateLoaded) {

								transclude($scope, function (clone) {
									angular.forEach(clone, function (e) {
										$element.append(e);
									});
								});


								if ($attrs.templateUrl) {

									$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

										$element.html('').append(html);
										$compile($element)($scope);

									});

								} else {

									if ($element[0].children.length === 0) {

										// if no template ... generate a default template
										$scope.fields = [];

										angular.forEach($scope.item.list.Fields, function(field) {
											if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType' && field.InternalName !== 'Attachments') {
												$scope.fields.push(field);
											}
										});

										$http.get('templates/form-templates/spform.html', { cache: $templateCache }).success(function (html) {

											$element.html('').append(html);
											$compile($element)($scope);

										});

									}
									
								}

							}

							$scope.templateLoaded = true;
						};

					},

					post: function($scope, $element, $attrs) {
						
						//console.log('SPForm.postLink');
						
					}

				};

			}

		};
	}

]);