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

    ['$compile', '$http', '$templateCache',

    function SPFieldDirective_Factory($compile, $http, $templateCache) {

        // ****************************************************************************
        // Private functions
        //
        function defaultOnValidateFn() {
            // NOTE: Executed in the directive's '$scope' context (i.e.: this === $scope).

            // Update the model property '$viewValue' to change the model state to $dirty and
            // force to run $parsers, which include validators.
            this.modelCtrl.$setViewValue(this.modelCtrl.$viewValue);
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
         *              init (function): An initialization function for the directive.
         *
         *              parserFn (function): If defined, add this parser function to the 
         *              (model to view)      model controller '$parsers' array.
         *                                   This could be usefull if the directive requires
         *                                   custom or special validations.
         *                                   Working examples are in the 'spfieldMultichoice' 
         *                                   or 'spfieldMultiLookup' directives.
         *
         *              formatterFn (function): If defined, add this formatter function to the 
         *              (view to model)         model controller '$formatters' array.
         *
         *              watchModeFn (function): If defined, replace the default behavior in the 
         *                                      'Watch for form mode changes' function.
         *                                      The default behavior is to call the 'renderField' 
         *                                      function.
         *                          
         *              watchValueFn (function): If defined, applies it after the default behavior 
         *                                       in the 'Watch for field value changes' function.
         *
         *              onValidateFn (function): If defined, applies it after the default behavior 
         *                                       in the '$scope.$on('validate', ...)' function.
         *
         *              postRenderFn (function): If defined, will be executed after the default
         *                                       render action (setElementHtml).
         */
        this.baseLinkFn = function($scope, $element, $attrs, controllers) {

            var directive = this;

            // Initialize some $scope properties.
            $scope.formCtrl = controllers[0];
            $scope.modelCtrl = controllers[1];
            $scope.schema = $scope.formCtrl.getFieldSchema($attrs.name);
            $scope.item = $scope.formCtrl.getItem(); // Needed?


            // Apply the directive initializacion if specified.
            if (angular.isFunction(directive.init)) directive.init();


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
            // Renders the field with the correct layout based on the field/form mode.
            //
            directive.renderField = function() {

                $http.get('templates/form-templates/spfield-' + directive.fieldTypeName + '-' + $scope.currentMode + '.html', { cache: $templateCache }).success(function(html) {

                    directive.setElementHTML(html);
                    if (angular.isFunction(directive.postRenderFn)) directive.postRenderFn.apply(directive, arguments);
                });
            };



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



            // ****************************************************************************
            // Validate the field.
            //
            $scope.unregisterValidateFn = $scope.$on('validate', function() {

                defaultOnValidateFn.apply($scope, arguments);
                if (angular.isFunction(directive.onValidateFn)) directive.onValidateFn.apply(directive, arguments);
            });


        }; // baseLinkFn

    } // SPFieldDirectiveFactory

]);