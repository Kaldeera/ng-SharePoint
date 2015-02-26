/*
    SPForm - directive
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPForm
///////////////////////////////////////

angular.module('ngSharePoint').directive('spform', 

    ['SPUtils', '$compile', '$templateCache', '$http', '$q', '$timeout', '$injector', 'SPExpressionResolver', 'SPListItem',

    function spform_DirectiveFactory(SPUtils, $compile, $templateCache, $http, $q, $timeout, $injector, SPExpressionResolver, SPListItem) {

        var spform_DirectiveDefinitionObject = {

            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                item: '=item',
                mode: '=mode',
                extendedSchema: '=',
                extendedController: '=',
            },
            templateUrl: 'templates/form-templates/spform.html',


            controllerAs: 'spformCtrl',


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

                    return $scope.item.isNew();
                };

                this.registerField = function(fieldControl) {

                    this.formFields = this.formFields || [];
                    this.formFields.push(fieldControl);
                };

                this.unregisterField = function(fieldControl) {

                    for(var r=this.formFields.length -1; r >= 0; r--) {

                        if (this.formFields[r].name === fieldControl.name) {
                            this.formFields.splice(r, 1);
                        }
                    }
                };

                this.initField = function(fieldName) {

                    var def = $q.defer();

                    if (this.isNew()) {

                        var fieldSchema = this.getFieldSchema(fieldName);

                        SPExpressionResolver.resolve(fieldSchema.DefaultValue, $scope).then(function(solvedDefaultValue) {

                            // Set field default value.
                            switch(fieldSchema.TypeAsString) {

                                case 'MultiChoice':
                                    $scope.item[fieldName] = { results: [] };
                                    if (solvedDefaultValue !== null) {
                                        $scope.item[fieldName].results.push(solvedDefaultValue);
                                    }
                                    break;

                                case 'DateTime':
                                    var value;

                                    switch(solvedDefaultValue) {
                                        case '[today]':
                                            value = new Date();
                                            break;

                                        case 'undefined':
                                        case undefined:
                                        case null:
                                            value = undefined;
                                            break;

                                        default:
                                            value = new Date(solvedDefaultValue);
                                            break;
                                    }


                                    $scope.item[fieldName] = value;
                                    break;

                                case 'Boolean':
                                    if (solvedDefaultValue !== null) {
                                        $scope.item[fieldName] = solvedDefaultValue == '1';
                                    }
                                    break;

                                case 'Lookup':
                                case 'User':
                                    if (solvedDefaultValue !== null) {
                                        $scope.item[fieldName + 'Id'] = parseInt(solvedDefaultValue);
                                    }
                                    break;

                                default:
                                    if (solvedDefaultValue !== null && solvedDefaultValue != 'undefined') {
                                        $scope.item[fieldName] = solvedDefaultValue;
                                    }
                                    break;
                            }

                            def.resolve();

                        });

                    } else {

                        def.resolve();
                    }

                    return def.promise;
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

                        // returns the content type field or list field (workflow fields and other hand added fields to list)
                        return $scope.schema[fieldName] || $scope.item.list.Fields[fieldName] || undefined;
                    }

                };


                this.fieldValueChanged = function(fieldName, newValue, oldValue) {

                    // Propagate to child Elements/Fields
                    $scope.$broadcast(fieldName + '_changed', newValue, oldValue);

                    // Propagate to parent Elements/Controllers
                    $scope.$emit(fieldName + '_changed', newValue, oldValue);
                    
                };


                this.getFormMode = function() {

                    return $scope.mode || 'display';
                };


                this.setFormMode = function(newMode) {

                    $scope.mode = newMode;
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


                this.setFormStatus = function(status) {

                    $timeout(function() {

                        $scope.formStatus = status;
                        $scope.$apply();

                    }, 0);
                };


                this.setFieldFocus = function(fieldName) {

                    var fieldFocused;

                    // Ensure 'focusElements' array.
                    this.focusElements = this.focusElements || [];

                    // Set the focus in the field specified by @fieldName argument or, if not defined,
                    // in the first invalid field found or, if there are no invalid fields, in
                    // the first field.

                    for (var i = 0; i < this.focusElements.length; i++) {
                        
                        if (fieldName !== void 0) {

                            // If argument @fieldName is defined, set the focus in the field specified (if found).
                            if (this.focusElements[i].name === fieldName) {

                                fieldFocused = this.focusElements[i].element;
                                break;
                            }

                        } else {

                            // If argument @fieldName is not defined, set the focus in the first invalid field.
                            var control = $scope.ngFormCtrl[this.focusElements[i].name];

                            if (control && control.$invalid) {

                                fieldFocused = this.focusElements[i].element;
                                break;

                            }
                        }
                    }

                    // If there are not invalid field focused, focus the first field.
                    if (!fieldFocused && this.focusElements.length > 0) {

                        fieldFocused = this.focusElements[0].element;

                    }

                    // Set the focus on the final element if exists.
                    if (fieldFocused) {

                        fieldFocused.focus();

                    }

                    return fieldFocused;

                };



                this.save = function(options) {

                    var self = this;
                    var def = $q.defer();
                    var dlg;


                    function closeDialog() {
                        if (dlg) dlg.close();
                    }


                    // Process @options argument.
                    // If is a string, assumes the value as the redirect url to use after the save operation.
                    // Otherwise, process as an object with the next properties:
                    //
                    //      redirectUrl:    The url to redirect after the save operation. Default is undefined.
                    //      force:          Indicates that must perform the save operation even if the form is not valid.
                    //                      Default is FALSE.
                    //      silent:         Indicates that runs in 'silent' mode, i.e., don't show the 'Working on it...' dialog.
                    //                      Default is FALSE.
                    //
                    // NOTE: This options are unavailable when use the built-in toolbar which uses the default options.
                    //
                    if (angular.isString(options)) {

                        options = {
                            redirectUrl: options
                        };

                    } else {

                        // If @options is not an object, initializes it as an object.
                        if (!angular.isObject(options) || angular.isArray(options)) {

                            options = {};
                        }
                    }


                    // Change the form to a 'dirty' state.
                    $scope.ngFormCtrl.$setDirty();


                    // Check the form validity
                    $scope.$broadcast('validate');

                    // Make a call to all form fields validation function
                    var validationPromises = [];

                    angular.forEach(this.formFields, function(formField) {

                        if (formField.validate !== undefined) {

                            var promise = $q.when(formField.validate());
                            validationPromises.push(promise);
                        }
                    });

                    // Check the form validity broadcasting a 'validate' event to all the fields.
                    $q.all(validationPromises).then(function() {

                        // Set the focus in the first invalid field.
                        var fieldFocused = self.setFieldFocus();

                        $scope.$broadcast('postValidate', fieldFocused);
                        $scope.$emit('postValidate', fieldFocused);


                        // Check if the form is valid after validate all the fields
                        if (!$scope.ngFormCtrl.$valid) {

                            // Check if 'force' option is enabled.
                            // If so, continues with the saving process even if there are invalid fields.
                            // Otherwise, cancel the saving process.
                            //
                            // NOTE: Must check if there are fields that will generate an error when saving the item.
                            //       e.g. If the user sets an string in a numeric field and so on.
                            //
                            if (options.force !== true) {

                                def.reject();
                                return def.promise;

                            }

                        }


                        // Start the 'save' process...
                        $scope.formStatus = this.status.PROCESSING;


                        // Shows the 'Working on it...' dialog.
                        if (options.silent !== true) {
                            dlg = SP.UI.ModalDialog.showWaitScreenWithNoClose(SP.Res.dialogLoading15);
                        }


                        // Removes all the custom 'virtual' fields.
                        angular.forEach($scope.schema, function(field, key) {

                            if (field.isVirtualField) {

                                delete $scope.item[key];

                            }

                        });


                        // Invoke 'onPreSave' function
                        $q.when(SPUtils.callFunctionWithParams($scope.onPreSave, $scope)).then(function(result) {

                            // If the 'onPreSave' function returns FALSE, cancels the save operation.
                            if (result !== false) {

                                $scope.item.save().then(function(data) {

                                    $scope.formStatus = this.status.IDLE;

                                    // Invoke 'onPostSave' function.
                                    $q.when(SPUtils.callFunctionWithParams($scope.onPostSave, $scope)).then(function(result) {

                                        if (result !== false) {

                                            // Default 'post-save' action.
                                            //self.closeForm(options.redirectUrl);
                                            def.resolve(result);

                                        } else {

                                            def.reject();

                                        }

                                        // Close the 'Working on it...' dialog.
                                        closeDialog();
                                        
                                    }, function() {

                                        // At this point, the 'OnPostSave' promise has been rejected 
                                        // due to an exception or manually by the user.

                                        closeDialog();
                                        def.reject();
                                        
                                    });

                                }, function(err) {

                                    // At this point, the 'item.save' promise has been rejected 
                                    // due to an exception.

                                    console.error(err);
                                    closeDialog();

                                    // Shows a popup with the error details.
                                    var dom = document.createElement('div');
                                    dom.innerHTML = '<div style="color:brown">' + err.code + '<br/><strong>' + err.message + '</strong></div>';

                                    SP.UI.ModalDialog.showModalDialog({
                                        title: SP.Res.dlgTitleError,
                                        html: dom,
                                        showClose: true,
                                        autoSize: true,
                                        dialogReturnValueCallback: function() {
                                            def.reject();
                                        }
                                    });

                                });

                            } else {

                                // At this point, the 'OnPreSave' promise has been canceled 
                                // by the user (By the 'onPreSave' method implemented by the user).

                                closeDialog();
                                def.reject();

                            }
                            
                        }, function() {

                            // At this point, the 'OnPreSave' promise has been rejected 
                            // due to an exception or manually by the user.

                            closeDialog();
                            def.reject();

                        });

                    });


                    return def.promise;

                };


                this.cancel = function() {

                    var self = this;
                    var def = $q.defer();

                    // Change the form to a 'pristine' state to avoid field validation.
                    $scope.ngFormCtrl.$setPristine();

                    $scope.formStatus = this.status.PROCESSING;

                    // Invoke 'onCancel' function
                    $q.when(SPUtils.callFunctionWithParams($scope.onCancel, $scope)).then(function(result) {

                        if (result !== false) {

                            // Performs the default 'cancel' action...
                            //self.closeForm(redirectUrl);

                            // Restore the item to its 'original' value.
                            //$scope.item = angular.copy($scope.originalItem);
                            //$scope.item = new SPListItem($scope.originalItem.list, $scope.originalItem);
                            $scope.item = new SPListItem($scope.originalItem.list, angular.copy($scope.originalItem));

                            def.resolve(result);

                        } else {

                            def.reject();

                        }


                    }, function() {

                        // When error, should close the form ?
                        //self.closeForm(redirectUrl);
                        def.reject();
                    });

                    return def.promise;
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
                        $scope.$watch('mode', function(newValue, oldValue) {

                            if (newValue === void 0 || newValue === oldValue) return;

                            loadItemInfrastructure().then(function() {
                                loadItemTemplate();
                            });

                        });



                        // Watch for item changes
                        $scope.$watch('item', function(newValue, oldValue) {

                            // Checks if the item has a value
                            if (newValue === void 0) return;

                            // Store a copy of the original item.
                            // See 'onPreSave', 'onPostSave' and 'onCancel' callbacks in the controller's 'save' method.

                            // Using the 'angular.copy' method, the objects __proto__ are different.
                            //$scope.originalItem = angular.copy(newValue);

                            // Instead, create a 'new SPListItem(@list, @data)' that use the 'angular.extend' method.
                            // $scope.originalItem = new SPListItem($scope.item.list, $scope.item);
                            $scope.originalItem = new SPListItem($scope.item.list, angular.copy($scope.item));

                            loadItemInfrastructure().then(function() {
                                loadItemTemplate();
                            });

                        });


                        function loadItemInfrastructure() {

                            var self = this;
                            var def = $q.defer();

                            // Checks if the form is already being processed.
                            if ($scope.formStatus === spformController.status.PROCESSING) {
                                def.reject();
                                return def.promise;
                            }

                            // Ensure item has a value
                            if (!angular.isDefined($scope.item)) {
                                def.reject();
                                return def.promise;
                            }

                            // Ensure mode has a value
                            if (!angular.isDefined($scope.mode)) {

                                $scope.mode = spformController.getFormMode();

                            }

                            // Update form status
                            $scope.formStatus = spformController.status.PROCESSING;


                            // Extend the formController with the extendedController (if exists)
                            if (angular.isDefined($scope.extendedController)) {

                                utils.extend($scope, $scope.extendedController);
                            }

                            // Gets the schema (fields) of the list.
                            // Really, gets the fields of the list content type specified in the 
                            // item or, if not specified, the default list content type.
                            $scope.item.list.getProperties({
                            
                                $expand: 'Fields,ContentTypes,ContentTypes/Fields'

                            }).then(function() {

                                $scope.item.list.getFields().then(function(listFields) {

                                    $scope.item.list.getContentType($scope.item.ContentTypeId).then(function(contentType) {

                                        contentType.getFields().then(function(ctFields) {

                                            var fields = ctFields;

                                            // The 'Attachments' field belongs to the list not to the content type.
                                            // So adds it to the content type fields, if needed.
                                            if ($scope.item.list.EnableAttachments) {

                                                fields.Attachments = listFields.Attachments;

                                            }

                                            // Sets schema
                                            $scope.schema = fields;

                                            // There are dialog args ?
                                            var dialogExtendedSchema = {};

                                            var dlg = SP.UI.ModalDialog.get_childDialog();
                                            if (dlg !== null) {
                                                var args = dlg.get_args();
                                                if (args !== null && args.extendedSchema !== undefined) {

                                                    dialogExtendedSchema = args.extendedSchema;
                                                }
                                            }

                                            $scope.extendedSchema = utils.deepExtend({Fields: {}}, $scope.extendedSchema, dialogExtendedSchema);


                                            // Resolve expressions
                                            /*
                                            SPExpressionResolver.resolve(angular.toJson($scope.extendedSchema), $scope).then(function(extendedSchemaSolved) {

                                                var solvedExtendedSchema = angular.fromJson(extendedSchemaSolved);

                                                // Extend original schema with extended properties
                                                $scope.schema = utils.deepExtend({}, $scope.schema, solvedExtendedSchema.Fields);

                                                def.resolve();
                                            });
                                            */

                                            // Extend original schema with extended properties
                                            $scope.schema = utils.deepExtend($scope.item.list.Fields, $scope.schema, $scope.extendedSchema.Fields);

                                            // Set the originalTypeAsString
                                            angular.forEach($scope.schema, function(field) {
                                                field.originalTypeAsString = field.TypeAsString;
                                            });

                                            def.resolve();

                                        }); // contentType.getFields

                                    }); // lit.getContentType

                                }); // list.getFields

                            }); // list.getProperties


                            return def.promise;

                        }   // loadItemInfrastructure



                        function loadItemTemplate() {

                            $q.when(SPUtils.callFunctionWithParams($scope.onPreBind, $scope)).then(function(result) {

                                // Search for the 'transclusion-container' attribute in the 'spform' template elements.
                                var elements = $element.find('*');
                                var transclusionContainer;

                                angular.forEach(elements, function(elem) {
                                    if (elem.attributes['transclusion-container'] !== void 0) {
                                        transclusionContainer = angular.element(elem);
                                    }
                                });


                                // Ensure 'transclusion' element.
                                if (transclusionContainer === void 0 || transclusionContainer.length === 0) {
                                    transclusionContainer = $element;
                                }


                                /*
                                // Remove the 'loading animation' element
                                var loadingAnimation = document.querySelector('#form-loading-animation-wrapper-' + $scope.$id);
                                if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();
                                */


                                transclusionContainer.empty(); // Needed?


                                // Check for 'templateUrl' attribute
                                if ($attrs.templateUrl) {

                                    // Apply the 'templateUrl' attribute
                                    $http.get($attrs.templateUrl, { cache: $templateCache }).success(function(html) {

                                        parseRules(transclusionContainer, angular.element(html), false).then(function() {

                                            /*
                                            $compile(transclusionContainer)($scope);
                                            $scope.formStatus = spformController.status.IDLE;
                                            dialogResize();
                                            */

                                            compile(transclusionContainer);

                                        });

                                    }).error(function(data, status, headers, config, statusText) {

                                        $element.html('<div><h2 class="ms-error">' + data + '</h2><p class="ms-error">Form Template URL: <strong>' + $attrs.templateUrl + '</strong></p></div>');

                                        /*
                                        $compile(transclusionContainer)($scope);
                                        $scope.formStatus = spformController.status.IDLE;
                                        dialogResize();
                                        */

                                        compile(transclusionContainer);

                                    });

                                } else {

                                    // Apply transclusion
                                    transcludeFn($scope, function(clone) {
                                        
                                        parseRules(transclusionContainer, clone, true).then(function() {

                                            // If no content was detected within the 'spform' element, generates a default form template.
                                            if (transclusionContainer[0].children.length === 0) {

                                                $scope.fields = [];

                                                angular.forEach($scope.schema, function(field) {
                                                    if (!field.Hidden && !field.Sealed && !field.ReadOnlyField && field.InternalName !== 'ContentType') {
                                                        $scope.fields.push(field);
                                                    }
                                                });

                                                $http.get('templates/form-templates/spform-default.html', { cache: $templateCache }).success(function (html) {

                                                    transclusionContainer.append(html);
                                                    /*
                                                    $compile(transclusionContainer)($scope);
                                                    $scope.formStatus = spformController.status.IDLE;
                                                    dialogResize();
                                                    */

                                                    compile(transclusionContainer);

                                                });

                                            } else {

                                                /*
                                                $scope.formStatus = spformController.status.IDLE;
                                                dialogResize();
                                                */

                                                compile(transclusionContainer);

                                            }
                                        });
                                    });
                                }

                            });

                        } // loadItemTemplate



                        function compile(element) {

                            $q.when($compile(element)($scope)).then(function() {

                                // Remove the 'loading animation' element if still present.
                                var loadingAnimation = document.querySelector('#form-loading-animation-wrapper-' + $scope.$id);
                                if (loadingAnimation !== void 0) angular.element(loadingAnimation).remove();

                                // Waits for the next $digest cycle when all the DOM has been rendered.
                                $timeout(function() {

                                    // Sets the form to its idle status.
                                    $scope.formStatus = spformController.status.IDLE;

                                    // Checks for dialog and resize if needed.
                                    dialogResize();

                                    // Broadcast the 'formRenderComplete' event to form childs.
                                    $scope.$broadcast('formRenderComplete');

                                    // Also emit the event to parent elements/controllers.
                                    $scope.$emit('formRenderComplete');

                                });

                            });

                        } // compile



                        function parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded) {

                            elementIndex = elementIndex || 0;
                            deferred = deferred || $q.defer();
                            terminalRuleAdded = terminalRuleAdded || false;

                            var forceRuleParam = utils.getQueryStringParamByName('rule');
                            var forceRuleElement = '';

                            if (forceRuleParam !== undefined) {

                                forceRuleParam = parseInt(forceRuleParam);

                                for (var r=0, count=0; r < sourceElements.length; r++) {

                                    forceRuleElement = sourceElements[r];

                                    if (forceRuleElement.tagName !== void 0 && forceRuleElement.tagName.toLowerCase() === 'spform-rule') {

                                        count++;
                                        if (count === forceRuleParam) break;

                                    }
                                }

                                if (forceRuleElement !== '') {
                                    
                                    return SPExpressionResolver.resolve(forceRuleElement.outerHTML, $scope).then(function(elemResolved) {

                                        targetElement.append(angular.element(elemResolved)[0]);

                                        deferred.resolve();
                                        return deferred.promise;

                                    });

                                }

                            }

                            // Gets the element to parse.
                            var elem = sourceElements[elementIndex++];

                            // Resolve the promise when there are no more elements to parse.
                            if (elem === void 0) {

                                deferred.resolve();
                                return deferred.promise;
                            }


                            // Initialize the 'rules' array for debug purposes.
                            $scope.rules = $scope.rules || [];


                            // Check if 'elem' is a <spform-rule> element.
                            if (elem.tagName !== void 0 && elem.tagName.toLowerCase() == 'spform-rule') {

                                // Check if a previous 'terminal' <spform-rule> element was detected.
                                if (!terminalRuleAdded) {

                                    var testExpression = 'false',
                                        terminalExpression = 'false';

                                    // Check for 'test' attribute
                                    if (elem.hasAttribute('test')) {
                                        testExpression = elem.getAttribute('test');
                                    }

                                    // Check for 'terminal' attribute
                                    if (elem.hasAttribute('terminal')) {
                                        terminalExpression = elem.getAttribute('terminal');
                                    }


                                    // Resolve 'test' attribute expressions.
                                    SPExpressionResolver.resolve(testExpression, $scope).then(function(testResolved) {

                                        // Evaluates the test expression.
                                        if ($scope.$eval(testResolved)) {

                                            // Update the 'test' attribute value
                                            elem.setAttribute('test', testResolved);


                                            // Resolve the 'terminal' attribute expression
                                            SPExpressionResolver.resolve(terminalExpression, $scope).then(function(terminalResolved) {

                                                // Update the 'terminal' attribute value
                                                elem.setAttribute('terminal', terminalResolved);

                                                // Evaluates the 'terminal' attribute
                                                terminalRuleAdded = $scope.$eval(terminalResolved);


                                                // Resolve 'expressions' within the 'spform-rule' element.
                                                SPExpressionResolver.resolve(elem.outerHTML, $scope).then(function(elemResolved) {

                                                    var elem = angular.element(elemResolved)[0];

                                                    // Append the element to the final form template
                                                    targetElement.append(elem);


                                                    // Add the rule to the 'rules' array for debug purposes.
                                                    $scope.rules.push({
                                                        test: testExpression, 
                                                        testResolved: testResolved, 
                                                        terminal: terminalExpression, 
                                                        terminalResolved: terminalResolved,
                                                        solved: true
                                                    });


                                                    // Process the next element
                                                    parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);

                                                });
                                            });

                                        } else {

                                            if (isTransclude) {

                                                // NOTE: If this function is called from a transclusion function, removes the 'spform-rule' 
                                                //       elements when the expression in its 'test' attribute evaluates to FALSE.
                                                //       This is because when the transclusion is performed the elements are inside the 
                                                //       current 'spform' element and should be removed.
                                                //       When this function is called from an asynchronous template load ('templete-url' attribute), 
                                                //       the elements are not yet in the element.
                                                elem.remove();
                                                elem = null;
                                            }


                                            // Add the rule to the 'rules' array for debug purposes.
                                            $scope.rules.push({
                                                test: testExpression, 
                                                testResolved: testResolved,
                                                terminal: terminalExpression, 
                                                terminalResolved: 'n/a',
                                                solved: false
                                            });


                                            // Process the next element
                                            parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);
                                        }
                                        
                                    });

                                } else {

                                    // Process the next element
                                    parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);

                                }

                            } else {

                                // Append the element to the final form template
                                targetElement.append(elem);


                                // Process the next element
                                parseRules(targetElement, sourceElements, isTransclude, elementIndex, deferred, terminalRuleAdded);
                            }


                            return deferred.promise;

                        } // parseRules private function



                        // Checks if SharePoint is rendering the form in a dialog, and if so 
                        // resizes it after de DOM is loaded using the $timeout service.
                        //
                        function dialogResize() {

                            if (SP.UI.ModalDialog.get_childDialog()) {

                                $timeout(function() {

                                    SP.UI.ModalDialog.get_childDialog().autoSize();

                                });

                            }

                        } // dialogResize

                    } // compile.post-link

                }; // compile function return

            } // compile property

        }; // Directive definition object


        return spform_DirectiveDefinitionObject;

    } // Directive factory function

]);
