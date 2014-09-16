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

	['SPUtils', '$compile', '$templateCache', '$http', '$q',

	function(SPUtils, $compile, $templateCache, $http, $q) {

		return {
			restrict: 'EA',
			templateUrl: 'templates/form-templates/spform.html',
			transclude: true,
			replace: true,
			priority: 100,
			scope: {
				originalItem: '=item',
				onPreSave: '&',
				onPostSave: '&',
				onCancel: '&'
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

						// Set field default value.
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
	
					if (utils.isGuid(fieldName)) {

						var fieldSchema = void 0;

						angular.forEach($scope.schema, function(field) {
							if (field.Id == fieldName) {
								fieldSchema = field;
							}
						});

						return fieldSchema;

					} else {

						return $scope.schema[fieldName];
					}

				};


				this.getFormMode = function() {

					return $attrs.mode || 'display';
				};


				this.getWebRegionalSettings = function() {

					var def = $q.defer();

					if ($scope.item.list.web.RegionalSettings !== void 0) {
						def.resolve($scope.item.list.web.RegionalSettings);
					} else {
						$scope.item.list.web.getProperties().then(function() {
							def.resolve($scope.item.list.web.RegionalSettings);
						});
					}

					return def.promise;
				};


				this.getFormStatus = function() {
					return $scope.formStatus;
				};


				this.save = function() {

					var self = this;

					$scope.formStatus = this.status.PROCESSING;

					// Shows the 'Working on it...' dialog.
					var dlg = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);

					if ($scope.onPreSave({ item: $scope.item }) !== false) {
						
						$scope.item.save().then(function(data) {

							angular.extend($scope.originalItem, data);
							$scope.formStatus = this.status.IDLE;

							if ($scope.onPostSave({ item: $scope.originalItem }) || true) {

								// Close the 'Working on it...' dialog.
								dlg.close();

								// TODO: Performs the 'post-save' action/s or redirect

								// Default 'post-save' action.
								self.closeForm();
								
							}

						}, function(err) {

							console.error(err);

							dlg.close();

							var dom = document.createElement('div');
							dom.innerHTML = '<div style="color:brown">' + err.code + '<br/><strong>' + err.message + '</strong></div>';


							SP.UI.ModalDialog.showModalDialog({
								title: SP.Res.dlgTitleError,
								html: dom,
								showClose: true,
								autoSize: true,
								dialogReturnValueCallback: function() {
									$scope.formStatus = self.status.IDLE;
									$scope.$apply();
								}
							});

						});

					}

				};


				this.cancel = function() {

					$scope.item = angular.copy($scope.originalItem);

					if ($scope.onCancel({ item: $scope.item }) !== false) {

						// Performs the default 'cancel' action.
						this.closeForm();

					}
				};



				this.closeForm = function() {

					window.location = utils.getQueryStringParamByName('Source') || _spPageContextInfo.webServerRelativeUrl;

				};

			}],



			compile: function(element, attrs, transclude) {

				return {

					pre: function($scope, $element, $attrs, spformController) {

						$scope.isInDesignMode = SPUtils.inDesignMode();
						
						if ($scope.isInDesignMode) return;


						// Watch for form mode changes
						$scope.$watch(function() {

							return spformController.getFormMode();

						}, function(newMode) {

							$scope.mode = newMode;

							if ($scope.item !== void 0) {

								$scope.item.list.getFields().then(function(fields) {

									$scope.schema = fields;
									$scope.loadItemTemplate();

								});

							}
						});


						// Watch for item changes
						$scope.$watch('originalItem', function(newValue) {

							// Checks if the item has a value
							if (newValue === void 0) return;

							$scope.item = angular.copy(newValue);
							$scope.item.clean();

							$scope.item.list.getFields().then(function(fields) {

								$scope.schema = fields;
								$scope.loadItemTemplate();

							});

						}, true);



						$scope.loadItemTemplate = function() {
							
							$scope.formStatus = spformController.status.PROCESSING;

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
								parseRules(elementToTransclude, clone, true);
							});


							var loadingAnimation = document.querySelector('#form-loading-animation-wrapper');
							if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();


							if ($attrs.templateUrl) {

								$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

									terminalRuleAdded = false;
									$element.html('');
									parseRules($element, angular.element(html), false);
									$compile($element)($scope);
									$scope.formStatus = spformController.status.IDLE;

								});

							} else {

								// If no template-url attribute was provided generate a default form template
								if (elementToTransclude[0].children.length === 0) {

									$scope.fields = [];

									angular.forEach($scope.item.list.Fields, function(field) {
										//if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType' && field.InternalName !== 'Attachments') {
										if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType') {
											$scope.fields.push(field);
										}
									});

									$http.get('templates/form-templates/spform-default.html', { cache: $templateCache }).success(function (html) {

										elementToTransclude.html('').append(html);
										$compile(elementToTransclude)($scope);
										$scope.formStatus = spformController.status.IDLE;

									});

								}
								
							}
							
						};


						function parseRules(targetElement, sourceElements, isTransclude) {

							var terminalRuleAdded = false;

							angular.forEach(sourceElements, function (e) {

								// if e (element) is a spform-rule, evaluates first the test expression
								if (e.tagName !== void 0 && e.tagName.toLowerCase() == 'spform-rule' && e.attributes.test !== undefined) {

									var testExpression = e.attributes.test.value;

									if (!terminalRuleAdded && $scope.$eval(testExpression)) {

										targetElement.append(e);

										if (e.attributes.terminal !== void 0) {

											terminalRuleAdded = $scope.$eval(e.attributes.terminal.value);
										}

									} else if (isTransclude) {
										e.remove();
										e = null;
									}
									
								} else {

									targetElement.append(e);
								}
							});

						}

					}
					
				};

			}

		};
	}

]);