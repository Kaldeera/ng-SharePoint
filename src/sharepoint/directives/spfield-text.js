/*
	SPFieldText - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldText
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldText', 

	['SPFieldDirective',

	function spfieldText_DirectiveFactory(SPFieldDirective) {

		var spfieldText_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: ['^spform', 'ngModel'],
			replace: true,
			scope: {
				mode: '@',
				value: '=ngModel'
			},
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, controllers) {


				var directive = {
					fieldTypeName: 'text',
					replaceAll: false
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

/*
				var formCtrl = controllers[0], modelCtrl = controllers[1];
				$scope.modelCtrl = modelCtrl;
				$scope.schema = formCtrl.getFieldSchema($attrs.name);



				// ****************************************************************************
				// Watch for form mode changes.
				//
				$scope.$watch(function() {

					return $scope.mode || formCtrl.getFormMode();

				}, function(newValue) {

					$scope.currentMode = newValue;
					renderField(newValue);
				});



				// ****************************************************************************
				// Watch for field value changes.
				//
				$scope.$watch('value', function(newValue, oldValue) {

					if (newValue === oldValue) return;
					modelCtrl.$setViewValue(newValue);
				});



				// ****************************************************************************
				// Validate the field.
				//
				var unregisterValidateFn = $scope.$on('validate', function() {

					// Update the $viewValue to change its state to $dirty and force to run 
					// $parsers, which include validators.
					modelCtrl.$setViewValue(modelCtrl.$viewValue);
				});



				// ****************************************************************************
				// Renders the field with the correct layout based on the form mode.
				//
				function renderField(mode) {

					$http.get('templates/form-templates/spfield-text-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						//var newElement = $compile(html)($scope);
						//$element.replaceWith(newElement);
						//$element = newElement;
						
						$element.html(html);
						$compile($element)($scope);
					});

				}
*/

			} // link

		}; // Directive definition object


		return spfieldText_DirectiveDefinitionObject;

	} // Directive factory

]);