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
			scope: {
				originalItem: '=item'
			},



			controller: ['$scope', '$attrs', function($scope, $attrs) {

				this.isNew = function() {

					return $scope.originalItem.isNew();
				};


				this.initField = function(fieldName) {

					if (this.isNew()) {

						var fieldSchema = this.getFieldSchema(fieldName);

						switch(fieldSchema.TypeAsString) {

							case 'MultiChoice':
								$scope.item[fieldName] = { results: [] };
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName].results.push(fieldSchema.DefaultValue);
								}
								break;

							case 'DateTime':
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName] = new Date();
									console.log('>>>>> DateTime default value:', fieldSchema.DefaultValue);
								}
								break;

							case 'Boolean':
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName] = fieldSchema.DefaultValue == '1';
								}
								break;

							default:
								if (fieldSchema.DefaultValue !== null) {
									$scope.item[fieldName] = fieldSchema.DefaultValue;
								}
								break;
						}
					}
				};


				this.getFieldSchema = function(fieldName) {
	
					return $scope.schema[fieldName];
				};


				this.getFormMode = function() {

					return $attrs.mode || 'display';
				};


				this.getWebRegionalSettings = function() {

					if ($scope.item.list.web.RegionalSettings === void 0) {
						$scope.item.list.web.getProperties();//.then(...); // Puede ser necesario hacer esta función una promesa.
					}

					return $scope.item.list.web.RegionalSettings;
				};


				this.save = function() {

					$scope.item.save().then(function(data) {

						console.log(data);
						angular.extend($scope.originalItem, data);

					}, function(err) {

						console.error(err);

					});
				};


				this.cancel = function() {

					$scope.item = angular.copy($scope.originalItem);
				};

			}],



			compile: function(element, attrs, transclude) {

				return {

					pre: function($scope, $element, $attrs) {

						if (SPUtils.inDesignMode()) return;


						$scope.$watch('originalItem', function(newValue) {

							// Checks if the item has a value
							if (newValue === void 0) return;

							$scope.item = angular.copy(newValue);
							$scope.item.clean();

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

						}, true);



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

										// if no template then generate a default template.
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
						
					}

				};

			}

		};
	}

]);