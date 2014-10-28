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

	function spform_DirectiveFactory(SPUtils, $compile, $templateCache, $http, $q) {

		var spform_DirectiveDefinitionObject = {

			restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                originalItem: '=item',
                onPreSave: '&',
                onPostSave: '&',
                onCancel: '&'
            },
			templateUrl: 'templates/form-templates/spform.html',


			controller: ['$scope', '$attrs', function spformController($scope, $attrs) {


                this.status = {
                    IDLE: 0,
                    PROCESSING: 1
                };

                
                this.getItem = function() {

                    return $scope.item;
                };


                this.getFormCtrl = function() {

                    // Returns the 'ng-form' directive controller
                    return $scope.ngFormCtrl;
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

                    $scope.ngFormCtrl.$setDirty();

                    if (!$scope.ngFormCtrl.$valid) {

                        $scope.$broadcast('validate');

                        // TODO: Set the focus to the first invalid control (Try ng-focus directive).

                        return;
                    }

					$scope.formStatus = this.status.PROCESSING;

					// Shows the 'Working on it...' dialog.
					var dlg = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);

					$q.when($scope.onPreSave({ item: $scope.item })).then(function(result) {

						if (result !== false) {

							$scope.item.save().then(function(data) {

								$scope.formStatus = this.status.IDLE;

								var postSaveData = {
									originalItem: $scope.originalItem,
									item: $scope.item
								};

								$q.when($scope.onPostSave(postSaveData)).then(function(result) {

									if (result !== false) {

										// TODO: Performs the 'post-save' action/s or redirect

										// Default 'post-save' action.
										self.closeForm(redirectUrl);

									}

									// Close the 'Working on it...' dialog.
									dlg.close();
									
								}, function() {

									dlg.close();
									$scope.formStatus = this.status.IDLE;
									
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
						
					}, function() {

						dlg.close();
						$scope.formStatus = this.status.IDLE;

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

			}], // controller property



            compile: function compile(element, attrs/*, transcludeFn (DEPRECATED)*/) {

                return {

                    pre: function prelink($scope, $element, $attrs, spformController, transcludeFn) {
                    
                        // Sets the form 'name' attribute if user don't provide it.
                        // This way has always available the 'ng-form' directive controller for form validations.
                        if (!$attrs.name) {
                            $attrs.$set('name', 'spform');
                        }

                    },



                    post: function postLink($scope, $element, $attrs, spformController, transcludeFn) {

                        // Makes an internal reference to the 'ng-form' directive controller for form validations.
                        // (See pre-linking function above).
                        $scope.ngFormCtrl = $scope[$attrs.name];


                        // Checks if the page is in design mode.
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
                                    loadItemTemplate();

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

                                // TODO: We need to get list properties to know if the list has 
                                //       ContentTypesEnabled and, if so, get the schema from the
                                //       ContentType instead.
                                //       Also we need to know which is the default ContentType
                                //       to get the correct schema (I don't know how).
                                //
                                //       If the above is not done, field properties like 'Required' will have incorrect data.

                                $scope.schema = fields;
                                loadItemTemplate();

                            });

                        }, true);



                        function loadItemTemplate() {
                            
                            $scope.formStatus = spformController.status.PROCESSING;

                            // Search for the 'transclusion-container' attribute within the 'spform' template elements.
                            var elements = $element.find('*');
                            var transclusionContainer;

                            angular.forEach(elements, function(elem) {
                                if (elem.attributes['transclusion-container'] !== void 0) {
                                    transclusionContainer = angular.element(elem);
                                }
                            });

                            // Remove the 'loading animation' element
                            var loadingAnimation = document.querySelector('#form-loading-animation-wrapper-' + $scope.$id);
                            if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();


                            // Check for 'templateUrl' attribute
                            if ($attrs.templateUrl) {

                                // Apply the 'templateUrl' attribute
                                $http.get($attrs.templateUrl, { cache: $templateCache }).success(function(html) {

                                    parseRules(transclusionContainer, angular.element(html), false);
                                    $compile(transclusionContainer)($scope);
                                    $scope.formStatus = spformController.status.IDLE;

                                }).error(function(data, status, headers, config, statusText) {

                                    $element.html('<div><h2 class="ms-error">' + data + '</h2><p class="ms-error">Form Template URL: <strong>' + $attrs.templateUrl + '</strong></p></div>');
                                    $compile(transclusionContainer)($scope);
                                    $scope.formStatus = spformController.status.IDLE;
                                });

                            } else {

                                // Apply transclusion
                                transcludeFn($scope, function (clone) {
                                    parseRules(transclusionContainer, clone, true);
                                });


                                // If no transclude content was detected inside the 'spform' directive, generate a default form template.
                                if (transclusionContainer[0].children.length === 0) {

                                    $scope.fields = [];

                                    angular.forEach($scope.item.list.Fields, function(field) {
                                        if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType') {
                                            $scope.fields.push(field);
                                        }
                                    });

                                    $http.get('templates/form-templates/spform-default.html', { cache: $templateCache }).success(function (html) {

                                        transclusionContainer.append(html);
                                        $compile(transclusionContainer)($scope);
                                        $scope.formStatus = spformController.status.IDLE;

                                    });

                                } else {

                                    $scope.formStatus = spformController.status.IDLE;
                                }
                                
                            }
                            
                        } // loadItemTemplate


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

                                        // NOTE: If this function is called from a transclusion function, removes the 'spform-rule' 
                                        //       elements when the expression in its 'test' attribute evaluates to FALSE.
                                        //       This is because when the transclusion is performed the elements are inside the 
                                        //       current 'spform' element and should be removed.
                                        //       When this function is called from an asynchronous template load ('templete-url' attribute), 
                                        //       the elements are not yet in the element.
                                        elem.remove();
                                        elem = null;
                                    }
                                    
                                } else {

                                    targetElement.append(elem);
                                }
                            });

                        } // parseRules private function

                    } // compile.post-link

                }; // compile function return

            } // compile property

		}; // Directive definition object


        return spform_DirectiveDefinitionObject;

	} // Directive factory function

]);