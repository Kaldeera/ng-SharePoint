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
									$scope.item[fieldName] = new Date(); //-> [today]
									// TODO: Hay que controlar el resto de posibles valores por defecto.
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


				this.fieldValueChanged = function(fieldName, fieldValue) {

					//console.log('>>>> spform.fieldValueChanged(' + fieldName + ', ' + fieldValue + ')');
					//console.log('-------------------------------------------------------------------------------');
					
					$scope.$broadcast(fieldName + '_changed', fieldValue);
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


				this.save = function(redirectUrl) {

					var self = this;

					$scope.formStatus = this.status.PROCESSING;

					// Shows the 'Working on it...' dialog.
					var dlg = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);

					$q.when($scope.onPreSave({ item: $scope.item })).then(function(result) {

						if (result !== false) {

							$scope.item.save().then(function(data) {

								//angular.extend($scope.originalItem, data); //-> This launch $scope.originalItem $watch !!!
								$scope.formStatus = this.status.IDLE;

								$q.when($scope.onPostSave({ item: $scope.originalItem })).then(function(result) {

									if (result !== false) {

										// TODO: Performs the 'post-save' action/s or redirect

										// Default 'post-save' action.
										self.closeForm(redirectUrl);

									}

									// Close the 'Working on it...' dialog.
									dlg.close();
									
								});

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

						} else {

							console.log('>>>> Save form was canceled!');
							dlg.close();
							$scope.formStatus = this.status.IDLE;
						}
						
					});
						

				};


				this.cancel = function(redirectUrl) {

					$scope.item = angular.copy($scope.originalItem);

					if ($scope.onCancel({ item: $scope.item }) !== false) {

						// Performs the default 'cancel' action.
						this.closeForm(redirectUrl);

					}
				};



				this.closeForm = function(redirectUrl) {

					if (redirectUrl !== void 0) {

						window.location = redirectUrl;

					} else {
						
						window.location = utils.getQueryStringParamByName('Source') || _spPageContextInfo.webServerRelativeUrl;

					}

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

								// NOTE: We need to get list properties to know if the list has 
								//		 ContentTypesEnabled and, if so, get the schema from the
								//		 ContentType instead.
								//		 Also we need to know which is the default ContentType
								//		 to get the correct schema (I don't know how).
								//
								//		 If the above is not done, field properties like 'Required' will have incorrect data.

								$scope.schema = fields;
								$scope.loadItemTemplate();

							});

						}, true);



						$scope.loadItemTemplate = function() {
							
							$scope.formStatus = spformController.status.PROCESSING;

							
							var loadingAnimation = document.querySelector('#form-loading-animation-wrapper-' + $scope.$id);
							if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();


							if ($attrs.templateUrl) {

								$http.get($attrs.templateUrl, { cache: $templateCache }).success(function (html) {

									$element.html('');
									parseRules($element, angular.element(html), false);
									$compile($element)($scope);
									$scope.formStatus = spformController.status.IDLE;

								});

							} else {

								var elements = $element.find('*');
								var transcludeFields = 'transclude-fields';
								var elementToTransclude;

								angular.forEach(elements, function(elem) {
									if (elem.attributes[transcludeFields] !== void 0) {
										elementToTransclude = angular.element(elem);
									}
								});

								if (elementToTransclude === void 0) {
									elementToTransclude = $element;
								}

								elementToTransclude.empty();

								transclude($scope, function (clone) {
									parseRules(elementToTransclude, clone, true);
								});


								// If no template-url attribute was provided generate a default form template
								if (elementToTransclude[0].children.length === 0) {

									$scope.fields = [];

									angular.forEach($scope.item.list.Fields, function(field) {
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

							// Initialize the 'rulesApplied' array for debug purposes.
							$scope.rulesApplied = [];

							angular.forEach(sourceElements, function (elem) {

								// Check if 'elem' is a <spform-rule> element.
								if (elem.tagName !== void 0 && elem.tagName.toLowerCase() == 'spform-rule' && elem.attributes.test !== undefined) {

									var testExpression = elem.attributes.test.value;

									// Evaluates the test expression if no 'terminal' attribute was detected in a previous valid rule.
									if (!terminalRuleAdded && $scope.$eval(testExpression)) {

										targetElement.append(elem);
										var terminalExpression = false;

										if (elem.attributes.terminal !== void 0) {

											terminalExpression = elem.attributes.terminal.value;
											terminalRuleAdded = $scope.$eval(terminalExpression);

										}

										// Add the rule applied to the 'rulesApplied' array for debug purposes.
										$scope.rulesApplied.push({ test: testExpression, terminal: terminalExpression });

									} else if (isTransclude) {

										elem.remove();
										elem = null;
									}
									
								} else {

									targetElement.append(elem);
								}
							});

						}

					}
					
				};

			}

		};
	}

]);