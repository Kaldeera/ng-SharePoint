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

					parserFn: function(viewValue) {

						$scope.modelCtrl.$setValidity('required', !$scope.schema.Required || $scope.choices.length > 0);

						return viewValue;
					}
				};


				SPFieldDirective.baseLinkFn.apply(directive, arguments);


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
