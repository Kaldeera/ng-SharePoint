/*
	SPFieldChoice - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldChoice', 

	['SPFieldDirective',

	function spfieldChoice_DirectiveFactory(SPFieldDirective) {

		var spfieldChoice_DirectiveDefinitionObject = {

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
					fieldTypeName: 'choice',
					replaceAll: false,

					init: function() {

						$scope.choices = $scope.schema.Choices.results;
					}
				};
				

				SPFieldDirective.baseLinkFn.apply(directive, arguments);

/*				
				var formCtrl = controllers[0], modelCtrl = controllers[1];
				$scope.modelCtrl = modelCtrl;
				$scope.schema = formCtrl.getFieldSchema($attrs.name);
				$scope.choices = $scope.schema.Choices.results;


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

					$http.get('templates/form-templates/spfield-choice-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						$element.html(html);
						$compile($element)($scope);
					});

				}
*/
			} // link

		}; // Directive definition object


		return spfieldChoice_DirectiveDefinitionObject;

	} // Directive factory

]);