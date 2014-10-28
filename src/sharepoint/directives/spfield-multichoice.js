/*
	SPFieldMultiChoice - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldMultiChoice
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldMultichoice', 

	['SPFieldDirective',

	function spfieldMultichoice_DirectiveFactory(SPFieldDirective) {

		var spfieldMultichoice_DirectiveDefinitionObject = {

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
					fieldTypeName: 'multichoice',
					replaceAll: false,

					init: function() {

						// Adjust the model if no value is provided
						if ($scope.value === null || $scope.value === void 0) {
							$scope.value = { results: [] };
						}

						$scope.choices = $scope.value.results;
						sortChoices();
					},

					parserFn: function(modelValue, viewValue) {

						$scope.modelCtrl.$setValidity('required', !$scope.schema.Required || $scope.choices.length > 0);
						return $scope.value;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);

/*
				var formCtrl = controllers[0], modelCtrl = controllers[1];
				$scope.modelCtrl = modelCtrl;
				$scope.schema = formCtrl.getFieldSchema($attrs.name);
*/

				/*
				// Adjust the model if no value is provided
				if ($scope.value === null) {
					$scope.value = { results: [] };
				}

				$scope.choices = $scope.value.results;
				sortChoices();
				*/

				/*
				var parseFn = function(modelValue, viewValue) {

					$scope.modelCtrl.$setValidity('required', !$scope.schema.Required || $scope.choices.length > 0);
					return $scope.value;
				};

				$scope.modelCtrl.$parsers.push(parseFn);
				*/

/*
				$scope.$watch('value', function(newValue, oldValue) {

                    if (newValue === oldValue) return;
                    fieldScope.modelCtrl.$setViewValue(newValue);
                        
                }, true);


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

				}, true);



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

					$http.get('templates/form-templates/spfield-multichoice-' + mode + '.html', { cache: $templateCache }).success(function(html) {

						$element.html(html);
						$compile($element)($scope);
					});

				}
*/


				// ****************************************************************************
				// Updates the model (array of choices) when a checkbox is toggled.
				//
				$scope.toggleCheckbox = function(choice) {

					var idx = $scope.choices.indexOf(choice);

					if (idx != -1) {
						$scope.choices.splice(idx, 1);
					} else {
						$scope.choices.push(choice);
					}

					sortChoices();

				};



				// ****************************************************************************
				// Sort the choices according to the definition order.
				//
				function sortChoices() {

					var sortedChoices = [];

					angular.forEach($scope.schema.Choices.results, function(choice) {

						if($scope.choices.indexOf(choice) != -1) {
							sortedChoices.push(choice);
						}
					});

					$scope.choices = $scope.value.results = sortedChoices;
				}

			}

		}; // Directive definition object


		return spfieldMultichoice_DirectiveDefinitionObject;

	} // Directive factory

]);
