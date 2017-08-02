/*
    SPFieldDirective - Service

    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPFieldDirective
///////////////////////////////////////

angular.module('ngSharePoint').service('SPFieldDirective',

    ['$compile', '$http', '$templateCache', '$q', 'SPUtils',

    function SPFieldDirective_Factory($compile, $http, $templateCache, $q, SPUtils) {

        // ****************************************************************************
        // Private functions
        //

        function defaultOnValidateFn() {

            // NOTE: Executed in the directive's '$scope' context (i.e.: this === $scope).

            // Update the model property '$viewValue' to change the model state to $dirty and
            // force to run $parsers, which include validators.
            var value = this.modelCtrl.$viewValue;
            if (!angular.isDefined(value)) value = null;

            this.modelCtrl.$setViewValue(value);
        }


        function defaultWatchValueFn(newValue, oldValue) {

            // NOTE: Executed in the directive $scope context.

            if (newValue === oldValue) return;

            // Update the model property '$viewValue' when the model value changes.
            this.modelCtrl.$setViewValue(newValue);
        }




        // ****************************************************************************
        // Public API
        //

        /*
         * baseLinkFn
         * ----------------------------------------------------------------------------
         *
         * Serves as the base 'link' function to all 'spfield-xxx' directives.
         *
         * The 'this' word in this function is the directive object defined in the
         * 'spfield-xxx' directive. See the definition of the 'directive object' below.
         *
         * Example of use in a directive 'post-link' function:
         *
         *      // Define the 'directive' object
         *
         *      var directiveObj = {
         *          fieldTypeName: 'text',
         *          replaceAll: false,
         *          init: function() {
         *              $scope.SomeText = 'My directive';
         *
         *              // Call some private function
         *              MyPrivateFunction();
         *          }
         *      };
         *
         *      // Apply the directive definition object to the 'baseLinkFn'.
         *      // Pass 'post-link' function arguments as arguments to the 'baseLinkFn'.
         *      // The 'directive object' becomes the execution context of the 'baseLinkFn'.
         *      // (Becomes the 'this' word within the 'baseLinkFn' function).
         *
         *      SPFieldDirective.baseLinkFn.apply(directiveObj, arguments);
         *
         *
         * 'directiveObj' definition:
         *
         *        Required properties:
         *        --------------------
         *
         *              fieldTypeName: The type name of the directive to load the
         *                             correct directive template.
         *
         *
         *        Optional properties/functions:
         *        ------------------------------
         *
         *              replaceAll: If set to true, the 'renderField' function will replace
         *                          the entire element instead its contents.
         *
         *              displayTemplateUrl: Custom field template for display rendering.
         *
         *              editTemplateUrl: Custom field template for edit rendering.
         *
         *              init (function): An initialization function for the directive.
         *
         *              parserFn (function): If defined, add this parser function to the
         *              (view to model)      model controller '$parsers' array.
         *                                   Used to sanitize/convert the value as well as
         *                                   validation.
         *                                   Working examples are in the 'spfieldMultichoice'
         *                                   or 'spfieldLookupmulti' directives.
         *
         *              formatterFn (function): If defined, add this formatter function to the
         *              (model to view)         model controller '$formatters' array.
         *                                      Used to format/convert values for display in the
         *                                      control and validation.
         *
         *              watchModeFn (function): If defined, replace the default behavior in the
         *                                      'Watch for form mode changes' function.
         *                                      The default behavior is to call the 'renderField'
         *                                      function.
         *
         *              watchValueFn (function): If defined, applies it after the default behavior
         *                                       in the 'Watch for field value changes' function.
         *                                       Deprecated: new spfield-* don't have attribute:
         *                                          value: '=ngModel'
         *                                       This behaviors should be done on renderFn
         *
         *              renderFn (function):     If defined, applies it when modelController need to
         *                                       update the view (render). By default, this function
         *                                       set's the scope.value variable with the new value
         *                                       (modelCtrl.$viewValue)

         *              onValidateFn (function): If defined, applies it after the default behavior
         *                                       in the '$scope.$on('validate', ...)' function.
         *
         *              postRenderFn (function): If defined, will be executed after the default
         *                                       render action (setElementHtml).
         */
        this.baseLinkFn = function($scope, $element, $attrs, controllers) {

            // Directive definition object from 'spfield-xxx' directive.
            var directive = this;

            // Initialize some $scope properties.
            $scope.formCtrl = controllers[0];
            $scope.modelCtrl = controllers[1];
            $scope.name = $attrs.name;
            directive.name = $scope.name;
            $scope.schema = $scope.formCtrl.getFieldSchema($attrs.name);
            $scope.item = $scope.formCtrl.getItem(); // Needed?
            $scope.currentMode = $scope.mode || $scope.formCtrl.getFormMode();

            $scope.formCtrl.registerField(this);

            $scope.$on('$destroy', function() {
                $scope.formCtrl.unregisterField(directive);
            });


            // Apply the directive parser function if specified.
            if (angular.isFunction(directive.parserFn)) $scope.modelCtrl.$parsers.unshift(directive.parserFn);


            // Apply the directive formatter function if specified.
            if (angular.isFunction(directive.formatterFn)) $scope.modelCtrl.$formatters.unshift(directive.formatterFn);



            // ****************************************************************************
            // Replaces the directive element HTML.
            //
            directive.setElementHTML = function(html) {

                if (directive.replaceAll === true) {

                    var newElement = $compile(html)($scope);
                    $element.replaceWith(newElement);
                    $element = newElement;

                } else {

                    $element.html(html);
                    $compile($element)($scope);
                }
            };



            // ****************************************************************************
            // Gets the field rendering template.
            //
            directive.getFieldTemplate = function() {

                var deferred = $q.defer();
                var templateUrl = 'templates/form-templates/spfield-' + directive.fieldTypeName + '-' + $scope.currentMode + '.html';

                if ($scope.currentMode === 'display' && directive.displayTemplateUrl) templateUrl = directive.displayTemplateUrl;
                if ($scope.currentMode === 'edit' && directive.editTemplateUrl) templateUrl = directive.editTemplateUrl;


                $http.get(templateUrl, { cache: $templateCache }).then(function(html) {

                    // Checks if the field has an 'extended template'.
                    // The 'extended template' is defined in the field 'extended schema'.
                    //
                    // Extended template definition (Apply for display and edit modes):
                    //
                    // extendedTemplate: {
                    //     html: A string that contains the HTML.
                    //     url: Url to the template that contains the HTML. This overwrites 'html' property
                    //     replaceOnDisplay: true or false that indicates if the template will replace the
                    //                       default field template on 'display' mode.
                    //     replaceOnEdit: true or false that indicates if the template will replace the default
                    //                    field template on 'edit' mode.
                    //     replace: true or false that indicates if the template will replace the default field
                    //              template on both form modes (display and edit).
                    //              This have precedence over 'replaceOnEdit' and 'replaceOnDisplay'
                    //              properties.
                    // }
                    //
                    // or
                    //
                    // extendedTemplate: {
                    //     display|edit: {
                    //         html: String
                    //         url: String
                    //         replace: Boolean
                    //     }
                    // }
                    //


                    if (angular.isDefined($scope.schema) && angular.isDefined($scope.schema.extendedTemplate)) {

                        var finalHtml = html.data;
                        var templateEx = $scope.schema.extendedTemplate;

                        // Checks if there are defined and explicit mode extended template.
                        if (angular.isDefined(templateEx[$scope.currentMode])) {

                            templateEx = templateEx[$scope.currentMode];

                        }

                        var replace = (
                            ($scope.currentMode === 'display' && templateEx.replaceOnDisplay === true) ||
                            ($scope.currentMode === 'edit' && templateEx.replaceOnEdit === true) ||
                            templateEx.replace === true
                        );

                        if (angular.isDefined(templateEx.url)) {

                            $http.get(templateEx.url, { cache: $templateCache }).then(function(htmlEx) {

                                finalHtml = replace ? htmlEx.data : html.data + htmlEx.data;
                                deferred.resolve(finalHtml);

                            });

                        } else if (angular.isDefined(templateEx.html)) {

                            finalHtml = replace ? templateEx.html : html.data + templateEx.html;
                            deferred.resolve(finalHtml);

                        } else {

                            // The properties 'url' or 'html' not found.
                            deferred.resolve(finalHtml);

                        }

                    } else {

                        deferred.resolve(html.data);

                    }

                });


                return deferred.promise;

            };




            // ****************************************************************************
            // Renders the field with the correct layout based on the field/form mode.
            //
            directive.renderField = function() {

                directive.getFieldTemplate().then(function(html) {

                    directive.setElementHTML(html);
                    if (angular.isFunction(directive.postRenderFn)) directive.postRenderFn.apply(directive, arguments);

                });

            };



            // ****************************************************************************
            // Sets the field validity only when in 'edit' mode.
            //
            // @validator: String with the validator name.
            // @isValid: Boolean value indicating if the validator is valid or not.
            //
            // IMPORTANT: Use this function in custom 'parserFn' to set field validities instead
            //            to call directly to '$scope.modelCtrl.$setValidity' method.
            //
            directive.setValidity = function(validator, isValid) {

                if ($scope.currentMode === 'edit') {

                    $scope.modelCtrl.$setValidity(validator, isValid);
                }
            };



            // ****************************************************************************
            // Validate the field.
            //
            directive.validate = function() {

                if ($scope.currentMode !== 'edit') return;

                var deferred = $q.defer();
                $scope.modelCtrl.$dirty = true;

                defaultOnValidateFn.apply($scope, arguments);

                if (angular.isFunction(directive.onValidateFn)) {

                    $q.when(directive.onValidateFn.apply(directive, arguments)).then(function() {

                        if ($scope.schema !== undefined && $scope.schema.onValidate !== undefined) {

                            $q.when(SPUtils.callFunctionWithParams($scope.schema.onValidate, $scope)).then(function(result) {

                                deferred.resolve();
                            });

                        } else {

                            deferred.resolve();
                        }
                    });

                } else {

                    if ($scope.schema !== undefined && $scope.schema.onValidate !== undefined) {

                        $q.when(SPUtils.callFunctionWithParams($scope.schema.onValidate, $scope)).then(function(result) {

                            deferred.resolve();
                        });

                    } else {

                        deferred.resolve();
                    }
                }

                return deferred.promise;
            };


            // ****************************************************************************
            // New model value ... render
            //
            $scope.modelCtrl.$render = function() {

                if (angular.isFunction(directive.renderFn)) {
                    directive.renderFn(directive, arguments);
                } else {
                    $scope.value = $scope.modelCtrl.$viewValue;
                }

            };


            // Apply the directive initializacion if specified.
            var init = true;
            if (angular.isFunction(directive.init)) init = directive.init();

            $q.when(init).then(function() {

                // ****************************************************************************
                // Watch for form mode changes.
                //
                $scope.$watch(function() {

                    return $scope.mode || $scope.formCtrl.getFormMode();

                }, function(newValue, oldValue) {

                    // Sets field current mode
                    $scope.currentMode = newValue;

                    // Renders the field or apply the specific field type function
                    if (angular.isFunction(directive.watchModeFn)) {

                        directive.watchModeFn.apply(directive, arguments);

                    } else {

                        directive.renderField();
                    }
                });



                // ****************************************************************************
                // Watch for field value changes.
                //
                $scope.$watch('value', function(newValue, oldValue) {

                    defaultWatchValueFn.apply($scope, arguments);
                    if (angular.isFunction(directive.watchValueFn)) directive.watchValueFn.apply(directive, arguments);

                }, true);

            });




        }; // baseLinkFn

    } // SPFieldDirective factory

]);
