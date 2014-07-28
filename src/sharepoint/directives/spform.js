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
			templateUrl: 'templates/form-templates/spform.html',
			transclude: true,
			replace: true,
			priority: 100,
			scope: {
				originalItem: '=item',
				preSave: '&',
				postSave: '&'
			},



			controller: ['$scope', '$attrs', function spformController($scope, $attrs) {

				this.status = {
					IDLE: 0,
					PROCESSING: 1
				};

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
						$scope.item.list.web.getProperties();//.then(...); // Es necesario hacer esta función una promesa.
					}

					return $scope.item.list.web.RegionalSettings;
				};


				this.getFormStatus = function() {
					return $scope.formStatus;
				};


				this.save = function() {

					$scope.formStatus = this.status.PROCESSING;

					if ($scope.preSave({ item: $scope.item }) !== false) {
						
						$scope.item.save().then(function(data) {

							console.log(data);
							angular.extend($scope.originalItem, data);

							$scope.postSave({ item: $scope.originalItem });

							$scope.formStatus = this.status.IDLE;

						}, function(err) {

							console.error(err);

						});

					}

				};


				this.cancel = function() {

					$scope.item = angular.copy($scope.originalItem);
				};

			}],



			compile: function(element, attrs, transclude) {

				return {

					pre: function($scope, $element, $attrs, spformController) {

						if (SPUtils.inDesignMode()) return;


						$scope.$watch(function() {

							return spformController.getFormMode();

						}, function(newMode) {

							$scope.mode = newMode;

							if ($scope.item !== void 0) {

								if ($scope.item.list.Fields !== void 0) {

									$scope.loadItemTemplate();
								}
							}
						});

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
							
							var terminalRuleAdded = false;

							var elements = $element.find('*');
							var transcludeFields = 'transclude-fields';
							var elementToTransclude;

							angular.forEach(elements, function(element) {
								if (element.attributes[transcludeFields] !== void 0) {
									elementToTransclude = angular.element(element);
								}
							});

							if (elementToTransclude === void 0) {
								elementToTransclude = $element;
							}

							elementToTransclude.empty();

							transclude($scope, function (clone) {
								angular.forEach(clone, function (e) {

									// if e (element) is a spform-rule, evaluates first the test expression
									if (e.tagName !== void 0 && e.tagName.toLowerCase() == 'spform-rule' && e.attributes.test !== undefined) {

										var testExpression = e.attributes.test.value;

										if (!terminalRuleAdded && $scope.$eval(testExpression)) {

											elementToTransclude.append(e);

											if (e.attributes.terminal !== void 0) {

												terminalRuleAdded = $scope.$eval(e.attributes.terminal.value);
											}

										} else {
											e.remove();
											e = null;
										}
										
									} else {

										elementToTransclude.append(e);
									}
								});
							});


							if ($attrs.templateUrl) {

								$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

									$element.html('').append(html);
									$compile($element)($scope);

								});

							} else {

								if (elementToTransclude[0].children.length === 0) {

									// if no template then generate a default template.
									$scope.fields = [];

									angular.forEach($scope.item.list.Fields, function(field) {
										if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType' && field.InternalName !== 'Attachments') {
											$scope.fields.push(field);
										}
									});

									$http.get('templates/form-templates/spform-default.html', { cache: $templateCache }).success(function (html) {

										elementToTransclude.html('').append(html);
										$compile(elementToTransclude)($scope);

									});

								}
								
							}

							$scope.templateLoaded = true;
						};

					}
					
				};

			}

		};
	}

]);